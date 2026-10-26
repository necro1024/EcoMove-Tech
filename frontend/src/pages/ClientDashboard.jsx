import React, { useState, useEffect } from 'react';
import NuevaSolicitudWizard from './NuevaSolicitudWizard.jsx';
import SeguimientoView from './SeguimientoView.jsx';
import HistorialView from './HistorialView.jsx';
import { API_BASE_URL, getHeaders } from "@/apiConfig.js";

export default function ClientDashboard({ user }) {
  const [subVista, setSubVista] = useState('inicio'); // 'inicio' | 'vehiculos' | 'seguimiento' | 'historial' | 'nueva_solicitud'
  const [vehiculos, setVehiculos] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);
  const [historial, setHistorial] = useState([]);

  const [modalVehiculo, setModalVehiculo] = useState(false);
  const [vehiculoAEditar, setVehiculoAEditar] = useState(null);
  const [vehiculoABorrar, setVehiculoABorrar] = useState(null);
  const [modalPdf, setModalPdf] = useState(null);

  const [formVehiculo, setFormVehiculo] = useState({
    tipo_vehiculo: 'Scooter Eléctrico',
    marca: '',
    modelo: '',
    numero_serie: '',
    voltaje_bateria: 36
  });

  const nombreLimpio = user.nombre ? user.nombre.replace(/\s*\([^)]*\)/g, '').trim() : 'Usuario';

  const fetchData = async () => {
  try {
    const [resVeh, resSol, resHist] = await Promise.all([
      fetch(`${API_BASE_URL}/vehiculos/cliente/${user.referencia_id}`, { headers: getHeaders() }).then(r => r.json()),
      fetch(`${API_BASE_URL}/solicitudes/cliente/${user.referencia_id}`, { headers: getHeaders() }).then(r => r.json()),
      fetch(`${API_BASE_URL}/historial/${user.referencia_id}`, { headers: getHeaders() }).then(r => r.json())
    ]);

    setVehiculos(Array.isArray(resVeh) ? resVeh : []);
    setSolicitudes(Array.isArray(resSol) ? resSol : []);
    setHistorial(Array.isArray(resHist) ? resHist : []);

  } catch (error) {
    console.error('Error cargando datos del cliente:', error);
  }
};

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleGuardarVehiculo = async (e) => {
    e.preventDefault();
    if (vehiculoAEditar) {
      await fetch(`${API_BASE_URL}/vehiculos/${vehiculoAEditar.id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(formVehiculo)
      });
    } else {
      await fetch(`${API_BASE_URL}/vehiculos`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...formVehiculo, cliente_id: user.referencia_id })
      });
    }
    setFormVehiculo({ tipo_vehiculo: 'Scooter Eléctrico', marca: '', modelo: '', numero_serie: '', voltaje_bateria: 36 });
    setVehiculoAEditar(null);
    setModalVehiculo(false);
    fetchData();
  };

  const confirmarBajaPopUp = async () => {
    if (!vehiculoABorrar) return;
    try {
      const res = await fetch(`${API_BASE_URL}/vehiculos/${vehiculoABorrar.id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error);
      } else {
        setVehiculoABorrar(null);
        fetchData();
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const numActivos = solicitudes.filter(s => s.estado_servicio !== 'Finalizado').length;
  const numOperativos = Math.max(0, vehiculos.length - numActivos);

  return (
    <div>
      <div className="bg-white border-bottom py-2 px-4 shadow-sm mb-3">
        <div className="container-fluid d-flex justify-content-between align-items-center" style={{ maxWidth: '1440px' }}>
          <div className="d-flex gap-2">
            {[
              { id: 'inicio', label: 'Inicio', icon: 'bi-house-door' },
              { id: 'vehiculos', label: 'Mis Vehículos', icon: 'bi-scooter' },
              { id: 'seguimiento', label: 'Seguimiento', icon: 'bi-broadcast' },
              { id: 'historial', label: 'Historial', icon: 'bi-clock-history' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSubVista(tab.id)}
                className={`btn btn-sm rounded-pill px-3 ${subVista === tab.id ? 'btn-dark' : 'btn-light text-secondary'}`}
              >
                <i className={`bi ${tab.icon} me-1`}></i> {tab.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setSubVista('nueva_solicitud')} 
            className="btn btn-electric btn-sm px-4 rounded-pill fw-bold shadow-sm"
          >
            <i className="bi bi-plus-circle-fill me-1"></i> Solicitar Reparación
          </button>
        </div>
      </div>

      {subVista === 'nueva_solicitud' && (
        <NuevaSolicitudWizard
          user={user}
          vehiculos={vehiculos}
          onVolver={() => setSubVista('inicio')}
          onCompletado={() => {
            fetchData();
            setSubVista('seguimiento');
          }}
        />
      )}

      {subVista === 'seguimiento' && (
        <SeguimientoView 
          solicitudes={solicitudes}
          onIrANuevaSolicitud={() => setSubVista('nueva_solicitud')}
        />
      )}

      {subVista === 'historial' && (
        <HistorialView 
          historial={historial}
          onVerPdf={(h) => setModalPdf(h)}
        />
      )}

      {subVista === 'inicio' && (
        <div className="container-fluid px-4 py-3" style={{ maxWidth: '1440px' }}>
          <div className="theme-banner p-4 mb-4 d-flex justify-content-between align-items-center shadow-sm">
            <div>
              <span className="text-uppercase fw-bold text-electric tracking-wider small">
                <i className="bi bi-calendar3 me-1"></i> OCTUBRE 2026
              </span>
              <h2 className="fw-bold mb-1 text-white mt-1">¡Bienvenido, {nombreLimpio}!</h2>
              <p className="mb-0 text-secondary-custom" style={{ color: '#cbd5e1' }}>
                Tienes <strong className="text-electric">{numActivos} servicios en curso</strong> y <strong className="text-white">{numOperativos} vehículos operativos</strong>.
              </p>
            </div>
            <button onClick={() => setSubVista('nueva_solicitud')} className="btn btn-electric px-4 py-2 rounded-pill shadow-sm fw-bold">
              + Solicitar Reparación
            </button>
          </div>

          <div className="row g-4">
            <div className="col-md-4">
              <div className="custom-card p-4 h-100 shadow-sm cursor-pointer" onClick={() => setSubVista('vehiculos')}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0">Mis Unidades</h5>
                  <i className="bi bi-scooter fs-3 text-electric"></i>
                </div>
                <p className="text-secondary-custom small mb-2">Administra tus vehículos registrados y especificaciones.</p>
                <span className="badge bg-dark text-electric px-3 py-1 rounded-pill">{vehiculos.length} Registrados</span>
              </div>
            </div>

            <div className="col-md-4">
              <div className="custom-card p-4 h-100 shadow-sm cursor-pointer" onClick={() => setSubVista('seguimiento')}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0">Seguimiento en Vivo</h5>
                  <i className="bi bi-broadcast fs-3 text-electric"></i>
                </div>
                <p className="text-secondary-custom small mb-2">Verifica el progreso y estado en tiempo real de tus pedidos.</p>
                <span className="badge bg-warning text-dark px-3 py-1 rounded-pill">{numActivos} Activos</span>
              </div>
            </div>

            <div className="col-md-4">
              <div className="custom-card p-4 h-100 shadow-sm cursor-pointer" onClick={() => setSubVista('historial')}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold text-dark mb-0">Historial Técnico</h5>
                  <i className="bi bi-clock-history fs-3 text-electric"></i>
                </div>
                <p className="text-secondary-custom small mb-2">Consulta hojas de vida, técnicos que atendieron y garantías.</p>
                <span className="badge bg-success px-3 py-1 rounded-pill">{historial.length} Finalizados</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {subVista === 'vehiculos' && (
        <div className="container-fluid px-4 py-3" style={{ maxWidth: '1440px' }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h5 className="fw-bold text-dark mb-0">Mis Scooters y Bicicletas Registradas</h5>
              <small className="text-secondary-custom">{vehiculos.length} unidades vinculadas a tu cuenta</small>
            </div>
            <button 
              onClick={() => { setVehiculoAEditar(null); setFormVehiculo({ tipo_vehiculo: 'Scooter Eléctrico', marca: '', modelo: '', numero_serie: '', voltaje_bateria: 36 }); setModalVehiculo(true); }}
              className="btn btn-dark btn-sm rounded-pill px-3"
            >
              + Agregar Vehículo
            </button>
          </div>

          <div className="row g-3">
            {vehiculos.map(v => (
              <div key={v.id} className="col-md-6 col-lg-3">
                <div className="custom-card p-3 h-100 d-flex flex-column justify-content-between shadow-sm">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-secondary-custom small fw-bold">{v.marca}</span>
                      <span className="badge bg-dark text-electric">Operativo</span>
                    </div>
                    <div className="text-center py-2">
                      <i className={`bi ${v.tipo_vehiculo.includes('Bicicleta') ? 'bi-bicycle' : 'bi-scooter'}`} style={{ fontSize: '3rem', color: '#151719' }}></i>
                    </div>
                    <h6 className="fw-bold mb-1 text-dark">{v.modelo}</h6>
                    <small className="text-secondary-custom d-block mb-2" style={{ fontSize: '0.75rem' }}>{v.numero_serie}</small>
                    <span className="badge bg-light text-dark border mb-3">{v.voltaje_bateria}V Nominal</span>
                  </div>

                  <div className="border-top pt-2 d-flex gap-2">
                    <button 
                      onClick={() => {
                        setVehiculoAEditar(v);
                        setFormVehiculo({ ...v });
                        setModalVehiculo(true);
                      }}
                      className="btn btn-sm btn-outline-secondary flex-grow-1"
                    >
                      <i className="bi bi-pencil-square me-1"></i> Editar
                    </button>
                    <button 
                      onClick={() => setVehiculoABorrar(v)}
                      className="btn btn-sm btn-danger px-3 fw-bold"
                    >
                      <i className="bi bi-trash-fill me-1"></i> Dar de Baja
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {vehiculoABorrar && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(21, 23, 25, 0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header bg-danger text-white border-0 py-3">
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-exclamation-triangle-fill me-2"></i>
                  Confirmar Baja de Vehículo
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setVehiculoABorrar(null)}></button>
              </div>
              <div className="modal-body p-4 text-center">
                <div className="p-3 bg-light rounded-3 border mb-3 text-start">
                  <p className="mb-1"><strong>Vehículo:</strong> {vehiculoABorrar.marca} {vehiculoABorrar.modelo}</p>
                  <p className="mb-0"><strong>N° de Serie:</strong> {vehiculoABorrar.numero_serie}</p>
                </div>
                <p className="text-secondary-custom mb-0">
                  ¿Estás seguro de dar de baja este vehículo? Ya no se podrán vincular nuevas solicitudes a esta unidad.
                </p>
              </div>
              <div className="modal-footer border-0 bg-light py-2">
                <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setVehiculoABorrar(null)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger rounded-pill px-4 fw-bold" onClick={confirmarBajaPopUp}>
                  Sí, Dar de Baja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modalVehiculo && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(21, 23, 25, 0.7)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header border-0 pb-0" style={{ backgroundColor: '#151719', color: '#FFFFFF' }}>
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-scooter text-electric me-2"></i>
                  {vehiculoAEditar ? 'Editar Especificaciones' : 'Registrar Nuevo Vehículo'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalVehiculo(false)}></button>
              </div>
              <form onSubmit={handleGuardarVehiculo}>
                <div className="modal-body p-4">
                  <div className="mb-3">
                    <label className="form-label small fw-bold">Tipo de Unidad</label>
                    <select
                      className="form-select"
                      value={formVehiculo.tipo_vehiculo}
                      onChange={e => setFormVehiculo({ ...formVehiculo, tipo_vehiculo: e.target.value })}
                    >
                      <option value="Scooter Eléctrico">Scooter Eléctrico</option>
                      <option value="Bicicleta Eléctrica">Bicicleta Eléctrica</option>
                    </select>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Marca</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formVehiculo.marca}
                        onChange={e => setFormVehiculo({ ...formVehiculo, marca: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Modelo</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formVehiculo.modelo}
                        onChange={e => setFormVehiculo({ ...formVehiculo, modelo: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">N° Serie</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formVehiculo.numero_serie}
                        onChange={e => setFormVehiculo({ ...formVehiculo, numero_serie: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Voltaje Nominal (V)</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formVehiculo.voltaje_bateria}
                        onChange={e => setFormVehiculo({ ...formVehiculo, voltaje_bateria: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-3" onClick={() => setModalVehiculo(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-electric rounded-pill px-4">
                    {vehiculoAEditar ? 'Guardar Cambios' : 'Guardar Unidad'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {modalPdf && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(21, 23, 25, 0.75)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow rounded-4">
              <div className="modal-header text-white rounded-top-4" style={{ backgroundColor: '#151719' }}>
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-pdf-fill text-danger"></i>
                  Hoja de Vida Técnica Oficial — Folio OT-{modalPdf.orden_id}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalPdf(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <small className="text-secondary-custom fw-bold d-block mb-1">VEHÍCULO</small>
                      <h6 className="fw-bold mb-1">{modalPdf.marca} {modalPdf.modelo}</h6>
                      <small className="text-secondary-custom d-block">Serie: {modalPdf.numero_serie}</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <small className="text-secondary-custom fw-bold d-block mb-1">DETALLE SERVICIO</small>
                      <p className="mb-1"><strong>Modalidad:</strong> {modalPdf.modalidad}</p>
                      <p className="mb-1"><strong>Técnico:</strong> {modalPdf.tecnico_nombre || 'Especialista en Taller'}</p>
                      <p className="mb-0"><strong>Costo Total:</strong> S/ {Number(modalPdf.costo).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="fw-bold small text-secondary-custom">ACCIONES TÉCNICAS EJECUTADAS:</label>
                  <p className="p-2 bg-light rounded border mb-0">{modalPdf.trabajo_realizado}</p>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary rounded-pill px-3" onClick={() => setModalPdf(null)}>Cerrar</button>
                <button type="button" className="btn btn-electric rounded-pill px-4" onClick={() => window.print()}>
                  <i className="bi bi-printer me-1"></i> Imprimir Reporte
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}