import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface HistoricalData {
  timestamp: string;
  efficiency: number;
  component_states: Record<string, any>;
}

interface ComponentHistory {
  timestamp: string;
  status: string;
  efficiency: number;
  speed?: number;
  temperature?: number;
  collected_count?: number;
}

interface Props {
  selectedComponent: string | null;
  onClose: () => void;
}

export const HistoricalCharts: React.FC<Props> = ({ selectedComponent, onClose }) => {
  const [efficiencyHistory, setEfficiencyHistory] = useState<HistoricalData[]>([]);
  const [componentHistory, setComponentHistory] = useState<ComponentHistory[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedComponent) {
        // Fetch overall efficiency history
        const response = await fetch('http://localhost:5000/efficiency/history');
        const data = await response.json();
        setEfficiencyHistory(data);
      } else {
        // Fetch specific component history
        const response = await fetch(`http://localhost:5000/history/${selectedComponent}`);
        const data = await response.json();
        setComponentHistory(data);
      }
    };

    fetchData();
  }, [selectedComponent]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-4/5 h-4/5 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {selectedComponent ? `${selectedComponent} History` : 'Overall Efficiency History'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="flex-1">
          {!selectedComponent ? (
            // Overall efficiency chart
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={efficiencyHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                  stroke="#666"
                />
                <YAxis
                  domain={[0, 1]}
                  tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  stroke="#666"
                />
                <Tooltip
                  formatter={(value: number) => `${(value * 100).toFixed(1)}%`}
                  labelFormatter={(label) => new Date(label).toLocaleString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="efficiency"
                  stroke="#8884d8"
                  name="Line Efficiency"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            // Component-specific metrics
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={componentHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis
                  dataKey="timestamp"
                  tickFormatter={(time) => new Date(time).toLocaleTimeString()}
                  stroke="#666"
                />
                <YAxis stroke="#666" />
                <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
                <Legend />
                {componentHistory[0]?.efficiency !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="efficiency"
                    stroke="#8884d8"
                    name="Efficiency"
                    dot={false}
                  />
                )}
                {componentHistory[0]?.speed !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="speed"
                    stroke="#82ca9d"
                    name="Speed (rpm)"
                    dot={false}
                  />
                )}
                {componentHistory[0]?.temperature !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="temperature"
                    stroke="#ffc658"
                    name="Temperature"
                    dot={false}
                  />
                )}
                {componentHistory[0]?.collected_count !== undefined && (
                  <Line
                    type="monotone"
                    dataKey="collected_count"
                    stroke="#ff7300"
                    name="Items Collected"
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
};
