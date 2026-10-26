import React, { useState, useEffect } from 'react';
import '../ClientePortal.css';

export default function ClienteView({ usuario, vehiculos, solicitudes, onRefresh, onCambiarRol }) {
  const [modalVehiculo, setModalVehiculo] = useState(false);
  const [modalSolicitud, setModalSolicitud] = useState(false);
  const [modalHojaVida, setModalHojaVida] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [busqueda, setBusqueda] = useState('');

  const [formVehiculo, setFormVehiculo] = useState({
    tipo_vehiculo: 'Scooter Eléctrico',
    marca: '',
    modelo: '',
    numero_serie: '',
    voltaje_bateria: 36
  });

  const [formSolicitud, setFormSolicitud] = useState({
    vehiculo_id: '',
    modalidad: 'Taller',
    falla_reportada: '',
    direccion: '',
    referencia: ''
  });

  const clienteId = usuario?.referencia_id || 1;

  const cargarHistorial = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/historial/${clienteId}`);
      if (res.ok) {
        const data = await res.json();
        setHistorial(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    cargarHistorial();
  }, [solicitudes]);

  useEffect(() => {
    if (vehiculos.length > 0 && !formSolicitud.vehiculo_id) {
      setFormSolicitud(prev => ({ ...prev, vehiculo_id: vehiculos[0].id }));
    }
  }, [vehiculos]);

  const handleCrearVehiculo = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/vehiculos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formVehiculo, cliente_id: clienteId })
    });
    setFormVehiculo({ tipo_vehiculo: 'Scooter Eléctrico', marca: '', modelo: '', numero_serie: '', voltaje_bateria: 36 });
    setModalVehiculo(false);
    onRefresh();
  };

  const handleCrearSolicitud = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/api/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...formSolicitud, cliente_id: clienteId })
    });
    setFormSolicitud({
      vehiculo_id: vehiculos[0]?.id || '',
      modalidad: 'Taller',
      falla_reportada: '',
      direccion: '',
      referencia: ''
    });
    setModalSolicitud(false);
    onRefresh();
  };

  const servicioActivo = solicitudes.find(s => s.estado_servicio !== 'Finalizado') || null;
  const numServiciosActivos = solicitudes.filter(s => s.estado_servicio !== 'Finalizado').length;
  const numVehiculosOperativos = Math.max(0, vehiculos.length - numServiciosActivos);

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

  const vehiculosFiltrados = vehiculos.filter(v => 
    v.marca.toLowerCase().includes(busqueda.toLowerCase()) || 
    v.modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.numero_serie.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <div className="portal-topbar py-2 px-4 d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-3">
          <div>
            <span className="fw-bold fs-6 d-block text-dark">Mi Portal</span>
            <small className="text-muted" style={{ fontSize: '0.75rem' }}>Panel de cliente</small>
          </div>
          <div className="position-relative ms-3" style={{ width: '280px' }}>
            <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
            <input
              type="text"
              className="form-control form-control-sm ps-5 rounded-pill bg-light border-0"
              placeholder="Buscar vehículo, orden..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="d-flex align-items-center gap-3">
          <button 
            onClick={() => setModalSolicitud(true)} 
            className="btn btn-portal-green btn-sm px-3 rounded-pill d-flex align-items-center gap-1 shadow-sm"
          >
            <i className="bi bi-plus-lg"></i> Solicitar Servicio
          </button>
          <div className="position-relative cursor-pointer text-muted px-2">
            <i className="bi bi-bell fs-5"></i>
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-warning border border-light rounded-circle"></span>
          </div>
          <div className="d-flex align-items-center gap-2">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm"
              style={{ width: '36px', height: '36px', backgroundColor: '#0ea5e9', fontSize: '0.85rem' }}
            >
              MC
            </div>
            <span className="fw-semibold text-dark small">Martín C.</span>
          </div>
        </div>
      </div>

      <div className="portal-nav-dark py-2 px-4 d-flex align-items-center gap-2">
        <span className="text-uppercase fw-bold text-muted me-2" style={{ fontSize: '0.7rem' }}>VISTA:</span>
        <button className="portal-nav-btn active">
          <i className="bi bi-person-fill"></i> Portal Cliente
        </button>
        <button className="portal-nav-btn" onClick={() => onCambiarRol('administrador')}>
          <i className="bi bi-kanban"></i> Admin Despacho
        </button>
        <button className="portal-nav-btn" onClick={() => onCambiarRol('tecnico')}>
          <i className="bi bi-phone"></i> Técnico (Móvil)
        </button>
      </div>

      <div className="container-fluid px-4 py-4" style={{ maxWidth: '1440px' }}>
        <div className="banner-welcome p-4 mb-4 d-flex justify-content-between align-items-center shadow-sm">
          <div>
            <span className="text-uppercase fw-bold tracking-wider" style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
              LUNES, 28 SEP 2026
            </span>
            <h2 className="fw-bold mb-1 text-white mt-1">¡Bienvenido, Martín!</h2>
            <p className="mb-0 text-slate-300" style={{ color: '#cbd5e1' }}>
              Tienes <strong className="text-warning">{numServiciosActivos} servicio activo</strong> y <strong className="text-success">{numVehiculosOperativos} vehículos operativos</strong>.
            </p>
          </div>
          <button 
            onClick={() => setModalSolicitud(true)} 
            className="btn btn-portal-green px-4 py-2 rounded-pill fw-semibold shadow-sm d-flex align-items-center gap-2"
          >
            <i className="bi bi-plus-circle-fill"></i> Solicitar Servicio Técnico
          </button>
        </div>

        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h5 className="fw-bold text-dark mb-0">Mis Vehículos Registrados</h5>
            <small className="text-muted">{vehiculos.length} unidades en tu cuenta</small>
          </div>
          <a href="#ver-todos" onClick={(e) => { e.preventDefault(); setBusqueda(''); }} className="text-decoration-none fw-semibold small text-success">
            Ver todos <i className="bi bi-chevron-right"></i>
          </a>
        </div>

        <div className="row g-3 mb-4">
          {vehiculosFiltrados.map((v, i) => {
            const tieneServicio = solicitudes.some(s => s.vehiculo_id === v.id && s.estado_servicio !== 'Finalizado');
            return (
              <div key={v.id} className="col-md-6 col-lg-3">
                <div className="vehicle-card p-3 h-100 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="text-muted small text-capitalize">{v.marca}</span>
                      <span className={tieneServicio ? 'badge-servicio' : 'badge-operativo'}>
                        {tieneServicio ? 'En Servicio' : 'Operativo'}
                      </span>
                    </div>

                    <div className="text-center py-3">
                      <i className={`bi ${v.tipo_vehiculo.includes('Bicicleta') ? 'bi-bicycle text-success' : 'bi-scooter text-info'}`} style={{ fontSize: '3rem' }}></i>
                    </div>

                    <h6 className="fw-bold mb-1 text-dark">{v.modelo}</h6>
                    <small className="text-muted d-block mb-3" style={{ fontSize: '0.75rem' }}>{v.numero_serie}</small>
                  </div>

                  <div>
                    <div className="d-flex gap-2 mb-2">
                      <span className="badge-tag">{v.voltaje_bateria}V</span>
                      <span className="badge-tag">15Ah</span>
                    </div>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      <i className="bi bi-calendar3 me-1"></i> {tieneServicio ? 'Último: En Curso' : 'Último: Operativo'}
                    </small>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="col-md-6 col-lg-3">
            <div 
              onClick={() => setModalVehiculo(true)}
              className="vehicle-card-add p-3 h-100 d-flex flex-column align-items-center justify-content-center text-center py-4"
            >
              <div 
                className="rounded-circle bg-light border d-flex align-items-center justify-content-center text-secondary mb-2"
                style={{ width: '48px', height: '48px' }}
              >
                <i className="bi bi-plus-lg fs-5"></i>
              </div>
              <span className="fw-semibold text-muted small">+ Agregar Vehículo</span>
            </div>
          </div>
        </div>

        {servicioActivo ? (
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold text-dark mb-0">Servicio en Curso</h5>
                <small className="text-muted">{servicioActivo.marca} {servicioActivo.modelo} — Orden #{servicioActivo.id}</small>
              </div>
              <span className="badge bg-light text-primary border border-primary px-3 py-2 rounded-pill fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>
                <i className="bi bi-dot"></i> {servicioActivo.modalidad === 'Taller' ? 'EN TALLER' : 'AUXILIO RUTA'}
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-center py-2 mb-4 border-bottom pb-3">
              <div className="d-flex align-items-center gap-3">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                  style={{ width: '42px', height: '42px', backgroundColor: '#0284c7' }}
                >
                  JR
                </div>
                <div>
                  <span className="fw-bold text-dark d-block">Técnico: {servicioActivo.tecnico_nombre || 'Asignación pendiente'}</span>
                  <small className="text-muted font-monospace" style={{ fontSize: '0.78rem' }}>
                    {servicioActivo.direccion_servicio || 'Taller Central — Av. La Marina 2401, San Miguel'}
                  </small>
                </div>
              </div>
              <div className="text-muted small">
                <i className="bi bi-clock me-1"></i> Ingreso: 09:30 AM
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
                  <small className="fw-bold text-success d-block" style={{ fontSize: '0.72rem' }}>Solicitud<br/>Recibida</small>
                </div>

                <div className="text-center" style={{ width: '80px' }}>
                  <div className={`stepper-circle mx-auto mb-2 ${getStepStatus(2, servicioActivo.estado_servicio)}`}>
                    {getStepStatus(2, servicioActivo.estado_servicio) === 'completed' ? <i className="bi bi-check-lg"></i> : 2}
                  </div>
                  <small className="fw-bold text-success d-block" style={{ fontSize: '0.72rem' }}>Técnico<br/>Asignado</small>
                </div>

                <div className="text-center" style={{ width: '80px' }}>
                  <div className={`stepper-circle mx-auto mb-2 ${getStepStatus(3, servicioActivo.estado_servicio)}`}>
                    <i className="bi bi-lightning-charge-fill"></i>
                  </div>
                  <small className="fw-bold text-primary d-block" style={{ fontSize: '0.72rem' }}>En<br/>Taller</small>
                </div>

                <div className="text-center" style={{ width: '80px' }}>
                  <div className={`stepper-circle mx-auto mb-2 ${getStepStatus(4, servicioActivo.estado_servicio)}`}>
                    4
                  </div>
                  <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>En<br/>Reparación</small>
                </div>

                <div className="text-center" style={{ width: '80px' }}>
                  <div className={`stepper-circle mx-auto mb-2 ${getStepStatus(5, servicioActivo.estado_servicio)}`}>
                    5
                  </div>
                  <small className="text-muted d-block" style={{ fontSize: '0.72rem' }}>Finalizado</small>
                </div>
              </div>
            </div>

            <div className="alert bg-light border-0 d-flex align-items-center gap-2 mb-0 py-2 px-3 rounded-3" style={{ borderLeft: '4px solid #0284c7 !important' }}>
              <i className="bi bi-info-circle-fill text-primary"></i>
              <span className="small text-dark">
                <strong>Diagnóstico en progreso:</strong> {servicioActivo.falla_reportada}. Tiempo estimado de finalización: hoy entre 4:00 – 6:00 PM.
              </span>
            </div>
          </div>
        ) : (
          <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white text-center">
            <i className="bi bi-check-circle-fill text-success fs-1 mb-2"></i>
            <h5 className="fw-bold">No tienes servicios pendientes</h5>
            <p className="text-muted small mb-3">Todos tus vehículos se encuentran operativos y al día.</p>
            <div>
              <button onClick={() => setModalSolicitud(true)} className="btn btn-portal-green btn-sm px-4 rounded-pill">
                Solicitar Nuevo Mantenimiento
              </button>
            </div>
          </div>
        )}

        <div className="card border-0 shadow-sm rounded-4 bg-white overflow-hidden">
          <div className="p-4 border-bottom d-flex justify-content-between align-items-center">
            <div>
              <h5 className="fw-bold text-dark mb-0">Historial Técnico Reciente</h5>
              <small className="text-muted">Últimas intervenciones registradas</small>
            </div>
            <a href="#historial" onClick={(e) => { e.preventDefault(); cargarHistorial(); }} className="text-decoration-none fw-semibold small text-success">
              Ver historial completo <i className="bi bi-chevron-right"></i>
            </a>
          </div>

          <div className="table-responsive">
            <table className="table table-historial align-middle mb-0">
              <thead className="bg-light">
                <tr>
                  <th>FECHA</th>
                  <th>VEHÍCULO</th>
                  <th>PROBLEMA</th>
                  <th>TRABAJO REALIZADO</th>
                  <th>COSTO</th>
                  <th className="text-center">HOJA DE VIDA</th>
                </tr>
              </thead>
              <tbody>
                {historial.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">No se registran intervenciones pasadas aún.</td>
                  </tr>
                ) : (
                  historial.map((h, idx) => (
                    <tr key={idx}>
                      <td className="text-muted">
                        <i className="bi bi-calendar3 me-2"></i>{h.fecha_solicitud?.split('T')[0] || '15 Sep 2026'}
                      </td>
                      <td className="fw-bold text-dark">{h.marca} {h.modelo}</td>
                      <td className="text-secondary">{h.problema}</td>
                      <td className="text-secondary">{h.trabajo_realizado}</td>
                      <td className="fw-bold text-dark">S/ {Number(h.costo).toFixed(2)}</td>
                      <td className="text-center">
                        <button 
                          onClick={() => setModalHojaVida(h)} 
                          className="btn btn-light btn-sm text-secondary fw-semibold border px-3 rounded-pill"
                        >
                          <i className="bi bi-file-earmark-pdf me-1 text-danger"></i> Ver PDF
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

      {modalVehiculo && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Registrar Nuevo Vehículo</h5>
                <button type="button" className="btn-close" onClick={() => setModalVehiculo(false)}></button>
              </div>
              <form onSubmit={handleCrearVehiculo}>
                <div className="modal-body">
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
                        placeholder="Xiaomi, Segway..."
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
                        placeholder="Mi Pro 2, Ninebot MAX..."
                        value={formVehiculo.modelo}
                        onChange={e => setFormVehiculo({ ...formVehiculo, modelo: e.target.value })}
                        required 
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-bold">Número de Serie</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="XM-48V-2847-ES"
                        value={formVehiculo.numero_serie}
                        onChange={e => setFormVehiculo({ ...formVehiculo, numero_serie: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-bold">Voltaje Batería (V)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="36 o 48"
                        value={formVehiculo.voltaje_bateria}
                        onChange={e => setFormVehiculo({ ...formVehiculo, voltaje_bateria: e.target.value })}
                        required 
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setModalVehiculo(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-portal-green rounded-pill px-4">Guardar Unidad</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {modalSolicitud && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold">Solicitar Servicio Técnico Especializado</h5>
                <button type="button" className="btn-close" onClick={() => setModalSolicitud(false)}></button>
              </div>
              <form onSubmit={handleCrearSolicitud}>
                <div className="modal-body">
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Vehículo a Reparar</label>
                      <select 
                        className="form-select"
                        value={formSolicitud.vehiculo_id}
                        onChange={e => setFormSolicitud({ ...formSolicitud, vehiculo_id: e.target.value })}
                        required
                      >
                        {vehiculos.map(v => (
                          <option key={v.id} value={v.id}>{v.marca} {v.modelo} ({v.numero_serie})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-bold">Modalidad de Atención</label>
                      <select 
                        className="form-select"
                        value={formSolicitud.modalidad}
                        onChange={e => setFormSolicitud({ ...formSolicitud, modalidad: e.target.value })}
                      >
                        <option value="Taller">Recepción en Taller Central (San Miguel)</option>
                        <option value="Domicilio">Auxilio Mecánico en Ruta / Domicilio</option>
                      </select>
                    </div>
                  </div>

                  {formSolicitud.modalidad === 'Domicilio' && (
                    <div className="p-3 bg-light rounded-3 mb-3 border">
                      <h6 className="fw-bold small mb-2 text-dark">Ubicación exacta para el auxilio técnico</h6>
                      <div className="row g-2">
                        <div className="col-md-7">
                          <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            placeholder="Dirección exacta (Av., Calle, Número)"
                            value={formSolicitud.direccion}
                            onChange={e => setFormSolicitud({ ...formSolicitud, direccion: e.target.value })}
                            required
                          />
                        </div>
                        <div className="col-md-5">
                          <input 
                            type="text" 
                            className="form-control form-control-sm" 
                            placeholder="Referencia (Esquina, frente a parque...)"
                            value={formSolicitud.referencia}
                            onChange={e => setFormSolicitud({ ...formSolicitud, referencia: e.target.value })}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-bold">Detalle de la Avería o Servicio Preventivo</label>
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      placeholder="Describa el fallo: ruidos en rueda trasera, error en display, falla en frenos, etc."
                      value={formSolicitud.falla_reportada}
                      onChange={e => setFormSolicitud({ ...formSolicitud, falla_reportada: e.target.value })}
                      required
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer border-0 pt-0">
                  <button type="button" className="btn btn-light rounded-pill px-3" onClick={() => setModalSolicitud(false)}>Cancelar</button>
                  <button type="submit" className="btn btn-portal-green rounded-pill px-4">Generar Orden</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {modalHojaVida && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4">
              <div className="modal-header bg-dark text-white rounded-top-4">
                <h5 className="modal-title d-flex align-items-center gap-2">
                  <i className="bi bi-file-earmark-pdf-fill text-danger"></i>
                  Hoja de Vida Técnica — Orden #{modalHojaVida.orden_id}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setModalHojaVida(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-4">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <small className="text-muted fw-bold d-block mb-1">VEHÍCULO</small>
                      <h6 className="fw-bold mb-1">{modalHojaVida.marca} {modalHojaVida.modelo}</h6>
                      <small className="text-muted d-block">Serie: {modalHojaVida.numero_serie}</small>
                      <small className="text-muted d-block">Voltaje: {modalHojaVida.voltaje_bateria}V</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded-3 border">
                      <small className="text-muted fw-bold d-block mb-1">INTERVENCIÓN</small>
                      <p className="mb-1"><strong>Modalidad:</strong> {modalHojaVida.modalidad}</p>
                      <p className="mb-1"><strong>Técnico:</strong> {modalHojaVida.tecnico_nombre || 'Especialista en Taller'}</p>
                      <p className="mb-0"><strong>Costo Total:</strong> <span className="text-success fw-bold">S/ {Number(modalHojaVida.costo).toFixed(2)}</span></p>
                    </div>
                  </div>
                </div>

                <h6 className="fw-bold border-bottom pb-2">Diagnóstico de Componentes</h6>
                <div className="row g-2 text-center my-3">
                  <div className="col-4">
                    <div className="p-2 border rounded-3 bg-light">
                      <small className="text-muted d-block">Batería Medida</small>
                      <strong className="text-primary">{modalHojaVida.bateria_medida} V</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 border rounded-3 bg-light">
                      <small className="text-muted d-block">Motor y Tracción</small>
                      <strong className="text-success">{modalHojaVida.estado_motor}</strong>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="p-2 border rounded-3 bg-light">
                      <small className="text-muted d-block">Frenos y Ruedas</small>
                      <strong className="text-success">{modalHojaVida.estado_frenos}</strong>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="fw-bold small text-muted">TRABAJO Y ACCIONES REALIZADAS:</label>
                  <p className="p-2 bg-light rounded border">{modalHojaVida.trabajo_realizado}</p>
                </div>
              </div>
              <div className="modal-footer border-0">
                <button type="button" className="btn btn-secondary rounded-pill px-3" onClick={() => setModalHojaVida(null)}>Cerrar</button>
                <button type="button" className="btn btn-portal-green rounded-pill px-4" onClick={() => window.print()}>
                  <i className="bi bi-printer me-1"></i> Imprimir Reporte Oficial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}