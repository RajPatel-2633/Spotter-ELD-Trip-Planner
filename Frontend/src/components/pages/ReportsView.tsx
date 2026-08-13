import React, { useEffect, useState } from 'react';
import { fetchTripHistory } from '../../services/tripService';
import type { TripPlan } from '../../types/trip';
import { useTripContext } from '../../context/TripContext';
import { CheckCircle2, MapPin, Fuel, Calendar, ShieldCheck, Database, AlertTriangle } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { selectedDriver } = useTripContext();
  const [atlasHistory, setAtlasHistory] = useState<TripPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchTripHistory()
      .then((data) => {
        setAtlasHistory(data);
      })
      .catch((err) => {
        setError(err.message || 'Trip history is temporarily unavailable');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalTrips = atlasHistory.length;
  const totalMiles = atlasHistory.reduce((acc, t) => acc + (t.summary?.totalDistanceMiles || 0), 0);
  const totalFuelStops = atlasHistory.reduce(
    (acc, t) => acc + (t.stops?.filter((s) => s.type === 'FUEL').length || 0),
    0
  );

  const avgDriveHours =
    atlasHistory.length > 0
      ? (atlasHistory.reduce((acc, t) => acc + (t.summary?.driveTimeMinutes || 0), 0) / atlasHistory.length / 60).toFixed(1)
      : '0.0';

  const compliantCount = atlasHistory.filter((t) => t.hos?.isCompliant ?? true).length;
  const compliancePercentage =
    atlasHistory.length > 0 ? ((compliantCount / atlasHistory.length) * 100).toFixed(1) : '100.0';

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
          Operational Analytics & Trip History Reports
        </h2>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
          Live historical mileage, driver activity, fuel stop compliance, and saved trip logs.
        </p>
      </div>

      {error && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <AlertTriangle size={20} color="#EF4444" />
          <div>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#EF4444' }}>
              History Service Unavailable
            </div>
            <div style={{ fontSize: '12px', color: '#D1D5DB', marginTop: '2px' }}>{error}</div>
          </div>
        </div>
      )}

      {/* Reports Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        <div className="spotter-card" style={{ padding: '16px', background: '#0F121C', borderColor: '#1E2536' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>TRIPS COMPLETED</span>
            <CheckCircle2 size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }} className="text-mono">
            {error ? '—' : totalTrips}
          </div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>Calculated from stored history</div>
        </div>

        <div className="spotter-card" style={{ padding: '16px', background: '#0F121C', borderColor: '#1E2536' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>MILES DRIVEN</span>
            <MapPin size={16} color="#FF5722" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#FF5722' }} className="text-mono">
            {error ? '—' : `${totalMiles.toLocaleString()} mi`}
          </div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>Calculated from stored history</div>
        </div>

        <div className="spotter-card" style={{ padding: '16px', background: '#0F121C', borderColor: '#1E2536' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>FUEL STOPS</span>
            <Fuel size={16} color="#FF5722" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }} className="text-mono">
            {error ? '—' : totalFuelStops}
          </div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>Calculated from stored history</div>
        </div>

        <div className="spotter-card" style={{ padding: '16px', background: '#0F121C', borderColor: '#1E2536' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>AVG DURATION</span>
            <Calendar size={16} color="#FFB300" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#FFFFFF' }} className="text-mono">
            {error ? '—' : `${avgDriveHours} hrs`}
          </div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>Calculated from stored history</div>
        </div>

        <div className="spotter-card" style={{ padding: '16px', background: '#0F121C', borderColor: '#1E2536' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>HOS COMPLIANCE</span>
            <ShieldCheck size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#10B981' }} className="text-mono">
            {error ? '—' : `${compliancePercentage}%`}
          </div>
          <div style={{ fontSize: '10px', color: '#6B7280', marginTop: '4px' }}>Calculated from stored history</div>
        </div>
      </div>

      {/* MongoDB Atlas Saved Trip History Table */}
      <div className="spotter-card" style={{ padding: '20px', background: '#0D0F17', borderColor: '#1E2536' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Recent Saved Trip Logs (MongoDB Atlas Live Sync)
          </h3>
          <span style={{ fontSize: '11px', color: error ? '#EF4444' : '#10B981', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={13} />
            <span>{error ? 'Database Offline' : 'MongoDB Atlas Connected'}</span>
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1F2638', color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px' }}>Trip ID</th>
                <th style={{ padding: '10px 12px' }}>Route</th>
                <th style={{ padding: '10px 12px' }}>Distance</th>
                <th style={{ padding: '10px 12px' }}>Drive Time</th>
                <th style={{ padding: '10px 12px' }}>Driver</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF' }}>
                    Loading trip history...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#EF4444' }}>
                    Trip history is temporarily unavailable.
                  </td>
                </tr>
              ) : atlasHistory.length > 0 ? (
                atlasHistory.map((trip) => (
                  <tr key={trip.id} style={{ borderBottom: '1px solid #161A26', color: '#D1D5DB' }}>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#FF5722' }} className="text-mono">
                      {trip.id}
                    </td>
                    <td style={{ padding: '12px', fontWeight: 700, color: '#FFFFFF' }}>
                      {trip.currentLocation} → {trip.dropoffLocation}
                    </td>
                    <td style={{ padding: '12px' }} className="text-mono">
                      {trip.summary?.totalDistanceMiles?.toLocaleString() || 0} mi
                    </td>
                    <td style={{ padding: '12px' }} className="text-mono">
                      {Math.floor((trip.summary?.driveTimeMinutes || 0) / 60)}h{' '}
                      {(trip.summary?.driveTimeMinutes || 0) % 60}m
                    </td>
                    <td style={{ padding: '12px' }}>
                      {trip.driverName || selectedDriver.name}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(16, 185, 129, 0.15)',
                          color: '#10B981',
                          border: '1px solid rgba(16, 185, 129, 0.3)',
                        }}
                      >
                        COMPLIANT
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF' }}>
                    No stored trip plans found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
