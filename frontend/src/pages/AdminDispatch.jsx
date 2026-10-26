import React, { useState, useEffect, useMemo } from 'react';
import { API_BASE_URL, getHeaders } from "@/apiConfig.js";

export default function AdminDispatch({ user }) {
  const [tabAdmin, setTabAdmin] = useState('solicitudes');
  const [solicitudes, setSolicitudes] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [filtroModalidad, setFiltroModalidad] = useState('Todas');

  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 5;

  const [ordenAsignando, setOrdenAsignando] = useState(null);
  const [tecnicoElegido, setTecnicoElegido] = useState('');
  const [ordenDetalle, setOrdenDetalle] = useState(null);

  const fetchData = async () => {
    try {
      const [resSol, resTec] = await Promise.all([
        fetch(`${API_BASE_URL}/solicitudes/admin`, { headers: getHeaders() }).then(r => r.json()),
        fetch(`${API_BASE_URL}/tecnicos`, { headers: getHeaders() }).then(r => r.json())
      ]);
      setSolicitudes(resSol);
      setTecnicos(resTec);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalSolicitudes = solicitudes.length;
  const totalPendientes = solicitudes.filter(s => s.estado_servicio === 'Pendiente').length;
  const totalEnProceso = solicitudes.filter(s => ['Asignado', 'En camino', 'Recibido'].includes(s.estado_servicio)).length;
  const totalFinalizadas = solicitudes.filter(s => s.estado_servicio === 'Finalizado').length;

  const solicitudesFiltradas = useMemo(() => {
    return solicitudes.filter(s => {
      const coincideBusqueda = 
        String(s.id).includes(busqueda) ||
        (s.cliente_nombre && s.cliente_nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
        (s.falla_reportada && s.falla_reportada.toLowerCase().includes(busqueda.toLowerCase())) ||
        (s.marca && s.marca.toLowerCase().includes(busqueda.toLowerCase()));

      const coincideEstado = filtroEstado === 'Todos' || s.estado_servicio === filtroEstado;
      const coincideModalidad = filtroModalidad === 'Todas' || s.modalidad === filtroModalidad;

      return coincideBusqueda && coincideEstado && coincideModalidad;
    });
  }, [solicitudes, busqueda, filtroEstado, filtroModalidad]);

  const totalPaginas = Math.ceil(solicitudesFiltradas.length / elementosPorPagina) || 1;
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const solicitudesPaginadas = solicitudesFiltradas.slice(indiceInicio, indiceInicio + elementosPorPagina);

  const getSaturacionBadge = (pendientes) => {
    const cant = parseInt(pendientes, 10);
    const valorReal = isNaN(cant) ? 0 : cant;

    if (valorReal === 0) {
      return { 
        texto: 'Disponible / Libre (0 tareas)', 
        clase: 'bg-success text-white', 
        colorProg: '#10b981', 
        alert: false 
      };
    }
    if (valorReal >= 1 && valorReal <= 2) {
      return { 
        texto: `Carga Moderada (${valorReal} tarea${valorReal > 1 ? 's' : ''})`, 
        clase: 'bg-primary text-white', 
        colorProg: '#3b82f6', 
        alert: false 
      };
    }
    return { 
      texto: `Sobrecargado (${valorReal} tareas)`, 
      clase: 'bg-danger text-white', 
      colorProg: '#ef4444', 
      alert: true 
    };
  };

  const exportarCSV = () => {
    if (solicitudesFiltradas.length === 0) {
      alert('No hay registros para exportar con los filtros seleccionados.');
      return;
    }

    const encabezados = ['ID_ORDEN', 'CLIENTE', 'VEHICULO', 'AVERIA', 'MODALIDAD', 'DIRECCION', 'ESTADO', 'TECNICO', 'FECHA'];
    const filas = solicitudesFiltradas.map(s => [
      `OT-${s.id}`,
      `"${s.cliente_nombre || ''}"`,
      `"${s.marca || ''} ${s.modelo || ''}"`,
      `"${(s.falla_reportada || '').replace(/"/g, '""')}"`,
      s.modalidad,
      `"${(s.direccion_servicio || '').replace(/"/g, '""')}"`,
      s.estado_servicio,
      `"${s.tecnico_nombre || 'No asignado'}"`,
      s.fecha_solicitud ? s.fecha_solicitud.split('T')[0] : '2026-10-22'
    ]);

    const contenidoCSV = 'data:text/csv;charset=utf-8,' + [encabezados.join(','), ...filas.map(f => f.join(','))].join('\n');
    const encodedUri = encodeURI(contenidoCSV);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Solicitudes_EcoMove_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmarAsignacion = async (e) => {
    e.preventDefault();
    if (!tecnicoElegido || !ordenAsignando) return;

    await fetch(`${API_BASE_URL}/solicitudes/${ordenAsignando.id}/asignar`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ tecnico_id: tecnicoElegido })
    });

    setOrdenAsignando(null);
    setTecnicoElegido('');
    fetchData();
  };

  const tecnicoSeleccionadoObj = tecnicos.find(t => String(t.id) === String(tecnicoElegido));
  const cantidadPendientesNum = tecnicoSeleccionadoObj 
    ? (parseInt(tecnicoSeleccionadoObj.trabajos_pendientes, 10) || 0) 
    : 0;
  const advertenciaSobrecarga = cantidadPendientesNum >= 3;

  return (
    <div className="container-fluid px-4 py-4" style={{ maxWidth: '1440px' }}>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div className="d-flex gap-2">
          {[
            { id: 'solicitudes', label: 'Gestión de Solicitudes', icon: 'bi-inboxes-fill' },
            { id: 'tecnicos', label: 'Especialistas Técnicos', icon: 'bi-person-gear' },
            { id: 'reportes', label: 'Reportes y Métricas', icon: 'bi-bar-chart-line-fill' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setTabAdmin(tab.id); setPaginaActual(1); }}
              className={`btn btn-sm rounded-pill px-3 fw-semibold ${
                tabAdmin === tab.id ? 'btn-electric shadow-sm' : 'btn-outline-dark'
              }`}
            >
              <i className={`bi ${tab.icon} me-1`}></i> {tab.label}
            </button>
          ))}
        </div>

        <button onClick={fetchData} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
          <i className="bi bi-arrow-clockwise me-1"></i> Refrescar Datos
        </button>
      </div>

      {tabAdmin === 'solicitudes' && (
        <>
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
            <div>
              <h3 className="fw-bold text-dark mb-1">Centro de Despacho y Asignación</h3>
              <p className="text-secondary-custom mb-0 small">
                Monitorea el estatus de las unidades, evalúa los reportes y asigna mecánicos según su carga laboral.
              </p>
            </div>
            <button onClick={exportarCSV} className="btn btn-dark btn-sm rounded-pill px-4 shadow-sm fw-bold">
              <i className="bi bi-download text-electric me-2"></i> Exportar CSV
            </button>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6 col-xl-3">
              <div className="custom-card p-3 shadow-sm h-100 border-start border-4 border-dark">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-secondary-custom small fw-bold text-uppercase">Total Solicitudes</span>
                  <div className="rounded p-2 bg-light">
                    <i className="bi bi-file-earmark-text text-dark fs-5"></i>
                  </div>
                </div>
                <h2 className="fw-bold text-dark mb-0">{totalSolicitudes}</h2>
                <small className="text-secondary-custom" style={{ fontSize: '0.75rem' }}>Órdenes históricas en el sistema</small>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="custom-card p-3 shadow-sm h-100 border-start border-4 border-warning">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-secondary-custom small fw-bold text-uppercase">Pendientes</span>
                  <div className="rounded p-2 bg-light">
                    <i className="bi bi-clock-history text-warning fs-5"></i>
                  </div>
                </div>
                <h2 className="fw-bold text-dark mb-0">{totalPendientes}</h2>
                <small className="text-danger fw-semibold" style={{ fontSize: '0.75rem' }}>
                  {totalPendientes > 0 ? 'Requieren asignación urgente' : 'Al día, sin cola'}
                </small>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="custom-card p-3 shadow-sm h-100 border-start border-4" style={{ borderLeftColor: 'var(--color-electric-green) !important' }}>
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-secondary-custom small fw-bold text-uppercase">En Proceso</span>
                  <div className="rounded p-2 bg-light">
                    <i className="bi bi-wrench-adjustable text-success fs-5"></i>
                  </div>
                </div>
                <h2 className="fw-bold text-dark mb-0">{totalEnProceso}</h2>
                <small className="text-secondary-custom" style={{ fontSize: '0.75rem' }}>Unidades bajo servicio activo</small>
              </div>
            </div>

            <div className="col-md-6 col-xl-3">
              <div className="custom-card p-3 shadow-sm h-100 border-start border-4 border-success">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-secondary-custom small fw-bold text-uppercase">Finalizadas</span>
                  <div className="rounded p-2 bg-light">
                    <i className="bi bi-check-circle-fill text-success fs-5"></i>
                  </div>
                </div>
                <h2 className="fw-bold text-dark mb-0">{totalFinalizadas}</h2>
                <small className="text-secondary-custom" style={{ fontSize: '0.75rem' }}>Entregadas satisfactoriamente</small>
              </div>
            </div>
          </div>

          <div className="custom-card p-3 mb-4 shadow-sm bg-white">
            <div className="row g-2 align-items-center">
              <div className="col-lg-6">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search text-secondary-custom"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control bg-light border-start-0"
                    placeholder="Buscar por ID, cliente, avería o modelo..."
                    value={busqueda}
                    onChange={e => { setBusqueda(e.target.value); setPaginaActual(1); }}
                  />
                </div>
              </div>

              <div className="col-sm-6 col-lg-3">
                <div className="input-group">
                  <span className="input-group-text bg-white small text-secondary-custom">Estado:</span>
                  <select
                    className="form-select bg-light"
                    value={filtroEstado}
                    onChange={e => { setFiltroEstado(e.target.value); setPaginaActual(1); }}
                  >
                    <option value="Todos">Todos</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="Asignado">Asignado</option>
                    <option value="En camino">En camino</option>
                    <option value="Recibido">Recibido</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                </div>
              </div>

              <div className="col-sm-6 col-lg-3">
                <div className="input-group">
                  <span className="input-group-text bg-white small text-secondary-custom">Modalidad:</span>
                  <select
                    className="form-select bg-light"
                    value={filtroModalidad}
                    onChange={e => { setFiltroModalidad(e.target.value); setPaginaActual(1); }}
                  >
                    <option value="Todas">Todas</option>
                    <option value="Taller">En Taller</option>
                    <option value="Domicilio">Auxilio a Domicilio</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="custom-card overflow-hidden shadow-sm bg-white">
            <div className="table-responsive">
              <table className="table align-middle mb-0 table-hover">
                <thead style={{ backgroundColor: '#151719', color: '#FFFFFF' }}>
                  <tr className="small text-uppercase">
                    <th className="py-3 px-3"><i className="bi bi-hash text-electric me-1"></i> ID ORDEN</th>
                    <th className="py-3"><i className="bi bi-person text-electric me-1"></i> CLIENTE</th>
                    <th className="py-3"><i className="bi bi-scooter text-electric me-1"></i> VEHÍCULO</th>
                    <th className="py-3"><i className="bi bi-exclamation-circle text-electric me-1"></i> TIPO AVERÍA</th>
                    <th className="py-3"><i className="bi bi-geo-alt text-electric me-1"></i> MODALIDAD</th>
                    <th className="py-3"><i className="bi bi-tag text-electric me-1"></i> ESTADO</th>
                    <th className="py-3"><i className="bi bi-calendar3 text-electric me-1"></i> FECHA</th>
                    <th className="py-3 text-center"><i className="bi bi-gear text-electric me-1"></i> ACCIONES</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudesPaginadas.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-5 text-secondary-custom">
                        <i className="bi bi-search fs-2 d-block mb-2"></i>
                        No se encontraron órdenes coincidentes con los filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    solicitudesPaginadas.map(s => {
                      const esPendiente = s.estado_servicio === 'Pendiente';
                      const badgeBg = 
                        s.estado_servicio === 'Finalizado' ? '#dcfce7' :
                        s.estado_servicio === 'Pendiente' ? '#fef3c7' :
                        s.estado_servicio === 'En camino' ? '#f3e8ff' : '#e0f2fe';
                      
                      const badgeText = 
                        s.estado_servicio === 'Finalizado' ? '#15803d' :
                        s.estado_servicio === 'Pendiente' ? '#b45309' :
                        s.estado_servicio === 'En camino' ? '#7e22ce' : '#0369a1';

                      return (
                        <tr key={s.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td className="fw-bold px-3 text-dark">
                            #ORD-{s.id}
                          </td>
                          <td className="fw-semibold text-dark">
                            {s.cliente_nombre}
                          </td>
                          <td>
                            <strong className="text-dark d-block">{s.marca} {s.modelo}</strong>
                            <small className="text-secondary-custom">{s.tipo_vehiculo}</small>
                          </td>
                          <td style={{ maxWidth: '240px' }} className="small text-secondary-custom text-truncate">
                            {s.falla_reportada}
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border px-2 py-1">
                              <i className={`bi ${s.modalidad === 'Taller' ? 'bi-building' : 'bi-geo-alt-fill text-danger'} me-1`}></i>
                              {s.modalidad}
                            </span>
                          </td>
                          <td>
                            <span 
                              className="badge px-3 py-1 rounded-pill fw-bold"
                              style={{ backgroundColor: badgeBg, color: badgeText, fontSize: '0.72rem' }}
                            >
                              {s.estado_servicio}
                            </span>
                          </td>
                          <td className="small text-secondary-custom">
                            {s.fecha_solicitud ? s.fecha_solicitud.split('T')[0] : '2026-10-22'}
                          </td>
                          <td className="text-center">
                            {esPendiente ? (
                              <button
                                onClick={() => {
                                  setOrdenAsignando(s);
                                  setTecnicoElegido('');
                                }}
                                className="btn btn-electric btn-sm px-3 rounded-pill fw-bold"
                              >
                                Asignar
                              </button>
                            ) : (
                              <button
                                onClick={() => setOrdenDetalle(s)}
                                className="btn btn-outline-dark btn-sm px-3 rounded-pill"
                              >
                                Ver Detalle
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="p-3 border-top d-flex justify-content-between align-items-center flex-wrap gap-2">
              <span className="text-secondary-custom small">
                Mostrando <strong>{solicitudesFiltradas.length === 0 ? 0 : indiceInicio + 1}</strong> a <strong>{Math.min(indiceInicio + elementosPorPagina, solicitudesFiltradas.length)}</strong> de <strong>{solicitudesFiltradas.length}</strong> solicitudes
              </span>

              <div className="d-flex gap-1">
                <button
                  disabled={paginaActual === 1}
                  onClick={() => setPaginaActual(p => p - 1)}
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                >
                  <i className="bi bi-chevron-left"></i>
                </button>
                {Array.from({ length: totalPaginas }, (_, i) => i + 1).map(num => (
                  <button
                    key={num}
                    onClick={() => setPaginaActual(num)}
                    className={`btn btn-sm rounded-pill px-3 ${paginaActual === num ? 'btn-dark fw-bold' : 'btn-outline-secondary'}`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  disabled={paginaActual === totalPaginas || totalPaginas === 0}
                  onClick={() => setPaginaActual(p => p + 1)}
                  className="btn btn-sm btn-outline-secondary rounded-pill px-3"
                >
                  <i className="bi bi-chevron-right"></i>
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {tabAdmin === 'tecnicos' && (
        <div>
          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1">Carga Laboral de Especialistas Técnicos</h3>
            <p className="text-secondary-custom small mb-0">
              Supervisión de trabajos en cola por mecánico para garantizar una distribución equilibrada de órdenes.
            </p>
          </div>

          <div className="row g-3">
            {tecnicos.map(t => {
              const cantPendientes = parseInt(t.trabajos_pendientes, 10) || 0;
              const sat = getSaturacionBadge(cantPendientes);
              const porcentajeCarga = Math.min(100, Math.round((cantPendientes / 4) * 100));

              return (
                <div key={t.id} className="col-md-6 col-lg-4">
                  <div className="custom-card p-4 shadow-sm h-100 d-flex flex-column justify-content-between">
                    <div>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: '46px', height: '46px', backgroundColor: '#151719', color: 'var(--color-electric-green)' }}
                        >
                          {t.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <span className={`badge px-3 py-2 rounded-pill small ${sat.clase}`}>
                          {sat.texto}
                        </span>
                      </div>

                      <h5 className="fw-bold text-dark mb-1">{t.nombre}</h5>
                      <p className="text-secondary-custom small mb-3">
                        <i className="bi bi-wrench me-1 text-electric"></i> {t.especialidad}
                      </p>

                      <div className="p-3 bg-light rounded-3 border mb-3">
                        <div className="d-flex justify-content-between small fw-bold mb-1">
                          <span>Carga de Asignaciones:</span>
                          <span className={sat.alert ? 'text-danger' : 'text-dark'}>
                            {cantPendientes} / 4 sugerido
                          </span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div 
                            className="progress-bar" 
                            style={{ width: `${porcentajeCarga}%`, backgroundColor: sat.colorProg }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="d-flex justify-content-between align-items-center pt-2 border-top small text-secondary-custom">
                      <span><i className="bi bi-telephone me-1"></i> {t.telefono || '987 654 321'}</span>
                      <span className={cantPendientes >= 3 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                        {cantPendientes >= 3 ? 'Evitar sobrecarga' : 'Disponible'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {tabAdmin === 'reportes' && (
        <div>
          <div className="mb-4">
            <h3 className="fw-bold text-dark mb-1">Reportes Ejecutivos de Operación</h3>
            <p className="text-secondary-custom small mb-0">Balance general de servicios, demanda por modalidad y tiempos de entrega.</p>
          </div>

          <div className="row g-4">
            <div className="col-md-6">
              <div className="custom-card p-4 shadow-sm h-100">
                <h5 className="fw-bold text-dark mb-3">Distribución por Modalidad</h5>
                <div className="p-3 bg-light rounded border mb-3">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Atención en Taller Central</span>
                    <strong className="text-dark">
                      {solicitudes.filter(s => s.modalidad === 'Taller').length} órdenes
                    </strong>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar bg-dark" 
                      style={{ 
                        width: `${(solicitudes.filter(s => s.modalidad === 'Taller').length / (solicitudes.length || 1)) * 100}%` 
                      }}
                    ></div>
                  </div>
                </div>

                <div className="p-3 bg-light rounded border">
                  <div className="d-flex justify-content-between mb-1">
                    <span>Auxilio a Domicilio / Ruta</span>
                    <strong className="text-dark">
                      {solicitudes.filter(s => s.modalidad === 'Domicilio').length} órdenes
                    </strong>
                  </div>
                  <div className="progress" style={{ height: '8px' }}>
                    <div 
                      className="progress-bar" 
                      style={{ 
                        width: `${(solicitudes.filter(s => s.modalidad === 'Domicilio').length / (solicitudes.length || 1)) * 100}%`,
                        backgroundColor: 'var(--color-electric-green)'
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="custom-card p-4 shadow-sm h-100">
                <h5 className="fw-bold text-dark mb-3">Tasa de Resolución Operativa</h5>
                <div className="d-flex align-items-center gap-4 py-3">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center p-4 border border-4 border-success"
                    style={{ width: '100px', height: '100px' }}
                  >
                    <span className="fs-4 fw-bold text-dark">
                      {Math.round((totalFinalizadas / (totalSolicitudes || 1)) * 100)}%
                    </span>
                  </div>
                  <div>
                    <h6 className="fw-bold text-dark mb-1">Servicios Completados</h6>
                    <p className="text-secondary-custom small mb-0">
                      {totalFinalizadas} de {totalSolicitudes} órdenes cerradas con Hoja de Vida técnica emitida.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {ordenAsignando && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(21, 23, 25, 0.75)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header text-white border-0 py-3" style={{ backgroundColor: '#151719' }}>
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-person-plus-fill text-electric me-2"></i>
                  Asignar Especialista — #ORD-{ordenAsignando.id}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setOrdenAsignando(null)}></button>
              </div>
              <form onSubmit={confirmarAsignacion}>
                <div className="modal-body p-4">
                  <div className="p-3 bg-light rounded-3 border mb-3 small">
                    <p className="mb-1"><strong>Cliente:</strong> {ordenAsignando.cliente_nombre}</p>
                    <p className="mb-1"><strong>Vehículo:</strong> {ordenAsignando.marca} {ordenAsignando.modelo}</p>
                    <p className="mb-1"><strong>Modalidad:</strong> {ordenAsignando.modalidad}</p>
                    <p className="mb-0"><strong>Falla:</strong> {ordenAsignando.falla_reportada}</p>
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-dark">
                      Seleccionar Técnico Responsable
                    </label>
                    <select
                      className="form-select"
                      value={tecnicoElegido}
                      onChange={e => setTecnicoElegido(e.target.value)}
                      required
                    >
                      <option value="" disabled>Seleccione un especialista de la lista...</option>
                      {tecnicos.map(t => (
                        <option key={t.id} value={t.id}>
                          {t.nombre} — {t.especialidad}
                        </option>
                      ))}
                    </select>
                  </div>

                  {tecnicoSeleccionadoObj ? (
                    <div className="p-3 rounded-3 border mb-3" style={{ backgroundColor: '#f8fafc' }}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="small fw-bold text-dark">
                          <i className="bi bi-speedometer2 text-primary me-1"></i> Estado Operativo del Técnico:
                        </span>
                        <span className={`badge px-3 py-1 rounded-pill ${
                          cantidadPendientesNum === 0 ? 'bg-success text-white' :
                          cantidadPendientesNum < 3 ? 'bg-primary text-white' : 'bg-danger text-white'
                        }`}>
                          {cantidadPendientesNum === 0 ? 'Disponible / Libre' :
                          cantidadPendientesNum < 3 ? 'Carga Moderada' : 'Sobrecargado'}
                        </span>
                      </div>

                      <div className="d-flex justify-content-between small text-secondary-custom mb-1">
                        <span>Órdenes activas en curso:</span>
                        <strong className="text-dark fs-6">{cantidadPendientesNum} asignación(es)</strong>
                      </div>

                      <div className="progress mb-2" style={{ height: '6px' }}>
                        <div 
                          className="progress-bar"
                          style={{ 
                            width: `${Math.min(100, Math.round((cantidadPendientesNum / 4) * 100))}%`,
                            backgroundColor: cantidadPendientesNum >= 3 ? '#ef4444' : '#10b981'
                          }}
                        ></div>
                      </div>

                      {advertenciaSobrecarga && (
                        <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-0 mt-2">
                          <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                          <div>
                            <strong>Alerta de Saturación:</strong> Este técnico tiene {cantidadPendientesNum} órdenes activas. Se aconseja seleccionar a otro técnico disponible.
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-3 bg-light rounded-3 border text-center text-secondary-custom small mb-3">
                      <i className="bi bi-info-circle me-1"></i> Selecciona un técnico para consultar su disponibilidad y órdenes en curso.
                    </div>
                  )}
                </div>
                <div className="modal-footer border-0 bg-light py-2">
                  <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={() => setOrdenAsignando(null)}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-electric rounded-pill px-4 fw-bold">
                    Confirmar Asignación
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {ordenDetalle && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(21, 23, 25, 0.75)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="modal-header text-white border-0 py-3" style={{ backgroundColor: '#151719' }}>
                <h5 className="modal-title fw-bold">
                  <i className="bi bi-file-earmark-text text-electric me-2"></i>
                  Detalle Técnico Completo — #ORD-{ordenDetalle.id}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setOrdenDetalle(null)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <small className="text-secondary-custom fw-bold d-block mb-1">CLIENTE Y UNIDAD</small>
                      <h6 className="fw-bold mb-1">{ordenDetalle.cliente_nombre}</h6>
                      <p className="mb-0 small text-dark">{ordenDetalle.marca} {ordenDetalle.modelo} ({ordenDetalle.tipo_vehiculo})</p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 border h-100">
                      <small className="text-secondary-custom fw-bold d-block mb-1">ESTADO DEL SERVICIO</small>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <span className="badge bg-dark text-electric px-3 py-1">{ordenDetalle.estado_servicio}</span>
                        <span className="badge bg-light text-dark border">{ordenDetalle.modalidad}</span>
                      </div>
                      <small className="text-secondary-custom d-block">
                        Técnico: <strong>{ordenDetalle.tecnico_nombre || 'No asignado'}</strong>
                      </small>
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="fw-bold small text-secondary-custom">DIAGNÓSTICO O MOTIVO DE INGRESO:</label>
                  <p className="p-2 bg-light rounded border mb-0 small text-dark">{ordenDetalle.falla_reportada}</p>
                </div>

                {ordenDetalle.direccion_servicio && (
                  <div className="mb-3">
                    <label className="fw-bold small text-secondary-custom">UBICACIÓN REGISTRADA PARA AUXILIO:</label>
                    <p className="p-2 bg-light rounded border mb-0 small text-dark">
                      <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                      {ordenDetalle.direccion_servicio} {ordenDetalle.referencia && `(Ref: ${ordenDetalle.referencia})`}
                    </p>
                  </div>
                )}
              </div>
              <div className="modal-footer border-0 bg-light py-2">
                <button type="button" className="btn btn-dark rounded-pill px-4" onClick={() => setOrdenDetalle(null)}>
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}