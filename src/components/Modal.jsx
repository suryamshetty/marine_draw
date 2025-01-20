import React, { useState } from 'react';
import './Modal.css';

const Modal = ({ title, onClose, waypoints, onPolygonInsertion, onGenerateData }) => {
  const [showOptions, setShowOptions] = useState(null); 

 
  const handleDotsClick = (index) => {
    setShowOptions(showOptions === index ? null : index); 
  };

  const handlePolygonInsertion = (index, mode) => {
    onPolygonInsertion(index, mode); 
    setShowOptions(null);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
       
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        
        <div className="modal-body">
          <table className="waypoint-table">
            <thead>
              <tr>
                <th>WP</th>
                <th>Coordinates</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              {waypoints.map((wp, index) => (
                <tr key={index} data-row-id={wp.id}>
                  <td><strong>{wp.id}</strong></td>
                  <td>
                    {wp.coordinates && wp.coordinates.length === 2
                      ? `(${wp.coordinates[0]}, ${wp.coordinates[1]})`
                      : 'Coordinates unavailable'}
                  </td>
                  <td>{wp.distance ? `${wp.distance} m` : 'Distance unavailable'}</td>

              
                  <td>
                    <span
                      className="three-dots"
                      onClick={() => handleDotsClick(index)} 
                    >
                      &#x22EE; 
                    </span>

                    
                    {showOptions === index && (
                      <ul className="options-list">
                        <li onClick={() => handlePolygonInsertion(index, 'before')}>
                          Insert Polygon Before
                        </li>
                        <li onClick={() => handlePolygonInsertion(index, 'after')}>
                          Insert Polygon After
                        </li>
                      </ul>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        
          <div className="placeholder-container">
            <p className="placeholder-text">
              Click on the map to mark points of the route and then press enter to complete the route.
            </p>
          </div>
        </div>

      
        <div className="modal-footer">
          
          <button className="generate-data-btn" onClick={onGenerateData}>
            Generate Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
