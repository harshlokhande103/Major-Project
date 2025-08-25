import React from 'react';

const Navbar = ({ onSignIn, onRegister }) => {
  return (
    <nav className="navbar">
      <div className="logo">Clarity Call</div>
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