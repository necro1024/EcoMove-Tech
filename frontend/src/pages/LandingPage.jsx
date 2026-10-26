import React from 'react';

export default function LandingPage({ onOpenLogin, onOpenRegister }) {
  return (
    <div className="min-vh-100" style={{ backgroundColor: 'var(--color-section-bg)' }}>
      <nav className="theme-header py-3 px-4 shadow-sm sticky-top">
        <div className="container-fluid d-flex justify-content-between align-items-center" style={{ maxWidth: '1360px' }}>
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-lightning-charge-fill text-electric fs-2"></i>
            <div>
              <h4 className="fw-bold mb-0 text-white">EcoMove Tech</h4>
              <small className="text-secondary-custom" style={{ fontSize: '0.75rem' }}>
                Gestión Integral de Mantenimiento de Movilidad Eléctrica
              </small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <a href="#servicios" className="btn btn-sm text-white text-decoration-none d-none d-md-inline">
              Servicios
            </a>
            <a href="#empresa" className="btn btn-sm text-white text-decoration-none d-none d-md-inline">
              La Empresa
            </a>
            <a href="#sedes" className="btn btn-sm text-white text-decoration-none d-none d-md-inline">
              Sedes
            </a>
            <button onClick={onOpenLogin} className="btn btn-outline-light btn-sm px-3 rounded-pill">
              <i className="bi bi-box-arrow-in-right me-1"></i> Iniciar Sesión
            </button>
            <button onClick={onOpenRegister} className="btn btn-electric btn-sm px-3 rounded-pill">
              <i className="bi bi-person-plus-fill me-1"></i> Registrarse
            </button>
          </div>
        </div>
      </nav>

      <div className="theme-banner py-5 px-4 my-4 container rounded-4 shadow-sm" style={{ maxWidth: '1360px' }}>
        <div className="row align-items-center py-4">
          <div className="col-lg-7">
            <span className="badge px-3 py-1 mb-3 text-uppercase fw-bold" style={{ backgroundColor: '#23272b', color: 'var(--color-electric-green)' }}>
              SERVICIO TÉCNICO ESPECIALIZADO 2026
            </span>
            <h1 className="fw-bold text-white display-5 mb-3">
              Mantenimiento inteligente para tu Scooter y Bicicleta Eléctrica
            </h1>
            <p className="fs-5 mb-4 text-secondary-custom" style={{ color: '#cbd5e1' }}>
              Atención presencial en nuestro taller central y auxilio mecánico móvil en ruta en Lima Metropolitana. Trazabilidad digital completa mediante Hoja de Vida técnica por vehículo.
            </p>
            <div className="d-flex gap-3">
              <button onClick={onOpenRegister} className="btn btn-electric px-4 py-2 rounded-pill fw-bold">
                <i className="bi bi-person-check-fill me-2"></i> Crear Cuenta de Cliente
              </button>
              <button onClick={onOpenLogin} className="btn btn-outline-light px-4 py-2 rounded-pill fw-semibold">
                Acceder a mi Portal
              </button>
            </div>
          </div>
          <div className="col-lg-5 text-center mt-4 mt-lg-0">
            <div className="p-4 rounded-circle d-inline-block" style={{ backgroundColor: '#151719', border: '3px solid var(--color-electric-green)' }}>
              <i className="bi bi-scooter text-electric" style={{ fontSize: '6rem' }}></i>
            </div>
          </div>
        </div>
      </div>

      <div id="empresa" className="container py-5" style={{ maxWidth: '1360px' }}>
        <div className="text-center mb-5">
          <span className="badge bg-dark text-electric px-3 py-2 rounded-pill fw-bold text-uppercase mb-2">CONÓCENOS</span>
          <h2 className="fw-bold text-dark">Liderando el Transporte Sostenible en Perú</h2>
          <p className="text-secondary-custom mx-auto" style={{ maxWidth: '650px' }}>
            Nacidos en 2026 para resolver las fallas imprevistas, demoras y falta de repuestos originales en vehículos eléctricos ligeros.
          </p>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-6">
            <div className="custom-card p-4 h-100 shadow-sm border-top border-4" style={{ borderTopColor: 'var(--color-electric-green) !important' }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-circle p-3" style={{ backgroundColor: '#151719' }}>
                  <i className="bi bi-compass text-electric fs-3"></i>
                </div>
                <h4 className="fw-bold text-dark mb-0">Nuestra Misión</h4>
              </div>
              <p className="text-secondary-custom mb-0">
                Garantizar una gestión ágil, eficiente y transparente en el mantenimiento preventivo y correctivo de la micromovilidad eléctrica, conectando a usuarios con técnicos certificados mediante una plataforma web intuitiva con asistencia en taller y a domicilio.
              </p>
            </div>
          </div>

          <div className="col-md-6">
            <div className="custom-card p-4 h-100 shadow-sm border-top border-4" style={{ borderTopColor: '#151719 !important' }}>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className="rounded-circle p-3" style={{ backgroundColor: '#151719' }}>
                  <i className="bi bi-eye text-electric fs-3"></i>
                </div>
                <h4 className="fw-bold text-dark mb-0">Nuestra Visión</h4>
              </div>
              <p className="text-secondary-custom mb-0">
                Ser la red tecnológica referente a nivel nacional en soporte técnico, prolongación de vida útil de baterías de litio y seguridad vial para vehículos eléctricos ligeros.
              </p>
            </div>
          </div>
        </div>

        <div id="servicios" className="row g-4 mb-5">
          <div className="col-md-4">
            <div className="custom-card p-4 text-center h-100 shadow-sm">
              <i className="bi bi-battery-charging text-electric fs-1 mb-3 d-block"></i>
              <h5 className="fw-bold text-dark">Diagnóstico de Baterías y BMS</h5>
              <p className="text-secondary-custom small mb-0">
                Medición con multímetro de alta precisión, balance de celdas 18650/21700 y reemplazo de tarjetas controladoras BMS.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="custom-card p-4 text-center h-100 shadow-sm">
              <i className="bi bi-geo-alt-fill text-electric fs-1 mb-3 d-block"></i>
              <h5 className="fw-bold text-dark">Auxilio Mecánico en Ruta</h5>
              <p className="text-secondary-custom small mb-0">
                Unidades técnicas móviles equipadas para asistir fallas de neumáticos, frenos hidráulicos y aceleradores en tu ubicación.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="custom-card p-4 text-center h-100 shadow-sm">
              <i className="bi bi-file-earmark-medical text-electric fs-1 mb-3 d-block"></i>
              <h5 className="fw-bold text-dark">Hoja de Vida Técnica Oficial</h5>
              <p className="text-secondary-custom small mb-0">
                Trazabilidad digital de cada reparación y repuesto utilizado, protegiendo la garantía y el valor de reventa de tu equipo.
              </p>
            </div>
          </div>
        </div>

        <div id="sedes" className="custom-card p-4 shadow-sm" style={{ backgroundColor: '#151719', color: '#FFFFFF' }}>
          <div className="row align-items-center">
            <div className="col-md-8">
              <h4 className="fw-bold text-white mb-2"><i className="bi bi-building text-electric me-2"></i>Taller Central Lima</h4>
              <p className="text-secondary-custom mb-0" style={{ color: '#cbd5e1' }}>
                Av. La Marina 2401, San Miguel. Horario de atención: Lunes a Sábado de 8:30 AM a 6:30 PM.
              </p>
            </div>
            <div className="col-md-4 text-md-end mt-3 mt-md-0">
              <button onClick={onOpenRegister} className="btn btn-electric px-4 rounded-pill">
                Registra tu Vehículo
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="theme-header py-4 text-center text-secondary-custom border-top border-secondary">
        <small>© 2026 EcoMove Tech Perú — Plataforma Universitaria Integrador I (UTP)</small>
      </footer>
    </div>
  );
}