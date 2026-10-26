import React from 'react';

export default function Navbar({ usuario, onLogout }) {
  const badges = {
    cliente: 'bg-primary',
    tecnico: 'bg-warning text-dark',
    administrador: 'bg-danger'
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm mb-4">
      <div className="container">
        <a className="navbar-brand d-flex align-items-center gap-2" href="#">
          <i className="bi bi-lightning-charge-fill text-warning fs-4"></i>
          <span className="fw-bold">EcoMove Tech</span>
        </a>
        <div className="d-flex align-items-center gap-3">
          {usuario && (
            <>
              <span className="text-light">
                <i className="bi bi-person-circle me-1"></i> {usuario.nombre}
              </span>
              <span className={`badge ${badges[usuario.rol]} text-uppercase`}>
                {usuario.rol}
              </span>
              <button onClick={onLogout} className="btn btn-outline-light btn-sm">
                <i className="bi bi-box-arrow-right me-1"></i> Cerrar Sesión
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}