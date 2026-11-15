import bcrypt from 'bcryptjs';
import { eq, and, isNull, desc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
import { ROLES, RegisterDriverInput } from '@poscocina/shared';
import { wahaService } from '../whatsapp/services/waha.service.js';

export class DriversService {
  /**
   * Freelance Courier Public Self-Registration
   */
  async registerDriver(input: RegisterDriverInput) {
    // 1. Verify email uniqueness
    const [existingEmail] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.email, input.email.toLowerCase().trim()))
      .limit(1);

    if (existingEmail) {
      throw new Error('Ya existe una cuenta registrada con este correo electrónico');
    }

    // 2. Verify document uniqueness
    const [existingDoc] = await db
      .select({ id: schema.users.id })
      .from(schema.users)
      .where(eq(schema.users.documentNumber, input.documentNumber.trim()))
      .limit(1);

    if (existingDoc) {
      throw new Error('Ya existe una cuenta registrada con este número de documento');
    }

    // 3. Resolve role ID for 'driver'
    const [driverRole] = await db
      .select({ id: schema.roles.id })
      .from(schema.roles)
      .where(eq(schema.roles.name, ROLES.DRIVER))
      .limit(1);

    if (!driverRole) {
      throw new Error('Rol de domiciliario no configurado en el sistema');
    }

    // 4. Hash password
    const passwordHash = await bcrypt.hash(input.password, 10);

    // 5. Create user record
    const [newUser] = await db
      .insert(schema.users)
      .values({
        name: input.name.trim(),
        email: input.email.toLowerCase().trim(),
        documentNumber: input.documentNumber.trim(),
        passwordHash,
        roleId: driverRole.id,
        allVenuesAccess: true,
        isActive: true,
        tokenVersion: 1,
      })
      .returning();

    // 6. Create driver profile with initial trust tier (Tier 1: $15.000 limit)
    const [newProfile] = await db
      .insert(schema.driverProfiles)
      .values({
        userId: newUser.id,
        phone: input.phone.trim(),
        documentType: input.documentType,
        documentNumber: input.documentNumber.trim(),
        city: input.city.trim(),
        vehicleType: input.vehicleType,
        licensePlate: input.licensePlate?.trim().toUpperCase() || null,
        status: 'available',
        trustTier: 1,
        creditLimit: '15000.00',
        walletBalance: '0.00',
        payoutMethod: input.payoutMethod,
        payoutAccount: input.payoutAccount.trim(),
        isVerified: true,
      })
      .returning();

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: ROLES.DRIVER,
      },
      profile: newProfile,
    };
  }

  /**
   * Retrieve driver profile by user ID
   */
  async getDriverProfile(userId: string) {
    const [profile] = await db
      .select()
      .from(schema.driverProfiles)
      .where(eq(schema.driverProfiles.userId, userId))
      .limit(1);

    return profile || null;
  }

  /**
   * Toggle driver online/offline status and GPS location
   */
  async updateStatus(userId: string, status: 'offline' | 'available' | 'busy', lat?: number, lng?: number) {
    const [profile] = await db
      .update(schema.driverProfiles)
      .set({
        status,
        currentLat: lat !== undefined ? lat.toString() : undefined,
        currentLng: lng !== undefined ? lng.toString() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(schema.driverProfiles.userId, userId))
      .returning();

    return profile;
  }

  /**
   * Get unassigned orders in the City Delivery Pool
   */
  async getAvailableOrders(city?: string) {
    const availableOrders = await db.query.orders.findMany({
      where: and(
        eq(schema.orders.orderType, 'delivery'),
        isNull(schema.orders.driverId),
        eq(schema.orders.dispatchStatus, 'seeking_driver')
      ),
      with: {
        venue: true,
        customer: true,
        items: {
          with: {
            product: true,
            modifiers: true,
          },
        },
      },
      orderBy: desc(schema.orders.openedAt),
      limit: 30,
    });

    return availableOrders;
  }

  /**
   * Atomically claim an unassigned delivery order
   */
  async claimOrder(orderId: string, userId: string, io?: any) {
    // 1. Check driver profile and debt ceiling
    const profile = await this.getDriverProfile(userId);
    if (!profile) {
      throw new Error('Perfil de domiciliario no encontrado');
    }

    if (profile.status === 'suspended') {
      throw new Error('Tu cuenta de repartidor se encuentra suspendida');
    }

    const currentBalance = parseFloat(profile.walletBalance);
    const maxCredit = parseFloat(profile.creditLimit);
    if (currentBalance < -maxCredit) {
      throw new Error(
        `Has alcanzado el límite de saldo negativo permitido ($${maxCredit.toLocaleString('es-CO')}). Consigna comisiones para continuar.`
      );
    }

    // 2. Atomic assignment: only succeed if driverId IS NULL
    const [claimed] = await db
      .update(schema.orders)
      .set({
        driverId: userId,
        dispatchStatus: 'driver_assigned',
        claimedAt: new Date(),
      })
      .where(and(eq(schema.orders.id, orderId), isNull(schema.orders.driverId)))
      .returning();

    if (!claimed) {
      throw new Error('Este pedido ya fue tomado por otro repartidor');
    }

    // 3. Set driver status to busy
    await db
      .update(schema.driverProfiles)
      .set({ status: 'busy', updatedAt: new Date() })
      .where(eq(schema.driverProfiles.userId, userId));

    // 4. Notify venue and customer via Socket.io
    if (io) {
      io.to(`venue:${claimed.venueId}`).emit('order:driver_assigned', {
        orderId,
        driverId: userId,
        driverName: profile.phone,
      });
      io.emit('delivery:order_claimed', { orderId });
    }

    return claimed;
  }

  /**
   * Step 1 Handshake: Confirm Pickup at Restaurant using pickupPin
   */
  async confirmPickup(orderId: string, userId: string, pickupPin: string, io?: any) {
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    if (order.driverId !== userId) {
      throw new Error('No estás asignado a este pedido');
    }

    if (!order.pickupPin || order.pickupPin.trim() !== pickupPin.trim()) {
      throw new Error('Código de recogida del restaurante incorrecto');
    }

    const [updated] = await db
      .update(schema.orders)
      .set({
        dispatchStatus: 'picked_up',
        kitchenStatus: 'ready',
        pickedUpAt: new Date(),
      })
      .where(eq(schema.orders.id, orderId))
      .returning();

    if (io) {
      io.to(`venue:${order.venueId}`).emit('order:picked_up', { orderId });
      io.emit(`order:${orderId}:picked_up`, { orderId });
    }

    return updated;
  }

  /**
   * Step 2 Handshake: Complete Delivery at Customer Door using deliveryPin & 3-Way Settlement
   */
  async completeDelivery(orderId: string, userId: string, deliveryPin: string, io?: any) {
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    if (order.driverId !== userId) {
      throw new Error('No estás asignado a este pedido');
    }

    if (!order.deliveryPin || order.deliveryPin.trim() !== deliveryPin.trim()) {
      throw new Error('Código de entrega del cliente incorrecto');
    }

    // 1. Close order
    const [closedOrder] = await db
      .update(schema.orders)
      .set({
        status: 'paid',
        kitchenStatus: 'delivered',
        dispatchStatus: 'delivered',
        deliveredAt: new Date(),
        closedAt: new Date(),
      })
      .where(eq(schema.orders.id, orderId))
      .returning();

    // 2. Fetch driver profile
    const [profile] = await db
      .select()
      .from(schema.driverProfiles)
      .where(eq(schema.driverProfiles.userId, userId))
      .limit(1);

    // 3. Compute 3-Way Financial Settlement
    const foodSubtotal = parseFloat(order.subtotal || '0');
    const totalAmount = parseFloat(order.total || '0');
    const deliveryFee = parseFloat(order.deliveryFee || '5000');
    const driverShare = parseFloat(order.driverPayout || (deliveryFee * 0.8).toFixed(2));
    const platformShare = parseFloat(order.platformFee || (deliveryFee * 0.2).toFixed(2));
    const restaurantShare = foodSubtotal;

    // Detect payment method (notes or default)
    const isCash = order.notes?.toLowerCase().includes('pago: cash') || order.notes?.toLowerCase().includes('efectivo');
    const paymentMethod = isCash ? 'cash' : 'transfer';

    // 4. Save order settlement ledger
    await db
      .insert(schema.orderSettlements)
      .values({
        orderId,
        venueId: order.venueId,
        driverId: userId,
        totalAmount: totalAmount.toFixed(2),
        foodSubtotal: foodSubtotal.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        restaurantShare: restaurantShare.toFixed(2),
        driverShare: driverShare.toFixed(2),
        platformShare: platformShare.toFixed(2),
        paymentMethod,
        collectedBy: isCash ? 'driver' : 'platform',
        settlementStatus: 'settled',
        settledAt: new Date(),
      })
      .onConflictDoNothing();

    // 5. Update driver wallet balance & transaction ledger
    if (profile) {
      let walletDelta = 0;
      let transactionType = 'delivery_earning';
      let transactionNotes = `Ganancia por entrega de pedido #${order.id.slice(0, 8)}`;

      if (isCash) {
        // Customer paid cash to driver -> Platform fee is deducted from digital wallet
        walletDelta = -platformShare;
        transactionType = 'platform_fee_deduction';
        transactionNotes = `Comisión de plataforma (20%) por pedido en efectivo #${order.id.slice(0, 8)}`;
      } else {
        // Digital payment -> Driver delivery fee credited to digital wallet
        walletDelta = driverShare;
        transactionType = 'delivery_earning';
        transactionNotes = `Ganancia de domicilio (80%) por pedido #${order.id.slice(0, 8)}`;
      }

      const prevBalance = parseFloat(profile.walletBalance);
      const newBalance = prevBalance + walletDelta;
      const newCompleted = (profile.completedDeliveries || 0) + 1;
      const newEarnings = parseFloat(profile.totalEarnings || '0') + driverShare;

      // Progressive Trust Tier Promotion
      let newTier = profile.trustTier;
      let newCreditLimit = profile.creditLimit;
      if (newCompleted >= 50 && newTier < 3) {
        newTier = 3;
        newCreditLimit = '80000.00';
      } else if (newCompleted >= 10 && newTier < 2) {
        newTier = 2;
        newCreditLimit = '40000.00';
      }

      await db
        .update(schema.driverProfiles)
        .set({
          walletBalance: newBalance.toFixed(2),
          totalEarnings: newEarnings.toFixed(2),
          completedDeliveries: newCompleted,
          trustTier: newTier,
          creditLimit: newCreditLimit,
          status: 'available',
          updatedAt: new Date(),
        })
        .where(eq(schema.driverProfiles.id, profile.id));

      await db.insert(schema.driverWalletTransactions).values({
        driverProfileId: profile.id,
        orderId,
        type: transactionType,
        amount: walletDelta.toFixed(2),
        balanceAfter: newBalance.toFixed(2),
        notes: transactionNotes,
      });
    }

    // 6. Broadcast completion event
    if (io) {
      io.to(`venue:${order.venueId}`).emit('order:delivered', { orderId });
      io.emit(`order:${orderId}:delivered`, { orderId });
    }

    // 7. Dispatch automated customer WhatsApp message
    if (order.customerId) {
      const [customer] = await db
        .select()
        .from(schema.customers)
        .where(eq(schema.customers.id, order.customerId))
        .limit(1);

      if (customer?.phone) {
        const text = `¡Hola ${customer.name || ''}! Tu pedido ha sido entregado exitosamente. ¡Gracias por confiar en nosotros y buen provecho! 🍽️✨`;
        wahaService.sendText(`venue_${order.venueId}`, customer.phone, text).catch(() => {});
      }
    }

    return closedOrder;
  }

  /**
   * Fetch wallet balance and transaction ledger
   */
  async getDriverWallet(userId: string) {
    const profile = await this.getDriverProfile(userId);
    if (!profile) return null;

    const transactions = await db
      .select()
      .from(schema.driverWalletTransactions)
      .where(eq(schema.driverWalletTransactions.driverProfileId, profile.id))
      .orderBy(desc(schema.driverWalletTransactions.createdAt))
      .limit(50);

    return {
      profile,
      transactions,
    };
  }
}

export const driversService = new DriversService();
