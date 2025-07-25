import { useState } from 'react';

const AVAILABLE_METRICS = [
  'status',
  'efficiency',
  'speed',
  'temperature',
  'fill_level',
  'error_rate',
  'uptime',
  'collected_count',
  'pressure',
  'vibration',
  'power_consumption',
  'maintenance_due',
  'quality_score'
];

interface AddMetricDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (metric: string) => void;
  currentMetrics: Set<string>;
}

export default function AddMetricDialog({ isOpen, onClose, onAdd, currentMetrics }: AddMetricDialogProps) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const availableMetrics = AVAILABLE_METRICS.filter(
    metric => !currentMetrics.has(metric) && 
    metric.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-96 border border-gray-700 shadow-xl">
        <h3 className="text-lg font-semibold mb-4">Add Metric</h3>
        
        <input
          type="text"
          placeholder="Search metrics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white mb-4"
        />

        <div className="max-h-60 overflow-y-auto space-y-2">
          {availableMetrics.map(metric => (
            <button
              key={metric}
              onClick={() => {
                onAdd(metric);
                onClose();
              }}
              className="w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors flex items-center justify-between group"
            >
              <span className="text-gray-300 capitalize">{metric.replace(/_/g, ' ')}</span>
              <i className="ri-add-line text-gray-500 group-hover:text-blue-400"></i>
            </button>
          ))}
          {availableMetrics.length === 0 && (
            <p className="text-gray-500 text-center py-2">No metrics available</p>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
