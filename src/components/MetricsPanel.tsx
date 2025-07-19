import React from 'react';

interface MetricsPanelProps {
  componentData: {
    [key: string]: any;
  };
  visibleMetrics: Set<string>;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ componentData, visibleMetrics }) => {
  const componentOrder = ['filler', 'conveyor', 'control', 'collector'];
  const componentLabels: { [key: string]: string } = {
    filler: 'Filler Station',
    conveyor: 'Conveyor Belt',
    control: 'Control Unit',
    collector: 'Collector'
  };

  const formatMetricValue = (key: string, value: any) => {
    if (typeof value === 'number') {
      switch (key) {
        case 'efficiency':
        case 'fill_level':
        case 'error_rate':
        case 'uptime':
          return `${(value * 100).toFixed(1)}%`;
        case 'speed':
          return `${value.toFixed(1)} u/min`;
        case 'temperature':
          return `${value.toFixed(1)}°C`;
        case 'collected_count':
          return value.toLocaleString();
        default:
          return value.toFixed(1);
      }
    }
    return value;
  };

  const getMetricLabel = (key: string): string => {
    const labels: { [key: string]: string } = {
      status: 'Status',
      efficiency: 'Efficiency',
      speed: 'Speed',
      temperature: 'Temperature',
      fill_level: 'Fill Level',
      error_rate: 'Error Rate',
      uptime: 'Uptime',
      collected_count: 'Items Collected'
    };
    return labels[key] || key;
  };

  return (
    <div className="text-white p-4 h-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {componentOrder.map(componentId => {
          const data = componentData[componentId];
          if (!data) return null;

          return (
            <div key={componentId} className="bg-gray-800 rounded-lg p-3">
              <h3 className="text-sm font-semibold capitalize mb-2 flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  data.status === 'operational' ? 'bg-green-500' : 
                  data.status === 'stopped' ? 'bg-red-500' : 'bg-yellow-500'
                }`} />
                {componentLabels[componentId]}
              </h3>
              <div className="grid grid-cols-2 gap-1 text-xs">
                {Object.entries(data).map(([key, value]) => {
                  if (!visibleMetrics.has(key)) return null;
                  return (
                    <React.Fragment key={key}>
                      <div className="text-gray-400">
                        {getMetricLabel(key)}
                      </div>
                      <div className={`${
                        key === 'status' ? (
                          value === 'operational' ? 'text-green-500' : 
                          value === 'stopped' ? 'text-red-500' : 'text-yellow-500'
                        ) : ''
                      }`}>
                        {formatMetricValue(key, value)}
                      </div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MetricsPanel;
