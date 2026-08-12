import React, { useState } from 'react';
import { useTripContext } from '../../context/TripContext';
import { ELDDayTabs } from '../eld/ELDDayTabs';
import { ELDGrid } from '../eld/ELDGrid';
import { ELDStats } from '../eld/ELDStats';
import { DutyStatusLegend } from '../eld/DutyStatusLegend';
import { FMCSADailyLogModal } from '../eld/FMCSADailyLogModal';
import { PrintableRODS } from '../eld/PrintableRODS';
import { Calendar, FileCheck, Truck, ShieldCheck, MapPin, ArrowRight, Printer } from 'lucide-react';

export const ELDLogsView: React.FC = () => {
  const { currentPlan, activeDayIndex, setActiveDayIndex, selectedDriver } = useTripContext();
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  if (!currentPlan) {
    return (
      <div>
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
            Driver's Daily Log / RODS (Record of Duty Status)
          </h2>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
            Official 24-hour daily log sheets for Property-Carrying Drivers (49 CFR Part 395).
          </p>
        </div>

        {/* Selected Driver Context Banner */}
        <div
          className="spotter-card"
          style={{
            padding: '16px 20px',
            marginBottom: '20px',
            background: 'linear-gradient(180deg, #131724 0%, #0E111A 100%)',
            borderColor: '#1F273A',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Truck size={20} color="#FF5722" />
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>SELECTED DRIVER & VEHICLE</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                {selectedDriver.name} (ID: {selectedDriver.driverId}) • {selectedDriver.truckNo}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={20} color="#10B981" />
            <div>
              <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>CARRIER</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
                {selectedDriver.carrierName}
              </div>
            </div>
          </div>
        </div>

        <div
          className="spotter-card"
          style={{
            padding: '36px 20px',
            textAlign: 'center',
            background: '#0D0F17',
            borderColor: '#1E2536',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
            No Active Trip Plan
          </div>
          <div style={{ fontSize: '13px', color: '#9CA3AF', maxWidth: '540px', margin: '0 auto' }}>
            Generate a trip plan in the Dashboard or Trip Planner to generate official FMCSA daily RODS logs for <strong style={{ color: '#FFFFFF' }}>{selectedDriver.name}</strong>.
          </div>
        </div>
      </div>
    );
  }

  const currentDailyLog = currentPlan.dailyLogs[activeDayIndex] || currentPlan.dailyLogs[0];

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
              Driver's Daily Log / RODS (Record of Duty Status)
            </h2>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '4px' }}>
              FMCSA COMPLIANT
            </span>
          </div>
          <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
            Official 24-hour daily log sheets for Property-Carrying Drivers (49 CFR Part 395).
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={handlePrint}
            className="spotter-btn-secondary"
            style={{ height: '40px', padding: '0 16px' }}
          >
            <Printer size={16} color="#9CA3AF" />
            <span>Print Daily Log</span>
          </button>
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="spotter-btn-primary"
            style={{ height: '40px', padding: '0 18px' }}
          >
            <FileCheck size={16} />
            <span>View Official Log Sheet</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Trip & Driver Context Banner */}
      <div
        className="spotter-card"
        style={{
          padding: '16px 20px',
          marginBottom: '20px',
          background: 'linear-gradient(180deg, #131724 0%, #0E111A 100%)',
          borderColor: '#1F273A',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <MapPin size={20} color="#FF5722" />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>TRIP ROUTE</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
              {currentPlan.currentLocation} → {currentPlan.dropoffLocation}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Truck size={20} color="#FF5722" />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>DRIVER & VEHICLE</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
              {selectedDriver.name} (ID: {selectedDriver.driverId}) • {selectedDriver.truckNo}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Calendar size={20} color="#FFB300" />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>LOG SHEET DATE</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
              Day {currentDailyLog.dayNumber} — {currentDailyLog.dateString}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={20} color="#10B981" />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>PROJECTED CYCLE STATUS</div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#10B981' }}>
              Start: {currentPlan.hos.cycleUsedHours}h • Projected: {currentPlan.hos.projectedCycleHours} / 70h
            </div>
          </div>
        </div>
      </div>

      {/* Main ELD Logs Viewer Section */}
      <div
        className="spotter-card"
        style={{
          padding: '20px',
          marginBottom: '20px',
          background: '#0D0F17',
          borderColor: '#1E2536',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <ELDDayTabs
            daysCount={currentPlan.dailyLogs.length}
            activeDayIndex={activeDayIndex}
            onSelectDay={setActiveDayIndex}
          />
          <DutyStatusLegend />
        </div>

        <ELDGrid dailyLog={currentDailyLog} />
        <ELDStats totals={currentDailyLog.totals} />
      </div>

      {/* Itemized Duty Status Remarks Log Table */}
      <div
        className="spotter-card"
        style={{
          padding: '20px',
          background: '#0D0F17',
          borderColor: '#1E2536',
        }}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF', marginBottom: '12px' }}>
          Duty Status Change Log & Location Remarks
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {currentDailyLog.intervals.map((inv) => (
            <div
              key={inv.id}
              style={{
                backgroundColor: '#121623',
                border: '1px solid #1F2638',
                borderRadius: '8px',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#FF5722' }} className="text-mono">
                  {inv.startTime} - {inv.endTime}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor:
                      inv.status === 'DRIVING'
                        ? 'rgba(255, 87, 34, 0.2)'
                        : inv.status === 'SLEEPER_BERTH'
                        ? 'rgba(59, 130, 246, 0.2)'
                        : inv.status === 'ON_DUTY'
                        ? 'rgba(245, 158, 11, 0.2)'
                        : 'rgba(75, 85, 99, 0.2)',
                    color:
                      inv.status === 'DRIVING'
                        ? '#FF5722'
                        : inv.status === 'SLEEPER_BERTH'
                        ? '#3B82F6'
                        : inv.status === 'ON_DUTY'
                        ? '#F59E0B'
                        : '#9CA3AF',
                  }}
                >
                  {inv.status}
                </span>
                {inv.location && (
                  <span style={{ fontSize: '12.5px', color: '#FFFFFF', fontWeight: 600 }}>{inv.location}</span>
                )}
              </div>

              <span style={{ fontSize: '11.5px', color: '#6B7280', fontStyle: 'italic' }}>
                {inv.note || 'Compliant RODS entry'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <FMCSADailyLogModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        dailyLog={currentDailyLog}
      />

      {/* Printable RODS Document rendered for active selected day */}
      <PrintableRODS
        dailyLog={currentDailyLog}
        currentPlan={currentPlan}
        selectedDriver={selectedDriver}
      />
    </div>
  );
};
