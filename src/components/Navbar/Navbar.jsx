import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light w-100 mt-0">
      <div className="container-fluid">
        <Link to="/"><img src="src\assets\img-util-logo.png" alt="Image Editor Logo" width="50" height="50" className="d-inline-block align-text-top me-2" /></Link>
        <Link className="navbar-brand" to="/">Image Editor</Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/batch-icon-editor">Batch Icon Editor</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/image-editor">Background Editor</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/wand-editor">Magic Wand Editor</Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/dalle-editor">Dalle Editor</Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
