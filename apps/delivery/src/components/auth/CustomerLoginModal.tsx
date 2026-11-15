"use client";

import React, { useState } from "react";
import { MessageSquare, Phone, ShieldCheck, ArrowRight, CheckCircle2, RotateCw, X } from "lucide-react";
import { useCustomerAuth } from "../../context/CustomerAuthContext";
import { useCart } from "../../context/CartContext";
import { GoogleSignInButton } from "./GoogleSignInButton";
import { sileo } from "sileo";

export const CustomerLoginModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login } = useCustomerAuth();
  const { currentVenue } = useCart();

  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleGoogleSuccess = async (idToken: string) => {
    try {
      const res = await fetch("/api/auth/customer/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idToken,
          venueId: currentVenue?.id || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al autenticar con Google");
      }

      login(data.token, data.customer);
      sileo.success({ title: `¡Bienvenido, ${data.customer.name}!` });
      setIsAuthModalOpen(false);
      setStep("phone");
    } catch (err: any) {
      sileo.error({ title: err.message || "Fallo en inicio de sesión con Google" });
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 7) {
      sileo.error({ title: "Por favor ingresa un número de teléfono válido" });
      return;
    }

    if (!currentVenue?.id) {
      sileo.error({ title: "Selecciona un restaurante antes de iniciar sesión" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/customer/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: currentVenue.id,
          phone: cleanPhone,
          name: name.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Error al solicitar el código");
      }

      sileo.success({ title: "¡Código enviado! Revisa tu WhatsApp 📲" });
      setStep("otp");
    } catch (err: any) {
      sileo.error({ title: err.message || "No se pudo enviar el código por WhatsApp" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    const cleanCode = otpCode.replace(/\D/g, "");

    if (cleanCode.length !== 6) {
      sileo.error({ title: "El código debe tener 6 dígitos" });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/customer/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: currentVenue?.id,
          phone: cleanPhone,
          code: cleanCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Código incorrecto o expirado");
      }

      login(data.token, data.customer);
      sileo.success({ title: `¡Bienvenido de nuevo, ${data.customer.name}!` });
      setStep("phone");
      setOtpCode("");
    } catch (err: any) {
      sileo.error({ title: err.message || "Código incorrecto" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl text-slate-100">
        <button
          onClick={() => {
            setIsAuthModalOpen(false);
            setStep("phone");
          }}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight text-white">
              {step === "phone" ? "Iniciar Sesión en Zogui" : "Verifica tu Código"}
            </h2>
            <p className="text-xs text-slate-400">
              {step === "phone"
                ? "Accede en 1 clic con tu cuenta de Google o mediante WhatsApp."
                : `Ingresa el código de 6 dígitos que enviamos a +${phone.replace(/\D/g, "")}`}
            </p>
          </div>
        </div>

        {step === "phone" ? (
          <div className="space-y-4">
            {/* Google 1-Click Login */}
            <div>
              <GoogleSignInButton
                onSuccess={handleGoogleSuccess}
                onError={(err) => sileo.error({ title: err })}
                disabled={loading}
              />
            </div>

            <div className="relative my-3 flex items-center justify-center">
              <div className="w-full border-t border-slate-800" />
              <span className="absolute bg-slate-900 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                o continuar con WhatsApp
              </span>
            </div>

            <form onSubmit={handleRequestOtp} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Tu Nombre completo (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej. Carlos Mendoza"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Número de WhatsApp *
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="tel"
                  required
                  placeholder="Ej. 3001234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 pl-10 pr-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !phone.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Enviando código...</span>
                </>
              ) : (
                <>
                  <span>Enviar Código por WhatsApp</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
          </div>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Código de 6 dígitos
              </label>
              <input
                type="text"
                pattern="[0-9]*"
                maxLength={6}
                required
                autoFocus
                placeholder="000000"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 text-center text-3xl font-mono font-black tracking-widest text-emerald-400 placeholder-slate-600 focus:border-emerald-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="underline hover:text-white"
              >
                Cambiar número
              </button>
              <button
                type="button"
                onClick={handleRequestOtp}
                className="text-emerald-400 hover:underline"
              >
                Reenviar código
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || otpCode.length !== 6}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <RotateCw className="h-4 w-4 animate-spin" />
                  <span>Validando...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Verificar e Ingresar</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
