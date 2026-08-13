import React, { useState } from 'react';
import { ShieldCheck, Bell, Server, Check } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [notifications, setNotifications] = useState({
    tripReady: true,
    hosWarning: true,
    fuelReminder: true,
  });

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
          HOS & Dispatch System Settings
        </h2>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
          Configure Hours of Service rules, notification alerts, and map routing service infrastructure.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <div className="spotter-card" style={{ padding: '20px', background: '#0D0F17', borderColor: '#1E2536' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={16} color="#FF5722" /> HOS Rule Configuration
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #181D2A' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Driver Category</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>FMCSA 49 CFR Part 395</div>
              </div>
              <span style={{ fontWeight: 700, color: '#FF5722' }}>Property-Carrying</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #181D2A' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Duty Cycle Rule</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>70 hours in 8 consecutive days</div>
              </div>
              <span style={{ fontWeight: 700, color: '#10B981' }}>70h / 8-Day</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #181D2A' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Mandatory Rest Break</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>30m interruption after 8h driving</div>
              </div>
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>30 Minutes</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Adverse Driving Conditions</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>2-hour extension exemption</div>
              </div>
              <span style={{ fontWeight: 700, color: '#6B7280' }}>Disabled</span>
            </div>
          </div>
        </div>

        <div className="spotter-card" style={{ padding: '20px', background: '#0D0F17', borderColor: '#1E2536' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={16} color="#FF5722" /> Notification Preferences
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              onClick={() => toggleNotif('tripReady')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: '#121623',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Trip Ready Notification</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Alert when route optimization completes</div>
              </div>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: notifications.tripReady ? '#FF5722' : '#262F44',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {notifications.tripReady && <Check size={14} color="#FFFFFF" />}
              </div>
            </div>

            <div
              onClick={() => toggleNotif('hosWarning')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: '#121623',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>HOS Warning Alert</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Warn when approaching 11h driving limit</div>
              </div>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: notifications.hosWarning ? '#FF5722' : '#262F44',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {notifications.hosWarning && <Check size={14} color="#FFFFFF" />}
              </div>
            </div>

            <div
              onClick={() => toggleNotif('fuelReminder')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                backgroundColor: '#121623',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>Fuel Stop Reminder</div>
                <div style={{ fontSize: '11px', color: '#9CA3AF' }}>Remind driver 50 miles before fuel stop</div>
              </div>
              <div
                style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '4px',
                  backgroundColor: notifications.fuelReminder ? '#FF5722' : '#262F44',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {notifications.fuelReminder && <Check size={14} color="#FFFFFF" />}
              </div>
            </div>
          </div>
        </div>

        <div className="spotter-card" style={{ padding: '20px', background: '#0D0F17', borderColor: '#1E2536' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Server size={16} color="#FF5722" /> Map & Routing Infrastructure
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #181D2A' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Map Tile Provider</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>OpenStreetMap / CartoDB Dark Matter</div>
              </div>
              <span style={{ fontWeight: 700, color: '#10B981' }}>Active</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '10px', borderBottom: '1px solid #181D2A' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Routing Engine API</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>Django REST Framework Endpoint</div>
              </div>
              <span style={{ fontWeight: 700, color: '#FF5722' }}>POST /api/trips/plan</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#FFFFFF' }}>Frontend Architecture</div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>React + TypeScript + React Router</div>
              </div>
              <span style={{ fontWeight: 700, color: '#FFFFFF' }}>Spotter TripOS v1.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
