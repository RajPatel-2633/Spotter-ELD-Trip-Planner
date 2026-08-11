import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TripProvider, useTripContext } from './context/TripContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { LoadingState } from './components/ui/LoadingState';
import { DashboardView } from './components/pages/DashboardView';
import { TripPlannerView } from './components/pages/TripPlannerView';
import { ELDLogsView } from './components/pages/ELDLogsView';
import { FuelStopsView } from './components/pages/FuelStopsView';
import { DriversView } from './components/pages/DriversView';
import { ReportsView } from './components/pages/ReportsView';
import { SettingsView } from './components/pages/SettingsView';
import { NotFoundView } from './components/pages/NotFoundView';
import './App.css';

/**
 * Inner Layout shell consuming TripContext
 */
const AppShell: React.FC = () => {
  const { inputs, currentPlan, status, loadingStepIndex, steps } = useTripContext();

  const startCycle = currentPlan?.hos?.cycleUsedHours ?? inputs.currentCycleUsed;
  const projectedCycle = currentPlan?.hos?.projectedCycleHours;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#090A0D' }}>
      {/* Persistent Navigation Sidebar */}
      <Sidebar
        startCycleUsed={startCycle}
        projectedCycleUsed={projectedCycle}
        status={status === 'planning' ? 'PLANNING' : 'EN_ROUTE'}
        origin={currentPlan?.currentLocation || inputs.currentLocation}
        destination={currentPlan?.dropoffLocation || inputs.dropoffLocation}
        distanceMiles={currentPlan?.summary?.totalDistanceMiles || 0}
      />

      {/* Main Command Center Workspace */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar startCycleUsed={startCycle} projectedCycleUsed={projectedCycle} />

        <main style={{ padding: '24px', maxWidth: '1600px', width: '100%', margin: '0 auto' }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardView />} />
            <Route path="/trip-planner" element={<TripPlannerView />} />
            <Route path="/eld-logs" element={<ELDLogsView />} />
            <Route path="/fuel-stops" element={<FuelStopsView />} />
            <Route path="/drivers" element={<DriversView />} />
            <Route path="/reports" element={<ReportsView />} />
            <Route path="/settings" element={<SettingsView />} />
            <Route path="*" element={<NotFoundView />} />
          </Routes>
        </main>
      </div>

      {/* Multi-step Animated Planning Overlay */}
      <LoadingState
        steps={steps}
        currentStepIndex={loadingStepIndex}
        isOpen={status === 'planning'}
      />
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <TripProvider>
        <AppShell />
      </TripProvider>
    </BrowserRouter>
  );
}

export default App;
