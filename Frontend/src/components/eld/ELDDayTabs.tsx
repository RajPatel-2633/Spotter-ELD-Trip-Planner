import React from 'react';
import { motion } from 'framer-motion';

interface ELDDayTabsProps {
  daysCount: number;
  activeDayIndex: number;
  onSelectDay: (index: number) => void;
}

export const ELDDayTabs: React.FC<ELDDayTabsProps> = ({ daysCount, activeDayIndex, onSelectDay }) => {
  const daysArray = Array.from({ length: daysCount }, (_, i) => i);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#131722', padding: '4px', borderRadius: '8px' }}>
      {daysArray.map((dayIdx) => {
        const isActive = dayIdx === activeDayIndex;
        return (
          <button
            key={dayIdx}
            onClick={() => onSelectDay(dayIdx)}
            style={{
              position: 'relative',
              background: 'transparent',
              border: 'none',
              color: isActive ? '#FFFFFF' : '#9CA3AF',
              padding: '6px 16px',
              fontSize: '12.5px',
              fontWeight: isActive ? 700 : 500,
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'color 0.2s ease',
            }}
          >
            {isActive && (
              <motion.div
                layoutId="activeDayTab"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: '#FF5722',
                  borderRadius: '6px',
                  boxShadow: '0 2px 8px rgba(255, 87, 34, 0.4)',
                  zIndex: 0,
                }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span style={{ position: 'relative', zIndex: 1 }}>Day {dayIdx + 1}</span>
          </button>
        );
      })}
    </div>
  );
};
