import React, { useEffect, useRef, useState } from 'react';
import type { DailyLog, DutyStatus } from '../../types/trip';
import { animateELDBlocks } from '../../animations/eldAnimation';
import { Moon, Truck, ShieldAlert, Coffee } from 'lucide-react';

interface ELDGridProps {
  dailyLog: DailyLog;
}

export const ELDGrid: React.FC<ELDGridProps> = ({ dailyLog }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoverMinute, setHoverMinute] = useState<number | null>(720);

  useEffect(() => {
    if (containerRef.current) {
      animateELDBlocks(containerRef.current);
    }
  }, [dailyLog]);

  const hours = [
    '12 AM',
    '2 AM',
    '4 AM',
    '6 AM',
    '8 AM',
    '10 AM',
    '12 PM',
    '2 PM',
    '4 PM',
    '6 PM',
    '8 PM',
    '10 PM',
    '12 AM',
  ];

  const rows: { status: DutyStatus; label: string; icon: any; color: string }[] = [
    { status: 'OFF_DUTY', label: 'OFF DUTY', icon: Coffee, color: '#4B5563' },
    { status: 'SLEEPER_BERTH', label: 'SLEEPER BERTH', icon: Moon, color: '#3B82F6' },
    { status: 'DRIVING', label: 'DRIVING', icon: Truck, color: '#FF5722' },
    { status: 'ON_DUTY', label: 'ON DUTY (NOT DRIVING)', icon: ShieldAlert, color: '#F59E0B' },
  ];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const minutes = Math.max(0, Math.min(1440, Math.round((x / rect.width) * 1440)));
    setHoverMinute(minutes);
  };

  const handleMouseLeave = () => {
    setHoverMinute(720);
  };

  const formatScrubberTime = (mins: number) => {
    const h = Math.floor(mins / 60) % 24;
    const m = Math.floor(mins % 60);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayH = h % 12 === 0 ? 12 : h % 12;
    return `${displayH}:${m.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <div
      ref={containerRef}
      style={{
        backgroundColor: '#0D0F16',
        border: '1px solid #1C2232',
        borderRadius: '10px',
        padding: '16px 16px 12px 16px',
        position: 'relative',
        userSelect: 'none',
        overflowX: 'auto',
      }}
    >
      <div style={{ minWidth: '700px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', marginBottom: '10px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280' }}>DUTY STATUS</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingRight: '4px' }}>
            {hours.map((h, i) => (
              <div key={i} style={{ fontSize: '10px', fontWeight: 600, color: '#9CA3AF', width: '0', textAlign: 'center' }}>
                <span style={{ transform: 'translateX(-50%)', display: 'inline-block' }}>{h}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px' }}
        >
          {hoverMinute !== null && (
            <div
              style={{
                position: 'absolute',
                left: `calc(160px + (100% - 160px) * ${hoverMinute / 1440})`,
                top: '-20px',
                bottom: 0,
                width: '1px',
                backgroundColor: '#FF5722',
                zIndex: 25,
                pointerEvents: 'none',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: '-22px',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#FF5722',
                  color: '#FFFFFF',
                  fontSize: '10px',
                  fontWeight: 800,
                  padding: '2px 6px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                }}
              >
                {formatScrubberTime(hoverMinute)}
              </div>
            </div>
          )}

          {rows.map((row) => {
            const Icon = row.icon;
            const rowIntervals = dailyLog.intervals.filter((inv) => inv.status === row.status);

            return (
              <div
                key={row.status}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '160px 1fr',
                  alignItems: 'center',
                  height: '36px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingRight: '12px' }}>
                  <Icon size={14} color={row.color} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#D1D5DB' }}>{row.label}</span>
                </div>

                <div
                  style={{
                    position: 'relative',
                    height: '100%',
                    backgroundColor: '#121622',
                    border: '1px solid #1F2638',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  {Array.from({ length: 24 }).map((_, hourIdx) => (
                    <div
                      key={hourIdx}
                      style={{
                        position: 'absolute',
                        left: `${(hourIdx / 24) * 100}%`,
                        top: 0,
                        bottom: 0,
                        width: '1px',
                        backgroundColor: hourIdx % 2 === 0 ? '#262F44' : '#192030',
                      }}
                    />
                  ))}

                  {rowIntervals.map((inv) => {
                    const startMin = inv.startMinute ?? inv.startMinutes ?? 0;
                    const leftPct = (startMin / 1440) * 100;
                    const widthPct = (inv.durationMinutes / 1440) * 100;

                    return (
                      <div
                        key={inv.id}
                        className="eld-block"
                        title={`${inv.status}: ${inv.startTime} - ${inv.endTime} (${inv.durationMinutes} mins) - ${inv.note || ''}`}
                        style={{
                          position: 'absolute',
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          top: '4px',
                          bottom: '4px',
                          backgroundColor: row.color,
                          borderRadius: '3px',
                          boxShadow: `0 0 10px ${row.color}40`,
                          cursor: 'pointer',
                          transition: 'opacity 0.2s ease',
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
