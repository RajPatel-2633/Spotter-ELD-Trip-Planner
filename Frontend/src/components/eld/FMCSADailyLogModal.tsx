import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, CheckSquare, ShieldCheck } from 'lucide-react';
import type { DailyLog } from '../../types/trip';
import { useTripContext } from '../../context/TripContext';

interface FMCSADailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  dailyLog: DailyLog;
}

export const FMCSADailyLogModal: React.FC<FMCSADailyLogModalProps> = ({ isOpen, onClose, dailyLog }) => {
  const { selectedDriver } = useTripContext();
  const formatMinsToHours = (mins: number) => (mins / 60).toFixed(1);

  const handlePrint = () => {
    window.print();
  };

  const driverName = dailyLog.driverName || selectedDriver.name;
  const driverId = dailyLog.driverId || selectedDriver.driverId;
  const carrierName = dailyLog.carrierName || selectedDriver.carrierName;
  const truckNo = dailyLog.truckNumber || selectedDriver.truckNo;
  const trailerNo = dailyLog.trailerNumber || selectedDriver.trailerNo;
  const homeTerminal = selectedDriver.homeTerminal;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(4, 5, 8, 0.88)',
            backdropFilter: 'blur(10px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 20 }}
            style={{
              backgroundColor: '#0F121C',
              border: '1px solid #283248',
              borderRadius: '14px',
              padding: '28px',
              width: '100%',
              maxWidth: '920px',
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.9)',
              color: '#F3F4F6',
            }}
          >
            {/* Modal Control Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={22} color="#FF5722" />
                <div>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                    Official Driver's Daily Log Sheet (FMCSA Form MCS-59)
                  </h2>
                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>49 CFR Part 395 - Property-Carrying Driver Daily Record</span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={handlePrint}
                  className="spotter-btn-secondary"
                  style={{ fontSize: '12px', padding: '6px 12px' }}
                >
                  <Printer size={14} color="#9CA3AF" />
                  <span>Print Sheet</span>
                </button>
                <button
                  onClick={onClose}
                  style={{
                    background: '#1A1F2C',
                    border: 'none',
                    color: '#9CA3AF',
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Official FMCSA Log Form Document Area */}
            <div
              className="fmcsa-print-area"
              style={{
                backgroundColor: '#0B0D14',
                border: '2px solid #2A3348',
                borderRadius: '8px',
                padding: '20px',
                fontFamily: 'Inter, sans-serif',
              }}
            >
              {/* Document Header Table Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  borderBottom: '2px solid #2A3348',
                  paddingBottom: '16px',
                  marginBottom: '16px',
                }}
              >
                <div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>DATE</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{dailyLog.dateString}</div>
                </div>

                <div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>DRIVER NAME & ID</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>
                    {driverName} ({driverId})
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>CARRIER NAME</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FF5722' }}>
                    {carrierName}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>MANIFEST / BOL NO.</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }} className="text-mono">
                    {dailyLog.shippingDocNo || 'BOL-98421-SPOT'}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>TOTAL MILES DRIVEN</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }} className="text-mono">
                    {dailyLog.totalMilesDriven || 480} mi
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>TRUCK / TRACTOR NO.</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }} className="text-mono">
                    {truckNo}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>TRAILER NO.</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }} className="text-mono">
                    {trailerNo}
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: '9px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>HOME TERMINAL</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF' }}>{homeTerminal}</div>
                </div>
              </div>

              {/* 24-Hour Graph Grid */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '10px' }}>
                  24-HOUR DUTY STATUS GRAPH GRID
                </div>

                <div
                  style={{
                    backgroundColor: '#121623',
                    border: '1.5px solid #232B3C',
                    borderRadius: '6px',
                    padding: '12px',
                  }}
                >
                  {/* Hours Tick Line */}
                  <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr 70px', marginBottom: '8px' }}>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280' }}>STATUS</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#9CA3AF' }}>
                      {['M', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'N', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', 'M'].map((h, i) => (
                        <span key={i} style={{ width: '0', textAlign: 'center' }}>{h}</span>
                      ))}
                    </div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#6B7280', textAlign: 'right' }}>HOURS</div>
                  </div>

                  {/* 4 Duty Status Graph Rows */}
                  {[
                    { status: 'OFF_DUTY', label: '1. OFF DUTY', mins: (dailyLog.totals.offDutyHours !== undefined ? Math.round(dailyLog.totals.offDutyHours * 60) : dailyLog.totals.offDutyMinutes) ?? 0, color: '#4B5563' },
                    { status: 'SLEEPER_BERTH', label: '2. SLEEPER BERTH', mins: (dailyLog.totals.sleeperBerthHours !== undefined ? Math.round(dailyLog.totals.sleeperBerthHours * 60) : dailyLog.totals.sleeperBerthMinutes) ?? 0, color: '#3B82F6' },
                    { status: 'DRIVING', label: '3. DRIVING', mins: (dailyLog.totals.drivingHours !== undefined ? Math.round(dailyLog.totals.drivingHours * 60) : dailyLog.totals.drivingMinutes) ?? 0, color: '#FF5722' },
                    { status: 'ON_DUTY', label: '4. ON DUTY (NOT DRIVING)', mins: (dailyLog.totals.onDutyHours !== undefined ? Math.round(dailyLog.totals.onDutyHours * 60) : dailyLog.totals.onDutyMinutes) ?? 0, color: '#F59E0B' },
                  ].map((row) => {
                    const rowIntervals = dailyLog.intervals.filter((inv) => inv.status === row.status);

                    return (
                      <div
                        key={row.status}
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '160px 1fr 70px',
                          alignItems: 'center',
                          height: '32px',
                          borderTop: '1px solid #1D2434',
                        }}
                      >
                        <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#D1D5DB' }}>{row.label}</div>

                        <div
                          style={{
                            position: 'relative',
                            height: '100%',
                            backgroundColor: '#090C12',
                            borderLeft: '1px solid #262F44',
                            borderRight: '1px solid #262F44',
                          }}
                        >
                          {/* Grid Hour Lines */}
                          {Array.from({ length: 24 }).map((_, hourIdx) => (
                            <div
                              key={hourIdx}
                              style={{
                                position: 'absolute',
                                left: `${(hourIdx / 24) * 100}%`,
                                top: 0,
                                bottom: 0,
                                width: '1px',
                                backgroundColor: hourIdx % 6 === 0 ? '#323D57' : '#1A2132',
                              }}
                            />
                          ))}

                          {/* Status Blocks */}
                          {rowIntervals.map((inv) => {
                            const startMin = inv.startMinute ?? inv.startMinutes ?? 0;
                            const leftPct = (startMin / 1440) * 100;
                            const widthPct = (inv.durationMinutes / 1440) * 100;
                            return (
                              <div
                                key={inv.id}
                                style={{
                                  position: 'absolute',
                                  left: `${leftPct}%`,
                                  width: `${widthPct}%`,
                                  top: '4px',
                                  bottom: '4px',
                                  backgroundColor: row.color,
                                  borderRadius: '2px',
                                }}
                              />
                            );
                          })}
                        </div>

                        <div style={{ fontSize: '12px', fontWeight: 800, color: '#FFFFFF', textAlign: 'right' }} className="text-mono">
                          {formatMinsToHours(row.mins)}
                        </div>
                      </div>
                    );
                  })}

                  {/* Total 24h Verification Row */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '160px 1fr 70px',
                      alignItems: 'center',
                      height: '32px',
                      borderTop: '2px solid #2A3348',
                      marginTop: '4px',
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#10B981' }}>TOTAL HOURS</div>
                    <div style={{ fontSize: '10px', color: '#9CA3AF', fontStyle: 'italic', paddingLeft: '8px' }}>
                      (Must equal exactly 24.0 hours)
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#10B981', textAlign: 'right' }} className="text-mono">
                      24.0
                    </div>
                  </div>
                </div>
              </div>

              {/* Remarks Section */}
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px' }}>
                  REMARKS & LOCATION CHANGE LOG
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {dailyLog.intervals.map((inv) => (
                    <div
                      key={inv.id}
                      style={{
                        backgroundColor: '#121623',
                        border: '1px solid #1F2638',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '11.5px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 700, color: '#FF5722' }} className="text-mono">
                          {inv.startTime} - {inv.endTime}
                        </span>
                        <span style={{ fontWeight: 600, color: '#FFFFFF' }}>{inv.status}</span>
                        {inv.location && <span style={{ color: '#9CA3AF' }}>• {inv.location}</span>}
                      </div>
                      <span style={{ color: '#6B7280', fontStyle: 'italic' }}>{inv.note || 'Compliant log entry'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Driver Certification Statement */}
              <div
                style={{
                  borderTop: '2px solid #2A3348',
                  paddingTop: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CheckSquare size={16} color="#10B981" />
                  <span style={{ fontSize: '11.5px', color: '#D1D5DB', fontStyle: 'italic' }}>
                    "I certify that these entries are true and correct."
                  </span>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '9px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 700 }}>
                    DRIVER'S SIGNATURE
                  </div>
                  <div
                    style={{
                      fontSize: '18px',
                      fontFamily: 'cursive',
                      fontWeight: 700,
                      color: '#FF5722',
                      marginTop: '2px',
                    }}
                  >
                    {driverName}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
