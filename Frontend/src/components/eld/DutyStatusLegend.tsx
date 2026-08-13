import React from 'react';

export const DutyStatusLegend: React.FC = () => {
  const statuses = [
    { label: 'Off Duty', color: '#4B5563' },
    { label: 'Sleeper Berth', color: '#3B82F6' },
    { label: 'Driving', color: '#FF5722' },
    { label: 'On Duty (Not Driving)', color: '#F59E0B' },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
      {statuses.map((s) => (
        <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: s.color,
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '11.5px', color: '#9CA3AF', fontWeight: 500 }}>{s.label}</span>
        </div>
      ))}
    </div>
  );
};
