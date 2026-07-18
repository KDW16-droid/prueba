"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Role = "employee" | "hr" | "operations";
type WorkState =
  | "not-started"
  | "working"
  | "break"
  | "provisional-exit"
  | "reentry-authorized"
  | "finished";

type TimelineItem = {
  type: string;
  label: string;
  detail: string;
  time: string;
};

const employees = [
  {
    initials: "DR",
    name: "Diego Ramírez",
    email: "diego.ramirez@melius.demo",
    company: "Nébula Retail",
    location: "Ciudad de México",
    status: "Trabajando",
    hours: "07:42",
    attendance: "A tiempo",
  },
  {
    initials: "CT",
    name: "Camila Torres",
    email: "camila.torres@melius.demo",
    company: "Aurea Logistics",
    location: "Bogotá",
    status: "En comida",
    hours: "04:18",
    attendance: "A tiempo",
  },
  {
    initials: "AM",
    name: "Andrés Méndez",
    email: "andres.mendez@melius.demo",
    company: "Nébula Retail",
    location: "Monterrey",
    status: "Trabajando",
    hours: "06:55",
    attendance: "Retardo",
  },
  {
    initials: "LS",
    name: "Laura Silva",
    email: "laura.silva@melius.demo",
    company: "Aurea Logistics",
    location: "Medellín",
    status: "Salida provisional",
    hours: "05:31",
    attendance: "A tiempo",
  },
];

