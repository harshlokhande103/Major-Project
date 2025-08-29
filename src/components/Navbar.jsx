import React from 'react';

const Navbar = ({ onSignIn, onRegister }) => {
  return (
    <nav className="navbar">
      <div className="logo">
        <img src="/logo-removebg-preview.png" alt="Clarity Call Logo" className="logo-img" />
        <span className="logo-text">CLARITY CALL</span>
      </div>
      <div className="nav-links">
        <a href="#features">Features</a>
        <a href="#mentors">Mentors</a>
        <a href="#pricing">Pricing</a>
        <button className="sign-in" onClick={onSignIn}>Sign In</button>
        <button className="register" onClick={onRegister}>Register</button>
        <button className="start-mentoring">Start Mentoring</button>
      </div>
    </nav>
  );
};

export default Navbar;