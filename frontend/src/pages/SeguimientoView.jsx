import React, { useState } from 'react';

export default function SeguimientoView({ solicitudes, onIrANuevaSolicitud }) {
  const [solicitudSeleccionadaId, setSolicitudSeleccionadaId] = useState(
    solicitudes[0]?.id || null
  );

  const servicioActivo = solicitudes.find(s => s.id === solicitudSeleccionadaId) || solicitudes[0];

  const getStepStatus = (stepIndex, estadoServicio) => {
    const ordenEstados = ['Pendiente', 'Asignado', 'En camino', 'Recibido', 'Finalizado'];
    let actualIndex = ordenEstados.indexOf(estadoServicio);
    if (actualIndex === -1) actualIndex = 0;

    let targetIndex = stepIndex;
    if (stepIndex === 3) targetIndex = 2;
    if (stepIndex === 4) targetIndex = 3;
    if (stepIndex === 5) targetIndex = 4;

    if (actualIndex > targetIndex) return 'completed';
    if (actualIndex === targetIndex) return 'active';
    return 'pending';
  };

  const getProgresoPorcentaje = (estadoServicio) => {
    switch (estadoServicio) {
      case 'Pendiente': return '12%';
      case 'Asignado': return '35%';
      case 'En camino':
      case 'Recibido': return '58%';
      case 'Finalizado': return '100%';
      default: return '10%';
    }
  };

  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1440px' }}>
      <div className="row g-4">
        <div className="col-lg-4">
          <div className="custom-card p-4 shadow-sm h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="fw-bold text-dark mb-0">Órdenes Activas</h5>
              <span className="badge bg-dark text-electric">{solicitudes.length}</span>
            </div>

            {solicitudes.length === 0 ? (
              <div className="text-center py-4 text-secondary-custom">
                <i className="bi bi-inbox fs-2 d-block mb-2"></i>
                No registras órdenes de servicio por el momento.
              </div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {solicitudes.map(s => {
                  const activa = s.id === servicioActivo?.id;
                  const isFin = s.estado_servicio === 'Finalizado';
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSolicitudSeleccionadaId(s.id)}
                      className={`p-3 rounded-3 border cursor-pointer ${
                        activa ? 'border-dark bg-white shadow-sm' : 'bg-light border-0'
                      }`}
                      style={{ cursor: 'pointer', borderLeft: activa ? '5px solid #10b981 !important' : '' }}
                    >
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <strong className="text-dark small">{s.marca} {s.modelo}</strong>
                        <span className={`badge ${isFin ? 'bg-success' : 'bg-warning text-dark'}`} style={{ fontSize: '0.7rem' }}>
                          {s.estado_servicio}
                        </span>
                      </div>
                      <small className="text-secondary-custom d-block" style={{ fontSize: '0.75rem' }}>
                        Orden #OT-{s.id} • {s.modalidad}
                      </small>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-8">
          {servicioActivo ? (
            <div className="custom-card p-4 shadow-sm bg-white">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h5 className="fw-bold text-dark mb-0">Seguimiento en Tiempo Real</h5>
                  <small className="text-secondary-custom">{servicioActivo.marca} {servicioActivo.modelo} — Folio #OT-{servicioActivo.id}</small>
                </div>
                <span className="badge bg-dark text-electric px-3 py-2 rounded-pill fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-geo-alt-fill text-electric me-1"></i> {servicioActivo.modalidad === 'Taller' ? 'EN TALLER' : 'AUXILIO RUTA'}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center py-2 mb-4 border-bottom pb-3">
                <div className="d-flex align-items-center gap-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold" 
                    style={{ width: '42px', height: '42px', backgroundColor: '#151719', color: 'var(--color-electric-green)' }}
                  >
                    <i className="bi bi-person-fill"></i>
                  </div>
                  <div>
                    <span className="fw-bold text-dark d-block">
                      Técnico Responsable: {servicioActivo.tecnico_nombre || 'Asignación pendiente por administrador'}
                    </span>
                    <small className="text-secondary-custom font-monospace" style={{ fontSize: '0.78rem' }}>
                      <i className="bi bi-pin-map text-electric me-1"></i>
                      {servicioActivo.direccion_servicio || 'Taller Central — Av. La Marina 2401, San Miguel'}
                    </small>
                  </div>
                </div>
                <div className="text-secondary-custom small">
                  <i className="bi bi-hourglass-split text-electric me-1"></i> Estado: <strong>{servicioActivo.estado_servicio}</strong>
                </div>
              </div>

              <div className="position-relative my-4 px-2">
                <div className="stepper-line"></div>
                <div className="stepper-line-progress" style={{ width: getProgresoPorcentaje(servicioActivo.estado_servicio) }}></div>

                <div className="d-flex justify-content-between position-relative">
                  <div className="text-center" style={{ width: '80px' }}>
                    <div className={`stepper-circle mx-auto mb-2 ${getStepStatus(1, servicioActivo.estado_servicio)}`}>
                      <i className="bi bi-check-lg"></i>
                    </div>
                    <small className="fw-bold text-dark d-block" style={{ fontSize: '0.72rem' }}>Solicitud<br/>Recibida</small>
                  </div>

                  <div className="text-center" style={{ width: '80px' }}>
                    <div className={`stepper-circle mx-auto mb-2 ${getStepStatus(2, servicioActivo.estado_servicio)}`}>
                      {getStepStatus(2, servicioActivo.estado_servicio) === 'completed' ? <i className="bi bi-check-lg"></i> : 2}
                    </div>
                    <small className="fw-bold text-dark d-block" style={{ fontSize: '0.72rem' }}>Técnico<br/>Asignado</small>
                  </div>

                  <div className="text-center" style={{ width: '80px' }}>
                    <div className={`stepper-circle mx-auto mb-2 ${getStepStatus(3, servicioActivo.estado_servicio)}`}>
                      <i className="bi bi-lightning-charge-fill"></i>
                    </div>
                    <small className="fw-bold text-dark d-block" style={{ fontSize: '0.72rem' }}>En Taller<br/>/ Ruta</small>
                  </div>

                  <div className="text-center" style={{ width: '80px' }}>
                    <div className={`stepper-circle mx-auto mb-2 ${getStepStatus(4, servicioActivo.estado_servicio)}`}>4</div>
                    <small className="text-secondary-custom d-block" style={{ fontSize: '0.72rem' }}>En<br/>Reparación</small>
                  </div>

                  <div className="text-center" style={{ width: '80px' }}>
                    <div className={`stepper-circle mx-auto mb-2 ${getStepStatus(5, servicioActivo.estado_servicio)}`}>5</div>
                    <small className="text-secondary-custom d-block" style={{ fontSize: '0.72rem' }}>Finalizado</small>
                  </div>
                </div>
              </div>

              <div className="alert border-0 d-flex align-items-center gap-2 mb-0 py-2 px-3 rounded-3" style={{ backgroundColor: '#151719', color: '#FFFFFF' }}>
                <i className="bi bi-info-circle-fill text-electric fs-5"></i>
                <span className="small">
                  <strong>Diagnóstico en curso:</strong> {servicioActivo.falla_reportada}. Tiempo estimado de culminación técnica sujeto a pruebas funcionales.
                </span>
              </div>
            </div>
          ) : (
            <div className="custom-card p-5 text-center shadow-sm">
              <i className="bi bi-clock-history text-electric fs-1 d-block mb-2"></i>
              <h5 className="fw-bold">No hay servicios en curso</h5>
              <p className="text-secondary-custom small mb-3">Tus vehículos se encuentran al día.</p>
              <button onClick={onIrANuevaSolicitud} className="btn btn-electric btn-sm px-4 rounded-pill fw-bold">
                Solicitar Reparación
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}