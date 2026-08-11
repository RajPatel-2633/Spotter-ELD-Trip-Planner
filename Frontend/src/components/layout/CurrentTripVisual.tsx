import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { animateCurrentTripTruck } from '../../animations/truckAnimation';

export interface CurrentTripVisualProps {
  status?: 'PLANNING' | 'EN_ROUTE' | 'ARRIVED';
  origin?: string;
  destination?: string;
  distanceMiles?: number;
}

export const CurrentTripVisual: React.FC<CurrentTripVisualProps> = ({
  status = 'EN_ROUTE',
  origin = 'Chicago, IL',
  destination = 'Houston, TX',
  distanceMiles = 1240,
}) => {
  const truckRef = useRef<SVGGElement | null>(null);
  const roadRef = useRef<SVGLineElement | null>(null);
  const dotsRef = useRef<(SVGElement | null)[]>([]);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const tl = animateCurrentTripTruck(
      truckRef.current,
      roadRef.current,
      dotsRef.current,
      status
    );
    if (tl) timelineRef.current = tl;

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
    };
  }, [status, origin, destination]);

  const cleanOrigin = origin.split(',')[0];
  const cleanDest = destination.split(',')[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="spotter-card"
      style={{
        padding: '16px 14px',
        marginTop: '14px',
        background: 'linear-gradient(180deg, #141724 0%, #0E1018 100%)',
        borderColor: '#242C3E',
        borderRadius: '12px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '140px',
      }}
    >
      {/* Header Row: Title & Status Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
        <span style={{ fontSize: '10px', fontWeight: 800, color: '#9CA3AF', letterSpacing: '1px', textTransform: 'uppercase' }}>
          CURRENT TRIP
        </span>

        <AnimatePresence mode="wait">
          <motion.span
            key={status}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              fontSize: '10px',
              fontWeight: 800,
              padding: '3px 9px',
              borderRadius: '5px',
              backgroundColor: status === 'ARRIVED' ? 'rgba(16, 185, 129, 0.18)' : 'rgba(255, 87, 34, 0.18)',
              color: status === 'ARRIVED' ? '#10B981' : '#FF5722',
              border: `1px solid ${status === 'ARRIVED' ? 'rgba(16, 185, 129, 0.35)' : 'rgba(255, 87, 34, 0.35)'}`,
              letterSpacing: '0.6px',
            }}
          >
            {status === 'PLANNING' ? 'PLANNING TRIP' : status === 'ARRIVED' ? 'ARRIVED' : 'EN ROUTE'}
          </motion.span>
        </AnimatePresence>
      </div>

      {/* Prominent SVG Animated Route & Semi-Truck Scene */}
      <div style={{ position: 'relative', width: '100%', height: '65px', margin: '4px 0 8px 0' }}>
        <svg
          width="100%"
          height="65"
          viewBox="0 0 220 65"
          role="img"
          aria-label="Current trip semi-truck route visualization"
          style={{ overflow: 'visible' }}
        >
          {/* Subtle Road Line */}
          <line
            ref={roadRef}
            x1="10"
            y1="52"
            x2="210"
            y2="52"
            stroke="#2A3448"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Sequential Route Dots */}
          {[20, 65, 110, 155, 200].map((xPos, idx) => (
            <circle
              key={idx}
              ref={(el) => {
                if (el) dotsRef.current[idx] = el;
              }}
              cx={xPos}
              cy="52"
              r="3.5"
              fill={idx === 0 ? '#10B981' : idx === 4 ? '#EF4444' : '#FF5722'}
              opacity="0.9"
            />
          ))}

          {/* Enlarged Semi-Truck / Tractor-Trailer Vector */}
          <g ref={truckRef} transform="translate(10, 18)">
            {/* Headlight Beam */}
            <polygon points="28,18 44,12 44,26" fill="rgba(255, 87, 34, 0.2)" />

            {/* Trailer Body */}
            <rect x="0" y="6" width="18" height="17" rx="2" fill="#1C2333" stroke="#FF5722" strokeWidth="1.2" />
            <line x1="5" y1="8" x2="5" y2="21" stroke="#2D3852" strokeWidth="1.2" />
            <line x1="9" y1="8" x2="9" y2="21" stroke="#2D3852" strokeWidth="1.2" />
            <line x1="13" y1="8" x2="13" y2="21" stroke="#2D3852" strokeWidth="1.2" />

            {/* Cab / Tractor */}
            <path d="M18 10 H25 L29 16 V23 H18 Z" fill="#FF5722" />
            {/* Windshield */}
            <polygon points="22,11 27,16 22,16" fill="#0D0F17" />

            {/* Truck Wheels */}
            <circle cx="4.5" cy="25" r="2.5" fill="#0D0F17" stroke="#9CA3AF" strokeWidth="1" />
            <circle cx="13.5" cy="25" r="2.5" fill="#0D0F17" stroke="#9CA3AF" strokeWidth="1" />
            <circle cx="24.5" cy="25" r="2.5" fill="#0D0F17" stroke="#9CA3AF" strokeWidth="1" />
          </g>
        </svg>
      </div>

      {/* Footer Info: Route & Distance */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '8px',
          borderTop: '1px solid #1C2232',
        }}
      >
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#FFFFFF' }}>
          {cleanOrigin} <span style={{ color: '#FF5722' }}>→</span> {cleanDest}
        </div>
        {distanceMiles && (
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#FF5722' }} className="text-mono">
            {distanceMiles.toLocaleString()} mi
          </div>
        )}
      </div>
    </motion.div>
  );
};
