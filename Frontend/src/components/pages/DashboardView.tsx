import React, { useState } from 'react';
import { TripForm } from '../trip/TripForm';
import { RouteMap } from '../trip/RouteMap';
import { HOSStatus } from '../trip/HOSStatus';
import { TripSummary } from '../trip/TripSummary';
import { StopTimeline } from '../trip/StopTimeline';
import { ELDViewer } from '../eld/ELDViewer';
import { RouteDetailsModal } from '../ui/RouteDetailsModal';
import { useTripContext } from '../../context/TripContext';
import { Share2, Edit3, RotateCcw, AlertTriangle } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    inputs,
    setInputs,
    validationErrors,
    status,
    error,
    activeDayIndex,
    setActiveDayIndex,
    currentPlan,
    planTrip,
  } = useTripContext();

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  return (
    <div>
      {/* Visible Error Banner for API Failures / Infeasible Trips */}
      {status === 'error' && error && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <AlertTriangle size={20} color="#EF4444" />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: '#EF4444' }}>Trip Planning Error</div>
              <div style={{ fontSize: '12px', color: '#D1D5DB', marginTop: '2px' }}>{error}</div>
            </div>
          </div>

          <button
            onClick={() => planTrip()}
            className="spotter-btn-primary"
            style={{ backgroundColor: '#EF4444', height: '34px', padding: '0 14px', fontSize: '12px' }}
          >
            <RotateCcw size={14} />
            <span>Retry Plan</span>
          </button>
        </div>
      )}

      {/* Trip Route & Driver Configuration Input Area */}
      <TripForm
        inputs={inputs}
        onChange={setInputs}
        onPlanTrip={() => planTrip()}
        isLoading={status === 'planning'}
        validationErrors={validationErrors}
      />

      {/* Main Dashboard Layout Grid */}
      {currentPlan ? (
        <div
          id="route-map-section"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 340px',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {/* Central Area: Route Map, HOS Bar, ELD Visualizer */}
          <div style={{ minWidth: 0 }}>
            <RouteMap
              plan={currentPlan}
              isPlanning={status === 'planning'}
              onOpenDetails={() => setIsDetailsModalOpen(true)}
            />

            <HOSStatus hos={currentPlan.hos} />

            <ELDViewer
              dailyLogs={currentPlan.dailyLogs}
              activeDayIndex={activeDayIndex}
              onSelectDay={setActiveDayIndex}
            />
          </div>

          {/* Right Area: Trip Summary, Upcoming Stops, Quick Actions */}
          <div>
            <TripSummary plan={currentPlan} />

            <StopTimeline
              stops={currentPlan.stops}
              onOpenDetails={() => setIsDetailsModalOpen(true)}
            />

            <div
              className="spotter-card"
              style={{
                padding: '18px',
                background: '#0F121C',
                borderColor: '#1E2536',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', marginBottom: '12px' }}>
                QUICK ACTIONS
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <button className="spotter-btn-secondary" style={{ justifyContent: 'center' }}>
                  <Share2 size={14} color="#9CA3AF" />
                  <span>Share Trip</span>
                </button>
                <button className="spotter-btn-secondary" style={{ justifyContent: 'center' }}>
                  <Edit3 size={14} color="#9CA3AF" />
                  <span>Modify Trip</span>
                </button>
              </div>

              <button
                className="spotter-btn-primary"
                onClick={() => planTrip()}
                style={{ width: '100%', justifyContent: 'center', height: '40px' }}
              >
                <RotateCcw size={15} />
                <span>Recalculate Route</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        status !== 'planning' && (
          <div
            className="spotter-card"
            style={{
              padding: '36px 20px',
              textAlign: 'center',
              background: '#0D0F17',
              borderColor: '#1E2536',
              marginTop: '20px',
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 800, color: '#FFFFFF', marginBottom: '6px' }}>
              No Active Trip Plan
            </div>
            <div style={{ fontSize: '13px', color: '#9CA3AF', maxWidth: '540px', margin: '0 auto' }}>
              Configure your origin, pickup, dropoff locations, and driver cycle used above, then click{' '}
              <strong style={{ color: '#FF5722' }}>Plan Compliant Trip</strong> to generate live route geometry, HOS scheduling, and FMCSA daily logs.
            </div>
          </div>
        )
      )}

      {currentPlan && (
        <RouteDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          plan={currentPlan}
        />
      )}
    </div>
  );
};
