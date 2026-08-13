import React from 'react';
import type { DailyLog, TripPlan } from '../../types/trip';
import type { Driver } from '../../data/mockDriverData';

interface PrintableRODSProps {
  dailyLog: DailyLog;
  currentPlan: TripPlan | null;
  selectedDriver: Driver;
}

export const PrintableRODS: React.FC<PrintableRODSProps> = ({
  dailyLog,
  currentPlan,
  selectedDriver,
}) => {
  const driverName = dailyLog.driverName || selectedDriver.name;
  const driverId = dailyLog.driverId || selectedDriver.driverId;
  const carrierName = dailyLog.carrierName || selectedDriver.carrierName;
  const truckNo = dailyLog.truckNumber || selectedDriver.truckNo;
  const trailerNo = dailyLog.trailerNumber || selectedDriver.trailerNo;
  const homeTerminal = selectedDriver.homeTerminal;

  const origin = currentPlan?.currentLocation || 'Chicago, IL';
  const pickup = currentPlan?.pickupLocation || 'Dallas, TX';
  const dropoff = currentPlan?.dropoffLocation || 'Houston, TX';

  const offDutyHours = dailyLog.totals?.offDutyHours ?? 0;
  const sleeperBerthHours = dailyLog.totals?.sleeperBerthHours ?? 0;
  const drivingHours = dailyLog.totals?.drivingHours ?? 0;
  const onDutyHours = dailyLog.totals?.onDutyHours ?? 0;

  const formatHoursMins = (decimalHours: number) => {
    const totalMins = Math.round(decimalHours * 60);
    const hrs = Math.floor(totalMins / 60);
    const mins = totalMins % 60;
    return `${hrs}h ${mins < 10 ? '0' : ''}${mins}m`;
  };

  // Helper to map status to row index (0-3)
  const getRowIndex = (status: string): number => {
    switch (status) {
      case 'OFF_DUTY':
        return 0;
      case 'SLEEPER_BERTH':
        return 1;
      case 'DRIVING':
        return 2;
      case 'ON_DUTY':
        return 3;
      default:
        return 0;
    }
  };

  // Hourly markers 0-24
  const hourMarkers = Array.from({ length: 25 }, (_, i) => i);

  return (
    <div className="printable-rods-root">
      <div
        style={{
          width: '100%',
          maxWidth: '10.3in',
          margin: '0 auto',
          fontFamily: "'Inter', Arial, sans-serif",
          color: '#000000',
          backgroundColor: '#FFFFFF',
          padding: '16px',
          boxSizing: 'border-box',
          fontSize: '11px',
          lineHeight: '1.3',
        }}
      >
        {/* DOCUMENT TOP HEADER */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '2px solid #000000',
            paddingBottom: '8px',
            marginBottom: '10px',
          }}
        >
          <div>
            <div style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.5px' }}>
              SPOTTER <span style={{ color: '#000000' }}>TripOS</span>
            </div>
            <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' }}>
              Electronic Logging Device (ELD) / RODS System
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '16px', fontWeight: 900, margin: 0, textTransform: 'uppercase' }}>
              Driver's Daily Log (24 Hours)
            </h1>
            <div style={{ fontSize: '10px', fontWeight: 700 }}>
              RECORD OF DUTY STATUS — PROPERTY-CARRYING DRIVER (49 CFR PART 395)
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', fontWeight: 800 }}>FMCSA FORM MCS-59</div>
            <div style={{ fontSize: '9px', fontWeight: 600 }}>US DOT COMPLIANT</div>
          </div>
        </div>

        {/* METADATA GRID TABLE */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '12px',
            fontSize: '10px',
          }}
        >
          <tbody>
            <tr>
              <td style={{ border: '1px solid #000000', padding: '4px 6px', width: '15%' }}>
                <strong style={{ fontSize: '8px', display: 'block', color: '#444444' }}>DATE:</strong>
                <span style={{ fontSize: '11px', fontWeight: 800 }}>{dailyLog.dateString}</span>
              </td>
              <td style={{ border: '1px solid #000000', padding: '4px 6px', width: '25%' }}>
                <strong style={{ fontSize: '8px', display: 'block', color: '#444444' }}>DRIVER NAME & ID:</strong>
                <span style={{ fontSize: '11px', fontWeight: 800 }}>
                  {driverName} ({driverId})
                </span>
              </td>
              <td style={{ border: '1px solid #000000', padding: '4px 6px', width: '30%' }}>
                <strong style={{ fontSize: '8px', display: 'block', color: '#444444' }}>CARRIER NAME:</strong>
                <span style={{ fontSize: '11px', fontWeight: 800 }}>{carrierName}</span>
              </td>
              <td style={{ border: '1px solid #000000', padding: '4px 6px', width: '15%' }}>
                <strong style={{ fontSize: '8px', display: 'block', color: '#444444' }}>TRUCK / TRACTOR:</strong>
                <span style={{ fontSize: '11px', fontWeight: 800 }}>{truckNo}</span>
              </td>
              <td style={{ border: '1px solid #000000', padding: '4px 6px', width: '15%' }}>
                <strong style={{ fontSize: '8px', display: 'block', color: '#444444' }}>TRAILER NO:</strong>
                <span style={{ fontSize: '11px', fontWeight: 800 }}>{trailerNo}</span>
              </td>
            </tr>
            <tr>
              <td colSpan={2} style={{ border: '1px solid #000000', padding: '4px 6px' }}>
                <strong style={{ fontSize: '8px', display: 'block', color: '#444444' }}>MAIN TERMINAL ADDRESS:</strong>
                <span style={{ fontSize: '10px', fontWeight: 700 }}>{homeTerminal}</span>
              </td>
              <td colSpan={3} style={{ border: '1px solid #000000', padding: '4px 6px' }}>
                <strong style={{ fontSize: '8px', display: 'block', color: '#444444' }}>TRIP ITINERARY:</strong>
                <span style={{ fontSize: '10px', fontWeight: 700 }}>
                  Origin: {origin} &nbsp;│&nbsp; Pickup: {pickup} &nbsp;│&nbsp; Dropoff: {dropoff}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* 24-HOUR ELD GRID GRAPH */}
        <div style={{ marginBottom: '12px', border: '1.5px solid #000000', padding: '8px' }}>
          <div style={{ fontSize: '10px', fontWeight: 900, marginBottom: '4px', textTransform: 'uppercase' }}>
            24-HOUR DUTY STATUS GRID
          </div>

          <div style={{ display: 'flex', width: '100%', position: 'relative' }}>
            {/* Left Row Labels */}
            <div style={{ width: '130px', flexShrink: 0, paddingRight: '6px' }}>
              <div style={{ height: '22px', fontSize: '9px', fontWeight: 900, display: 'flex', alignItems: 'center' }}>
                1. OFF DUTY
              </div>
              <div style={{ height: '22px', fontSize: '9px', fontWeight: 900, display: 'flex', alignItems: 'center' }}>
                2. SLEEPER BERTH
              </div>
              <div style={{ height: '22px', fontSize: '9px', fontWeight: 900, display: 'flex', alignItems: 'center' }}>
                3. DRIVING
              </div>
              <div style={{ height: '22px', fontSize: '9px', fontWeight: 900, display: 'flex', alignItems: 'center' }}>
                4. ON DUTY (NOT DRIVING)
              </div>
            </div>

            {/* Grid Graphics Container */}
            <div style={{ flex: 1, position: 'relative' }}>
              {/* Hour Axis Top Labels */}
              <div style={{ display: 'flex', width: '100%', height: '14px', borderBottom: '1px solid #000000' }}>
                {hourMarkers.slice(0, 24).map((hr) => (
                  <div
                    key={hr}
                    style={{
                      flex: 1,
                      fontSize: '7px',
                      fontWeight: 800,
                      textAlign: 'center',
                      borderRight: '1px solid #CCCCCC',
                    }}
                  >
                    {hr === 0 ? 'M' : hr === 12 ? 'N' : hr > 12 ? hr - 12 : hr}
                  </div>
                ))}
              </div>

              {/* 4 Duty Status Rows */}
              <div
                style={{
                  position: 'relative',
                  height: '88px',
                  borderBottom: '1px solid #000000',
                  borderLeft: '1px solid #000000',
                  borderRight: '1px solid #000000',
                }}
              >
                {/* Horizontal background row lines */}
                {[0, 1, 2, 3].map((rIdx) => (
                  <div
                    key={rIdx}
                    style={{
                      position: 'absolute',
                      top: `${rIdx * 22}px`,
                      left: 0,
                      right: 0,
                      height: '22px',
                      borderBottom: rIdx < 3 ? '1px dashed #E0E0E0' : 'none',
                      backgroundColor: rIdx % 2 === 0 ? '#FAFAFA' : '#FFFFFF',
                    }}
                  />
                ))}

                {/* Vertical hour gridlines */}
                {hourMarkers.slice(1, 24).map((hr) => (
                  <div
                    key={hr}
                    style={{
                      position: 'absolute',
                      top: 0,
                      bottom: 0,
                      left: `${(hr / 24) * 100}%`,
                      width: '1px',
                      backgroundColor: hr % 6 === 0 ? '#888888' : '#E0E0E0',
                      zIndex: 1,
                    }}
                  />
                ))}

                {/* SVG Overlay for exact status lines and step transitions */}
                <svg
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2,
                  }}
                  preserveAspectRatio="none"
                  viewBox="0 0 1440 88"
                >
                  {dailyLog.intervals.map((inv, idx) => {
                    const rowIdx = getRowIndex(inv.status);
                    const yPos = rowIdx * 22 + 11; // Center of row
                    const x1 = inv.startMinute ?? inv.startMinutes ?? 0;
                    const x2 = inv.endMinute ?? inv.endMinutes ?? 1440;

                    // Next interval vertical connector line
                    const nextInv = dailyLog.intervals[idx + 1];
                    let nextY = yPos;
                    if (nextInv) {
                      const nextRowIdx = getRowIndex(nextInv.status);
                      nextY = nextRowIdx * 22 + 11;
                    }

                    return (
                      <g key={inv.id || idx}>
                        {/* Horizontal Duty Status Line */}
                        <line
                          x1={x1}
                          y1={yPos}
                          x2={x2}
                          y2={yPos}
                          stroke="#000000"
                          strokeWidth="3"
                          strokeLinecap="square"
                        />
                        {/* Vertical transition line to next interval */}
                        {nextInv && yPos !== nextY && (
                          <line
                            x1={x2}
                            y1={yPos}
                            x2={x2}
                            y2={nextY}
                            stroke="#000000"
                            strokeWidth="2.5"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Right Row Hours Totals Column */}
            <div style={{ width: '60px', flexShrink: 0, paddingLeft: '8px' }}>
              <div style={{ height: '14px', fontSize: '7px', fontWeight: 800, textAlign: 'right' }}>HOURS</div>
              <div style={{ height: '22px', fontSize: '9px', fontWeight: 800, textAlign: 'right', lineHeight: '22px' }}>
                {offDutyHours.toFixed(1)}
              </div>
              <div style={{ height: '22px', fontSize: '9px', fontWeight: 800, textAlign: 'right', lineHeight: '22px' }}>
                {sleeperBerthHours.toFixed(1)}
              </div>
              <div style={{ height: '22px', fontSize: '9px', fontWeight: 800, textAlign: 'right', lineHeight: '22px' }}>
                {drivingHours.toFixed(1)}
              </div>
              <div style={{ height: '22px', fontSize: '9px', fontWeight: 800, textAlign: 'right', lineHeight: '22px' }}>
                {onDutyHours.toFixed(1)}
              </div>
            </div>
          </div>
        </div>

        {/* DAILY TOTALS CARDS */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            marginBottom: '12px',
            textAlign: 'center',
          }}
        >
          <div style={{ border: '1px solid #000000', padding: '4px', backgroundColor: '#F8F9FA' }}>
            <div style={{ fontSize: '8px', fontWeight: 800, color: '#444444' }}>OFF DUTY</div>
            <div style={{ fontSize: '11px', fontWeight: 900 }}>{formatHoursMins(offDutyHours)}</div>
          </div>
          <div style={{ border: '1px solid #000000', padding: '4px', backgroundColor: '#F8F9FA' }}>
            <div style={{ fontSize: '8px', fontWeight: 800, color: '#444444' }}>SLEEPER BERTH</div>
            <div style={{ fontSize: '11px', fontWeight: 900 }}>{formatHoursMins(sleeperBerthHours)}</div>
          </div>
          <div style={{ border: '1px solid #000000', padding: '4px', backgroundColor: '#F8F9FA' }}>
            <div style={{ fontSize: '8px', fontWeight: 800, color: '#444444' }}>DRIVING</div>
            <div style={{ fontSize: '11px', fontWeight: 900 }}>{formatHoursMins(drivingHours)}</div>
          </div>
          <div style={{ border: '1px solid #000000', padding: '4px', backgroundColor: '#F8F9FA' }}>
            <div style={{ fontSize: '8px', fontWeight: 800, color: '#444444' }}>ON DUTY (NOT DRIVING)</div>
            <div style={{ fontSize: '11px', fontWeight: 900 }}>{formatHoursMins(onDutyHours)}</div>
          </div>
          <div style={{ border: '1.5px solid #000000', padding: '4px', backgroundColor: '#E9ECEF' }}>
            <div style={{ fontSize: '8px', fontWeight: 900, color: '#000000' }}>TOTAL LOGGED</div>
            <div style={{ fontSize: '11px', fontWeight: 900 }}>24h 00m</div>
          </div>
        </div>

        {/* REMARKS / DUTY STATUS CHANGE TIMELINE TABLE */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontSize: '9px', fontWeight: 900, marginBottom: '3px', textTransform: 'uppercase' }}>
            REMARKS & DUTY STATUS CHANGE LOG
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '9px' }}>
            <thead>
              <tr style={{ backgroundColor: '#F0F0F0' }}>
                <th style={{ border: '1px solid #000000', padding: '3px 6px', textAlign: 'left', width: '120px' }}>
                  TIME WINDOW
                </th>
                <th style={{ border: '1px solid #000000', padding: '3px 6px', textAlign: 'left', width: '130px' }}>
                  DUTY STATUS
                </th>
                <th style={{ border: '1px solid #000000', padding: '3px 6px', textAlign: 'left', width: '200px' }}>
                  LOCATION
                </th>
                <th style={{ border: '1px solid #000000', padding: '3px 6px', textAlign: 'left' }}>
                  REMARK / ACTIVITY NOTE
                </th>
              </tr>
            </thead>
            <tbody>
              {dailyLog.intervals.map((inv, idx) => (
                <tr key={inv.id || idx}>
                  <td style={{ border: '1px solid #000000', padding: '3px 6px', fontWeight: 800 }}>
                    {inv.startTime} – {inv.endTime} ({inv.durationMinutes}m)
                  </td>
                  <td style={{ border: '1px solid #000000', padding: '3px 6px', fontWeight: 800 }}>
                    {inv.status.replace('_', ' ')}
                  </td>
                  <td style={{ border: '1px solid #000000', padding: '3px 6px' }}>{inv.location}</td>
                  <td style={{ border: '1px solid #000000', padding: '3px 6px' }}>{inv.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* CERTIFICATION & SIGNATURE SECTION */}
        <div
          style={{
            border: '1.5px solid #000000',
            padding: '8px 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '9px',
          }}
        >
          <div>
            <div style={{ fontSize: '10px', fontWeight: 800, marginBottom: '2px' }}>
              DRIVER'S CERTIFICATION
            </div>
            <div>"I certify that these entries are true and correct."</div>
            <div style={{ marginTop: '4px', fontWeight: 700 }}>
              Driver Name: <span style={{ textDecoration: 'underline' }}>{driverName}</span>
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ marginBottom: '16px' }}>
              Date: <span style={{ textDecoration: 'underline' }}>{dailyLog.dateString}</span>
            </div>
            <div style={{ borderTop: '1px solid #000000', width: '240px', paddingTop: '2px', fontWeight: 700 }}>
              Driver Signature
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
