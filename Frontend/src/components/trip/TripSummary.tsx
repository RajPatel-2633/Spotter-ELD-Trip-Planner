import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, MapPin, Fuel, ShieldCheck, CheckCircle } from 'lucide-react';
import type { TripPlan } from '../../types/trip';

interface TripSummaryProps {
  plan: TripPlan;
}

export const TripSummary: React.FC<TripSummaryProps> = ({ plan }) => {
  const { summary, stops } = plan;

  const totalStopsCount = stops.length;
  const fuelStopsCount = stops.filter((s) => s.type === 'FUEL').length;

  const driveMins = summary.driveTimeMinutes || 0;
  const onDutyMins = summary.onDutyTimeMinutes || summary.driveTimeMinutes || 0;
  const totalMins = summary.totalTripMinutes || summary.driveTimeMinutes || 0;

  const driveHoursStr = `${Math.floor(driveMins / 60)}h ${(driveMins % 60).toString().padStart(2, '0')}m`;
  const onDutyHoursStr = `${Math.floor(onDutyMins / 60)}h ${(onDutyMins % 60).toString().padStart(2, '0')}m`;

  const totalDays = Math.max(1, Math.ceil(totalMins / 1440));
  const totalDaysStr = `${totalDays} Day${totalDays > 1 ? 's' : ''}`;

  const rows = [
    { label: 'Drive Time', value: driveHoursStr, icon: Clock },
    { label: 'On Duty Time', value: onDutyHoursStr, icon: ShieldCheck },
    { label: 'Total Time', value: totalDaysStr, icon: Calendar },
    { label: 'Total Distance', value: `${(summary.totalDistanceMiles || 0).toLocaleString()} mi`, icon: MapPin },
    { label: 'Total Stops', value: `${totalStopsCount}`, icon: CheckCircle },
    { label: 'Fuel Stops', value: `${fuelStopsCount} (Every ~1,000 mi)`, icon: Fuel },
    { label: 'Pickup Time', value: '+1h 00m (Loading)', icon: Clock },
    { label: 'Dropoff Time', value: '+1h 00m (Unloading)', icon: Clock },
  ];

  return (
    <motion.div
      initial={{ x: 20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="spotter-card"
      style={{
        padding: '18px',
        marginBottom: '16px',
        background: '#0F121C',
        borderColor: '#1E2536',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>Trip Summary</h3>
        <span style={{ fontSize: '11px', color: '#FF5722', fontWeight: 600 }}>Active Calculation</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', marginBottom: '16px' }}>
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '6px',
                borderBottom: '1px solid #181D2A',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#9CA3AF' }}>
                <Icon size={14} color="#6B7280" />
                <span>{r.label}</span>
              </div>
              <span style={{ fontWeight: 700, color: '#FFFFFF' }} className="text-mono">
                {r.value}
              </span>
            </div>
          );
        })}
      </div>

      <div
        style={{
          borderRadius: '8px',
          background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.12) 0%, rgba(15, 18, 28, 0.9) 100%)',
          border: '1px solid rgba(255, 87, 34, 0.3)',
          padding: '12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#9CA3AF' }}>Est. Arrival</span>
        <span style={{ fontSize: '13px', fontWeight: 800, color: '#FF5722' }}>{summary.estimatedArrival}</span>
      </div>
    </motion.div>
  );
};
