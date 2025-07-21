import React from 'react';

interface ConfigPanelProps {
  visibleMetrics: Set<string>;
  onMetricsChange: (metrics: Set<string>) => void;
  onViewHistory: (component: string | null) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ visibleMetrics, onMetricsChange, onViewHistory }) => {
  const componentMetrics = [
    { id: 'filler', label: 'Filler Station' },
    { id: 'conveyor', label: 'Conveyor Belt' },
    { id: 'control', label: 'Control Unit' },
    { id: 'collector', label: 'Collector' }
  ];

  const availableMetrics = [
    { id: 'status', label: 'Status' },
    { id: 'efficiency', label: 'Efficiency' },
    { id: 'speed', label: 'Speed (units/min)' },
    { id: 'temperature', label: 'Temperature (°C)' },
    { id: 'fill_level', label: 'Fill Level (%)' },
    { id: 'error_rate', label: 'Error Rate (%)' },
    { id: 'uptime', label: 'Uptime (%)' }
  ];

  const handleToggleMetric = (metricId: string) => {
    const newMetrics = new Set(visibleMetrics);
    if (newMetrics.has(metricId)) {
      newMetrics.delete(metricId);
    } else {
      newMetrics.add(metricId);
    }
    onMetricsChange(newMetrics);
  };

  return (
    <div className="bg-gray-800 text-white p-4 h-full overflow-y-auto">
      <h2 className="text-lg font-bold mb-4">Component Configuration</h2>
      
      {/* View History Buttons */}
      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Historical Data</h3>
        <div className="space-y-2">
          <button
            onClick={() => onViewHistory(null)}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
          >
            View Overall Efficiency History
          </button>
          <div className="border-t border-gray-700 my-2"></div>
          {componentMetrics.map(component => (
            <button
              key={component.id}
              onClick={() => onViewHistory(component.id)}
              className="w-full py-1.5 px-3 bg-blue-600/20 hover:bg-blue-600/40 rounded text-sm flex items-center justify-between group"
            >
              <span>{component.label}</span>
              <span className="text-blue-400 group-hover:text-blue-300">View History →</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-md font-semibold mb-2">Components</h3>
        <div className="space-y-2 mb-4">
          {componentMetrics.map(component => (
            <label key={component.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={visibleMetrics.has(component.id)}
                onChange={() => handleToggleMetric(component.id)}
                className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-600 bg-gray-700"
              />
              <span className="text-sm">{component.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-md font-semibold mb-2">Metrics</h3>
        <div className="space-y-2">
          {availableMetrics.map(metric => (
            <label key={metric.id} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={visibleMetrics.has(metric.id)}
                onChange={() => handleToggleMetric(metric.id)}
                className="form-checkbox h-4 w-4 text-blue-500 rounded border-gray-600 bg-gray-700"
              />
              <span className="text-sm">{metric.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ConfigPanel;
