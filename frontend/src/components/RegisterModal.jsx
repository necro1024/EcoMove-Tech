import React, { useState } from 'react';
import { API_BASE_URL, getHeaders } from "@/apiConfig.js";

export default function RegisterModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    direccion: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/registro-cliente`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al registrar cliente');

      alert('¡Cuenta creada con éxito! Ya puedes iniciar sesión con tu correo.');
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(21, 23, 25, 0.85)' }}>
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow rounded-4 overflow-hidden" style={{ backgroundColor: '#1e2226' }}>
          <div className="modal-header border-0 pb-0" style={{ backgroundColor: '#151719', color: '#FFFFFF' }}>
            <h5 className="modal-title fw-bold">
              <i className="bi bi-person-plus-fill text-electric me-2"></i>
              Registro de Nuevo Cliente (HU001)
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="modal-body p-4 text-white">
              {error && <div className="alert alert-danger py-2 small">{error}</div>}

              <div className="row g-3 mb-3">
                <div className="col-md-7">
                  <label className="form-label small fw-bold">Nombres y Apellidos Completos</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ backgroundColor: '#151719', color: '#FFFFFF', borderColor: '#33383f' }}
                    placeholder="Ej. Dante Uribe Gavilano"
                    value={formData.nombre}
                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-5">
                  <label className="form-label small fw-bold">DNI / Documento</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ backgroundColor: '#151719', color: '#FFFFFF', borderColor: '#33383f' }}
                    placeholder="72345678"
                    value={formData.dni}
                    onChange={e => setFormData({ ...formData, dni: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Teléfono Celular</label>
                  <input
                    type="tel"
                    className="form-control"
                    style={{ backgroundColor: '#151719', color: '#FFFFFF', borderColor: '#33383f' }}
                    placeholder="999888777"
                    value={formData.telefono}
                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Dirección Residencial (Lima)</label>
                  <input
                    type="text"
                    className="form-control"
                    style={{ backgroundColor: '#151719', color: '#FFFFFF', borderColor: '#33383f' }}
                    placeholder="Av. Arequipa 1234, Lince"
                    value={formData.direccion}
                    onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Correo Electrónico (Usuario)</label>
                  <input
                    type="email"
                    className="form-control"
                    style={{ backgroundColor: '#151719', color: '#FFFFFF', borderColor: '#33383f' }}
                    placeholder="usuario@ejemplo.com"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-bold">Contraseña de Acceso</label>
                  <input
                    type="password"
                    className="form-control"
                    style={{ backgroundColor: '#151719', color: '#FFFFFF', borderColor: '#33383f' }}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer border-0 pt-0">
              <button type="button" className="btn btn-outline-light rounded-pill px-3" onClick={onClose}>Cancelar</button>
              <button type="submit" disabled={loading} className="btn btn-electric rounded-pill px-4">
                {loading ? 'Creando cuenta...' : 'Completar Registro'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}