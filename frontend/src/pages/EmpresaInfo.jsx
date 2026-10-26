import React from 'react';

export default function EmpresaInfo({ onVolver }) {
  return (
    <div className="container py-4" style={{ maxWidth: '1280px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-uppercase fw-bold text-secondary-custom small">INICIATIVA TECNOLÓGICA 2026</span>
          <h2 className="fw-bold text-dark mb-0">EcoMove Tech Perú</h2>
          <p className="text-secondary-custom">Red de mantenimiento preventivo y auxilio en ruta para scooters y bicicletas eléctricas</p>
        </div>
        <button onClick={onVolver} className="btn btn-electric px-3 rounded-pill">
          <i className="bi bi-arrow-left me-1"></i> Volver al Panel
        </button>
      </div>

      <div className="theme-banner p-4 p-md-5 mb-5 shadow-sm">
        <div className="row align-items-center">
          <div className="col-lg-8">
            <span className="badge px-3 py-1 mb-2 text-uppercase fw-bold" style={{ backgroundColor: '#23272b', color: 'var(--color-electric-green)' }}>
              LIDERANDO LA MICROMOVILIDAD
            </span>
            <h1 className="fw-bold text-white mb-3">Revolucionando el soporte técnico de movilidad urbana en Lima</h1>
            <p className="text-secondary-custom fs-6 mb-0" style={{ color: '#cbd5e1' }}>
              Plataforma integral enfocada en prolongar la vida útil de baterías, controladores y tracción mecánica de vehículos eléctricos ligeros con atención en taller especializado y auxilio móvil a domicilio.
            </p>
          </div>
          <div className="col-lg-4 text-center mt-4 mt-lg-0">
            <i className="bi bi-ev-front text-electric" style={{ fontSize: '5.5rem' }}></i>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-6">
          <div className="custom-card p-4 h-100 shadow-sm border-top border-4" style={{ borderTopColor: 'var(--color-electric-green) !important' }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="rounded-circle p-3" style={{ backgroundColor: '#151719' }}>
                <i className="bi bi-compass text-electric fs-4"></i>
              </div>
              <h4 className="fw-bold text-dark mb-0">Nuestra Misión</h4>
            </div>
            <p className="text-secondary-custom mb-0">
              Facilitar una gestión ágil, eficiente y transparente en los servicios de mantenimiento y reparación de vehículos de movilidad eléctrica en Lima Metropolitana, conectando usuarios con técnicos especializados mediante trazabilidad digital y diagnósticos estandarizados.
            </p>
          </div>
        </div>

        <div className="col-md-6">
          <div className="custom-card p-4 h-100 shadow-sm border-top border-4" style={{ borderTopColor: '#151719 !important' }}>
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="rounded-circle p-3" style={{ backgroundColor: '#151719' }}>
                <i className="bi bi-eye text-electric fs-4"></i>
              </div>
              <h4 className="fw-bold text-dark mb-0">Nuestra Visión</h4>
            </div>
            <p className="text-secondary-custom mb-0">
              Ser la plataforma tecnológica referente en la gestión operativa, trazabilidad técnica y seguridad vial para vehículos eléctricos ligeros a nivel nacional, promoviendo el transporte ecológico y la durabilidad de sus componentes.
            </p>
          </div>
        </div>
      </div>

      <div className="row g-4 mb-5">
        <div className="col-md-4">
          <div className="custom-card p-4 text-center h-100 shadow-sm">
            <i className="bi bi-tools text-electric fs-1 mb-2 d-block"></i>
            <h5 className="fw-bold text-dark">Taller Central Certificado</h5>
            <p className="text-secondary-custom small mb-0">
              Equipamiento técnico para medición de celdas de litio, balance de BMS, sistemas de freno hidráulico y cableado interno.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="custom-card p-4 text-center h-100 shadow-sm">
            <i className="bi bi-geo-alt text-electric fs-1 mb-2 d-block"></i>
            <h5 className="fw-bold text-dark">Auxilio Móvil en Ruta</h5>
            <p className="text-secondary-custom small mb-0">
              Técnicos motorizados con herramientas de calibración rápida en San Miguel, Magdalena, Miraflores, San Isidro y Surco.
            </p>
          </div>
        </div>

        <div className="col-md-4">
          <div className="custom-card p-4 text-center h-100 shadow-sm">
            <i className="bi bi-file-earmark-check text-electric fs-1 mb-2 d-block"></i>
            <h5 className="fw-bold text-dark">Hoja de Vida Digital</h5>
            <p className="text-secondary-custom small mb-0">
              Historial técnico imborrable por número de serie, garantizando valor de reventa y seguridad funcional de cada unidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}