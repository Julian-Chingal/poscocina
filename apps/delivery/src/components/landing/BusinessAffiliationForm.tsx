'use client';

import React, { useState } from 'react';
import { Send, MessageCircle, CheckCircle2, Building2, Store, Phone, MapPin, User } from 'lucide-react';

const WHATSAPP_PHONE = '573508966184'; // Format for wa.me

export function BusinessAffiliationForm() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: 'Restaurante / Comida',
    city: '',
    contactName: '',
    phone: '',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Pre-fill WhatsApp message
    const message = `👋 ¡Hola equipo Pallevar! Quiero afiliar mi negocio a la plataforma:
🏢 *Negocio:* ${formData.businessName || 'Por definir'}
🏷️ *Tipo:* ${formData.businessType}
📍 *Ciudad:* ${formData.city || 'No especificada'}
👤 *Contacto:* ${formData.contactName || 'Propietario'}
📱 *Teléfono:* ${formData.phone || 'El registrado'}
📝 *Detalles:* ${formData.notes || 'Deseo recibir información de planes y comisiones'}`;

    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;

    setSubmitted(true);

    // Open WhatsApp in new tab
    if (typeof window !== 'undefined') {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="relative rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-10 shadow-2xl">
      <div className="max-w-md mx-auto">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 px-3 py-1 text-xs font-bold text-orange-400">
            <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
            <span>Afiliación Inmediata</span>
          </div>
          <h3 className="text-2xl font-black text-white">Solicita tu Afiliación</h3>
          <p className="text-xs sm:text-sm text-slate-400">
            Completa los datos de tu negocio y un asesor comercial de Pallevar se comunicará contigo al instante por WhatsApp.
          </p>
        </div>

        {submitted ? (
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-6 text-center space-y-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
            <h4 className="text-lg font-bold text-white">¡Solicitud iniciada!</h4>
            <p className="text-xs text-slate-300">
              Se ha abierto WhatsApp para conectar directamente con tu asesor comercial. Si no abrió automáticamente, haz clic abajo:
            </p>
            <a
              href={`https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
                `Hola Pallevar, solicito afiliar mi negocio ${formData.businessName}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-emerald-500 transition"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Abrir WhatsApp Ahora</span>
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <Store className="h-3.5 w-3.5 text-orange-500" />
                <span>Nombre del Negocio o Marca *</span>
              </label>
              <input
                type="text"
                required
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                placeholder="Ej. Arepas & Burger, Supermercado El Ahorro"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 text-orange-500" />
                  <span>Tipo de Comercio</span>
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2.5 text-xs text-white focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                >
                  <option value="Restaurante / Comida">Restaurante / Comida</option>
                  <option value="Minimarket / Tienda">Minimarket / Tienda</option>
                  <option value="Farmacia / Salud">Farmacia / Salud</option>
                  <option value="Licorería / Bebidas">Licorería / Bebidas</option>
                  <option value="Panadería / Repostería">Panadería / Repostería</option>
                  <option value="Mascotas / Pet Shop">Mascotas / Pet Shop</option>
                  <option value="Otro Comercio">Otro Comercio</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-orange-500" />
                  <span>Ciudad / Municipio *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ej. Mocoa, Pasto, Bogotá"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-orange-500" />
                  <span>Tu Nombre *</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.contactName}
                  onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  placeholder="Nombre y apellido"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-orange-500" />
                  <span>WhatsApp / Teléfono *</span>
                </label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Ej. 3508966184"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Comentarios o preguntas (opcional)
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="¿Tienes repartidores propios? ¿Cuántos productos manejas?"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 py-3 text-xs font-bold text-white shadow-lg shadow-orange-600/30 hover:from-orange-500 hover:to-amber-500 transition cursor-pointer"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chatear con Asesor Pallevar (WhatsApp)</span>
              <Send className="h-3.5 w-3.5 ml-1" />
            </button>

            <p className="text-[11px] text-center text-slate-500 pt-1">
              Atención comercial directa al <strong className="text-slate-400">+57 350 896 6184</strong>. Sin compromisos ni costos de apertura sorpresa.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
