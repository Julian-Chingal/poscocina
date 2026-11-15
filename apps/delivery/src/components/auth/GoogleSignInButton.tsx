"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Loader2 } from "lucide-react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          renderButton: (
            parent: HTMLElement,
            options: {
              theme?: "outline" | "filled_blue" | "filled_black";
              size?: "large" | "medium" | "small";
              text?: "signin_with" | "signup_with" | "continue_with" | "signin";
              shape?: "rectangular" | "pill" | "circle" | "square";
              logo_alignment?: "left" | "center";
              width?: number | string;
              locale?: string;
            }
          ) => void;
          prompt: () => void;
        };
      };
    };
  }
}

interface GoogleSignInButtonProps {
  onSuccess: (idToken: string) => Promise<void> | void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [clientId, setClientId] = useState<string>(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""
  );
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch clientId from BFF endpoint if not configured statically
  useEffect(() => {
    if (!clientId) {
      fetch("/api/auth/google/client-id")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.clientId) {
            setClientId(data.clientId);
          }
        })
        .catch(() => {});
    }
  }, [clientId]);

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      if (!response.credential) {
        const msg = "No se recibió la credencial de autenticación de Google.";
        if (onError) onError(msg);
        return;
      }

      setIsLoading(true);
      try {
        await onSuccess(response.credential);
      } catch (err: any) {
        const errorMsg = err.message || "Error al autenticar con Google.";
        if (onError) onError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  // Load GIS script dynamically
  useEffect(() => {
    if (window.google?.accounts?.id) {
      setScriptLoaded(true);
      return;
    }

    const existingScript = document.getElementById("google-gsi-client");
    if (existingScript) {
      existingScript.addEventListener("load", () => setScriptLoaded(true));
      return;
    }

    const script = document.createElement("script");
    script.id = "google-gsi-client";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      console.warn("No se pudo cargar Google Identity Services.");
    };
    document.body.appendChild(script);
  }, []);

  // Initialize and render official button
  useEffect(() => {
    if (!scriptLoaded || !clientId || !containerRef.current || !window.google?.accounts?.id) {
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      containerRef.current.innerHTML = "";
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: "filled_black",
        size: "large",
        text: "continue_with",
        shape: "pill",
        width: "100%",
        locale: "es",
      });
    } catch (e) {
      console.error("Error inicializando Google Sign-In:", e);
    }
  }, [scriptLoaded, clientId, handleCredentialResponse]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      {isLoading ? (
        <div className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-950 text-xs font-semibold text-slate-300">
          <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
          <span>Verificando con Google...</span>
        </div>
      ) : (
        <div
          ref={containerRef}
          className={`w-full flex justify-center ${disabled ? "opacity-50 pointer-events-none" : ""}`}
        />
      )}
    </div>
  );
};
