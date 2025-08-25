import React from 'react';

const SelectRole = ({ onSelect, onBack }) => {
  return (
    <div className="login-wrap">
      <div className="login-card">
        <h2>How would you like to start?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <button className="cta-primary" onClick={() => onSelect?.('client')}>As a Client</button>
          <button className="cta-primary" onClick={() => onSelect?.('mentor')}>As a Mentor</button>
        </div>
        <button type="button" className="badge" onClick={onBack} style={{ width: '100%', textAlign: 'center' }}>Back</button>
      </div>
    </div>
  );
};

export default SelectRole;


