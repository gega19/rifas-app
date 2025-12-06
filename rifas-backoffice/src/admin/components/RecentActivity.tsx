import { Card } from '@/components/ui/card';
import { motion } from 'motion/react';
import { User, Ticket, FileText, Clock } from 'lucide-react';
import type { RecentActivity as RecentActivityType } from '@/types';

interface RecentActivityProps {
  activities: RecentActivityType[];
}

const activityIcons = {
  participant_registered: User,
  reference_created: FileText,
  reference_used: Ticket,
};

const activityLabels = {
  participant_registered: 'Participante registrado',
  reference_created: 'Referencia creada',
  reference_used: 'Referencia usada',
};

export function RecentActivity({ activities }: RecentActivityProps) {
  if (activities.length === 0) {
    return (
      <Card className="p-6 bg-white border-0 shadow-lg">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Actividad Reciente</h3>
        <p className="text-gray-500 text-center py-8">No hay actividad reciente</p>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-white border-0 shadow-lg">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Actividad Reciente</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type] || Clock;
          const label = activityLabels[activity.type] || activity.type;
          
          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500 bg-opacity-10">
                <Icon className="w-4 h-4 text-cyan-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-600 mt-1">{activity.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Clock className="w-3 h-3 text-gray-400" />
                  <span className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString('es-VE')}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}




