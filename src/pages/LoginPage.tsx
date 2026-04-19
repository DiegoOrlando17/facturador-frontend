import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/app/AuthContext";

type LocationState = {
  from?: {
    pathname?: string;
  };
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isBootstrapping, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const state = location.state as LocationState | null;
  const redirectTo = state?.from?.pathname ?? "/";

  if (isBootstrapping) {
    return null;
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");

    const result = await login({ email, password, remember });

    if (!result.ok) {
      setErrorMessage(result.message ?? "No se pudo iniciar sesion.");
      setIsSubmitting(false);
      return;
    }

    navigate(redirectTo, { replace: true });
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <span className="eyebrow">Bienvenido</span>
        <h1>Entra al panel del facturador con la autenticacion real del backend.</h1>
        <p>
          El frontend ya consume la API admin del proyecto `facturador` y valida
          la sesion con token Bearer.
        </p>

        <div className="login-feature-list">
          <article>
            <strong>Login conectado</strong>
            <p>Usamos `POST /admin/auth/login` con el contrato real del monitor.</p>
          </article>
          <article>
            <strong>Sesion restaurable</strong>
            <p>Al recargar, consultamos `GET /admin/me` para validar el token guardado.</p>
          </article>
          <article>
            <strong>Salida prolija</strong>
            <p>El logout llama `POST /admin/auth/logout` y limpia el estado local.</p>
          </article>
        </div>
      </section>

      <section className="login-card-wrapper">
        <div className="login-card">
          <div className="login-card-heading">
            <span className="eyebrow">Acceso</span>
            <h2>Iniciar sesion</h2>
            <p>Ingresa con un usuario admin existente del backend.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@empresa.com"
              />
            </label>

            <label className="field">
              <span>Contrasena</span>
              <input
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="********"
              />
            </label>

            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              <span>Recordar esta sesion en este navegador</span>
            </label>

            {errorMessage ? <p className="form-error">{errorMessage}</p> : null}

            <button type="submit" className="primary-button primary-button--full" disabled={isSubmitting}>
              {isSubmitting ? "Ingresando..." : "Entrar al panel"}
            </button>
          </form>

          <div className="login-footer">
            <span>En desarrollo usamos proxy de Vite hacia `http://localhost:5000`.</span>
            <Link to="/login">Recargar acceso</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
