import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon: LucideIcon;
  color: string;
  trend?: Array<{ value: number }>;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color,
  trend 
}) => {
  const getTrendDirection = () => {
    if (!trend || trend.length < 2) return 'neutral';
    const first = trend[0].value;
    const last = trend[trend.length - 1].value;
    return last > first ? 'up' : last < first ? 'down' : 'neutral';
  };

  const trendDirection = getTrendDirection();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-sm font-medium ${
                change.type === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
              </span>
              <span className="text-sm text-gray-500 ml-1">vs {change.period}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col items-end">
          <div 
            className="p-3 rounded-lg"
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
          
          {trend && trend.length > 1 && (
            <div className="mt-2 flex items-center">
              <svg width="40" height="20" className="overflow-visible">
                <polyline
                  fill="none"
                  stroke={trendDirection === 'up' ? '#10B981' : trendDirection === 'down' ? '#EF4444' : '#6B7280'}
                  strokeWidth="2"
                  points={trend.map((point, index) => 
                    `${(index / (trend.length - 1)) * 35},${20 - (point.value / Math.max(...trend.map(t => t.value))) * 15}`
                  ).join(' ')}
                />
              </svg>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default MetricCard;