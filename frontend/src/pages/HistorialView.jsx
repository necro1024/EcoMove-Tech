import React from 'react';

export default function HistorialView({ historial, onVerPdf }) {
  return (
    <div className="container-fluid py-4" style={{ maxWidth: '1440px' }}>
      <div className="custom-card overflow-hidden shadow-sm">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold text-dark mb-0">Historial Técnico Integral de Servicios</h5>
            <small className="text-secondary-custom">Detalle completo de intervenciones, técnicos asignados y diagnósticos</small>
          </div>
          <span className="badge bg-dark text-electric px-3 py-2 rounded-pill fw-bold">{historial.length} Registros</span>
        </div>

        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead style={{ backgroundColor: '#151719', color: '#FFFFFF' }}>
              <tr>
                <th className="py-3 px-3"><i className="bi bi-calendar3 text-electric me-1"></i> FECHA</th>
                <th className="py-3"><i className="bi bi-scooter text-electric me-1"></i> VEHÍCULO</th>
                <th className="py-3"><i className="bi bi-geo-alt-fill text-electric me-1"></i> MODALIDAD / LUGAR</th>
                <th className="py-3"><i className="bi bi-person-badge text-electric me-1"></i> TÉCNICO RESPONSABLE</th>
                <th className="py-3"><i className="bi bi-tools text-electric me-1"></i> TRABAJO Y PIEZAS</th>
                <th className="py-3"><i className="bi bi-cash-stack text-electric me-1"></i> TOTAL</th>
                <th className="py-3 text-center"><i className="bi bi-file-earmark-pdf text-electric me-1"></i> HOJA DE VIDA</th>
              </tr>
            </thead>
            <tbody>
              {historial.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-secondary-custom">
                    No existen atenciones finalizadas registradas en el historial.
                  </td>
                </tr>
              ) : (
                historial.map((h, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td className="text-secondary-custom px-3 small">
                      {h.fecha_solicitud ? h.fecha_solicitud.split('T')[0] : '2026-09-28'}
                    </td>
                    <td>
                      <strong className="text-dark d-block">{h.marca} {h.modelo}</strong>
                      <small className="text-secondary-custom font-monospace" style={{ fontSize: '0.72rem' }}>{h.numero_serie}</small>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {h.modalidad}
                      </span>
                      <small className="text-secondary-custom d-block mt-1" style={{ fontSize: '0.75rem' }}>
                        {h.modalidad === 'Taller' ? 'Taller Central San Miguel' : (h.direccion_servicio || 'Auxilio en Ruta')}
                      </small>
                    </td>
                    <td>
                      <span className="fw-semibold text-dark">
                        <i className="bi bi-person-check text-success me-1"></i>
                        {h.tecnico_nombre || 'Especialista en Taller'}
                      </span>
                    </td>
                    <td style={{ maxWidth: '300px' }}>
                      <span className="small text-dark d-block fw-semibold">{h.trabajo_realizado}</span>
                      <small className="text-secondary-custom d-block" style={{ fontSize: '0.72rem' }}>
                        Motivo inicial: {h.problema}
                      </small>
                    </td>
                    <td className="fw-bold text-dark">
                      S/ {Number(h.costo).toFixed(2)}
                    </td>
                    <td className="text-center">
                      <button 
                        onClick={() => onVerPdf(h)} 
                        className="btn btn-outline-dark btn-sm fw-semibold border px-3 rounded-pill"
                      >
                        <i className="bi bi-file-earmark-pdf me-1 text-danger"></i> Ver Ficha
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}