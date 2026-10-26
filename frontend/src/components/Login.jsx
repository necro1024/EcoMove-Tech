import React, { useState } from 'react';

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Fallo de autenticación');
      onLoginSuccess(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const seleccionarDemo = (correo) => {
    setEmail(correo);
    setPassword('123456');
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card shadow-sm border-0">
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <i className="bi bi-shield-lock-fill text-primary" style={{ fontSize: '3rem' }}></i>
                <h4 className="fw-bold mt-2">Acceso al Sistema</h4>
                <p className="text-muted small">Gestión Integral de Movilidad Eléctrica</p>
              </div>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Correo Electrónico</label>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="usuario@test.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="******"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary w-100 py-2 fw-semibold">
                  Iniciar Sesión
                </button>
              </form>

              <div className="mt-4 pt-3 border-top">
                <label className="form-label text-muted small fw-bold">Accesos directos de prueba:</label>
                <div className="d-flex flex-column gap-1">
                  <button onClick={() => seleccionarDemo('cliente@test.com')} className="btn btn-sm btn-outline-primary text-start">
                    <i className="bi bi-person me-2"></i> Rol: Cliente (cliente@test.com)
                  </button>
                  <button onClick={() => seleccionarDemo('tecnico@test.com')} className="btn btn-sm btn-outline-warning text-dark text-start">
                    <i className="bi bi-tools me-2"></i> Rol: Técnico (tecnico@test.com)
                  </button>
                  <button onClick={() => seleccionarDemo('admin@test.com')} className="btn btn-sm btn-outline-danger text-start">
                    <i className="bi bi-gear me-2"></i> Rol: Administrador (admin@test.com)
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}