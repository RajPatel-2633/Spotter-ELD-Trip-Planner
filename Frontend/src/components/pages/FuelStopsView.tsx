import React from 'react';
import { useTripContext } from '../../context/TripContext';
import { RouteMap } from '../trip/RouteMap';
import { Fuel, Moon, MapPin, Flag, Clock } from 'lucide-react';

export const FuelStopsView: React.FC = () => {
  const { currentPlan, status } = useTripContext();

  if (!currentPlan) {
    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Fuel & Operational Stops Itinerary
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
            Mandatory fueling stops (every ~1,000 mi), 30-min rest breaks (after 8h cumulative driving), and load operations.
          </p>
        </div>

        <div
          className="spotter-card"
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            background: '#0D0F17',
            borderColor: '#1E2536',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
            No Active Trip Plan
          </div>
          <div style={{ fontSize: '13px', color: '#9CA3AF', maxWidth: '540px', margin: '0 auto' }}>
            Plan a trip to generate automated fuel stops and rest break itineraries based on your route geometry.
          </div>
        </div>
      </div>
    );
  }

  const { stops } = currentPlan;
  const totalStopsCount = stops.length;
  const fuelStopsCount = stops.filter((s) => s.type === 'FUEL').length;
  const restStopsCount = stops.filter((s) => s.type === 'REST').length;
  const pickupStopsCount = stops.filter((s) => s.type === 'PICKUP').length;
  const dropoffStopsCount = stops.filter((s) => s.type === 'DROPOFF').length;

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
          Fuel & Operational Stops Itinerary
        </h2>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
          Mandatory fueling stops (every ~1,000 mi), 30-min rest breaks (after 8h cumulative driving), and load operations.
        </p>
      </div>

      {/* Summary Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div className="spotter-card" style={{ padding: '14px', background: '#0F121C', borderColor: '#1E2536' }}>
          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>TOTAL STOPS</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }} className="text-mono">
            {totalStopsCount}
          </div>
        </div>

        <div className="spotter-card" style={{ padding: '14px', background: '#0F121C', borderColor: '#1E2536' }}>
          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>FUEL STOPS</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#FF5722' }} className="text-mono">
            {fuelStopsCount}
          </div>
        </div>

        <div className="spotter-card" style={{ padding: '14px', background: '#0F121C', borderColor: '#1E2536' }}>
          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>REST BREAKS</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFB300' }} className="text-mono">
            {restStopsCount}
          </div>
        </div>

        <div className="spotter-card" style={{ padding: '14px', background: '#0F121C', borderColor: '#1E2536' }}>
          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>PICKUP STOPS</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF' }} className="text-mono">
            {pickupStopsCount}
          </div>
        </div>

        <div className="spotter-card" style={{ padding: '14px', background: '#0F121C', borderColor: '#1E2536' }}>
          <div style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>DROPOFF STOPS</div>
          <div style={{ fontSize: '20px', fontWeight: 800, color: '#EF4444' }} className="text-mono">
            {dropoffStopsCount}
          </div>
        </div>
      </div>

      {/* Main Grid: Itemized Cards + Leaflet Map */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 480px',
          gap: '24px',
          alignItems: 'start',
        }}
      >
        {/* Itemized Stop Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {stops.map((stop, idx) => (
            <div
              key={stop.id}
              className="spotter-card"
              style={{
                padding: '16px 20px',
                background: '#0D0F17',
                borderColor: '#1E2536',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
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
                  {stop.type === 'START' && <MapPin size={18} color="#10B981" />}
                  {stop.type === 'FUEL' && <Fuel size={18} color="#FF5722" />}
                  {stop.type === 'REST' && <Moon size={18} color="#FFB300" />}
                  {stop.type === 'PICKUP' && <MapPin size={18} color="#FF5722" />}
                  {stop.type === 'DROPOFF' && <Flag size={18} color="#EF4444" />}
                </div>

                <div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF' }}>
                    <span style={{ color: '#FF5722', marginRight: '6px' }}>#{idx + 1}</span>
                    {stop.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                    {stop.location}
                    {stop.type === 'FUEL' && (
                      <span style={{ fontSize: '11px', color: '#FF5722', fontStyle: 'italic', marginLeft: '8px' }}>
                        • Mandatory Fueling (Scheduled every ~1,000 mi / route HOS timing)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#FF5722' }} className="text-mono">
                  {stop.milesFromStart.toLocaleString()} mi
                </div>
                <div style={{ fontSize: '11.5px', color: '#6B7280', marginTop: '2px' }} className="text-mono">
                  <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  ETA: {stop.eta} ({stop.durationMinutes}m duration)
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Map Visualization Column */}
        <div>
          <RouteMap plan={currentPlan} isPlanning={status === 'planning'} />
        </div>
      </div>
    </div>
  );
};
