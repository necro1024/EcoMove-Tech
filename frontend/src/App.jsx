import React, { useState } from 'react';
import LandingPage from './pages/LandingPage.jsx';
import RegisterModal from './components/RegisterModal.jsx';
import Header from './components/Header.jsx';
import ClientDashboard from './pages/ClientDashboard.jsx';
import AdminDispatch from './pages/AdminDispatch.jsx';
import TechnicianWorkspace from './pages/TechnicianWorkspace.jsx';
import './ClientePortal.css';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('sesion_activa');
    return saved ? JSON.parse(saved) : null;
  });

  const [modalLogin, setModalLogin] = useState(false);
  const [modalRegistro, setModalRegistro] = useState(false);

  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Credenciales inválidas');

      setUser(data);
      localStorage.setItem('sesion_activa', JSON.stringify(data));
      setModalLogin(false);
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sesion_activa');
  };

  const selectPreset = (email) => {
    setEmailInput(email);
    setPasswordInput('123456');
  };

  if (!user) {
    return (
      <>
        <LandingPage 
          onOpenLogin={() => setModalLogin(true)} 
          onOpenRegister={() => setModalRegistro(true)} 
        />

        {modalRegistro && (
          <RegisterModal 
            onClose={() => setModalRegistro(false)} 
            onSuccess={() => {
              setModalRegistro(false);
              setModalLogin(true);
            }} 
          />
        )}

        {modalLogin && (
          <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(21, 23, 25, 0.85)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow-lg p-3" style={{ backgroundColor: '#1e2226' }}>
                <div className="modal-header border-0 pb-0">
                  <h5 className="modal-title fw-bold text-white">Acceso al Sistema</h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setModalLogin(false)}></button>
                </div>
                <div className="modal-body p-4 text-center">
                  <div className="mb-4">
                    <div 
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                      style={{ width: '56px', height: '56px', backgroundColor: '#151719', border: '2px solid var(--color-electric-green)' }}
                    >
                      <i className="bi bi-lightning-charge-fill text-electric fs-3"></i>
                    </div>
                    <h4 className="fw-bold text-white mt-1">Iniciar Sesión</h4>
                    <p className="text-secondary-custom small mb-0">Gestión Integral de Movilidad Eléctrica</p>
                  </div>

                  {errorMsg && (
                    <div className="alert alert-danger py-2 small d-flex align-items-center gap-2">
                      <i className="bi bi-exclamation-triangle-fill"></i> {errorMsg}
                    </div>
                  )}

                  <form onSubmit={handleLogin} className="text-start">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-white">
                        <i className="bi bi-envelope text-electric me-1"></i> Correo Electrónico
                      </label>
                      <input
                        type="email"
                        className="form-control"
                        style={{ backgroundColor: '#151719', color: '#FFFFFF', borderColor: '#33383f' }}
                        value={emailInput}
                        onChange={e => setEmailInput(e.target.value)}
                        placeholder="usuario@test.com"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="form-label small fw-bold text-white">
                        <i className="bi bi-lock text-electric me-1"></i> Contraseña
                      </label>
                      <input
                        type="password"
                        className="form-control"
                        style={{ backgroundColor: '#151719', color: '#FFFFFF', borderColor: '#33383f' }}
                        value={passwordInput}
                        onChange={e => setPasswordInput(e.target.value)}
                        placeholder="••••••••"
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-electric w-100 py-2 rounded-3 fw-bold">
                      <i className="bi bi-box-arrow-in-right me-1"></i> Entrar
                    </button>
                  </form>

                  <div className="mt-3 text-center">
                    <span className="text-secondary-custom small">¿No tienes cuenta? </span>
                    <button 
                      onClick={() => { setModalLogin(false); setModalRegistro(true); }}
                      className="btn btn-link p-0 text-electric small fw-bold text-decoration-none"
                    >
                      Regístrate aquí
                    </button>
                  </div>

                  <div className="mt-3 pt-3 border-top border-secondary text-start">
                    <label className="text-secondary-custom small fw-bold mb-2 d-block">Accesos directos demo:</label>
                    <div className="d-flex flex-column gap-1">
                      <button type="button" onClick={() => selectPreset('cliente@test.com')} className="btn btn-outline-light btn-sm text-start">
                        <i className="bi bi-person text-electric me-2"></i> Cliente (cliente@test.com)
                      </button>
                      <button type="button" onClick={() => selectPreset('admin@test.com')} className="btn btn-outline-light btn-sm text-start">
                        <i className="bi bi-shield-check text-electric me-2"></i> Administrador (admin@test.com)
                      </button>
                      <button type="button" onClick={() => selectPreset('tecnico@test.com')} className="btn btn-outline-light btn-sm text-start">
                        <i className="bi bi-tools text-electric me-2"></i> Técnico (tecnico@test.com)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="min-vh-100" style={{ backgroundColor: 'var(--color-section-bg)' }}>
      <Header user={user} onLogout={handleLogout} />
      <main>
        {user.rol === 'cliente' && <ClientDashboard user={user} />}
        {user.rol === 'administrador' && <AdminDispatch user={user} />}
        {user.rol === 'tecnico' && <TechnicianWorkspace user={user} />}
      </main>
    </div>
  );
}