import { useState, useRef } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Ticket, Download, Sparkles, ArrowLeft, Check, AlertCircle } from 'lucide-react';
import type { UserData } from '@/types';
import { useTickets } from '@/hooks/useTickets';
import { RAFFLE } from '@/constants/config';
import html2canvas from 'html2canvas';
import { motion, AnimatePresence } from 'motion/react';

interface TicketGenerationProps {
  userData: UserData;
  ticketCount: number;
  onBack: () => void;
}

export function TicketGeneration({ userData, ticketCount, onBack }: TicketGenerationProps) {
  const [tickets, setTickets] = useState<string[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const ticketRef = useRef<HTMLDivElement>(null);
  
  const { generate, loading: isGenerating, error } = useTickets();

  const handleGenerateTickets = async () => {
    const result = await generate(userData.reference, userData, ticketCount);
    
    if (!result.success) {
      return;
    }
    
    setTickets(result.tickets || []);
    setHasGenerated(true);
  };

  const downloadTicket = async () => {
    if (!ticketRef.current) return;

    try {
      const canvas = await html2canvas(ticketRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const link = document.createElement('a');
      link.download = `comprobante-rifa-${userData.reference}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error al descargar:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-4 text-white hover:bg-white/20 backdrop-blur-sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 bg-white/95 backdrop-blur-xl shadow-2xl border-0 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />
            
            <div className="text-center mb-8">
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-full mb-4 relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ 
                  duration: 0.5,
                  type: "spring",
                  stiffness: 200
                }}
              >
                <Sparkles className="w-10 h-10 text-white" />
                {hasGenerated && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  />
                )}
              </motion.div>
              <h1 className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {hasGenerated ? '¡Tus Números de la Rifa!' : 'Genera tus Números'}
              </h1>
              <p className="text-gray-600">
                Referencia: <span className="text-purple-600">{userData.reference}</span>
              </p>
            </div>

            <AnimatePresence mode="wait">
              {!hasGenerated ? (
                <motion.div 
                  key="generate"
                  className="text-center py-12"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <motion.p 
                    className="text-gray-700 mb-6 max-w-md mx-auto"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Haz clic en el botón para generar tus {ticketCount} números aleatorios de la rifa. 
                    Los números son únicos y no se repetirán.
                  </motion.p>
                  
                  {error && (
                    <motion.div 
                      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 max-w-md mx-auto text-center"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                    >
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <p className="text-red-900 flex-1 text-center">{error}</p>
                    </motion.div>
                  )}
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      onClick={handleGenerateTickets}
                      disabled={isGenerating}
                      className="bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all"
                      size="lg"
                    >
                      {isGenerating ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-5 h-5 mr-2" />
                          </motion.div>
                          Generando números...
                        </>
                      ) : (
                        <>
                          <Ticket className="w-5 h-5 mr-2" />
                          Generar Mis Números
                        </>
                      )}
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  {/* Comprobante para descargar */}
                  <div ref={ticketRef} className="bg-white p-8 rounded-lg mb-6">
                    <div className="border-4 border-purple-600 rounded-lg p-6">
                      <div className="text-center mb-6">
                        <h2 className="text-purple-900 mb-2">Comprobante de Participación</h2>
                        <p className="text-gray-600">{RAFFLE.NAME}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div>
                          <p className="text-gray-600">Nombre:</p>
                          <p>{userData.name}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Cédula:</p>
                          <p>{userData.cedula}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Teléfono:</p>
                          <p>{userData.phone}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Email:</p>
                          <p className="break-all">{userData.email}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Referencia:</p>
                          <p>{userData.reference}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Fecha:</p>
                          <p>{new Date().toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg mb-4">
                        <h3 className="text-purple-900 mb-4 text-center">Tus Números</h3>
                        <div className="grid grid-cols-5 gap-3">
                          {tickets.map((ticket, index) => (
                            <motion.div
                              key={index}
                              className="bg-white border-2 border-purple-600 rounded-lg p-4 text-center"
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                delay: index * 0.1,
                                type: "spring",
                                stiffness: 200,
                                damping: 10
                              }}
                              whileHover={{ 
                                scale: 1.1,
                                boxShadow: "0 10px 30px rgba(147, 51, 234, 0.3)"
                              }}
                            >
                              <div className="text-2xl text-purple-900">{ticket}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="bg-purple-100 p-4 rounded-lg text-center">
                        <p className="text-purple-900">
                          Sorteo: <span>{RAFFLE.DATE_FORMATTED} - {RAFFLE.TIME_FORMATTED}</span>
                        </p>
                        <p className="text-purple-700 text-sm mt-2">
                          Guarda este comprobante. Lo necesitarás para reclamar tu premio.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <motion.div 
                    className="flex flex-col sm:flex-row gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div
                      className="flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={downloadTicket}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all"
                        size="lg"
                      >
                        <Download className="w-5 h-5 mr-2" />
                        Descargar Comprobante
                      </Button>
                    </motion.div>
                    <motion.div
                      className="flex-1"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={onBack}
                        variant="outline"
                        size="lg"
                        className="w-full border-2"
                      >
                        Nueva Consulta
                      </Button>
                    </motion.div>
                  </motion.div>

                  {/* Mensaje de éxito */}
                  <motion.div 
                    className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-lg flex items-start gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                  >
                    <motion.div
                      animate={{
                        scale: [1, 1.2, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    </motion.div>
                    <div>
                      <p className="text-green-900">
                        ¡Registro exitoso! Tus números han sido asignados correctamente.
                      </p>
                      <p className="text-green-700 text-sm mt-1">
                        Te enviaremos un correo de confirmación a {userData.email}
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}