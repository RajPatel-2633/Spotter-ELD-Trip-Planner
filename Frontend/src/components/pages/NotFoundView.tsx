import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft } from 'lucide-react';

export const NotFoundView: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          backgroundColor: 'rgba(255, 87, 34, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <AlertTriangle size={32} color="#FF5722" />
      </div>

      <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#FFFFFF', margin: '0 0 8px 0' }}>404 - Page Not Found</h1>
      <p style={{ fontSize: '14px', color: '#9CA3AF', maxWidth: '420px', marginBottom: '24px' }}>
        The requested operational view route does not exist or has been relocated within Spotter TripOS.
      </p>

      <Link to="/dashboard" style={{ textDecoration: 'none' }}>
        <button className="spotter-btn-primary" style={{ padding: '12px 24px' }}>
          <ArrowLeft size={16} />
          <span>Return to Dashboard</span>
        </button>
      </Link>
    </div>
  );
};
