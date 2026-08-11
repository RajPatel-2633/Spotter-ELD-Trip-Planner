import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  MapPin,
  FileText,
  Users,
  Fuel,
  BarChart3,
  Settings,
  Truck,
  Download,
  ExternalLink,
} from 'lucide-react';
import { CurrentTripVisual } from './CurrentTripVisual';

interface SidebarProps {
  startCycleUsed: number;
  projectedCycleUsed?: number;
  status?: 'PLANNING' | 'EN_ROUTE' | 'ARRIVED';
  origin?: string;
  destination?: string;
  distanceMiles?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  startCycleUsed,
  projectedCycleUsed,
  status = 'EN_ROUTE',
  origin = 'Chicago, IL',
  destination = 'Houston, TX',
  distanceMiles = 1240,
}) => {
  const activeCycle = projectedCycleUsed ?? startCycleUsed;
  const cyclePercent = Math.min(100, (activeCycle / 70) * 100);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Trip Planner', path: '/trip-planner', icon: MapPin },
    { label: 'ELD Logs', path: '/eld-logs', icon: FileText },
    { label: 'Drivers', path: '/drivers', icon: Users },
    { label: 'Fuel & Stops', path: '/fuel-stops', icon: Fuel },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <motion.aside
      initial={{ x: -40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      style={{
        width: '250px',
        backgroundColor: '#0C0E14',
        borderRight: '1px solid #1A1F2C',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        padding: '16px 14px',
        overflowY: 'auto',
      }}
    >
      {/* Brand Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', paddingLeft: '4px' }}>
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #FF5722 0%, #E64A19 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(255, 87, 34, 0.4)',
          }}
        >
          <Truck size={18} color="#FFFFFF" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '17px', fontWeight: 800, letterSpacing: '-0.5px', color: '#FFFFFF' }}>SPOTTER</span>
          </div>
          <span style={{ fontSize: '10px', fontWeight: 600, color: '#FF5722', letterSpacing: '1px', textTransform: 'uppercase' }}>
            TripOS
          </span>
        </div>
      </div>

      {/* NavLink Navigation Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '14px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '7px 10px',
                borderRadius: '6px',
                textDecoration: 'none',
                backgroundColor: isActive ? 'rgba(255, 87, 34, 0.12)' : 'transparent',
                color: isActive ? '#FF5722' : '#9CA3AF',
                borderLeft: isActive ? '3px solid #FF5722' : '3px solid transparent',
                fontWeight: isActive ? 600 : 400,
                fontSize: '12.5px',
                transition: 'all 0.15s ease',
              })}
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} color={isActive ? '#FF5722' : '#9CA3AF'} />
                  <span>{item.label}</span>
                  {item.label === 'Trip Planner' && (
                    <span
                      style={{
                        marginLeft: 'auto',
                        backgroundColor: '#1E2433',
                        color: '#FF5722',
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '2px 5px',
                        borderRadius: '4px',
                      }}
                    >
                      LIVE
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Driver Status Card */}
      <div
        className="spotter-card"
        style={{
          padding: '12px 14px',
          marginBottom: '10px',
          background: 'radial-gradient(circle at top left, #181D29 0%, #11141D 100%)',
          borderColor: '#1E2536',
        }}
      >
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.8px', marginBottom: '6px' }}>
          DRIVER STATUS
        </div>

        <div style={{ position: 'relative', width: '85px', height: '85px', margin: '0 auto 6px auto' }}>
          <svg width="85" height="85" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="42" stroke="#1F2636" strokeWidth="8" fill="none" />
            <circle
              cx="50"
              cy="50"
              r="42"
              stroke="#FF5722"
              strokeWidth="8"
              fill="none"
              strokeDasharray={2 * Math.PI * 42}
              strokeDashoffset={2 * Math.PI * 42 * (1 - cyclePercent / 100)}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: '15px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1 }}>
              {activeCycle.toFixed(2)}
            </span>
            <span style={{ fontSize: '9px', color: '#9CA3AF', marginTop: '1px' }}>/ 70 hrs</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', borderTop: '1px solid #1A2132', paddingTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9CA3AF' }}>Starting Cycle</span>
            <span style={{ fontWeight: 700, color: '#FFFFFF' }} className="text-mono">{startCycleUsed.toFixed(2)}h</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#9CA3AF' }}>After Trip</span>
            <span style={{ fontWeight: 700, color: projectedCycleUsed ? '#FF5722' : '#9CA3AF' }} className="text-mono">
              {projectedCycleUsed ? `${projectedCycleUsed.toFixed(2)}h` : '—'}
            </span>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 'auto' }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', letterSpacing: '0.8px', marginBottom: '4px' }}>
          QUICK ACTIONS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <button className="spotter-btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '5px 10px', fontSize: '11.5px' }}>
            <Download size={13} color="#9CA3AF" />
            <span>Export Logs</span>
          </button>
          <button className="spotter-btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', padding: '5px 10px', fontSize: '11.5px' }}>
            <ExternalLink size={13} color="#9CA3AF" />
            <span>View Reports</span>
          </button>
        </div>

        <CurrentTripVisual
          status={status}
          origin={origin}
          destination={destination}
          distanceMiles={distanceMiles}
        />
      </div>
    </motion.aside>
  );
};
