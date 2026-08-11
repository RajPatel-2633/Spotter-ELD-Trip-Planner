import React from 'react';
import { motion } from 'framer-motion';
import { Fuel, MapPin, Flag, Moon, ArrowRight } from 'lucide-react';
import type { Stop } from '../../types/trip';

interface StopTimelineProps {
  stops: Stop[];
  onOpenDetails?: () => void;
}

export const StopTimeline: React.FC<StopTimelineProps> = ({ stops, onOpenDetails }) => {
  const upcomingStops = stops.filter((s) => s.type !== 'START');

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="spotter-card"
      style={{
        padding: '18px',
        marginBottom: '16px',
        background: '#0F121C',
        borderColor: '#1E2536',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>Upcoming Stops</h3>
        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{upcomingStops.length} Stops Scheduled</span>
      </div>

      <div style={{ position: 'relative', paddingLeft: '20px', marginBottom: '16px' }}>
        <div
          style={{
            position: 'absolute',
            left: '7px',
            top: '8px',
            bottom: '8px',
            width: '2px',
            backgroundColor: '#1F2638',
          }}
        />

        {upcomingStops.map((stop, idx) => {
          return (
            <div
              key={stop.id}
              style={{
                position: 'relative',
                marginBottom: idx < upcomingStops.length - 1 ? '16px' : '0',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  left: '-20px',
                  top: '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: stop.type === 'DROPOFF' ? '#EF4444' : '#FF5722',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 8px rgba(255, 87, 34, 0.4)',
                }}
              >
                {stop.type === 'FUEL' && <Fuel size={9} color="#FFFFFF" />}
                {stop.type === 'REST' && <Moon size={9} color="#FFFFFF" />}
                {stop.type === 'PICKUP' && <MapPin size={9} color="#FFFFFF" />}
                {stop.type === 'DROPOFF' && <Flag size={9} color="#FFFFFF" />}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                    <span style={{ color: '#FF5722', marginRight: '6px' }}>#{idx + 2}</span>
                    {stop.name}
                  </div>
                  <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>{stop.location}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#FF5722' }} className="text-mono">
                    {stop.milesFromStart.toLocaleString()} mi
                  </div>
                  <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '1px' }} className="text-mono">
                    {stop.eta}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={onOpenDetails}
        className="spotter-btn-secondary"
        style={{ width: '100%', justifyContent: 'center', fontSize: '11.5px', padding: '8px' }}
      >
        <span>View All Stops</span>
        <ArrowRight size={13} color="#FF5722" />
      </button>
    </motion.div>
  );
};
