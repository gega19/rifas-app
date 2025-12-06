import { useState } from 'react';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Ticket, Gift, Info, Phone, Mail, User, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import type { UserData } from '@/types';
import { useReference } from '@/hooks/useReference';
import { validateUserData, validateReference as validateReferenceLocal } from '@/utils/validation';
import { REFERENCE, RAFFLE, CONTACT } from '@/constants/config';
import { motion } from 'motion/react';

interface ReferenceFormProps {
  onSubmit: (data: UserData, ticketCount: number) => void;
}

export function ReferenceForm({ onSubmit }: ReferenceFormProps) {
  const [reference, setReference] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');
  
  const { validate, loading: isValidating, error: validationError, clearError } = useReference();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    clearError();

    // Validar número de referencia localmente
    const refValidation = validateReferenceLocal(reference);
    if (!refValidation.valid) {
      setError(refValidation.error || '');
      return;
    }

    // Validar todos los campos
    const userData: Partial<UserData> = { reference, name, phone, email, cedula };
    const validation = validateUserData(userData);
    
    if (!validation.valid) {
      const firstError = Object.values(validation.errors)[0];
      setError(firstError || 'Por favor completa todos los campos correctamente');
      return;
    }

    // Validar con el backend
    const result = await validate(reference);
    
    if (!result.valid) {
      setError(result.message || validationError || 'Número de referencia no válido');
      return;
    }

    onSubmit(
      { reference, name, phone, email, cedula },
      result.ticketCount || 5
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-6xl grid md:grid-cols-2 gap-8">
        {/* Formulario */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="p-8 bg-white/95 backdrop-blur-xl shadow-2xl border-0 relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500" />
            
            <motion.div 
              className="mb-6 text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <motion.div 
                className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 rounded-full mb-4 relative"
                animate={{
                  rotate: [0, 360],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                }}
              >
                <Gift className="w-10 h-10 text-white" />
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500"
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
              <h1 className="bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                {RAFFLE.NAME}
              </h1>
              <p className="text-gray-600">Ingresa tu número de referencia para participar</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Label htmlFor="reference" className="flex items-center gap-2 mb-2 text-gray-700">
                  <Ticket className="w-4 h-4 text-purple-500" />
                  Número de Referencia
                </Label>
                <Input
                  id="reference"
                  type="text"
                  placeholder="000000"
                  value={reference}
                  onChange={(e) => setReference(e.target.value.slice(0, REFERENCE.LENGTH))}
                  maxLength={REFERENCE.LENGTH}
                  className="text-center text-2xl tracking-widest border-2 focus:border-purple-500 transition-colors"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Label htmlFor="name" className="flex items-center gap-2 mb-2 text-gray-700">
                  <User className="w-4 h-4 text-cyan-500" />
                  Nombre Completo
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border-2 focus:border-cyan-500 transition-colors"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Label htmlFor="cedula" className="flex items-center gap-2 mb-2 text-gray-700">
                  <CreditCard className="w-4 h-4 text-pink-500" />
                  Cédula
                </Label>
                <Input
                  id="cedula"
                  type="text"
                  placeholder="V-12345678"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  className="border-2 focus:border-pink-500 transition-colors"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Label htmlFor="phone" className="flex items-center gap-2 mb-2 text-gray-700">
                  <Phone className="w-4 h-4 text-purple-500" />
                  Teléfono
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+58 412-1234567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="border-2 focus:border-purple-500 transition-colors"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
              >
                <Label htmlFor="email" className="flex items-center gap-2 mb-2 text-gray-700">
                  <Mail className="w-4 h-4 text-cyan-500" />
                  Correo Electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="correo@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-2 focus:border-cyan-500 transition-colors"
                />
              </motion.div>

              {(error || validationError) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="w-full"
                >
                  <Alert variant="destructive" className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <AlertDescription className="text-red-900 text-center flex-1">
                      {error || validationError}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-600 hover:via-purple-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all"
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        <Sparkles className="w-4 h-4 mr-2" />
                      </motion.div>
                      Validando...
                    </>
                  ) : (
                    'Continuar'
                  )}
                </Button>
              </motion.div>
            </form>
          </Card>
        </motion.div>

        {/* Instrucciones */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Card className="p-6 bg-white/95 backdrop-blur-xl shadow-2xl border-0 hover:shadow-3xl transition-shadow">
              <div className="flex items-start gap-3 mb-4">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Info className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                </motion.div>
                <div>
                  <h2 className="bg-gradient-to-r from-cyan-600 to-purple-600 bg-clip-text text-transparent mb-2">
                    Instrucciones
                  </h2>
                  <ul className="space-y-2 text-gray-700">
                    <motion.li 
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                    >
                      <span className="text-cyan-500 mt-1">•</span>
                      <span>Ingresa tu número de referencia de {REFERENCE.LENGTH} dígitos que recibiste al realizar tu pago</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 }}
                    >
                      <span className="text-purple-500 mt-1">•</span>
                      <span>Completa todos tus datos personales correctamente</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 }}
                    >
                      <span className="text-pink-500 mt-1">•</span>
                      <span>Genera tus números de la rifa de forma automática</span>
                    </motion.li>
                    <motion.li 
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <span className="text-cyan-500 mt-1">•</span>
                      <span>Descarga y guarda tu comprobante de participación</span>
                    </motion.li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="p-6 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 text-white shadow-2xl border-0 relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{
                  x: ['-100%', '100%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <div className="relative z-10">
                <h3 className="mb-3">Fecha del Sorteo</h3>
                <p className="text-3xl mb-1">{RAFFLE.DATE_FORMATTED}</p>
                <p className="text-cyan-100">{RAFFLE.TIME_FORMATTED} (Hora Local)</p>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <Card className="p-6 bg-white/95 backdrop-blur-xl shadow-2xl border-0">
              <h3 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Información de Contacto
              </h3>
              <div className="space-y-2 text-gray-700">
                <motion.p 
                  className="flex items-center gap-2"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Phone className="w-4 h-4 text-purple-500" />
                  {CONTACT.PHONE}
                </motion.p>
                <motion.p 
                  className="flex items-center gap-2"
                  whileHover={{ x: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Mail className="w-4 h-4 text-pink-500" />
                  {CONTACT.EMAIL}
                </motion.p>
              </div>
              <motion.div 
                className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border-l-4 border-purple-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p className="text-purple-900">
                  ⚠️ Guarda tus tickets en un lugar seguro. Los necesitarás para reclamar tu premio.
                </p>
              </motion.div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}