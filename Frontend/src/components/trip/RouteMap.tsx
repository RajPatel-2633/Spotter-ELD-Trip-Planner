import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Polyline, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ArrowRight, Plus, Minus, Target } from 'lucide-react';
import type { TripPlan, Stop } from '../../types/trip';
import gsap from 'gsap';

interface RouteMapProps {
  plan: TripPlan;
  isPlanning: boolean;
  onOpenDetails?: () => void;
}

/**
 * Custom Leaflet divIcon generator for dark operational command center theme
 */
function createCustomMarkerIcon(stop: Stop, index: number) {
  let badgeBg = '#FF5722';

  if (stop.type === 'START') {
    badgeBg = '#10B981';
  } else if (stop.type === 'FUEL') {
    badgeBg = '#FF5722';
  } else if (stop.type === 'REST') {
    badgeBg = '#FFB300';
  } else if (stop.type === 'PICKUP') {
    badgeBg = '#FF5722';
  } else if (stop.type === 'DROPOFF') {
    badgeBg = '#EF4444';
  }

  const stopNumber = index + 1;

  const html = `
    <div style="
      display: flex;
      align-items: center;
      justify-content: center;
      width: 26px;
      height: 26px;
      background-color: #0B0E17;
      border: 2px solid ${badgeBg};
      border-radius: 50%;
      box-shadow: 0 4px 10px rgba(0, 0, 0, 0.9);
      color: #FFFFFF;
      font-family: Inter, sans-serif;
      font-size: 11px;
      font-weight: 800;
      transform: translate(-50%, -50%);
      cursor: pointer;
    ">
      ${stopNumber}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [26, 26],
    iconAnchor: [13, 13],
  });
}

/**
 * Controller component to handle map bounds and GSAP route drawing animation
 */
function MapController({ plan, isPlanning }: { plan: TripPlan; isPlanning: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!plan.route.pathPoints || plan.route.pathPoints.length === 0) return;

    const latLngs: L.LatLngExpression[] = plan.route.pathPoints.map((p) => [p.lat, p.lng]);
    const bounds = L.latLngBounds(latLngs);

    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true });

    const timer = setTimeout(() => {
      const pathEl = document.querySelector('.leaflet-overlay-pane path') as SVGPathElement | null;
      if (pathEl) {
        const length = pathEl.getTotalLength();
        gsap.set(pathEl, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(pathEl, {
          strokeDashoffset: 0,
          duration: 1.5,
          ease: 'power2.inOut',
        });
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [plan, isPlanning, map]);

  return null;
}

export const RouteMap: React.FC<RouteMapProps> = ({ plan, isPlanning, onOpenDetails }) => {
  const mapRef = useRef<L.Map | null>(null);

  const totalStopsCount = plan.stops.length;
  const fuelStopsCount = plan.stops.filter((s) => s.type === 'FUEL').length;

  const driveTimeFormatted = `${Math.floor(plan.summary.driveTimeMinutes / 60)}h ${(plan.summary.driveTimeMinutes % 60)
    .toString()
    .padStart(2, '0')}m`;

  const polylinePositions: L.LatLngExpression[] = plan.route.pathPoints.map((pt) => [pt.lat, pt.lng]);
  const centerLat = plan.route.pathPoints[0]?.lat || 41.8781;
  const centerLng = plan.route.pathPoints[0]?.lng || -87.6298;

  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleResetView = () => {
    if (mapRef.current && plan.route.pathPoints.length > 0) {
      const bounds = L.latLngBounds(plan.route.pathPoints.map((p) => [p.lat, p.lng]));
      mapRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  };

  return (
    <div
      className="spotter-card"
      style={{
        position: 'relative',
        height: '420px',
        padding: 0,
        overflow: 'hidden',
        background: '#090B10',
        borderColor: '#1C2230',
        marginBottom: '20px',
      }}
    >
      <MapContainer
        center={[centerLat, centerLng]}
        zoom={6}
        zoomControl={false}
        style={{ width: '100%', height: '100%', backgroundColor: '#090B10' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OpenStreetMap</a>'
          maxZoom={18}
        />

        <MapController plan={plan} isPlanning={isPlanning} />

        <Polyline
          positions={polylinePositions}
          pathOptions={{
            color: '#FF5722',
            weight: 5,
            opacity: 0.9,
            lineCap: 'round',
            lineJoin: 'round',
          }}
        />

        {plan.stops.map((stop, idx) => (
          <Marker
            key={stop.id}
            position={[stop.coordinates.lat, stop.coordinates.lng]}
            icon={createCustomMarkerIcon(stop, idx)}
          >
            <Tooltip direction="top" offset={[0, -14]} opacity={0.95}>
              <span style={{ fontWeight: 700, fontSize: '11px' }}>
                #{idx + 1} {stop.name} ({stop.location})
              </span>
            </Tooltip>
            <Popup className="spotter-dark-popup">
              <div style={{ padding: '4px', color: '#111827' }}>
                <div style={{ fontWeight: 800, fontSize: '13px', color: '#FF5722' }}>
                  Stop #{idx + 1}: {stop.name}
                </div>
                <div style={{ fontSize: '11px', color: '#374151', marginTop: '2px' }}>{stop.location}</div>
                <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>
                  Distance: {stop.milesFromStart} mi | ETA: {stop.eta} | Duration: {stop.durationMinutes}m
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          backgroundColor: 'rgba(17, 20, 28, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #232B3C',
          borderRadius: '10px',
          padding: '14px 18px',
          width: '240px',
          zIndex: 400,
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '10px' }}>
          ROUTE OVERVIEW
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9CA3AF' }}>Total Distance</span>
            <span style={{ fontWeight: 700, color: '#FFFFFF' }} className="text-mono">
              {plan.summary.totalDistanceMiles.toLocaleString()} mi
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9CA3AF' }}>Drive Time</span>
            <span style={{ fontWeight: 700, color: '#FFFFFF' }} className="text-mono">
              {driveTimeFormatted}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9CA3AF' }}>Total Stops</span>
            <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{totalStopsCount}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9CA3AF' }}>Fuel Stops</span>
            <span style={{ fontWeight: 700, color: '#FF5722' }}>{fuelStopsCount}</span>
          </div>
        </div>

        <button
          onClick={onOpenDetails}
          className="spotter-btn-secondary"
          style={{ width: '100%', justifyContent: 'center', fontSize: '11.5px', padding: '6px 10px' }}
        >
          <span>View Route Details</span>
          <ArrowRight size={13} color="#FF5722" />
        </button>
      </motion.div>

      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 400,
        }}
      >
        <button
          onClick={handleZoomIn}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#121520',
            border: '1px solid #232B3C',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Plus size={16} />
        </button>
        <button
          onClick={handleZoomOut}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#121520',
            border: '1px solid #232B3C',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Minus size={16} />
        </button>
        <button
          onClick={handleResetView}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '6px',
            backgroundColor: '#121520',
            border: '1px solid #232B3C',
            color: '#FF5722',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <Target size={16} />
        </button>
      </div>
    </div>
  );
};
