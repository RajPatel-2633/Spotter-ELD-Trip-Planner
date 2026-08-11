import React, { useState } from 'react';
import { TripForm } from '../trip/TripForm';
import { RouteMap } from '../trip/RouteMap';
import { HOSStatus } from '../trip/HOSStatus';
import { TripSummary } from '../trip/TripSummary';
import { StopTimeline } from '../trip/StopTimeline';
import { ELDViewer } from '../eld/ELDViewer';
import { RouteDetailsModal } from '../ui/RouteDetailsModal';
import { useTripContext } from '../../context/TripContext';

export const TripPlannerView: React.FC = () => {
  const {
    inputs,
    setInputs,
    validationErrors,
    status,
    activeDayIndex,
    setActiveDayIndex,
    currentPlan,
    planTrip,
  } = useTripContext();

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
          Trip Route Planner & Dispatch Workspace
        </h2>
        <p style={{ fontSize: '13px', color: '#9CA3AF', marginTop: '4px' }}>
          Configure origin, pickup, dropoff, and driver cycle parameters for automated HOS compliance routing.
        </p>
      </div>

      <TripForm
        inputs={inputs}
        onChange={setInputs}
        onPlanTrip={() => planTrip()}
        isLoading={status === 'planning'}
        validationErrors={validationErrors}
      />

      {currentPlan ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 340px',
            gap: '24px',
            alignItems: 'start',
          }}
        >
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

          <div>
            <TripSummary plan={currentPlan} />
            <StopTimeline
              stops={currentPlan.stops}
              onOpenDetails={() => setIsDetailsModalOpen(true)}
            />
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
              Configure your trip details above and click{' '}
              <strong style={{ color: '#FF5722' }}>Plan Compliant Trip</strong> to view the route map, HOS compliance breakdown, and ELD logs.
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
