import { MetricCard } from "@/components/ui/MetricCard";

const metrics = [
  {
    label: "Facturas emitidas",
    value: "1,284",
    detail: "+12% respecto al mes pasado",
  },
  {
    label: "Cobrado este mes",
    value: "$ 8.420.300",
    detail: "87% del objetivo mensual",
  },
  {
    label: "Pendientes",
    value: "34",
    detail: "9 vencen esta semana",
  },
];

const upcomingInvoices = [
  {
    client: "Estudio Roca",
    amount: "$ 420.000",
    status: "Borrador",
  },
  {
    client: "Clinica Delta",
    amount: "$ 1.180.000",
    status: "Lista para enviar",
  },
  {
    client: "Transportes Sur",
    amount: "$ 760.000",
    status: "Pendiente de pago",
  },
];

export function DashboardPage() {
  return (
    <main className="shell shell--app">
      <section className="hero-panel">
        <div className="hero-copy">
          <span className="eyebrow">Operacion</span>
          <h1>Todo el circuito de facturacion en un solo lugar.</h1>
          <p>
            Este dashboard ya queda dentro del area autenticada, listo para
            conectar usuarios reales, permisos y datos de negocio.
          </p>

          <div className="hero-actions">
            <button type="button" className="primary-button">
              Nueva factura
            </button>
            <button type="button" className="secondary-button">
              Ver actividad
            </button>
          </div>
        </div>

        <div className="spotlight-card">
          <p>Actividad de hoy</p>
          <strong>23 comprobantes preparados</strong>
          <span>6 listos para enviar, 4 con recordatorio automatico.</span>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Resumen general">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="content-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">Flujo</span>
              <h2>Proximas facturas</h2>
            </div>
            <a href="/">Ver todas</a>
          </div>

          <div className="invoice-list">
            {upcomingInvoices.map((invoice) => (
              <div key={invoice.client} className="invoice-row">
                <div>
                  <strong>{invoice.client}</strong>
                  <span>{invoice.status}</span>
                </div>
                <p>{invoice.amount}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="panel accent-panel">
          <span className="eyebrow">Siguiente paso</span>
          <h2>Que podemos construir ahora</h2>
          <ul>
            <li>Integracion con API de autenticacion real.</li>
            <li>Recupero de clave y manejo de sesiones.</li>
            <li>Permisos por rol para administracion y ventas.</li>
            <li>Guardas para modulos internos del sistema.</li>
          </ul>
        </article>
      </section>
    </main>
  );
}
