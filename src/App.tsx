import { useEffect, useState, useRef } from 'react';
import {
  Engine,
  Scene,
  Vector3,
  Color3,
  Color4,
  Mesh,
  AbstractMesh,
  ArcRotateCamera,
  ActionManager,
  ExecuteCodeAction,
  DirectionalLight,
  HemisphericLight,
  StandardMaterial,
  Material
} from '@babylonjs/core';
import '@babylonjs/loaders/glTF';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import MetricsPanel from './components/MetricsPanel';
import ConfigPanel from './components/ConfigPanel';
import { HistoricalCharts } from './components/HistoricalCharts';
import './App.css';

function App() {
  const [componentData, setComponentData] = useState<{ [key: string]: any }>({});
  const [visibleMetrics, setVisibleMetrics] = useState<Set<string>>(new Set(['status', 'efficiency', 'speed', 'temperature', 'collected_count']));
  const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);
  const [lineEfficiency, setLineEfficiency] = useState<number>(0);
  const renderCanvas = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const [modelLoaded, setModelLoaded] = useState<boolean>(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [selectedComponentForHistory, setSelectedComponentForHistory] = useState<string | null>(null);

  // Scene setup effect
  useEffect(() => {
    if (!renderCanvas.current) return;

    const engine = new Engine(renderCanvas.current, true);
    const scene = new Scene(engine);

    engineRef.current = engine;
    sceneRef.current = scene;

    // Set scene background color
    scene.clearColor = new Color4(0.1, 0.1, 0.2, 1);

    // Camera setup
    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 3,
      25,
      Vector3.Zero(),
      scene
    );
    camera.attachControl(renderCanvas.current, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 50;
    camera.setTarget(new Vector3(0, 2, 0));

    // Create a brighter light
    const light = new DirectionalLight("light", new Vector3(-1, -2, -1), scene);
    light.intensity = 2.0;  // Increased intensity
    const hemisphericLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
    hemisphericLight.intensity = 1.0;  // Increased ambient light

    // Load the model
    SceneLoader.ImportMesh(
      "",
      `${window.location.origin}/models/`,
      "drumsense.glb",
      scene,
      (meshes) => {
        console.log("Model loaded successfully. Meshes:", meshes.map(m => ({
          name: m.name,
          lowercaseName: m.name.toLowerCase(),
          id: m.id,
          hasParent: !!m.parent,
          parentName: m.parent?.name
        })));
        
        // Log available component data for debugging
        console.log("Available component data:", componentData);
        
        setModelLoaded(true);
        
        // Scale and position the model
        const rootMesh = meshes[0];
        rootMesh.scaling = new Vector3(8.0, 8.0, 8.0);
        rootMesh.position = new Vector3(0, 2, 0);

        // Add hover effects
        scene.meshes.forEach((mesh) => {
          if (mesh.name.includes("__root__")) return;

          mesh.actionManager = new ActionManager(scene);
          
          mesh.actionManager.registerAction(
            new ExecuteCodeAction(
              ActionManager.OnPointerOverTrigger,
              () => setHoveredMesh(mesh.name)
            )
          );

          mesh.actionManager.registerAction(
            new ExecuteCodeAction(
              ActionManager.OnPointerOutTrigger,
              () => setHoveredMesh(null)
            )
          );
        });

        console.log("Available meshes:", meshes.map(m => m.name).join(", "));
      },
      (event) => {
        console.log("Loading progress:", event);
      },
      (_, message) => {
        console.error("Error loading model:", message);
        setModelError(message);
      }
    );

    // Only render the scene in the render loop
    engine.runRenderLoop(() => {
      scene.render();
    });

    return () => {
      scene.dispose();
      engine.dispose();
    };
  }, []); // Only run once on mount

  // Separate effect for material updates
  useEffect(() => {
    if (!sceneRef.current || !modelLoaded) return;

    // Debug log current component states
    console.log("Component Data:", componentData);
    console.log("Available meshes:", sceneRef.current.meshes.map(m => ({
      name: m.name,
      lowercaseName: m.name.toLowerCase()
    })));

  // Log stopped components for debugging
  Object.entries(componentData).forEach(([name, data]) => {
    if (data?.status === 'stopped') {
      console.log("Found stopped component:", name, data);
    }
  });

  // Update all mesh materials
    sceneRef.current.meshes.forEach((mesh: AbstractMesh) => {
      if (!(mesh instanceof Mesh) || mesh.name.includes("__root__")) return;

      // Debug: Log all meshes being processed
      console.log("Processing mesh:", {
        name: mesh.name,
        parent: mesh.parent?.name,
        hasChildren: mesh.getChildren().length > 0
      });

      // Direct mapping of mesh names to component keys
      const meshToComponent: { [key: string]: string } = {
        'conveyor': 'conveyor',
        'filler': 'filler',
        'control': 'control',
        'collector': 'collector'
      };

      // Get the mesh name in lowercase
      const meshName = mesh.name.toLowerCase();
      
      // Check if this mesh is one of our monitored components
      if (!meshToComponent[meshName] || !componentData[meshToComponent[meshName]]) {
        console.log("Skipping mesh:", mesh.name, "- No matching component");
        return;
      }
      
      const matchingComponent = meshToComponent[meshName];

      console.log("Found matching component:", {
        meshName: mesh.name,
        component: matchingComponent,
        status: componentData[matchingComponent].status
      });

      const componentState = componentData[matchingComponent];

      console.log(`Processing mesh ${mesh.name}:`, {
        meshName: mesh.name,
        componentStatus: componentState.status,
        isHovered: hoveredMesh === mesh.name,
        hasMaterial: !!mesh.material,
        materialType: mesh.material ? mesh.material.constructor.name : 'none',
        hasScene: !!sceneRef.current
      });

      console.log(`Comstate`, !!mesh.material );

      if (mesh.material && sceneRef.current) {
        console.log("Material details:", {
          meshName: mesh.name,
          materialType: mesh.material.constructor.name,
          materialProperties: Object.keys(mesh.material)
        });

        // Create a clone of the material for this mesh if it doesn't already have one
        if (!mesh.material.name.includes('_clone')) {
          const clonedMaterial = mesh.material.clone(`${mesh.name}_material_clone`);
          mesh.material = clonedMaterial;
        }

        // Only modify the material if the mesh is stopped or hovered
        if (mesh.material instanceof StandardMaterial) {
          if (componentState.status === 'stopped') {
            mesh.material.emissiveColor = new Color3(1, 0, 0);
            mesh.material.diffuseColor = mesh.material.diffuseColor.clone();  // Preserve original color
            console.log(`${mesh.name} is STOPPED - Applied red overlay (StandardMaterial)`);
          } else if (hoveredMesh === mesh.name) {
            mesh.material.emissiveColor = new Color3(1, 1, 0);
            mesh.material.diffuseColor = mesh.material.diffuseColor.clone();  // Preserve original color
            console.log(`${mesh.name} is HOVERED - Applied yellow overlay (StandardMaterial)`);
          } else {
            mesh.material.emissiveColor = new Color3(0, 0, 0);
          }
          mesh.material.useEmissiveAsIllumination = true;
        } else {
          // Handle PBRMaterial or other material types
          const material = mesh.material as any;
          if ('emissiveColor' in material) {
            if (componentState.status === 'stopped') {
              material.emissiveColor = new Color3(1, 0, 0);
              console.log(`${mesh.name} is STOPPED - Applied red overlay (PBRMaterial)`);
            } else if (hoveredMesh === mesh.name) {
              material.emissiveColor = new Color3(1, 1, 0);
              console.log(`${mesh.name} is HOVERED - Applied yellow overlay (PBRMaterial)`);
            } else {
              material.emissiveColor = new Color3(0, 0, 0);
            }
            if ('useEmissiveAsIllumination' in material) {
              material.useEmissiveAsIllumination = true;
            }
          }
        }
      }
    });
  }, [componentData, hoveredMesh, modelLoaded]);

  // Fetch component data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5000/status');
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
      {/* Left Column */}
      <div className="w-1/4 flex flex-col border-r border-gray-800">
        {/* Line Efficiency Score */}
        <div className="p-4 border-b border-gray-800 bg-gray-900">
          <h2 className="text-xl font-bold mb-2">Line Efficiency Score</h2>
          <div className={`text-4xl font-bold ${
            lineEfficiency >= 0.8 ? 'text-green-500' :
            lineEfficiency >= 0.6 ? 'text-yellow-500' : 'text-red-500'
          }`}>
            {(lineEfficiency * 100).toFixed(1)}%
          </div>
          <button
            onClick={() => setSelectedComponentForHistory(null)}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300"
          >
            View History
          </button>
        </div>

        {/* Configuration Panel */}
        <div className="flex-1 overflow-y-auto">
          <ConfigPanel 
            visibleMetrics={visibleMetrics} 
            onMetricsChange={setVisibleMetrics}
            onViewHistory={setSelectedComponentForHistory}
          />
        </div>
      </div>

      {/* Right Column */}
      <div className="flex-1 flex flex-col">
        {/* 3D Scene */}
        <div className="flex-1 relative bg-gray-800">
          <canvas ref={renderCanvas} className="w-full h-full" />
          {!modelLoaded && !modelError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xl">Loading 3D model...</div>
            </div>
          )}
          {modelError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-xl text-red-500">Failed to load 3D model: {modelError}</div>
            </div>
          )}
          {hoveredMesh && (
            <div className="absolute top-4 right-4 bg-black bg-opacity-75 p-2 rounded">
              <div className="flex justify-between items-center mb-1">
                <div className="font-bold">{hoveredMesh}</div>
                <button
                  onClick={() => setSelectedComponentForHistory(hoveredMesh.toLowerCase())}
                  className="text-sm text-blue-400 hover:text-blue-300 ml-4"
                >
                  History
                </button>
              </div>
              {componentData[hoveredMesh.toLowerCase()] && (
                <div className="text-sm">
                  {Object.entries(componentData[hoveredMesh.toLowerCase()]).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 gap-2">
                      <span className="text-gray-400">{key}:</span>
                      <span>{formatMetricValue(key, value)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Metrics Panel */}
        <div className="h-1/3 bg-gray-900">
          <MetricsPanel 
            componentData={componentData} 
            visibleMetrics={visibleMetrics}
          />
        </div>
      </div>

      {/* Historical Charts Modal */}
      {selectedComponentForHistory !== null && (
        <HistoricalCharts
          selectedComponent={selectedComponentForHistory}
          onClose={() => setSelectedComponentForHistory(null)}
        />
      )}
    </div>
  );
}

export default App;
