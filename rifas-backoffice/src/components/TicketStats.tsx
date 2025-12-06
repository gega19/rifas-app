import { Card } from '@/components/ui/card';
import { motion } from 'motion/react';
import { Ticket, Check, X } from 'lucide-react';
import type { TicketStats } from '@/types';

interface TicketStatsProps {
  stats: TicketStats;
}

export function TicketStats({ stats }: TicketStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-6 bg-white border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Tickets</p>
              <p className="text-3xl font-bold">{stats.total.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 bg-opacity-10">
              <Ticket className="w-6 h-6 text-cyan-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-6 bg-white border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Usados</p>
              <p className="text-3xl font-bold text-red-600">{stats.used.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-100">
              <X className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6 bg-white border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Disponibles</p>
              <p className="text-3xl font-bold text-green-600">{stats.available.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <Check className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6 bg-white border-0 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Porcentaje Usado</p>
              <p className="text-3xl font-bold">{stats.percentageUsed}%</p>
            </div>
            <div className="w-16 h-16 relative">
              <svg className="transform -rotate-90 w-16 h-16">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                  strokeDasharray={`${(stats.percentageUsed / 100) * 175.9} 175.9`}
                  className="text-purple-600"
                />
              </svg>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}




