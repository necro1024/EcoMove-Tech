import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getHeaders } from "@/apiConfig.js";

export default function TechnicianWorkspace({ user }) {
  const [ordenes, setOrdenes] = useState([]);
  const [catalogoRepuestos, setCatalogoRepuestos] = useState([]);
  const [diag, setDiag] = useState({});
  const [repuestosSeleccionados, setRepuestosSeleccionados] = useState({});
  const [repuestoActivo, setRepuestoActivo] = useState('');

  // Estado para el Pop-up de confirmación de cierre
  const [ordenALiquidar, setOrdenALiquidar] = useState(null);

  const fetchData = async () => {
    try {
      const [resOrd, resRep] = await Promise.all([
        fetch(`${API_BASE_URL}/solicitudes/tecnico/${user.referencia_id}`, { headers: getHeaders() }).then(r => r.json()),
        fetch(`${API_BASE_URL}/repuestos`, { headers: getHeaders() }).then(r => r.json())
      ]);
      setOrdenes(resOrd);
      setCatalogoRepuestos(resRep);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleUpdateEstado = async (id, nuevoEstado) => {
    await fetch(`${API_BASE_URL}/solicitudes/${id}/estado`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ estado_servicio: nuevoEstado })
    });
    fetchData();
  };

  const agregarRepuestoAOrden = (ordenId) => {
    if (!repuestoActivo) return;
    const item = catalogoRepuestos.find(r => r.id === parseInt(repuestoActivo));
    if (!item) return;

    const listaActual = repuestosSeleccionados[ordenId] || [];
    const existe = listaActual.find(r => r.id === item.id);

    let nuevaLista;
    if (existe) {
      nuevaLista = listaActual.map(r => 
        r.id === item.id ? { ...r, cantidad: r.cantidad + 1, subtotal: (r.cantidad + 1) * r.precio_unitario } : r
      );
    } else {
      nuevaLista = [...listaActual, { ...item, cantidad: 1, subtotal: item.precio_unitario }];
    }

    setRepuestosSeleccionados({ ...repuestosSeleccionados, [ordenId]: nuevaLista });
  };

  const eliminarRepuestoDeOrden = (ordenId, repuestoId) => {
    const listaActual = repuestosSeleccionados[ordenId] || [];
    const nuevaLista = listaActual.filter(r => r.id !== repuestoId);
    setRepuestosSeleccionados({ ...repuestosSeleccionados, [ordenId]: nuevaLista });
  };

  // Abre el Pop-up de confirmación
  const solicitarConfirmacionCierre = (s) => {
    const d = diag[s.id] || {};
    const repuestos = repuestosSeleccionados[s.id] || [];
    const subtotalRep = repuestos.reduce((acc, curr) => acc + curr.subtotal, 0);
    const manoObra = parseFloat(d.manoObra) || 40.0;
    const total = manoObra + subtotalRep;

    setOrdenALiquidar({
      orden: s,
      datos: {
        bateria: parseFloat(d.bateria) || 36.0,
        motor: d.motor || 'Operativo con escobillas limpias',
        frenos: d.frenos || 'Pastillas calibradas',
        trabajo: d.trabajo || 'Mantenimiento integral y calibración de sistema motriz',
        manoObra,
        repuestos,
        subtotalRep,
        total
      }
    });
  };

  // Cierre efectivo en la Base de Datos
  const ejecutarLiquidacionFinal = async () => {
    if (!ordenALiquidar) return;
    const { orden, datos } = ordenALiquidar;

    await fetch(`${API_BASE_URL}/solicitudes/${orden.id}/finalizar`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        estado_bateria: datos.bateria,
        estado_motor: datos.motor,
        estado_frenos: datos.frenos,
        trabajo_realizado: datos.trabajo,
        costo_mano_obra: datos.manoObra,
        costo_final: datos.total,
        periodo_garantia: 3,
        repuestos_usados: datos.repuestos
      })
    });

    setOrdenALiquidar(null);
    fetchData();
  };

  return (
    <div className="container py-4" style={{ maxWidth: '1440px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="badge px-3 py-1 mb-2 fw-bold" style={{ backgroundColor: '#151719', color: 'var(--color-electric-green)' }}>
            OPERACIONES TÉCNICAS
          </span>
          <h3 className="fw-bold mb-0 text-dark">Órdenes de Trabajo Asignadas</h3>
          <p className="text-secondary-custom small mb-0">Inspección de multímetro, sustitución de repuestos y liquidación final</p>
        </div>
        <button onClick={fetchData} className="btn btn-outline-dark btn-sm rounded-pill px-3">
          <i className="bi bi-arrow-clockwise me-1 text-electric"></i> Actualizar Tareas
        </button>
      </div>

      <div className="row g-4">
        {ordenes.length === 0 ? (
          <div className="col-12">
            <div className="custom-card py-5 text-center shadow-sm">
              <i className="bi bi-clipboard2-check text-electric fs-1 d-block mb-2"></i>
              <h5 className="fw-bold text-dark">No posees intervenciones pendientes</h5>
              <p className="text-secondary-custom small mb-0">El administrador te asignará nuevas órdenes cuando ingresen solicitudes.</p>
            </div>
          </div>
        ) : (
          ordenes.map(s => {
            const form = diag[s.id] || {};
            const listaRep = repuestosSeleccionados[s.id] || [];
            const subtotalRep = listaRep.reduce((acc, curr) => acc + curr.subtotal, 0);
            const manoObra = parseFloat(form.manoObra) || 40.0;
            const totalEstimado = manoObra + subtotalRep;

            return (
              <div key={s.id} className="col-lg-6">
                <div className="custom-card shadow-sm h-100 p-4">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-dark text-electric px-3 py-2 rounded-pill fw-bold">Orden #{s.id}</span>
                    <span className={`badge ${s.estado_servicio === 'Finalizado' ? 'bg-success' : 'bg-warning text-dark'}`}>
                      {s.estado_servicio}
                    </span>
                  </div>
                  <h5 className="fw-bold text-dark mb-1">{s.marca} {s.modelo}</h5>
                  <p className="text-secondary-custom small mb-3">
                    <i className="bi bi-person me-1"></i> Cliente: <strong>{s.cliente_nombre}</strong>
                  </p>

                  <div className="p-3 bg-light rounded-3 mb-3 small border">
                    <div className="fw-bold mb-1"><i className="bi bi-chat-left-text text-electric me-1"></i> Falla Reportada:</div>
                    <div className="text-secondary-custom mb-1">{s.falla_reportada}</div>
                    {s.direccion_servicio && (
                      <div className="text-danger mt-2 fw-semibold">
                        <i className="bi bi-geo-alt-fill me-1"></i> Auxilio en: {s.direccion_servicio}
                      </div>
                    )}
                  </div>

                  {s.estado_servicio !== 'Finalizado' && (
                    <div className="btn-group w-100 mb-3" role="group">
                      <button
                        onClick={() => handleUpdateEstado(s.id, 'En camino')}
                        className={`btn btn-sm ${s.estado_servicio === 'En camino' ? 'btn-electric' : 'btn-outline-dark'}`}
                      >
                        <i className="bi bi-bicycle me-1"></i> En camino
                      </button>
                      <button
                        onClick={() => handleUpdateEstado(s.id, 'Recibido')}
                        className={`btn btn-sm ${s.estado_servicio === 'Recibido' ? 'btn-electric' : 'btn-outline-dark'}`}
                      >
                        <i className="bi bi-box-seam me-1"></i> Recibido
                      </button>
                    </div>
                  )}

                  {s.estado_servicio !== 'Finalizado' ? (
                    <div className="border rounded-3 p-3 bg-white">
                      <h6 className="fw-bold small text-secondary-custom mb-2">
                        <i className="bi bi-speedometer text-electric me-1"></i> DIAGNÓSTICO DE COMPONENTES
                      </h6>
                      <div className="row g-2 mb-2">
                        <div className="col-4">
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="Voltaje (V)"
                            onChange={e => setDiag({ ...diag, [s.id]: { ...form, bateria: e.target.value } })}
                          />
                        </div>
                        <div className="col-4">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Motor"
                            onChange={e => setDiag({ ...diag, [s.id]: { ...form, motor: e.target.value } })}
                          />
                        </div>
                        <div className="col-4">
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Frenos"
                            onChange={e => setDiag({ ...diag, [s.id]: { ...form, frenos: e.target.value } })}
                          />
                        </div>
                      </div>

                      <h6 className="fw-bold small text-secondary-custom mt-3 mb-2">
                        <i className="bi bi-box-seam-fill text-electric me-1"></i> AÑADIR REPUESTOS DE INVENTARIO
                      </h6>
                      <div className="input-group mb-2">
                        <select 
                          className="form-select form-select-sm"
                          value={repuestoActivo}
                          onChange={e => setRepuestoActivo(e.target.value)}
                        >
                          <option value="">Seleccionar repuesto del catálogo...</option>
                          {catalogoRepuestos.map(r => (
                            <option key={r.id} value={r.id}>
                              [{r.codigo_pieza}] {r.nombre} — S/ {r.precio_unitario.toFixed(2)} (Stock: {r.stock_disponible})
                            </option>
                          ))}
                        </select>
                        <button 
                          type="button" 
                          onClick={() => agregarRepuestoAOrden(s.id)}
                          className="btn btn-dark btn-sm"
                        >
                          + Añadir
                        </button>
                      </div>

                      {listaRep.length > 0 && (
                        <div className="table-responsive mb-2">
                          <table className="table table-sm table-bordered small mb-1">
                            <thead className="table-light">
                              <tr>
                                <th>Pieza</th>
                                <th className="text-center">Cant</th>
                                <th>Subtotal</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {listaRep.map(r => (
                                <tr key={r.id}>
                                  <td>{r.nombre}</td>
                                  <td className="text-center">{r.cantidad}</td>
                                  <td>S/ {r.subtotal.toFixed(2)}</td>
                                  <td className="text-center">
                                    <button 
                                      type="button" 
                                      onClick={() => eliminarRepuestoDeOrden(s.id, r.id)}
                                      className="btn btn-outline-danger btn-sm p-0 px-1 border-0"
                                    >
                                      <i className="bi bi-x-circle"></i>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      <textarea
                        className="form-control form-control-sm mb-2"
                        rows={2}
                        placeholder="Descripción detallada de la reparación efectuada..."
                        onChange={e => setDiag({ ...diag, [s.id]: { ...form, trabajo: e.target.value } })}
                      ></textarea>

                      <div className="row g-2 mb-3 align-items-center">
                        <div className="col-6">
                          <label className="small text-secondary-custom fw-bold">Mano de Obra (S/.)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="40.00"
                            onChange={e => setDiag({ ...diag, [s.id]: { ...form, manoObra: e.target.value } })}
                          />
                        </div>
                        <div className="col-6">
                          <label className="small text-secondary-custom fw-bold">Total Liquidación</label>
                          <div className="fw-bold fs-6 text-dark p-1 bg-light rounded border text-center">
                            S/ {totalEstimado.toFixed(2)}
                          </div>
                        </div>
                      </div>

                      <button 
                        onClick={() => solicitarConfirmacionCierre(s)} 
                        className="btn btn-electric btn-sm w-100 rounded-pill fw-bold"
                      >
                        <i className="bi bi-check2-circle me-1"></i> Cerrar Servicio y Liquidar Orden
                      </button>
                    </div>
                  ) : (
                    <div className="alert border-0 py-2 mb-0 small rounded-3" style={{ backgroundColor: '#151719', color: '#FFFFFF' }}>
                      <i className="bi bi-patch-check-fill text-electric me-1"></i> Atención técnica finalizada y registrada.
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {ordenALiquidar && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(21, 23, 25, 0.85)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header text-white border-0 py-3" style={{ backgroundColor: '#151719' }}>
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-shield-check text-electric me-2"></i>
                  Confirmar Liquidación y Cierre — Orden #ORD-{ordenALiquidar.orden.id}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setOrdenALiquidar(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="alert alert-warning py-2 small d-flex align-items-center gap-2 mb-3">
                  <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                  <span>Al confirmar, la orden se marcará como <strong>Finalizada</strong>, se actualizará el stock de repuestos y se emitirá la Hoja de Vida técnica del vehículo de forma permanente.</span>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <small className="text-secondary-custom fw-bold d-block mb-1">CLIENTE Y UNIDAD</small>
                      <h6 className="fw-bold mb-1">{ordenALiquidar.orden.cliente_nombre}</h6>
                      <p className="mb-0 small">{ordenALiquidar.orden.marca} {ordenALiquidar.orden.modelo}</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <small className="text-secondary-custom fw-bold d-block mb-1">MEDICIONES ASENTADAS</small>
                      <p className="mb-1 small"><strong>Voltaje Batería:</strong> {ordenALiquidar.datos.bateria} V</p>
                      <p className="mb-0 small"><strong>Motor / Frenos:</strong> {ordenALiquidar.datos.motor} / {ordenALiquidar.datos.frenos}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-light rounded-3 border mb-3">
                  <h6 className="fw-bold small mb-2 text-dark">DESGLOSE ECONÓMICO FINAL:</h6>
                  <div className="d-flex justify-content-between small mb-1">
                    <span>Mano de obra técnica:</span>
                    <strong>S/ {ordenALiquidar.datos.manoObra.toFixed(2)}</strong>
                  </div>
                  <div className="d-flex justify-content-between small mb-2">
                    <span>Repuestos ({ordenALiquidar.datos.repuestos.length} ítems):</span>
                    <strong>S/ {ordenALiquidar.datos.subtotalRep.toFixed(2)}</strong>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-2 fs-6">
                    <span className="fw-bold">Total a Facturar / Cobrar:</span>
                    <span className="fw-bold text-success fs-5">S/ {ordenALiquidar.datos.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="small text-secondary-custom">
                  <strong>Trabajo documentado:</strong> {ordenALiquidar.datos.trabajo}
                </div>
              </div>
              <div className="modal-footer border-0 bg-light py-2">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setOrdenALiquidar(null)}>
                  Volver a Revisar
                </button>
                <button type="button" className="btn btn-electric rounded-pill px-4 fw-bold" onClick={ejecutarLiquidacionFinal}>
                  Sí, Liquidar y Finalizar Servicio
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}