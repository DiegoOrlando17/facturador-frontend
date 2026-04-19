import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/app/AuthContext";

export function AppShell({ children }: { children: ReactNode }) {
  const { logout, user } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="brand-lockup">
          <span className="brand-mark">F</span>
          <div>
            <strong>Facturador</strong>
            <p>Panel interno</p>
          </div>
        </Link>

        <div className="app-header-actions">
          <div className="user-chip">
            <span>{user?.role ?? "ADMIN"}</span>
            <small>{user?.email}</small>
          </div>
          <button type="button" className="secondary-button" onClick={logout}>
            Cerrar sesion
          </button>
        </div>
      </header>

      {children}
    </div>
  );
}
