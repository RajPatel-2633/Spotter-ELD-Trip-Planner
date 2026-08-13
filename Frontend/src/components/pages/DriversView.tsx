import React from 'react';
import { useTripContext } from '../../context/TripContext';
import { ShieldCheck, Clock, Truck, UserCheck } from 'lucide-react';

export const DriversView: React.FC = () => {
  const { currentPlan, drivers, selectedDriver, setSelectedDriverId } = useTripContext();

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
          Driver Profile & Fleet Compliance Dashboard
        </h2>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
          Driver assignment, vehicle equipment, active HOS cycle status, and safety compliance records.
        </p>
      </div>

      {/* Active Assigned Driver Banner Card */}
      <div
        className="spotter-card"
        style={{
          padding: '24px',
          marginBottom: '24px',
          background: 'linear-gradient(180deg, #131724 0%, #0E1119 100%)',
          borderColor: '#1F263A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              backgroundColor: '#FF5722',
              color: '#FFFFFF',
              fontSize: '20px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 14px rgba(255, 87, 34, 0.4)',
            }}
          >
            {selectedDriver.name
              .split(' ')
              .map((n) => n[0])
              .join('')}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>{selectedDriver.name}</h2>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(255, 87, 34, 0.18)',
                  color: '#FF5722',
                  border: '1px solid rgba(255, 87, 34, 0.3)',
                }}
              >
                {selectedDriver.status}
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '2px' }}>
              Driver ID: {selectedDriver.driverId} • {selectedDriver.carrierName} • Home: {selectedDriver.homeTerminal}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              backgroundColor: '#0F1712',
              border: '1px solid #1B382B',
              padding: '10px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <ShieldCheck size={20} color="#10B981" />
            <div>
              <div style={{ fontSize: '10px', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>
                SAFETY COMPLIANCE
              </div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#10B981' }}>{selectedDriver.complianceStatus}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Driver HOS Cycle & Vehicle Details Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        <div className="spotter-card" style={{ padding: '20px', background: '#0D0F17', borderColor: '#1E2536' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={16} color="#FF5722" /> Active HOS Cycle Capacity
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #181D2A' }}>
              <span style={{ color: '#9CA3AF' }}>70h / 8-Day Cycle Used</span>
              <span style={{ fontWeight: 800, color: '#FFFFFF' }} className="text-mono">
                {currentPlan ? `${currentPlan.hos.cycleUsedHours.toFixed(2)} / 70.0 hrs` : `${selectedDriver.cycleUsedHours.toFixed(2)} / 70.0 hrs`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #181D2A' }}>
              <span style={{ color: '#9CA3AF' }}>Cycle Capacity Remaining</span>
              <span style={{ fontWeight: 800, color: '#FFB300' }} className="text-mono">
                {currentPlan ? `${currentPlan.hos.cycleRemainingHours.toFixed(2)} hrs` : `${(70 - selectedDriver.cycleUsedHours).toFixed(2)} hrs`}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #181D2A' }}>
              <span style={{ color: '#9CA3AF' }}>Projected Post-Trip Cycle</span>
              <span style={{ fontWeight: 800, color: '#FF5722' }} className="text-mono">
                {currentPlan ? `${currentPlan.hos.projectedCycleHours.toFixed(2)} / 70.0 hrs` : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #181D2A' }}>
              <span style={{ color: '#9CA3AF' }}>14-Hour Driving Window</span>
              <span style={{ fontWeight: 800, color: '#FFFFFF' }}>14 Max</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9CA3AF' }}>11-Hour Driving Limit</span>
              <span style={{ fontWeight: 800, color: '#FFFFFF' }}>11 Max</span>
            </div>
          </div>
        </div>

        <div className="spotter-card" style={{ padding: '20px', background: '#0D0F17', borderColor: '#1E2536' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={16} color="#FF5722" /> Active Vehicle & Assigned Trip
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #181D2A' }}>
              <span style={{ color: '#9CA3AF' }}>Assigned Tractor</span>
              <span style={{ fontWeight: 800, color: '#FFFFFF' }}>{selectedDriver.truckNo}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #181D2A' }}>
              <span style={{ color: '#9CA3AF' }}>Assigned Trailer</span>
              <span style={{ fontWeight: 800, color: '#FFFFFF' }}>{selectedDriver.trailerNo}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #181D2A' }}>
              <span style={{ color: '#9CA3AF' }}>Current Active Route</span>
              <span style={{ fontWeight: 800, color: '#FF5722' }}>
                {currentPlan ? `${currentPlan.currentLocation} → ${currentPlan.dropoffLocation}` : 'No Active Plan'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid #181D2A' }}>
              <span style={{ color: '#9CA3AF' }}>Total Route Distance</span>
              <span style={{ fontWeight: 800, color: '#FFFFFF' }} className="text-mono">
                {currentPlan ? `${(currentPlan.summary.totalDistanceMiles || 0).toLocaleString()} mi` : '—'}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: '#9CA3AF' }}>Estimated Arrival</span>
              <span style={{ fontWeight: 800, color: '#10B981' }}>{currentPlan ? currentPlan.summary.estimatedArrival : '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Driver Roster Table */}
      <div className="spotter-card" style={{ padding: '20px', background: '#0D0F17', borderColor: '#1E2536' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserCheck size={16} color="#10B981" /> Spotter Fleet Driver Directory
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1F2638', color: '#6B7280', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px' }}>Driver Name</th>
                <th style={{ padding: '10px 12px' }}>Driver ID</th>
                <th style={{ padding: '10px 12px' }}>Tractor</th>
                <th style={{ padding: '10px 12px' }}>Home Terminal</th>
                <th style={{ padding: '10px 12px' }}>Cycle Used</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((drv) => (
                <tr key={drv.id} style={{ borderBottom: '1px solid #161A26', color: '#D1D5DB' }}>
                  <td style={{ padding: '12px', fontWeight: 700, color: '#FFFFFF' }}>{drv.name}</td>
                  <td style={{ padding: '12px', color: '#FF5722' }} className="text-mono">
                    {drv.driverId}
                  </td>
                  <td style={{ padding: '12px' }}>{drv.truckNo}</td>
                  <td style={{ padding: '12px' }}>{drv.homeTerminal}</td>
                  <td style={{ padding: '12px' }} className="text-mono">
                    {drv.cycleUsedHours} / 70.0 hrs
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        backgroundColor: drv.id === selectedDriver.id ? 'rgba(255, 87, 34, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: drv.id === selectedDriver.id ? '#FF5722' : '#10B981',
                        border: `1px solid ${drv.id === selectedDriver.id ? 'rgba(255, 87, 34, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                      }}
                    >
                      {drv.id === selectedDriver.id ? 'ASSIGNED ACTIVE' : 'AVAILABLE'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {drv.id !== selectedDriver.id && (
                      <button
                        onClick={() => setSelectedDriverId(drv.id)}
                        className="spotter-btn-secondary"
                        style={{ fontSize: '11px', padding: '4px 10px' }}
                      >
                        Assign Driver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
