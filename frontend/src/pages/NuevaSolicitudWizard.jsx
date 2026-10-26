import React, { useState } from 'react';

export default function NuevaSolicitudWizard({ user, vehiculos, onVolver, onCompletado }) {
  const [paso, setPaso] = useState(1);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [ordenGeneradaId, setOrdenGeneradaId] = useState(null);

  const [formData, setFormData] = useState({
    vehiculo_id: vehiculos[0]?.id || '',
    modalidad: 'Taller',
    falla_reportada: '',
    direccion: '',
    referencia: '',
    distrito: 'San Miguel',
    metodo_pago: 'Yape'
  });
  const [cargando, setCargando] = useState(false);

  const porcentajeProgreso = paso === 1 ? 33 : paso === 2 ? 66 : 100;

  const handleFinalizar = async (e) => {
    e.preventDefault();
    setCargando(true);
    try {
      const direccionCompleta = formData.modalidad === 'Domicilio' 
        ? `${formData.direccion}, ${formData.distrito}, Lima` 
        : 'Taller Central - Av. La Marina 2401, San Miguel';

      const res = await fetch('http://localhost:5000/api/solicitudes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente_id: user.referencia_id,
          vehiculo_id: formData.vehiculo_id,
          modalidad: formData.modalidad,
          falla_reportada: formData.falla_reportada,
          direccion: direccionCompleta,
          referencia: formData.referencia,
          metodo_pago: formData.metodo_pago
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar servicio');
      
      setOrdenGeneradaId(data.id);
      setShowSuccessPopup(true);
    } catch (err) {
      alert(err.message);
    } finally {
      setCargando(false);
    }
  };

  const getEmbedMapUrl = () => {
    const query = formData.direccion ? encodeURIComponent(`${formData.direccion}, ${formData.distrito}, Lima, Peru`) : 'Lima,Peru';
    return `https://maps.google.com/maps?q=${query}&t=&z=14&ie=UTF8&iwloc=&output=embed`;
  };

  return (
    <div className="container py-4" style={{ maxWidth: '980px' }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <button onClick={onVolver} className="btn btn-outline-dark btn-sm rounded-pill mb-2">
            <i className="bi bi-arrow-left me-1"></i> Volver a mi Panel
          </button>
          <h3 className="fw-bold text-dark mb-0">Solicitud de Servicio Técnico Especializado</h3>
          <p className="text-secondary-custom small mb-0">Paso {paso} de 3</p>
        </div>
      </div>

      <div className="custom-card p-3 mb-4 shadow-sm">
        <div className="d-flex justify-content-between small fw-bold mb-2">
          <span className={paso >= 1 ? 'text-dark' : 'text-secondary-custom'}>1. Falla y Vehículo</span>
          <span className={paso >= 2 ? 'text-dark' : 'text-secondary-custom'}>2. Modalidad y Mapa</span>
          <span className={paso === 3 ? 'text-dark' : 'text-secondary-custom'}>3. Pago y Envío</span>
        </div>
        <div className="progress" style={{ height: '8px' }}>
          <div 
            className="progress-bar" 
            role="progressbar" 
            style={{ width: `${porcentajeProgreso}%`, backgroundColor: 'var(--color-electric-green)' }}
          ></div>
        </div>
      </div>

      <div className="custom-card p-4 shadow-sm">
        {paso === 1 && (
          <div>
            <h5 className="fw-bold mb-3"><i className="bi bi-scooter text-electric me-2"></i>Selecciona el Vehículo y describe la Avería</h5>
            
            <div className="mb-3">
              <label className="form-label small fw-bold">Vehículo Registrado</label>
              <select 
                className="form-select"
                value={formData.vehiculo_id}
                onChange={e => setFormData({ ...formData, vehiculo_id: e.target.value })}
              >
                {vehiculos.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.marca} {v.modelo} — N° Serie: {v.numero_serie} ({v.voltaje_bateria}V)
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-bold">Detalle de Avería o Requerimiento Técnico</label>
              <textarea 
                className="form-control"
                rows={4}
                placeholder="Indica con precisión los síntomas: pérdida de potencia, descarga rápida, error en pantalla, frenos desgastados..."
                value={formData.falla_reportada}
                onChange={e => setFormData({ ...formData, falla_reportada: e.target.value })}
                required
              ></textarea>
            </div>

            <div className="text-end">
              <button 
                type="button" 
                disabled={!formData.falla_reportada.trim()}
                onClick={() => setPaso(2)} 
                className="btn btn-electric px-4 rounded-pill"
              >
                Continuar a Ubicación <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        )}

        {paso === 2 && (
          <div>
            <h5 className="fw-bold mb-3"><i className="bi bi-geo-alt-fill text-electric me-2"></i>Modalidad de Asistencia y Ubicación</h5>
            
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <div 
                  className={`p-3 rounded-3 border cursor-pointer ${formData.modalidad === 'Taller' ? 'border-dark bg-light' : ''}`}
                  onClick={() => setFormData({ ...formData, modalidad: 'Taller' })}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      checked={formData.modalidad === 'Taller'} 
                      onChange={() => setFormData({ ...formData, modalidad: 'Taller' })}
                    />
                    <label className="form-check-label fw-bold">Atención en Taller Central</label>
                  </div>
                  <small className="text-secondary-custom d-block mt-1">
                    Av. La Marina 2401, San Miguel. Entrega directa en nuestro centro especializado.
                  </small>
                </div>
              </div>

              <div className="col-md-6">
                <div 
                  className={`p-3 rounded-3 border cursor-pointer ${formData.modalidad === 'Domicilio' ? 'border-dark bg-light' : ''}`}
                  onClick={() => setFormData({ ...formData, modalidad: 'Domicilio' })}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="form-check">
                    <input 
                      className="form-check-input" 
                      type="radio" 
                      checked={formData.modalidad === 'Domicilio'} 
                      onChange={() => setFormData({ ...formData, modalidad: 'Domicilio' })}
                    />
                    <label className="form-check-label fw-bold">Auxilio a Domicilio / En Ruta</label>
                  </div>
                  <small className="text-secondary-custom d-block mt-1">
                    Un técnico motorizado se traslada al lugar exacto de la avería.
                  </small>
                </div>
              </div>
            </div>

            {formData.modalidad === 'Domicilio' && (
              <div className="mb-4">
                <div className="row g-2 mb-3">
                  <div className="col-md-8">
                    <label className="form-label small fw-bold">Dirección de Auxilio Técnico</label>
                    <input 
                      type="text" 
                      className="form-control"
                      placeholder="Ej. Av. Javier Prado Este 2465"
                      value={formData.direccion}
                      onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Distrito (Lima)</label>
                    <select 
                      className="form-select"
                      value={formData.distrito}
                      onChange={e => setFormData({ ...formData, distrito: e.target.value })}
                    >
                      <option value="San Miguel">San Miguel</option>
                      <option value="Magdalena">Magdalena del Mar</option>
                      <option value="Pueblo Libre">Pueblo Libre</option>
                      <option value="San Isidro">San Isidro</option>
                      <option value="Miraflores">Miraflores</option>
                      <option value="Surco">Santiago de Surco</option>
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold">Punto de Referencia</label>
                  <input 
                    type="text" 
                    className="form-control form-control-sm"
                    placeholder="Ej. Cruce con Av. Brasil, frente al supermercado"
                    value={formData.referencia}
                    onChange={e => setFormData({ ...formData, referencia: e.target.value })}
                  />
                </div>

                <div className="rounded-3 overflow-hidden border shadow-sm mt-3" style={{ height: '240px' }}>
                  <iframe
                    title="Ubicacion Google Maps"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={getEmbedMapUrl()}
                  ></iframe>
                </div>
              </div>
            )}

            <div className="d-flex justify-content-between">
              <button type="button" onClick={() => setPaso(1)} className="btn btn-outline-secondary rounded-pill px-4">
                <i className="bi bi-arrow-left me-1"></i> Anterior
              </button>
              <button 
                type="button" 
                disabled={formData.modalidad === 'Domicilio' && !formData.direccion.trim()}
                onClick={() => setPaso(3)} 
                className="btn btn-electric px-4 rounded-pill"
              >
                Continuar al Pago <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        )}

        {paso === 3 && (
          <div>
            <h5 className="fw-bold mb-3"><i className="bi bi-credit-card-2-front text-electric me-2"></i>Método de Pago y Confirmación</h5>
            
            <div className="row g-3 mb-4">
              {[
                { id: 'Yape', nombre: 'Yape / Plin', desc: 'Pago mediante código QR o número móvil' },
                { id: 'Tarjeta', nombre: 'Tarjeta Débito / Crédito', desc: 'Visa o Mastercard' },
                { id: 'Efectivo_Taller', nombre: 'Pago Contra Entrega', desc: 'Abono en taller o al técnico al finalizar' }
              ].map(m => (
                <div key={m.id} className="col-md-4">
                  <div 
                    className={`p-3 rounded-3 border h-100 cursor-pointer ${formData.metodo_pago === m.id ? 'border-dark bg-light' : ''}`}
                    onClick={() => setFormData({ ...formData, metodo_pago: m.id })}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="form-check mb-2">
                      <input 
                        className="form-check-input" 
                        type="radio" 
                        checked={formData.metodo_pago === m.id} 
                        onChange={() => setFormData({ ...formData, metodo_pago: m.id })}
                      />
                      <label className="form-check-label fw-bold">{m.nombre}</label>
                    </div>
                    <small className="text-secondary-custom">{m.desc}</small>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 bg-light rounded-3 border mb-4">
              <h6 className="fw-bold mb-2">Resumen de tu Orden</h6>
              <div className="row small">
                <div className="col-6"><strong>Modalidad:</strong> {formData.modalidad}</div>
                <div className="col-6"><strong>Método de Pago:</strong> {formData.metodo_pago}</div>
                <div className="col-12 mt-1"><strong>Falla Reportada:</strong> {formData.falla_reportada}</div>
              </div>
            </div>

            <div className="d-flex justify-content-between">
              <button type="button" onClick={() => setPaso(2)} className="btn btn-outline-secondary rounded-pill px-4">
                <i className="bi bi-arrow-left me-1"></i> Anterior
              </button>
              <button 
                type="button" 
                disabled={cargando}
                onClick={handleFinalizar} 
                className="btn btn-electric px-4 rounded-pill fw-bold"
              >
                {cargando ? 'Generando orden...' : 'Confirmar y Enviar Solicitud'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showSuccessPopup && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(21, 23, 25, 0.85)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden text-center p-4" style={{ backgroundColor: '#ffffff' }}>
              <div className="my-3">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ width: '70px', height: '70px', backgroundColor: '#dcfce7', border: '3px solid #10b981' }}
                >
                  <i className="bi bi-check-circle-fill text-success" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h4 className="fw-bold text-dark mb-2">¡Solicitud generada con éxito!</h4>
                <p className="text-secondary-custom mb-3">
                  La orden <strong>OT-#{ordenGeneradaId}</strong> ya se encuentra en bandeja administrativa para asignación técnica.
                </p>
                <div className="p-3 bg-light rounded-3 border text-start small mb-4">
                  <div className="mb-1"><i className="bi bi-check2 text-success me-1"></i> Notificación enviada al panel central.</div>
                  <div><i className="bi bi-check2 text-success me-1"></i> Puedes seguir el estado en tiempo real desde tu pestaña de Seguimiento.</div>
                </div>
              </div>
              <button 
                type="button" 
                className="btn btn-electric w-100 py-2 rounded-pill fw-bold"
                onClick={() => {
                  setShowSuccessPopup(false);
                  onCompletado();
                }}
              >
                Ir a Seguimiento de Órdenes <i className="bi bi-arrow-right ms-1"></i>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}