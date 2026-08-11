import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Flag, Clock, ArrowRight, RotateCcw, AlertCircle, User } from 'lucide-react';
import type { TripInput } from '../../types/trip';
import { useTripContext } from '../../context/TripContext';

interface TripFormProps {
  inputs: TripInput;
  onChange: (inputs: TripInput) => void;
  onPlanTrip: () => void;
  isLoading: boolean;
  validationErrors: Record<string, string>;
}

export const TripForm: React.FC<TripFormProps> = ({
  inputs,
  onChange,
  onPlanTrip,
  isLoading,
  validationErrors,
}) => {
  const { drivers, selectedDriver, setSelectedDriverId } = useTripContext();

  const presets = [
    { label: 'Chicago → Dallas → Houston', orig: 'Chicago, IL', pick: 'Dallas, TX', drop: 'Houston, TX' },
    { label: 'LA → Phoenix → Atlanta', orig: 'Los Angeles, CA', pick: 'Phoenix, AZ', drop: 'Atlanta, GA' },
    { label: 'Seattle → Salt Lake → Denver', orig: 'Seattle, WA', pick: 'Salt Lake City, UT', drop: 'Denver, CO' },
    { label: 'NY → Columbus → Chicago', orig: 'New York, NY', pick: 'Columbus, OH', drop: 'Chicago, IL' },
  ];

  const handleInputChange = (field: keyof TripInput, value: string | number) => {
    onChange({
      ...inputs,
      [field]: value,
    });
  };

  const applyPreset = (preset: typeof presets[0]) => {
    onChange({
      ...inputs,
      currentLocation: preset.orig,
      pickupLocation: preset.pick,
      dropoffLocation: preset.drop,
    });
  };

  const handlePlanSubmit = () => {
    onPlanTrip();
    // Smooth scroll down to Route Map so user sees the result immediately
    setTimeout(() => {
      const mapElem = document.getElementById('route-map-section');
      if (mapElem) {
        mapElem.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 1200);
  };

  return (
    <motion.div
      initial={{ y: 15, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="spotter-card"
      style={{
        padding: '16px 20px',
        marginBottom: '20px',
        background: 'linear-gradient(180deg, #131620 0%, #0F1118 100%)',
        borderColor: '#1F2636',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          TRIP ROUTE & DRIVER CONFIGURATION
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>Quick Presets:</span>
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              style={{
                background: '#181C28',
                border: '1px solid #232A3B',
                color: '#D1D5DB',
                borderRadius: '6px',
                padding: '4px 8px',
                fontSize: '11px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#FF5722')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#232A3B')}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr)) 140px 170px',
          gap: '12px',
          alignItems: 'start',
        }}
      >
        {/* Driver Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', marginBottom: '4px' }}>
            Assigned Driver
          </label>
          <div style={{ position: 'relative' }}>
            <User size={16} color="#FF5722" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <select
              className="spotter-input"
              value={selectedDriver.id}
              onChange={(e) => setSelectedDriverId(e.target.value)}
              style={{ paddingLeft: '36px', background: '#121520', color: '#FFFFFF', appearance: 'none' }}
            >
              {drivers.map((drv) => (
                <option key={drv.id} value={drv.id}>
                  {drv.name} ({drv.truckNo})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', marginBottom: '4px' }}>
            Current Location
          </label>
          <div style={{ position: 'relative' }}>
            <MapPin size={16} color="#FF5722" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="spotter-input"
              value={inputs.currentLocation}
              onChange={(e) => handleInputChange('currentLocation', e.target.value)}
              placeholder="e.g. Chicago, IL"
              style={{ paddingLeft: '36px' }}
            />
          </div>
          {validationErrors.currentLocation && (
            <div style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={12} /> {validationErrors.currentLocation}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', marginBottom: '4px' }}>
            Pickup Location
          </label>
          <div style={{ position: 'relative' }}>
            <Navigation size={16} color="#FF5722" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="spotter-input"
              value={inputs.pickupLocation}
              onChange={(e) => handleInputChange('pickupLocation', e.target.value)}
              placeholder="e.g. Dallas, TX"
              style={{ paddingLeft: '36px' }}
            />
          </div>
          {validationErrors.pickupLocation && (
            <div style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={12} /> {validationErrors.pickupLocation}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', marginBottom: '4px' }}>
            Dropoff Location
          </label>
          <div style={{ position: 'relative' }}>
            <Flag size={16} color="#EF4444" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="text"
              className="spotter-input"
              value={inputs.dropoffLocation}
              onChange={(e) => handleInputChange('dropoffLocation', e.target.value)}
              placeholder="e.g. Houston, TX"
              style={{ paddingLeft: '36px' }}
            />
          </div>
          {validationErrors.dropoffLocation && (
            <div style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={12} /> {validationErrors.dropoffLocation}
            </div>
          )}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9CA3AF', marginBottom: '4px' }}>
            Cycle Used (hrs)
          </label>
          <div style={{ position: 'relative' }}>
            <Clock size={16} color="#FFB300" style={{ position: 'absolute', left: '12px', top: '12px' }} />
            <input
              type="number"
              step="0.5"
              min="0"
              max="70"
              className="spotter-input text-mono"
              value={inputs.currentCycleUsed}
              onChange={(e) => handleInputChange('currentCycleUsed', parseFloat(e.target.value) || 0)}
              style={{ paddingLeft: '36px' }}
            />
          </div>
          {validationErrors.currentCycleUsed && (
            <div style={{ color: '#EF4444', fontSize: '11px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertCircle size={12} /> {validationErrors.currentCycleUsed}
            </div>
          )}
        </div>

        <div style={{ paddingTop: '20px' }}>
          <button
            className="spotter-btn-primary"
            onClick={handlePlanSubmit}
            disabled={isLoading}
            style={{ width: '100%', height: '42px' }}
          >
            {isLoading ? (
              <>
                <RotateCcw size={16} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                <span>Planning...</span>
              </>
            ) : (
              <>
                <span>Plan New Trip</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};
