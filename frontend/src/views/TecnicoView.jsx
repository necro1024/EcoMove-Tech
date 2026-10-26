import React, { useState } from 'react';

export default function TecnicoView({ solicitudes, onRefresh }) {
  const [diagnosticos, setDiagnosticos] = useState({});

  const handleEstado = async (id, nuevoEstado) => {
    await fetch(`http://localhost:5000/api/solicitudes/${id}/estado`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado_servicio: nuevoEstado })
    });
    onRefresh();
  };

  const handleCierre = async (id) => {
    const diag = diagnosticos[id] || {};
    await fetch(`http://localhost:5000/api/solicitudes/${id}/finalizar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        estado_bateria: parseFloat(diag.bateria) || 36.0,
        estado_motor: diag.motor || 'Operativo con escobillas limpias',
        estado_frenos: diag.frenos || 'Pastillas calibradas',
        trabajo_realizado: diag.trabajo || 'Mantenimiento integral del sistema eléctrico',
        costo_mano_obra: parseFloat(diag.manoObra) || 40,
        costo_final: (parseFloat(diag.manoObra) || 40) + (parseFloat(diag.repuestos) || 0),
        periodo_garantia: 3
      })
    });
    onRefresh();
  };

  const ordenes = solicitudes.filter(s => s.estado_servicio !== 'Pendiente');

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Panel Técnico Operativo</h4>
          <p className="text-muted small mb-0">Revisión de componentes, pruebas funcionales y cierre técnico</p>
        </div>
        <button onClick={onRefresh} className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-clockwise me-1"></i> Refrescar
        </button>
      </div>

      <div className="row g-4">
        {ordenes.length === 0 ? (
          <div className="col-12">
            <div className="alert alert-info py-4 text-center">
              <i className="bi bi-info-circle fs-3 d-block mb-2"></i>
              No tienes órdenes activas asignadas por el administrador en este momento.
            </div>
          </div>
        ) : (
          ordenes.map(s => {
            const form = diagnosticos[s.id] || {};
            return (
              <div key={s.id} className="col-lg-6">
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-header bg-white py-3 border-0 d-flex justify-content-between align-items-center">
                    <span className="badge bg-dark">Orden #{s.id}</span>
                    <span className={`badge ${s.estado_servicio === 'Finalizado' ? 'bg-success' : 'bg-primary'}`}>
                      {s.estado_servicio}
                    </span>
                  </div>
                  <div className="card-body">
                    <h5 className="card-title fw-bold">{s.marca} {s.modelo}</h5>
                    <p className="text-muted small mb-2">Cliente: {s.cliente_nombre}</p>

                    <div className="p-2 bg-light rounded mb-3 small">
                      <strong>Falla descrita:</strong> {s.falla_reportada}
                      {s.direccion_servicio && (
                        <div className="mt-1 text-danger">
                          <i className="bi bi-geo-alt-fill me-1"></i> Auxilio en: {s.direccion_servicio}
                        </div>
                      )}
                    </div>

                    {s.estado_servicio !== 'Finalizado' && (
                      <div className="btn-group w-100 mb-3" role="group">
                        <button
                          onClick={() => handleEstado(s.id, 'En camino')}
                          className={`btn btn-sm ${s.estado_servicio === 'En camino' ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'}`}
                        >
                          <i className="bi bi-bicycle me-1"></i> En camino
                        </button>
                        <button
                          onClick={() => handleEstado(s.id, 'Recibido')}
                          className={`btn btn-sm ${s.estado_servicio === 'Recibido' ? 'btn-primary' : 'btn-outline-primary'}`}
                        >
                          <i className="bi bi-box-seam me-1"></i> Recibido
                        </button>
                      </div>
                    )}

                    {s.estado_servicio !== 'Finalizado' ? (
                      <div className="border rounded p-3 bg-white">
                        <h6 className="fw-bold small text-muted mb-2">INSPECCIÓN Y MEDICIONES</h6>
                        <div className="row g-2 mb-2">
                          <div className="col-4">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="Voltaje (V)"
                              onChange={e => setDiagnosticos({ ...diagnosticos, [s.id]: { ...form, bateria: e.target.value } })}
                            />
                          </div>
                          <div className="col-4">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Motor"
                              onChange={e => setDiagnosticos({ ...diagnosticos, [s.id]: { ...form, motor: e.target.value } })}
                            />
                          </div>
                          <div className="col-4">
                            <input
                              type="text"
                              className="form-control form-control-sm"
                              placeholder="Frenos"
                              onChange={e => setDiagnosticos({ ...diagnosticos, [s.id]: { ...form, frenos: e.target.value } })}
                            />
                          </div>
                        </div>
                        <textarea
                          className="form-control form-control-sm mb-2"
                          rows="2"
                          placeholder="Procedimiento realizado y piezas reemplazadas..."
                          onChange={e => setDiagnosticos({ ...diagnosticos, [s.id]: { ...form, trabajo: e.target.value } })}
                        ></textarea>
                        <div className="row g-2 mb-3">
                          <div className="col-6">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="Mano de Obra (S/.)"
                              onChange={e => setDiagnosticos({ ...diagnosticos, [s.id]: { ...form, manoObra: e.target.value } })}
                            />
                          </div>
                          <div className="col-6">
                            <input
                              type="number"
                              className="form-control form-control-sm"
                              placeholder="Repuestos (S/.)"
                              onChange={e => setDiagnosticos({ ...diagnosticos, [s.id]: { ...form, repuestos: e.target.value } })}
                            />
                          </div>
                        </div>
                        <button
                          onClick={() => handleCierre(s.id)}
                          className="btn btn-success btn-sm w-100 fw-semibold"
                        >
                          <i className="bi bi-check2-circle me-1"></i> Cerrar Orden y Asentar Historial
                        </button>
                      </div>
                    ) : (
                      <div className="alert alert-success py-2 mb-0 small">
                        <i className="bi bi-patch-check-fill me-1"></i> Servicio finalizado con éxito.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}