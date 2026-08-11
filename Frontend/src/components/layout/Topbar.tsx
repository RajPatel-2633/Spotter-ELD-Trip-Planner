import React from 'react';
import { useLocation } from 'react-router-dom';
import { ShieldCheck, Bell, Clock } from 'lucide-react';
import { useTripContext } from '../../context/TripContext';

interface TopbarProps {
  startCycleUsed: number;
  projectedCycleUsed?: number;
}

export const Topbar: React.FC<TopbarProps> = ({ startCycleUsed, projectedCycleUsed }) => {
  const location = useLocation();
  const { selectedDriver } = useTripContext();

  const getPageTitles = () => {
    switch (location.pathname) {
      case '/trip-planner':
        return {
          title: 'Trip Route Planner & Dispatch Workspace',
          subtitle: 'Plan smarter. Drive safer. Stay compliant.',
        };
      case '/eld-logs':
        return {
          title: "Driver's Daily Log / RODS (Record of Duty Status)",
          subtitle: 'Official 24-hour daily log sheets (49 CFR Part 395).',
        };
      case '/fuel-stops':
        return {
          title: 'Fuel & Operational Stops Itinerary',
          subtitle: 'Mandatory fueling, rest breaks, and loading operations.',
        };
      case '/drivers':
        return {
          title: 'Driver Profile & Compliance Dashboard',
          subtitle: 'Driver assignment, vehicle equipment, and HOS cycle status.',
        };
      case '/reports':
        return {
          title: 'Operational Analytics & Trip History Reports',
          subtitle: 'Historical mileage, driving efficiency, and compliance logs.',
        };
      case '/settings':
        return {
          title: 'HOS & Dispatch System Settings',
          subtitle: 'Configure Hours of Service rules and routing infrastructure.',
        };
      default:
        return {
          title: 'Trip Planner & ELD Log System',
          subtitle: 'Plan smarter. Drive safer. Stay compliant.',
        };
    }
  };

  const { title, subtitle } = getPageTitles();
  const initials = selectedDriver.name
    .split(' ')
    .map((n) => n[0])
    .join('');

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 24px',
        backgroundColor: '#090A0D',
        borderBottom: '1px solid #1A1F2C',
        position: 'sticky',
        top: 0,
        zIndex: 30,
      }}
    >
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.4px', margin: 0 }}>
          {title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
          <span style={{ fontSize: '13px', color: '#9CA3AF' }}>{subtitle}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#0F1813',
            border: '1px solid #1B382B',
            padding: '6px 12px',
            borderRadius: '8px',
          }}
        >
          <ShieldCheck size={16} color="#10B981" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '9px', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>
              HOS Compliance
            </span>
            <span style={{ fontSize: '12px', color: '#10B981', fontWeight: 700 }}>Compliant (70hr/8day)</span>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#12151F',
            border: '1px solid #1E2433',
            padding: '6px 14px',
            borderRadius: '8px',
          }}
        >
          <Clock size={16} color="#FF5722" />
          <div>
            <div style={{ fontSize: '9px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600 }}>
              {projectedCycleUsed ? 'PROJECTED CYCLE' : 'STARTING CYCLE'}
            </div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: projectedCycleUsed ? '#FF5722' : '#FFFFFF' }}>
              {(projectedCycleUsed ?? startCycleUsed).toFixed(2)} <span style={{ fontSize: '11px', color: '#6B7280' }}>/ 70 hrs</span>
            </div>
          </div>
        </div>

        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '8px',
            backgroundColor: '#12151F',
            border: '1px solid #1E2433',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            cursor: 'pointer',
          }}
        >
          <Bell size={18} color="#9CA3AF" />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#FF5722',
            }}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#12151F',
            border: '1px solid #1E2433',
            padding: '6px 12px 6px 6px',
            borderRadius: '8px',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#FF5722',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#FFFFFF' }}>{selectedDriver.name}</div>
            <div style={{ fontSize: '10px', color: '#6B7280' }}>Driver ID: {selectedDriver.driverId}</div>
          </div>
        </div>
      </div>
    </header>
  );
};
