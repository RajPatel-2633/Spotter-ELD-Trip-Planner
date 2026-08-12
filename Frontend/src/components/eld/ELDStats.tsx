import React from 'react';
import type { DailyLog } from '../../types/trip';

interface ELDStatsProps {
  totals: DailyLog['totals'];
}

export const ELDStats: React.FC<ELDStatsProps> = ({ totals }) => {
  const formatHours = (hoursVal: number | undefined, minsVal?: number) => {
    if (hoursVal !== undefined && !isNaN(hoursVal)) {
      const totalMinutes = Math.round(hoursVal * 60);
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${h}h ${m.toString().padStart(2, '0')}m`;
    }
    if (minsVal !== undefined && !isNaN(minsVal)) {
      const h = Math.floor(minsVal / 60);
      const m = minsVal % 60;
      return `${h}h ${m.toString().padStart(2, '0')}m`;
    }
    return '0h 00m';
  };

  const cards = [
    { label: 'Off Duty', val: formatHours(totals.offDutyHours, totals.offDutyMinutes), color: '#4B5563' },
    { label: 'Sleeper Berth', val: formatHours(totals.sleeperBerthHours, totals.sleeperBerthMinutes), color: '#3B82F6' },
    { label: 'Driving', val: formatHours(totals.drivingHours, totals.drivingMinutes), color: '#FF5722' },
    { label: 'On Duty', val: formatHours(totals.onDutyHours, totals.onDutyMinutes), color: '#F59E0B' },
    { label: 'Total Hours', val: formatHours(totals.totalHours ?? 24.0), color: '#10B981' },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '12px',
        marginTop: '16px',
      }}
    >
      {cards.map((c) => (
        <div
          key={c.label}
          style={{
            backgroundColor: '#0F121C',
            border: '1px solid #1E2536',
            borderRadius: '8px',
            padding: '12px 14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: c.color }} />
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontWeight: 600 }}>{c.label}</span>
          </div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }} className="text-mono">
            {c.val}
          </div>
        </div>
      ))}
    </div>
  );
};
