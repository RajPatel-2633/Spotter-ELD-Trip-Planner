import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ArrowRight, FileCheck, Printer } from 'lucide-react';
import type { DailyLog } from '../../types/trip';
import { useTripContext } from '../../context/TripContext';
import { ELDDayTabs } from './ELDDayTabs';
import { ELDGrid } from './ELDGrid';
import { ELDStats } from './ELDStats';
import { DutyStatusLegend } from './DutyStatusLegend';
import { FMCSADailyLogModal } from './FMCSADailyLogModal';
import { PrintableRODS } from './PrintableRODS';

interface ELDViewerProps {
  dailyLogs: DailyLog[];
  activeDayIndex: number;
  onSelectDay: (index: number) => void;
}

export const ELDViewer: React.FC<ELDViewerProps> = ({ dailyLogs, activeDayIndex, onSelectDay }) => {
  const { currentPlan, selectedDriver } = useTripContext();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const currentDailyLog = dailyLogs[activeDayIndex] || dailyLogs[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="spotter-card"
      style={{
        padding: '20px',
        marginBottom: '20px',
        background: 'linear-gradient(180deg, #11141E 0%, #0D0F17 100%)',
        borderColor: '#1E2536',
      }}
    >
      {/* Top Header Row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>ELD Logs</h2>
          <ELDDayTabs
            daysCount={dailyLogs.length}
            activeDayIndex={activeDayIndex}
            onSelectDay={onSelectDay}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handlePrint}
            className="spotter-btn-secondary"
            style={{ fontSize: '12px', padding: '6px 12px', height: '34px' }}
          >
            <Printer size={14} color="#9CA3AF" />
            <span>Print Log</span>
          </button>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="spotter-btn-primary"
            style={{ fontSize: '12px', padding: '6px 14px', height: '34px' }}
          >
            <FileCheck size={14} />
            <span>View Official Log Sheet</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Selected Day Date Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          paddingBottom: '10px',
          borderBottom: '1px solid #1A202E',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Calendar size={15} color="#FF5722" />
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFFFFF' }}>
            Day {currentDailyLog?.dayNumber} — {currentDailyLog?.dateString}
          </span>
        </div>

        <DutyStatusLegend />
      </div>

      {/* Grid with Day Switch Transition */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeDayIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <ELDGrid dailyLog={currentDailyLog} />
          <ELDStats totals={currentDailyLog.totals} />
        </motion.div>
      </AnimatePresence>

      {/* FMCSA Official Driver's Daily Log Sheet Modal */}
      <FMCSADailyLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        dailyLog={currentDailyLog}
      />

      {/* Printable RODS Document */}
      {currentDailyLog && (
        <PrintableRODS
          dailyLog={currentDailyLog}
          currentPlan={currentPlan}
          selectedDriver={selectedDriver}
        />
      )}
    </motion.div>
  );
};
