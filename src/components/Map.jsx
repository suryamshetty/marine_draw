import React, { useEffect, useState } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import { OSM } from 'ol/source';
import { Tile as TileLayer } from 'ol/layer';
import { Draw } from 'ol/interaction';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import { fromLonLat, toLonLat } from 'ol/proj';

const MapComponent = React.forwardRef(
  ({ updateWaypoints, polygonMode, onPolygonComplete }, ref) => {
    const [mapInstance, setMapInstance] = useState(null);
    const [vectorSource, setVectorSource] = useState(null);

    useEffect(() => {
      const source = new VectorSource();
      const vectorLayer = new VectorLayer({
        source: source,
      });

      const map = new Map({
        target: 'map',
        layers: [
          new TileLayer({ source: new OSM() }),
          vectorLayer,
        ],
        view: new View({
          center: fromLonLat([0, 0]),
          zoom: 2,
        }),
      });

      setMapInstance(map);
      setVectorSource(source);
      if (ref) ref.current = map;

      return () => map.setTarget(null);
    }, [ref]);

    useEffect(() => {
      if (mapInstance && !polygonMode) {
        const draw = new Draw({
          source: vectorSource,
          type: 'LineString',
        });

        draw.on('drawend', (event) => {
          const coordinates = event.feature.getGeometry().getCoordinates();
          const formattedWaypoints = coordinates.map((coord, index) => {
            const [lon, lat] = toLonLat(coord);
            const distance =
              index > 0
                ? calculateDistance(coordinates[index - 1], coord)
                : 0;
            return {
              id: `WP(${String(index).padStart(2, '0')})`,
              coordinates: [lon.toFixed(8), lat.toFixed(8)],
              distance: distance.toFixed(2),
            };
          });

          updateWaypoints(formattedWaypoints);
        });

        mapInstance.addInteraction(draw);

        const handleKeyPress = (e) => {
          if (e.key === 'Enter') {
            mapInstance.removeInteraction(draw);
          }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
          mapInstance.removeInteraction(draw);
          window.removeEventListener('keydown', handleKeyPress);
        };
      }
    }, [mapInstance, vectorSource, polygonMode, updateWaypoints]);

    useEffect(() => {
      if (mapInstance && polygonMode) {
        const polygonDraw = new Draw({
          source: vectorSource,
          type: 'Polygon',
        });

        polygonDraw.on('drawend', (event) => {
          const polygonCoordinates = event.feature
            .getGeometry()
            .getCoordinates()[0];
          onPolygonComplete(
            polygonCoordinates.map((coord) => toLonLat(coord))
          );
        });

        mapInstance.addInteraction(polygonDraw);

        const handleKeyPress = (e) => {
          if (e.key === 'Enter') {
            mapInstance.removeInteraction(polygonDraw);
          }
        };

        window.addEventListener('keydown', handleKeyPress);

        return () => {
          mapInstance.removeInteraction(polygonDraw);
          window.removeEventListener('keydown', handleKeyPress);
        };
      }
    }, [mapInstance, vectorSource, polygonMode, onPolygonComplete]);

    
    const calculateDistance = (coord1, coord2) => {
      const [lon1, lat1] = toLonLat(coord1);
      const [lon2, lat2] = toLonLat(coord2);
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

    return <div id="map" style={{ width: '100%', height: '500px' }} />;
  }
);

export default MapComponent;
