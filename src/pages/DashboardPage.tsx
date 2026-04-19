import { useAuth } from "@/app/AuthContext";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { MetricCard } from "@/components/ui/MetricCard";
import { useApiResource } from "@/hooks/useApiResource";
import { formatCurrency, formatDateTime } from "@/lib/formatters";

type DashboardCard = {
  id: string;
  label: string;
  value: number;
  tone: "neutral" | "success" | "warning" | "danger";
};

type RecentPayment = {
  id: string;
  amount: number;
  customer: string | null;
  status: string;
  createdAt: string;
  tenant?: {
    id: string;
    slug: string;
    name: string;
  };
};

type DashboardSummary = {
  tenants: {
    total: number;
    active: number;
    withErrors: number;
  };
  payments: {
    total: number;
    pending: number;
    failed: number;
    complete: number;
    totalAmount: number;
  };
  recentPayments: RecentPayment[];
};

type DashboardResponse = {
  cards: DashboardCard[];
  summary: DashboardSummary;
};

function describeCard(card: DashboardCard, summary: DashboardSummary) {
  switch (card.id) {
    case "tenants_total":
      return `${summary.tenants.active} activos, ${summary.tenants.withErrors} con alertas`;
    case "payments_total":
      return `${summary.payments.complete} completados sobre ${summary.payments.total}`;
    case "payments_complete":
      return `${formatCurrency(summary.payments.totalAmount)} facturados`;
    case "payments_pending":
      return card.value > 0 ? "Requieren seguimiento" : "Sin pendientes operativos";
    case "payments_failed":
      return card.value > 0 ? "Necesitan revision manual" : "Sin errores recientes";
    case "amount_total":
      return `${summary.recentPayments.length} movimientos recientes cargados`;
    default:
      return "";
  }
}

function getSpotlightText(summary: DashboardSummary) {
  if (summary.recentPayments.length === 0) {
    return {
      title: "Todavia no hay actividad reciente",
      detail: "Cuando entren pagos o comprobantes, vas a ver el pulso operativo aca.",
    };
  }

  if (summary.payments.pending > 0) {
    return {
      title: `${summary.payments.pending} pagos necesitan seguimiento`,
      detail: "El panel ya te marca volumen pendiente para priorizar acciones.",
    };
  }

  if (summary.payments.failed > 0) {
    return {
      title: `${summary.payments.failed} pagos fallaron recientemente`,
      detail: "Conviene revisar la actividad reciente para detectar tenants o integraciones afectadas.",
    };
  }

  return {
    title: `${summary.payments.complete} pagos completados`,
    detail: "La operacion reciente viene estable y sin pendientes visibles.",
  };
}

function prettifyStatus(status: string) {
  return status.replace(/_/g, " ");
}

export function DashboardPage() {
  const { can, token, user } = useAuth();
  const {
    data: dashboard,
    errorMessage,
    isLoading,
    reload,
  } = useApiResource<DashboardResponse>("/admin/dashboard", {
    enabled: Boolean(token),
    fallbackErrorMessage: "No se pudo cargar el dashboard.",
  });

  const summary = dashboard?.summary;
  const spotlight = summary ? getSpotlightText(summary) : null;
  const canManagePayments = can("payments:manage");
  const canManageTenants = can("tenants:manage");
  const canManageIntegrations = can("integrations:manage");
  const canManageUsers = can("users:manage");

  return (
    <main className="shell shell--app">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Operacion</span>
          <h1>Todo el circuito de facturacion en un solo lugar.</h1>
          <p>
            El monitor ahora consume el resumen real del backend admin para mostrar
            estado operativo, volumen de cobros y actividad reciente.
          </p>

          <div className="hero-actions">
            <PermissionGate
              permission="payments:manage"
              fallback={
                <button type="button" className="secondary-button" disabled>
                  Solo lectura
                </button>
              }
            >
              <button type="button" className="primary-button">
                Gestionar pagos
              </button>
            </PermissionGate>
            <button type="button" className="secondary-button">
              Ver actividad
            </button>
          </div>
        </div>

        <div className="spotlight-card">
          <p>Actividad de hoy</p>
          <strong>{spotlight?.title ?? "Cargando actividad..."}</strong>
          <span>{spotlight?.detail ?? "Estamos consultando el resumen operativo del backend."}</span>
          <small className="spotlight-card__meta">
            {canManagePayments
              ? "Tu rol puede operar pagos y seguimiento."
              : "Tu rol esta en modo solo lectura para operaciones."}
          </small>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Resumen general">
        {isLoading ? (
          <article className="panel panel--feedback">
            <strong>Cargando dashboard...</strong>
            <p>Estamos trayendo las metricas reales del backend admin.</p>
          </article>
        ) : errorMessage ? (
          <article className="panel panel--feedback panel--danger">
            <strong>No pudimos cargar el dashboard</strong>
            <p>{errorMessage}</p>
            <button type="button" className="secondary-button" onClick={() => void reload()}>
              Reintentar
            </button>
          </article>
        ) : dashboard && summary ? (
          dashboard.cards.map((card) => (
            <MetricCard
              key={card.id}
              label={card.label}
              value={card.id === "amount_total" ? formatCurrency(card.value) : card.value}
              detail={describeCard(card, summary)}
              tone={card.tone}
            />
          ))
        ) : (
          <article className="panel panel--feedback">
            <strong>Sin datos por ahora</strong>
            <p>El backend respondio sin contenido visible para mostrar en resumen.</p>
          </article>
        )}
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Flujo</span>
              <h2>Actividad reciente</h2>
            </div>
            <a href="/">Ver modulo completo</a>
          </div>

          <div className="invoice-list">
            {isLoading ? (
              <div className="panel-state">
                <strong>Cargando movimientos...</strong>
                <span>Estamos trayendo los ultimos pagos del monitor.</span>
              </div>
            ) : errorMessage ? (
              <div className="panel-state panel-state--danger">
                <strong>Sin actividad disponible</strong>
                <span>{errorMessage}</span>
              </div>
            ) : summary && summary.recentPayments.length > 0 ? (
              summary.recentPayments.map((payment) => (
                <div key={payment.id} className="invoice-row">
                  <div>
                    <strong>{payment.customer || payment.tenant?.name || `Pago ${payment.id}`}</strong>
                    <span>
                      {prettifyStatus(payment.status)}
                      {payment.tenant?.name ? ` · ${payment.tenant.name}` : ""}
                    </span>
                    <small className="invoice-row__meta">{formatDateTime(payment.createdAt)}</small>
                  </div>
                  <p>{formatCurrency(payment.amount)}</p>
                </div>
              ))
            ) : (
              <div className="panel-state">
                <strong>Todavia no hay pagos recientes</strong>
                <span>Cuando el backend registre actividad, la vamos a listar aca.</span>
              </div>
            )}
          </div>
        </article>

        <article className="panel accent-panel">
          <span className="eyebrow">Siguiente paso</span>
          <h2>Permisos del rol</h2>
          <ul>
            <li>{user ? `Rol actual: ${user.role}.` : "Rol no disponible."}</li>
            <li>{canManagePayments ? "Puede operar pagos y acciones manuales." : "No puede ejecutar acciones operativas."}</li>
            <li>{canManageTenants ? "Puede crear y editar tenants." : "No puede modificar tenants."}</li>
            <li>{canManageIntegrations ? "Puede cambiar integraciones y configuracion sensible." : "No puede cambiar integraciones."}</li>
            <li>{canManageUsers ? "Puede administrar usuarios." : "No puede administrar usuarios."}</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
