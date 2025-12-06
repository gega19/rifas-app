import { useState } from 'react';
import { ReferenceForm } from './components/ReferenceForm';
import { TicketGeneration } from './components/TicketGeneration';
import { ErrorBoundary } from './components/ErrorBoundary';
import { motion, AnimatePresence } from 'motion/react';
import type { UserData } from './types';

export default function App() {
  const [step, setStep] = useState<'form' | 'generation'>('form');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [ticketCount, setTicketCount] = useState<number>(5);

  const handleFormSubmit = (data: UserData, count: number) => {
    setUserData(data);
    setTicketCount(count);
    setStep('generation');
  };

  const handleBackToForm = () => {
    setStep('form');
    setUserData(null);
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-20 left-10 w-72 h-72 bg-cyan-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-20 right-10 w-96 h-96 bg-pink-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-80 h-80 bg-purple-400/10 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.1, 1],
              x: [-100, 100, -100],
              y: [-50, 50, -50],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 'form' ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
            >
              <ReferenceForm onSubmit={handleFormSubmit} />
            </motion.div>
          ) : (
            <motion.div
              key="generation"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5 }}
            >
              <TicketGeneration 
                userData={userData!} 
                ticketCount={ticketCount}
                onBack={handleBackToForm} 
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}


