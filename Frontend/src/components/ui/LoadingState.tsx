import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { LoadingStep } from '../../context/TripContext';
import { CheckCircle2, Loader2, Sparkles } from 'lucide-react';

interface LoadingStateProps {
  steps: LoadingStep[];
  currentStepIndex: number;
  isOpen: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ steps, currentStepIndex, isOpen }) => {
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
            backgroundColor: 'rgba(5, 6, 9, 0.88)',
            backdropFilter: 'blur(10px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            style={{
              backgroundColor: '#11141E',
              border: '1px solid #232B3C',
              borderRadius: '16px',
              padding: '32px',
              width: '100%',
              maxWidth: '480px',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.95)',
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 87, 34, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px auto',
                }}
              >
                <Sparkles size={24} color="#FF5722" />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#FFFFFF', margin: 0 }}>
                Planning Trip Sequence
              </h3>
              <p style={{ fontSize: '12.5px', color: '#9CA3AF', marginTop: '4px' }}>
                Executing route optimization & HOS compliance engine...
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {steps.map((step, idx) => {
                const isCurrent = idx === currentStepIndex;
                const isDone = idx < currentStepIndex;

                return (
                  <motion.div
                    key={step.id}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.08 }}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      backgroundColor: isCurrent ? 'rgba(255, 87, 34, 0.1)' : isDone ? '#141824' : '#0E1119',
                      border: `1px solid ${isCurrent ? '#FF5722' : isDone ? '#1F2738' : '#161A26'}`,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <div style={{ marginTop: '2px' }}>
                      {isDone ? (
                        <CheckCircle2 size={18} color="#10B981" />
                      ) : isCurrent ? (
                        <Loader2 size={18} color="#FF5722" className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                      ) : (
                        <div
                          style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: '1.5px solid #374151',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            color: '#6B7280',
                            fontWeight: 700,
                          }}
                        >
                          0{step.id}
                        </div>
                      )}
                    </div>

                    <div>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: 700,
                          color: isDone ? '#10B981' : isCurrent ? '#FFFFFF' : '#6B7280',
                        }}
                      >
                        {step.label}
                      </div>
                      <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>{step.subLabel}</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
