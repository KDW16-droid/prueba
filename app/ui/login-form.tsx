"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        remember: new FormData(event.currentTarget).get("remember") === "on",
      }),
    });

    if (!response.ok) {
      setMessage("No fue posible iniciar sesión. Verifica tus credenciales.");
      return;
    }

    router.replace("/panel");
    router.refresh();
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
    </div>
  );
}
