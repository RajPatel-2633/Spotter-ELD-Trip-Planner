import React from 'react';
import { motion } from 'framer-motion';
import { Clock, ShieldAlert, Coffee, RotateCcw, ScrollText, TrendingUp } from 'lucide-react';
import type { HOSStatusData } from '../../types/trip';

interface HOSStatusProps {
  hos: HOSStatusData;
}

export const HOSStatus: React.FC<HOSStatusProps> = ({ hos }) => {
  const cycleLimit = hos.cycleLimitHours ?? 70;
  const drivingWindow = hos.drivingWindowHours ?? 14;
  const drivingLimit = hos.drivingLimitHours ?? 11;
  const cycleRemaining = hos.cycleRemainingHours ?? Math.max(0, cycleLimit - hos.cycleUsedHours);
  const projectedRemaining = Math.max(0, cycleLimit - hos.projectedCycleHours);

  const items = [
    {
      label: 'Driving Window',
      value: `${drivingWindow}h`,
      subtitle: '14-Hour Max',
      icon: Clock,
      color: '#FF5722',
    },
    {
      label: 'Driving Limit',
      value: `${drivingLimit}h`,
      subtitle: '11-Hour Max',
      icon: ShieldAlert,
      color: '#FF5722',
    },
    {
      label: 'Rest Break',
      value: '30m',
      subtitle: 'After 8h cumulative',
      icon: Coffee,
      color: '#FFB300',
    },
    {
      label: 'Starting Cycle',
      value: `${hos.cycleUsedHours.toFixed(2)} / ${cycleLimit}h`,
      subtitle: `Remaining: ${cycleRemaining.toFixed(2)}h`,
      icon: Clock,
      color: '#10B981',
    },
    {
      label: 'Projected After Trip',
      value: `${hos.projectedCycleHours.toFixed(2)} / ${cycleLimit}h`,
      subtitle: `Projected Rem: ${projectedRemaining.toFixed(2)}h`,
      icon: TrendingUp,
      color: '#FF5722',
    },
    {
      label: '34h Restart',
      value: hos.restartAvailable ? 'Available' : 'Not Required',
      subtitle: hos.restartAvailable ? 'Cycle Reset Ready' : 'Within Limits',
      icon: RotateCcw,
      color: '#3B82F6',
    },
    {
      label: 'Rules',
      value: 'Property',
      subtitle: 'No Adverse Cond.',
      icon: ScrollText,
      color: '#9CA3AF',
    },
  ];

  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="spotter-card"
      style={{
        padding: '12px 16px',
        marginBottom: '20px',
        background: '#0F121B',
        borderColor: '#1E2536',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(125px, 1fr))',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        {items.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 6px',
                borderRight: idx < items.length - 1 ? '1px solid #1E2536' : 'none',
              }}
            >
              <div
                style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  backgroundColor: `${item.color}1A`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={15} color={item.color} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1.1 }} className="text-mono">
                  {item.value}
                </div>
                <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#D1D5DB', marginTop: '2px', whiteSpace: 'nowrap' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '9px', color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.subtitle}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
