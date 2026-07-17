import { LoginForm } from "./ui/login-form";

export default function Home() {
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
            <span className="eyebrow eyebrow--light">MELIUS TIME</span>
            <h1>Tu jornada, clara y bajo control.</h1>
            <p>
              Registra entradas, pausas y salidas con trazabilidad completa para
              cada consultor, cliente y localidad.
            </p>
          </div>
          <div className="auth-feature-row" aria-label="Beneficios">
            <span>Multiempresa</span>
            <span>Auditable</span>
            <span>Tiempo real</span>
          </div>
        </div>
        <div className="brand-orb brand-orb--one" />
        <div className="brand-orb brand-orb--two" />
      </section>

      <section className="auth-form-panel">
        <LoginForm />
      </section>
    </main>
  );
}
