import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Fuel, Moon, Flag } from 'lucide-react';
import type { TripPlan } from '../../types/trip';

interface RouteDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: TripPlan;
}

export const RouteDetailsModal: React.FC<RouteDetailsModalProps> = ({ isOpen, onClose, plan }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(5, 6, 9, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            style={{
              backgroundColor: '#11141E',
              border: '1px solid #232B3C',
              borderRadius: '14px',
              padding: '24px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '85vh',
              overflowY: 'auto',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.8)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                  Route Details & Turn Breakdown
                </h3>
                <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                  {plan.currentLocation} → {plan.pickupLocation} → {plan.dropoffLocation}
                </span>
              </div>
              <button
                onClick={onClose}
                style={{
                  background: '#1A1F2C',
                  border: 'none',
                  color: '#9CA3AF',
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <X size={18} />
              </button>
            </div>

            <div
              style={{
                backgroundColor: '#161B28',
                border: '1px solid #222B3E',
                borderRadius: '10px',
                padding: '14px',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '12px',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Total Distance</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#FF5722' }} className="text-mono">
                  {plan.summary.totalDistanceMiles.toLocaleString()} mi
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Total Days</div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }} className="text-mono">
                  {plan.summary.totalTimeDays} Days
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Est. Arrival</div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#10B981' }}>
                  {plan.summary.estimatedArrival}
                </div>
              </div>
            </div>

            <div style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '12px' }}>
              SCHEDULED STOPS ITINERARY
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {plan.stops.map((stop) => (
                <div
                  key={stop.id}
                  style={{
                    backgroundColor: '#0D0F17',
                    border: '1px solid #1E2536',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        backgroundColor:
                          stop.type === 'START'
                            ? 'rgba(16, 185, 129, 0.15)'
                            : stop.type === 'DROPOFF'
                            ? 'rgba(239, 68, 68, 0.15)'
                            : 'rgba(255, 87, 34, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {stop.type === 'START' && <MapPin size={16} color="#10B981" />}
                      {stop.type === 'FUEL' && <Fuel size={16} color="#FF5722" />}
                      {stop.type === 'REST' && <Moon size={16} color="#FFB300" />}
                      {stop.type === 'PICKUP' && <MapPin size={16} color="#FF5722" />}
                      {stop.type === 'DROPOFF' && <Flag size={16} color="#EF4444" />}
                    </div>

                    <div>
                      <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF' }}>{stop.name}</div>
                      <div style={{ fontSize: '11.5px', color: '#9CA3AF' }}>{stop.location}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#FF5722' }} className="text-mono">
                      {stop.milesFromStart.toLocaleString()} mi
                    </div>
                    <div style={{ fontSize: '11px', color: '#6B7280' }} className="text-mono">
                      ETA: {stop.eta}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
