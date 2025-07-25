import { useState, useEffect } from 'react';
import MetricsPanel from './components/MetricsPanel';
import ChatBot from './components/ChatBot';
import ThreeDViewer from './components/ThreeDViewer';
import SideMenu from './components/SideMenu';
import EfficiencyDonut from './components/EfficiencyDonut';
import AddMetricDialog from './components/AddMetricDialog';
import './App.css';

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
] as const;

type MetricType = typeof AVAILABLE_METRICS[number];

function App() {
  const [componentData, setComponentData] = useState<{ [key: string]: any }>({});
  const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [lineEfficiency, setLineEfficiency] = useState<number>(0);
  const [showAddMetric, setShowAddMetric] = useState(false);
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(new Set([
    'status',
    'efficiency',
    'speed',
    'temperature',
    'fill_level',
    'error_rate',
    'uptime',
    'collected_count'
  ]));

  // Fetch component data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5050/status');
        const data = await response.json();
        const { line_efficiency, ...components } = data;
        
        // Ensure speed values are always positive
        const processedComponents = Object.fromEntries(
          Object.entries(components).map(([key, value]: [string, any]) => {
            if (value && typeof value === 'object' && 'speed' in value) {
              return [key, { ...value, speed: Math.abs(value.speed) }];
            }
            return [key, value];
          })
        );
        
        setComponentData(processedComponents);
        setLineEfficiency(line_efficiency || 0);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);
    return () => clearInterval(interval);
  }, []);

  // Fetch component data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5050/status');
        const data = await response.json();
        const { line_efficiency, ...components } = data;
        
        // Ensure speed values are always positive
        const processedComponents = Object.fromEntries(
          Object.entries(components).map(([key, value]: [string, any]) => {
            if (value && typeof value === 'object' && 'speed' in value) {
              return [key, { ...value, speed: Math.abs(value.speed) }];
            }
            return [key, value];
          })
        );
        
        setComponentData(processedComponents);
        setLineEfficiency(line_efficiency || 0);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);  // Reduced update frequency to 2 seconds
    return () => clearInterval(interval);
  }, []);

  // Helper function to format metric values
  const formatMetricValue = (key: string, value: any) => {
    if (key === 'speed') {
      return `${Math.abs(Number(value)).toFixed(2)} rpm`;
    } else if (key === 'collected_count') {
      return `${Number(value).toLocaleString()} items`;
    } else if (key === 'last_change') {
      return new Date(Number(value) * 1000).toLocaleString();
    } else if ((key === 'timestamp' || key === 'last_changed') && (typeof value === 'string' || typeof value === 'number')) {
      return new Date(value).toLocaleString();
    } else if (typeof value === 'number') {
      return Number(value).toFixed(2);
    }
    return String(value);
  };

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Left Section - Efficiency Score and Metrics Control */}
      <div className="w-1/6 border-r border-gray-700 bg-gray-800/50 backdrop-blur-sm p-4 flex flex-col gap-4">
        {/* Efficiency Donut */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Production Efficiency</h2>
          <div className="flex flex-col items-center bg-gray-800 rounded-lg p-6 shadow-lg border border-gray-700">
            <EfficiencyDonut efficiency={lineEfficiency} />
            <p className="text-sm text-gray-400 mt-4 font-medium">Overall Line Efficiency</p>
          </div>
        </div>

        {/* Metrics Control */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Metrics Control</h2>
            <button
              onClick={() => setShowAddMetric(true)}
              className="text-xs text-gray-400 hover:text-white flex items-center gap-1 px-2 py-1 rounded border border-gray-600 hover:border-gray-500 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add</span>
            </button>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="space-y-2">
              {AVAILABLE_METRICS.map((metric) => (
                <label key={metric} className="flex items-center justify-between cursor-pointer group py-1">
                  <span className="text-sm text-gray-400 capitalize group-hover:text-gray-300">{metric.replace(/_/g, ' ')}</span>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      checked={visibleMetrics.has(metric)}
                      onChange={() => {
                        const newVisibleMetrics = new Set(visibleMetrics);
                        if (visibleMetrics.has(metric)) {
                          newVisibleMetrics.delete(metric);
                        } else {
                          newVisibleMetrics.add(metric);
                        }
                        setVisibleMetrics(newVisibleMetrics);
                      }}
                      className="sr-only"
                    />
                    <div className={`w-10 h-6 rounded-full transition-colors ${
                      visibleMetrics.has(metric) ? 'bg-blue-600' : 'bg-gray-600'
                    }`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform mt-1 ${
                        visibleMetrics.has(metric) ? 'translate-x-5' : 'translate-x-1'
                      }`} />
                    </div>
                  </div>
                </label>
              ))}
            </div>

          </div>
        </div>
      </div>

      {/* Center Section */}
      <div className="flex-1 flex flex-col">
        {/* 3D Viewer */}
        <div className="flex-1 relative">
          <ThreeDViewer 
            className="w-full h-full" 
            onMeshHover={setHoveredMesh}
            componentData={componentData}
          />
          {hoveredMesh && componentData[hoveredMesh.toLowerCase()] && (
            <div className="absolute top-4 right-4 bg-gray-900/80 backdrop-blur-sm p-4 rounded-lg border border-gray-700">
              <h3 className="font-medium text-white mb-2">{hoveredMesh}</h3>
              <div className="space-y-2">
                {Object.entries(componentData[hoveredMesh.toLowerCase()]).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <span className="text-gray-400">{key}:</span>
                    <span className="text-white">{formatMetricValue(key, value)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Metrics Panel */}
        <div className="h-2/5 p-4 bg-gray-900/50 backdrop-blur-sm border-t border-gray-700">
          <h2 className="text-xl font-semibold mb-4">Component Metrics</h2>
          <MetricsPanel componentData={componentData} visibleMetrics={visibleMetrics} />
        </div>
      </div>

      {/* Right Section - Chat Interface */}
      <div className="w-1/4 border-l border-gray-700">
        <ChatBot />
      </div>

      {/* Side Menu */}
      <SideMenu isOpen={isSideMenuOpen} onClose={() => setIsSideMenuOpen(false)} />

      {/* Settings Toggle */}
      <button
        onClick={() => setIsSideMenuOpen(true)}
        className="fixed bottom-4 left-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white w-8 h-8 flex items-center justify-center rounded-full shadow-lg transition-all cursor-pointer hover:scale-110 active:scale-95 hover:shadow-xl active:shadow-md"
      >
        <i className="ri-settings-3-line text-base transition-transform group-hover:rotate-45"></i>
      </button>

      {/* Add Metric Dialog */}
      {showAddMetric && (
        <AddMetricDialog
          onClose={() => setShowAddMetric(false)}
          onAdd={(metricId: string) => {
            const newVisibleMetrics = new Set(visibleMetrics);
            newVisibleMetrics.add(metricId);
            setVisibleMetrics(newVisibleMetrics);
          }}
          existingMetrics={visibleMetrics}
        />
      )}
    </div>
  );
}

export default App;
