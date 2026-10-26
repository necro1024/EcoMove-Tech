import React from 'react';

export default function HojaDeVidaModal({ solicitud, onClose }) {
  if (!solicitud) return null;

  return (
    <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <i className="bi bi-file-earmark-medical text-warning"></i>
              Hoja de Vida Técnica - Orden #{solicitud.id}
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body p-4">
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div className="p-3 bg-light rounded border">
                  <h6 className="text-muted small fw-bold mb-2">DATOS DEL VEHÍCULO</h6>
                  <p className="mb-1"><strong>Tipo:</strong> {solicitud.tipo_vehiculo}</p>
                  <p className="mb-1"><strong>Modelo:</strong> {solicitud.marca} {solicitud.modelo}</p>
                  <p className="mb-0"><strong>Cliente:</strong> {solicitud.cliente_nombre}</p>
                </div>
              </div>
              <div className="col-md-6">
                <div className="p-3 bg-light rounded border">
                  <h6 className="text-muted small fw-bold mb-2">SERVICIO ASIGNADO</h6>
                  <p className="mb-1"><strong>Modalidad:</strong> {solicitud.modalidad}</p>
                  <p className="mb-1"><strong>Técnico Responsable:</strong> {solicitud.tecnico_nombre || 'No asignado'}</p>
                  <p className="mb-0"><strong>Estado:</strong> <span className="badge bg-success">{solicitud.estado_servicio}</span></p>
                </div>
              </div>
            </div>

            <h6 className="fw-bold border-bottom pb-2">Diagnóstico Técnico Registrado</h6>
            <div className="row g-2 text-center my-3">
              <div className="col-md-4">
                <div className="border p-2 rounded">
                  <small className="text-muted d-block">Voltaje Medido</small>
                  <span className="fs-5 fw-bold text-primary">36.0 V</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border p-2 rounded">
                  <small className="text-muted d-block">Sistema Motor</small>
                  <span className="fs-5 fw-bold text-success">Operativo</span>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border p-2 rounded">
                  <small className="text-muted d-block">Frenos y Calibración</small>
                  <span className="fs-5 fw-bold text-success">Calibrado</span>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="fw-bold small text-muted">MOTIVO DE REPORTE:</label>
              <p className="bg-light p-2 rounded border">{solicitud.falla_reportada}</p>
            </div>

            {solicitud.direccion_servicio && (
              <div className="mb-3">
                <label className="fw-bold small text-muted">DIRECCIÓN AUXILIO:</label>
                <p className="bg-light p-2 rounded border mb-0">{solicitud.direccion_servicio} {solicitud.referencia && `(Ref: ${solicitud.referencia})`}</p>
              </div>
            )}
          </div>
          <div className="modal-footer bg-light">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cerrar</button>
            <button type="button" className="btn btn-primary" onClick={() => window.print()}>
              <i className="bi bi-printer me-1"></i> Imprimir Reporte
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}