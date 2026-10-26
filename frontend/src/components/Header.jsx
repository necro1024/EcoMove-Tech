import React from 'react';

export default function Header({ user, onLogout, onNavigate, vistaActual }) {
  const getInitials = (name) => {
    if (!name) return 'US';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <header className="theme-header py-2 px-4 shadow-sm sticky-top">
      <div className="d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center gap-4">
          <div 
            className="d-flex align-items-center gap-2 cursor-pointer"
            onClick={() => onNavigate('dashboard')}
            style={{ cursor: 'pointer' }}
          >
            <i className="bi bi-lightning-charge-fill text-electric fs-3"></i>
            <div>
              <h5 className="fw-bold mb-0 text-white">EcoMove Tech</h5>
              <small className="text-secondary-custom" style={{ fontSize: '0.72rem' }}>
                Gestión Integral de Movilidad Eléctrica
              </small>
            </div>
          </div>

          <nav className="d-none d-md-flex gap-2">
          </nav>
        </div>

        <div className="d-flex align-items-center gap-3">
          <span 
            className="badge px-3 py-2 text-uppercase fw-bold"
            style={{ backgroundColor: '#23272b', color: 'var(--color-electric-green)', border: '1px solid #33383f' }}
          >
            <i className="bi bi-shield-check me-1"></i> {user.rol}
          </span>
          
          <div className="d-flex align-items-center gap-2">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
              style={{ width: '38px', height: '38px', backgroundColor: 'var(--color-electric-green)', color: '#151719' }}
            >
              {getInitials(user.nombre)}
            </div>
            <div className="d-none d-lg-block text-start">
              <span className="fw-semibold text-white small d-block">{user.nombre}</span>
              <small className="text-secondary-custom font-monospace" style={{ fontSize: '0.7rem' }}>{user.email}</small>
            </div>
          </div>

          <button onClick={onLogout} className="btn btn-outline-secondary btn-sm rounded-pill ms-2" title="Cerrar sesión">
            <i className="bi bi-box-arrow-right text-white"></i>
          </button>
        </div>
      </div>
    </header>
  );
}