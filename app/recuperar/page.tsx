"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RecoveryPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSent(true);
  };

  return (
    <main className="auth-shell">
      <section className="auth-brand-panel" aria-label="Melius Time">
        <div className="auth-brand-content">
          <div className="brand-lockup brand-lockup--light">
            <span className="brand-symbol" aria-hidden="true">
              ∞
            </span>
            <span className="brand-name">MELIUS</span>
          </div>
          <p className="brand-tagline">TRANSFORMA. TRASCIENDE.</p>
          <div className="auth-message">
            <span className="eyebrow eyebrow--light">RECUPERACIÓN</span>
            <h1>Vuelve a tu jornada.</h1>
            <p>
              Enviaremos un enlace temporal al correo registrado por Recursos
              Humanos. El enlace no revela si una cuenta existe.
            </p>
          </div>
        </div>
      </section>

      <section className="auth-form-panel">
        <div className="login-card">
          <span className="eyebrow">Contraseña</span>
          <h2>Recuperar acceso</h2>
          <p>Ingresa tu correo corporativo para recibir las instrucciones.</p>

          <form className="form-stack" onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="recovery-email">Correo electrónico</label>
              <input
                id="recovery-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </div>
            {sent ? (
              <div className="form-message" role="status">
                Si el correo está registrado, recibirás un enlace temporal.
              </div>
            ) : null}
            <button className="primary-button primary-button--wide" type="submit">
              Enviar enlace
            </button>
            <button
              className="ghost-button"
              type="button"
              onClick={() => router.push("/")}
            >
              Volver al inicio de sesión
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