const pendingApprovals = [
  {
    id: 1,
    name: "Laura Silva",
    meta: "Aurea Logistics · Medellín",
    type: "Reingreso",
    reason: "Salida provisional por trámite personal. Solicita continuar jornada.",
    time: "Hace 8 min",
  },
  {
    id: 2,
    name: "Andrés Méndez",
    meta: "Nébula Retail · Monterrey",
    type: "Corrección",
    reason: "Olvidó finalizar la pausa de comida. Solicita ajuste a las 14:06.",
    time: "Hace 24 min",
  },
  {
    id: 3,
    name: "Camila Torres",
    meta: "Aurea Logistics · Bogotá",
    type: "Horas extra",
    reason: "Cierre operativo solicitado por el cliente. Requiere 1.5 horas.",
    time: "Hace 41 min",
  },
];

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function nowLabel() {
  return new Intl.DateTimeFormat("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date());
}

export function PanelApp({ role }: { role: Role }) {
  const router = useRouter();
  const isEmployee = role === "employee";
  const [view, setView] = useState(isEmployee ? "clock" : "overview");
  const [menuOpen, setMenuOpen] = useState(false);
  const [now, setNow] = useState(new Date());
  const [workState, setWorkState] = useState<WorkState>("not-started");
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [modal, setModal] = useState<"provisional" | "change" | null>(null);
  const [toast, setToast] = useState("");
  const [approvals, setApprovals] = useState(pendingApprovals);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const profile = useMemo(() => {
    if (role === "hr") {
      return { initials: "RH", name: "Mariana RH", title: "Recursos Humanos" };
    }
    if (role === "operations") {
      return { initials: "OP", name: "Sofía Operaciones", title: "Dirección de Operaciones" };
    }
    return { initials: "DR", name: "Diego Ramírez", title: "Consultor" };
  }, [role]);

  const addTimeline = (item: Omit<TimelineItem, "time">) => {
    setTimeline((current) => [...current, { ...item, time: nowLabel() }]);
  };

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 3600);
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  };

  const clockIn = () => {
    setWorkState("working");
    addTimeline({ type: "E", label: "Entrada", detail: "IP registrada · Ciudad de México" });
    showToast("Entrada registrada correctamente.");
  };

  const toggleBreak = () => {
    if (workState === "working") {
      setWorkState("break");
      addTimeline({ type: "P", label: "Inicio de pausa", detail: "Tiempo no laborable" });
      showToast("Pausa iniciada.");
      return;
    }
    setWorkState("working");
    addTimeline({ type: "P", label: "Fin de pausa", detail: "Jornada reanudada" });
    showToast("Pausa finalizada.");
  };

  const provisionalExit = () => {
    setWorkState("provisional-exit");
    addTimeline({
      type: "SP",
      label: "Salida provisional",
      detail: "Reingreso sujeto a autorización",
    });
    setModal(null);
    showToast("Salida provisional registrada y solicitud de reingreso creada.");
  };

  const finishDay = () => {
    setWorkState("finished");
    addTimeline({ type: "S", label: "Salida", detail: "Jornada finalizada" });
    showToast("Salida registrada. Jornada finalizada.");
  };

  const requestChange = () => {
    setModal(null);
    showToast("Petición enviada a RH y Dirección de Operaciones.");
  };

  const resolveApproval = (id: number, approved: boolean) => {
    setApprovals((current) => current.filter((item) => item.id !== id));
    showToast(approved ? "Solicitud autorizada en esta demostración." : "Solicitud rechazada en esta demostración.");
  };

  const downloadExcel = () => {
    const headers = [
      "Empleado",
      "Correo",
      "Empresa",
      "Localidad",
      "Estado",
      "Horas trabajadas",
      "Asistencia",
    ];
    const rows = employees.map((employee) => [
      employee.name,
      employee.email,
      employee.company,
      employee.location,
      employee.status,
      employee.hours,
      employee.attendance,
    ]);
    const escape = (value: string) =>
      value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
    const xmlRows = [headers, ...rows]
      .map(
        (row) =>
          `<Row>${row
            .map((cell) => `<Cell><Data ss:Type="String">${escape(cell)}</Data></Cell>`)
            .join("")}</Row>`,
      )
      .join("");
    const workbook = `<?xml version="1.0"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="Asistencia"><Table>${xmlRows}</Table></Worksheet></Workbook>`;
    const blob = new Blob([workbook], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "Reporte_Asistencia_Melius.xls";
    anchor.click();
    URL.revokeObjectURL(url);
    showToast("Reporte Excel generado.");
  };

  const navItems = isEmployee
    ? [
        { id: "clock", icon: "RC", label: "Mi jornada" },
        { id: "history", icon: "HI", label: "Mi histórico" },
        { id: "requests", icon: "SO", label: "Solicitudes" },
      ]
    : [
        { id: "overview", icon: "RE", label: "Resumen" },
        { id: "consultants", icon: "CO", label: "Consultores" },
        { id: "approvals", icon: "AU", label: "Autorizaciones" },
        { id: "reports", icon: "IN", label: "Informes" },
        { id: "settings", icon: "PA", label: "Parámetros" },
      ];

  const renderEmployee = () => {
    if (view === "history") {
      return (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Movimientos de la sesión</h2>
              <p>Jornadas, pausas, retardos y autorizaciones</p>
            </div>
          </div>
          <div className="card-body table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Entrada</th>
                  <th>Salida</th>
                  <th>Pausas</th>
                  <th>Total</th>
                  <th>Incidencia</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>16 jul 2026</td>
                  <td>Nébula Retail</td>
                  <td>08:04</td>
                  <td>17:12</td>
                  <td>00:52</td>
                  <td>08:16</td>
                  <td><span className="badge badge--success">Completa</span></td>
                </tr>
                <tr>
                  <td>15 jul 2026</td>
                  <td>Nébula Retail</td>
                  <td>08:19</td>
                  <td>17:10</td>
                  <td>00:47</td>
                  <td>08:04</td>
                  <td><span className="badge badge--warning">Retardo</span></td>
                </tr>
                <tr>
                  <td>14 jul 2026</td>
                  <td>Nébula Retail</td>
                  <td>07:58</td>
                  <td>17:06</td>
                  <td>01:01</td>
                  <td>08:07</td>
                  <td><span className="badge badge--success">Completa</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      );
    }

    if (view === "requests") {
      return (
        <section className="card">
          <div className="card-header">
            <div>
              <h2>Mis solicitudes</h2>
              <p>Seguimiento de cambios, reingresos y horas extra</p>
            </div>
            <button className="primary-button" onClick={() => setModal("change")}>
              Nueva petición
            </button>
          </div>
          <div className="card-body">
            <div className="approval-list">
              <div className="approval-item">
                <div className="approval-heading">
                  <div><strong>Corrección de pausa</strong><span>15 jul · Nébula Retail</span></div>
                  <span className="badge badge--success">Autorizada</span>
                </div>
                <p>Se ajustó el fin de pausa a las 14:06 para fines de esta demostración.</p>
              </div>
              <div className="approval-item">
                <div className="approval-heading">
                  <div><strong>Horas extra</strong><span>11 jul · Nébula Retail</span></div>
                  <span className="badge badge--neutral">Cerrada</span>
                </div>
                <p>Una hora adicional aprobada por Dirección de Operaciones.</p>
              </div>
            </div>
          </div>
        </section>
      );
    }

    const stateCopy: Record<WorkState, string> = {
      "not-started": "Jornada sin iniciar",
      working: "Jornada activa",
      break: "Pausa en curso",
      "provisional-exit": "Reingreso pendiente de autorización",
      "reentry-authorized": "Reingreso autorizado",
      finished: "Jornada finalizada",
    };

    return (
      <div className="dashboard-grid">
        <div>
          <section className="clock-card card">
            <div className="clock-status">
              <span className="status-light" />
              {stateCopy[workState]}
            </div>
            <div className="live-clock">
              <time dateTime={now.toISOString()}>{formatTime(now)}</time>
              <span>{formatDate(now)} · Ciudad de México</span>
            </div>
            <div className="clock-actions">
              {workState === "not-started" || workState === "reentry-authorized" ? (
                <button className="clock-primary" onClick={clockIn}>Registrar entrada</button>
              ) : null}
              {workState === "working" || workState === "break" ? (
                <button className="clock-primary" onClick={toggleBreak}>
                  {workState === "break" ? "Finalizar pausa" : "Iniciar pausa"}
                </button>
              ) : null}
              {workState === "working" ? (
                <button className="clock-secondary" onClick={() => setModal("provisional")}>
                  Salida provisional
                </button>
              ) : null}
              {workState === "working" ? (
                <button className="clock-secondary" onClick={finishDay}>Terminar jornada</button>
              ) : null}
              {workState === "provisional-exit" ? (
                <button className="clock-secondary" disabled>Esperando autorización</button>
              ) : null}
            </div>
          </section>

          <div className="work-summary" style={{ marginTop: 20 }}>
            <div className="summary-cell"><span>Tiempo trabajado</span><strong>07:42</strong><small>Meta autorizada: 08:00</small></div>
            <div className="summary-cell"><span>Pausas</span><strong>00:48</strong><small>No cuentan en la jornada</small></div>
            <div className="summary-cell"><span>Entrada prevista</span><strong>08:00</strong><small>Tolerancia: 15 minutos</small></div>
          </div>
        </div>

        <aside className="card">
          <div className="card-header">
            <div><h2>Actividad de hoy</h2><p>Los movimientos se conservan durante esta sesión</p></div>
            <button className="text-action" onClick={() => setModal("change")}>Solicitar cambio</button>
          </div>
          <div className="card-body">
            {timeline.length ? (
              <div className="timeline-list">
                {timeline.map((item, index) => (
                  <div className="timeline-item" key={`${item.type}-${index}`}>
                    <span className="timeline-marker">{item.type}</span>
                    <div className="timeline-copy"><strong>{item.label}</strong><span>{item.detail}</span></div>
                    <span className="timeline-time">{item.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">Registra tu entrada para iniciar la jornada.</div>
            )}
            <div className="alert-box">
              <span aria-hidden="true">IP</span>
              <div><strong>Monitoreo de ciudad pendiente</strong>La geolocalización de IP se habilitará al conectar el proveedor configurado.</div>
            </div>
          </div>
        </aside>
      </div>
    );
  };

  const renderAdmin = () => {
    if (view === "approvals") {
      return (
        <section className="card">
          <div className="card-header">
            <div><h2>Centro de autorizaciones</h2><p>Una aprobación válida resuelve la solicitud</p></div>
            <span className="badge badge--warning">{approvals.length} pendientes</span>
          </div>
          <div className="card-body">
            <div className="approval-list">
              {approvals.map((approval) => (
                <article className="approval-item" key={approval.id}>
                  <div className="approval-heading">
                    <div><strong>{approval.name}</strong><span>{approval.meta} · {approval.time}</span></div>
                    <span className="badge badge--warning">{approval.type}</span>
                  </div>
                  <p>{approval.reason}</p>
                  <div className="approval-actions">
                    <button className="primary-button small-button" onClick={() => resolveApproval(approval.id, true)}>Autorizar</button>
                    <button className="ghost-button small-button" onClick={() => resolveApproval(approval.id, false)}>Rechazar</button>
                  </div>
                </article>
              ))}
              {!approvals.length ? <div className="empty-state">No hay solicitudes pendientes.</div> : null}
            </div>
          </div>
        </section>
      );
    }

    if (view === "settings") {
      return (
        <section className="card">
          <div className="card-header"><div><h2>Parámetros de asistencia</h2><p>Configuración por cliente y país</p></div><button className="primary-button">Guardar parámetros</button></div>
          <div className="card-body">
            <div className="form-stack">
              <div className="field"><label htmlFor="client-setting">Cliente</label><select id="client-setting"><option>Nébula Retail</option><option>Aurea Logistics</option></select></div>
              <div className="field"><label htmlFor="country-setting">País</label><select id="country-setting"><option>México</option><option>Colombia</option></select></div>
              <div className="field"><label htmlFor="tolerance-setting">Tolerancia antes de retardo (minutos)</label><input id="tolerance-setting" type="number" min="0" defaultValue="15" /></div>
              <div className="field"><label htmlFor="timezone-setting">Zona horaria</label><select id="timezone-setting"><option>America/Mexico_City</option><option>America/Bogota</option></select></div>
            </div>
          </div>
        </section>
      );
    }

    return (
      <>
        <div className="kpi-grid">
          <article className="card kpi-card"><div className="kpi-card-top"><span className="kpi-icon">AC</span><span className="kpi-trend">+4 hoy</span></div><strong>38</strong><span>Consultores activos</span></article>
          <article className="card kpi-card"><div className="kpi-card-top"><span className="kpi-icon">JO</span><span className="kpi-trend">86%</span></div><strong>31</strong><span>Jornadas en curso</span></article>
          <article className="card kpi-card"><div className="kpi-card-top"><span className="kpi-icon">RT</span><span className="kpi-trend">15 min</span></div><strong>3</strong><span>Retardos de hoy</span></article>
          <article className="card kpi-card"><div className="kpi-card-top"><span className="kpi-icon">AL</span><span className="kpi-trend">Revisar</span></div><strong>2</strong><span>Alertas de ciudad</span></article>
        </div>

        <div className="admin-grid">
          <section className="card">
            <div className="card-header">
              <div><h2>Consultores por empresa</h2><p>Estado operativo en tiempo real</p></div>
              <button className="secondary-button small-button" onClick={downloadExcel}>Exportar Excel</button>
            </div>
            <div className="card-body">
              <div className="filters">
                <input className="search-input" type="search" placeholder="Buscar consultor" aria-label="Buscar consultor" />
                <select className="filter-select" aria-label="Filtrar empresa"><option>Todas las empresas</option><option>Nébula Retail</option><option>Aurea Logistics</option></select>
                <select className="filter-select" aria-label="Filtrar estado"><option>Todos los estados</option><option>Trabajando</option><option>En comida</option><option>Salida provisional</option></select>
              </div>
              <div className="table-scroll">
                <table className="data-table">
                  <thead><tr><th>Consultor</th><th>Empresa</th><th>Localidad</th><th>Estado</th><th>Horas</th><th>Asistencia</th></tr></thead>
                  <tbody>
                    {employees.map((employee) => (
                      <tr key={employee.email}>
                        <td><div className="employee-cell"><span className="avatar">{employee.initials}</span><div><strong>{employee.name}</strong><span>{employee.email}</span></div></div></td>
                        <td>{employee.company}</td><td>{employee.location}</td>
                        <td><span className={`badge ${employee.status === "Trabajando" ? "badge--success" : employee.status === "Salida provisional" ? "badge--warning" : "badge--neutral"}`}>{employee.status}</span></td>
                        <td>{employee.hours}</td><td><span className={`badge ${employee.attendance === "Retardo" ? "badge--danger" : "badge--success"}`}>{employee.attendance}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside className="card">
            <div className="card-header"><div><h2>Requieren atención</h2><p>Autorizaciones y alertas</p></div><button className="text-action" onClick={() => setView("approvals")}>Ver todas</button></div>
            <div className="card-body">
              <div className="approval-list">
                {approvals.slice(0, 3).map((approval) => (
                  <article className="approval-item" key={approval.id}>
                    <div className="approval-heading"><div><strong>{approval.name}</strong><span>{approval.meta}</span></div><span className="badge badge--warning">{approval.type}</span></div>
                    <p>{approval.reason}</p>
                    <div className="approval-actions"><button className="primary-button small-button" onClick={() => resolveApproval(approval.id, true)}>Autorizar</button><button className="ghost-button small-button" onClick={() => resolveApproval(approval.id, false)}>Rechazar</button></div>
                  </article>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </>
    );
  };

  return (
    <main className="app-shell">
      <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""}`}>
        <div className="sidebar-brand"><div className="brand-lockup"><span className="brand-symbol" aria-hidden="true">∞</span><span className="brand-name">MELIUS</span></div></div>
        <nav className="sidebar-nav" aria-label="Navegación principal">
          {navItems.map((item) => (
            <button className={`nav-item ${view === item.id ? "nav-item--active" : ""}`} key={item.id} onClick={() => { setView(item.id); setMenuOpen(false); }}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-profile"><span className="avatar">{profile.initials}</span><div className="profile-copy"><strong>{profile.name}</strong><span>{profile.title}</span></div><button className="icon-button" aria-label="Cerrar sesión" onClick={logout}>↗</button></div>
      </aside>

      <section className="main-area">
        <header className="topbar">
          <div className="topbar-actions"><button className="icon-button mobile-menu" aria-label="Abrir menú" onClick={() => setMenuOpen((current) => !current)}>ME</button><div className="topbar-context"><strong>{isEmployee ? "Nébula Retail" : "Vista global"}</strong><span>{isEmployee ? "Ciudad de México · México" : "Todos los clientes y países"}</span></div></div>
          <div className="topbar-actions"><button className="icon-button" aria-label="Notificaciones">AL<span className="notification-dot" /></button><span className="avatar">{profile.initials}</span></div>
        </header>

        <div className="page-wrap">
          <div className="page-heading">
            <div><span className="eyebrow">{isEmployee ? "Mi espacio" : "Operación de asistencia"}</span><h1>{isEmployee ? `Hola, ${profile.name.split(" ")[0]}` : "Control operativo"}</h1><p>{isEmployee ? "Registra tus movimientos y revisa el avance de tu jornada autorizada." : "Supervisa consultores, incidencias y autorizaciones de todas las empresas."}</p></div>
            {!isEmployee ? <div className="heading-actions"><button className="ghost-button" onClick={() => setView("approvals")}>{approvals.length} autorizaciones</button><button className="primary-button" onClick={downloadExcel}>Exportar Excel</button></div> : null}
          </div>
          {isEmployee ? renderEmployee() : renderAdmin()}
        </div>
      </section>

      {toast ? <div className="form-message" role="status" style={{ position: "fixed", zIndex: 80, right: 20, bottom: 20, maxWidth: 380, boxShadow: "var(--shadow)" }}>{toast}</div> : null}

      {modal === "provisional" ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="provisional-title">
            <div className="modal-header"><div><h2 id="provisional-title">Registrar salida provisional</h2><p>La jornada quedará abierta, pero necesitarás autorización para volver a entrar.</p></div><button className="icon-button" aria-label="Cerrar" onClick={() => setModal(null)}>X</button></div>
            <div className="modal-body"><div className="field"><label htmlFor="provisional-reason">Motivo</label><textarea id="provisional-reason" placeholder="Describe brevemente el motivo de la salida" required /></div><div className="alert-box"><span aria-hidden="true">!</span><div><strong>Importante</strong>El tiempo fuera no se suma a la jornada laborada en esta demostración.</div></div></div>
            <div className="modal-footer"><button className="ghost-button" onClick={() => setModal(null)}>Cancelar</button><button className="primary-button" onClick={provisionalExit}>Confirmar salida</button></div>
          </div>
        </div>
      ) : null}

      {modal === "change" ? (
        <div className="modal-backdrop" role="presentation">
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="change-title">
            <div className="modal-header"><div><h2 id="change-title">Petición de cambio</h2><p>La solicitud queda disponible para revisión durante esta demostración.</p></div><button className="icon-button" aria-label="Cerrar" onClick={() => setModal(null)}>X</button></div>
            <div className="modal-body"><div className="field"><label htmlFor="change-type">Tipo de petición</label><select id="change-type"><option>Corrección de hora</option><option>Reingreso</option><option>Horas extra</option><option>Otro</option></select></div><div className="field"><label htmlFor="change-reason">Motivo</label><textarea id="change-reason" placeholder="Explica el cambio solicitado" required /></div></div>
            <div className="modal-footer"><button className="ghost-button" onClick={() => setModal(null)}>Cancelar</button><button className="primary-button" onClick={requestChange}>Enviar petición</button></div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
