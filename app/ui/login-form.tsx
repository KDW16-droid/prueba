"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const accounts = [
  { label: "Empleado", email: "diego.ramirez@melius.demo", role: "employee" },
  { label: "RH", email: "rh@melius.demo", role: "hr" },
  {
    label: "Operaciones",
    email: "operaciones@melius.demo",
    role: "operations",
  },
] as const;

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const selectDemo = (account: (typeof accounts)[number]) => {
    setEmail(account.email);
    setPassword("Melius2026!");
    setMessage(`Cuenta ${account.label} preparada para la demostración.`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const account = accounts.find((item) => item.email === email.trim());

    if (!account || password !== "Melius2026!") {
      setMessage("Para la POC utiliza una de las cuentas de demostración.");
      return;
    }

    router.push(`/panel?role=${account.role}`);
  };

  return (
    <div className="login-card">
      <span className="eyebrow">Acceso seguro</span>
      <h2>Bienvenido</h2>
      <p>Ingresa con tu correo corporativo para gestionar tu jornada.</p>

      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="nombre@meliusservices.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="field">
          <label htmlFor="password">Contraseña</label>
          <div className="password-wrap">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Ingresa tu contraseña"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button
              className="text-action password-toggle"
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? "Ocultar" : "Ver"}
            </button>
          </div>
        </div>

        <div className="form-options">
          <label className="remember">
            <input type="checkbox" name="remember" />
            Recordarme
          </label>
          <button
            className="text-action"
            type="button"
            onClick={() => router.push("/recuperar")}
          >
            Recuperar contraseña
          </button>
        </div>

        {message ? (
          <div className="form-message" role="status">
            {message}
          </div>
        ) : null}

        <button className="primary-button primary-button--wide" type="submit">
          Iniciar sesión
        </button>
      </form>

      <div className="demo-accounts">
        <span>Cuentas para probar la POC</span>
        <div className="demo-account-grid">
          {accounts.map((account) => (
            <button
              className="demo-account"
              key={account.role}
              type="button"
              onClick={() => selectDemo(account)}
            >
              {account.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
