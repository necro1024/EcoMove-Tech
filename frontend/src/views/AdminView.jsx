import React, { useState } from 'react';

export default function AdminView({ solicitudes, tecnicos, onRefresh }) {
  const [asignaciones, setAsignaciones] = useState({});
  const [filtro, setFiltro] = useState('todos');

  const handleAsignar = async (solicitudId) => {
    const tecnicoId = asignaciones[solicitudId];
    if (!tecnicoId) return;

    await fetch(`http://localhost:5000/api/solicitudes/${solicitudId}/asignar`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tecnico_id: tecnicoId })
    });
    onRefresh();
  };

  const listaFiltrada = solicitudes.filter(s => {
    if (filtro === 'pendientes') return s.estado_servicio === 'Pendiente';
    if (filtro === 'finalizados') return s.estado_servicio === 'Finalizado';
    return true;
  });

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold mb-0">Panel de Administración y Control Operativo</h4>
          <p className="text-muted small mb-0">Asignación técnica según especialidad y balance de cargas</p>
        </div>
        <div className="btn-group" role="group">
          <button 
            type="button" 
            className={`btn btn-sm ${filtro === 'todos' ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => setFiltro('todos')}
          >
            Todos ({solicitudes.length})
          </button>
          <button 
            type="button" 
            className={`btn btn-sm ${filtro === 'pendientes' ? 'btn-warning text-dark' : 'btn-outline-warning text-dark'}`}
            onClick={() => setFiltro('pendientes')}
          >
            Pendientes ({solicitudes.filter(s => s.estado_servicio === 'Pendiente').length})
          </button>
          <button 
            type="button" 
            className={`btn btn-sm ${filtro === 'finalizados' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => setFiltro('finalizados')}
          >
            Finalizados ({solicitudes.filter(s => s.estado_servicio === 'Finalizado').length})
          </button>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Vehículo</th>
                <th>Modalidad y Ubicación</th>
                <th>Falla Reportada</th>
                <th>Estado</th>
                <th>Especialista Asignado</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrada.map(s => (
                <tr key={s.id}>
                  <td className="fw-bold">#{s.id}</td>
                  <td>
                    <div><strong>{s.cliente_nombre}</strong></div>
                  </td>
                  <td>{s.marca} {s.modelo} <br/><small className="text-muted">{s.tipo_vehiculo}</small></td>
                  <td>
                    <span className="badge bg-light text-dark border">
                      {s.modalidad}
                    </span>
                    {s.direccion_servicio && (
                      <div className="small text-muted mt-1">
                        <i className="bi bi-geo-alt me-1"></i>{s.direccion_servicio}
                      </div>
                    )}
                  </td>
                  <td>{s.falla_reportada}</td>
                  <td>
                    <span className={`badge ${
                      s.estado_servicio === 'Finalizado' ? 'bg-success' : 
                      s.estado_servicio === 'Pendiente' ? 'bg-warning text-dark' : 'bg-primary'
                    }`}>
                      {s.estado_servicio}
                    </span>
                  </td>
                  <td>
                    {s.estado_servicio === 'Pendiente' ? (
                      <div className="d-flex gap-2">
                        <select
                          className="form-select form-select-sm"
                          defaultValue=""
                          onChange={e => setAsignaciones({ ...asignaciones, [s.id]: e.target.value })}
                        >
                          <option value="" disabled>Seleccionar técnico</option>
                          {tecnicos.map(t => (
                            <option key={t.id} value={t.id}>
                              {t.nombre} ({t.especialidad})
                            </option>
                          ))}
                        </select>
                        <button onClick={() => handleAsignar(s.id)} className="btn btn-sm btn-primary">
                          Asignar
                        </button>
                      </div>
                    ) : (
                      <span className="badge bg-info text-dark">
                        <i className="bi bi-person-check me-1"></i>{s.tecnico_nombre || 'Asignado'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}