import React, { useState, useRef } from 'react';
import Map from './components/Map';
import Modal from './components/Modal';
import './App.css';

const App = () => {
  const [waypoints, setWaypoints] = useState([]); 
  const [showMissionModal, setShowMissionModal] = useState(true);
  const [polygonMode, setPolygonMode] = useState(false); 
  const [polygonInsertIndex, setPolygonInsertIndex] = useState(null); 
  const [mapMode, setMapMode] = useState(false); 
  const [modalFixed, setModalFixed] = useState(false);

  const mapRef = useRef(null);

  const updateWaypoints = (newWaypoints) => {
    setWaypoints(newWaypoints);
  };

  const handlePolygonInsertion = (index, mode) => {
    setPolygonInsertIndex(index); 
    setPolygonMode(mode); 
  };

  const onPolygonComplete = (polygonCoordinates) => {
    const updatedWaypoints = [...waypoints];
    const insertionPoint = updatedWaypoints[polygonInsertIndex];

   
    const polygonWaypoints = polygonCoordinates.map((coord, i) => ({
      id: `Poly(${String(i).padStart(2, '0')})`,
      coordinates: coord,
      distance:
        i > 0
          ? calculateDistance(polygonCoordinates[i - 1], coord)
          : calculateDistance(insertionPoint.coordinates, coord),
    }));

    
    if (polygonMode === 'before') {
      updatedWaypoints.splice(polygonInsertIndex, 0, ...polygonWaypoints);
    } else if (polygonMode === 'after') {
      updatedWaypoints.splice(polygonInsertIndex + 1, 0, ...polygonWaypoints);
    }

    setWaypoints(updatedWaypoints);
    setPolygonMode(false); 
    setPolygonInsertIndex(null); 
  };

  const calculateDistance = (coord1, coord2) => {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;
    const R = 6371000; 
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  
  const handleGenerateDataClick = () => {
    setMapMode(true); 
    setModalFixed(true); 
    setShowMissionModal(false); 
  };

  return (
    <div className="App">
      {showMissionModal && (
        <Modal
          title="Mission Creation"
          onClose={() => setShowMissionModal(false)}
          waypoints={waypoints}
          onPolygonInsertion={handlePolygonInsertion}
          onGenerateData={handleGenerateDataClick} 
        />
      )}

      {mapMode && (
        <div className="map-container">
          <Map
            ref={mapRef}
            updateWaypoints={updateWaypoints}
            polygonMode={polygonMode}
            onPolygonComplete={onPolygonComplete}
          />
          <div className={`modal-fixed ${modalFixed ? 'fixed' : ''}`}>
            <Modal
              title="Mission Creation"
              onClose={() => setMapMode(false)} 
              waypoints={waypoints}
              onPolygonInsertion={handlePolygonInsertion}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
