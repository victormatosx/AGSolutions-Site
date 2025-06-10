import React from 'react';
import '../styles/CofounderCard.css';

const CofounderCard = ({ name, role, image, description }) => {
  return (
    <div className="cofounder-card">
      <div className="card-image">
        <img src={image} alt={name} />
      </div>
      <div className="card-content">
        <h3>{name}</h3>
        <p className="role">{role}</p>
        <p className="description">{description}</p>
      </div>
    </div>
  );
};

export default CofounderCard;