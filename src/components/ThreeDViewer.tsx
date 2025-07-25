import { useEffect, useRef, useState } from 'react';
import { Engine, Scene, SceneLoader, Vector3, Color4, ArcRotateCamera, DirectionalLight, HemisphericLight, ActionManager, ExecuteCodeAction, StandardMaterial, Color3, Mesh, AbstractMesh } from '@babylonjs/core';
import '@babylonjs/loaders/glTF';

interface ThreeDViewerProps {
  className?: string;
  onMeshHover?: (meshName: string | null) => void;
  componentData: { [key: string]: any };
}

export default function ThreeDViewer({ className = '', onMeshHover, componentData }: ThreeDViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Engine | null>(null);
  const sceneRef = useRef<Scene | null>(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [hoveredMesh, setHoveredMesh] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true);
    engineRef.current = engine;

    const scene = new Scene(engine);
    sceneRef.current = scene;
    scene.clearColor = new Color4(0.1, 0.1, 0.2, 1);

    const camera = new ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 25, Vector3.Zero(), scene);
    camera.setTarget(Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 10;
    camera.upperRadiusLimit = 50;

    const light = new DirectionalLight("light", new Vector3(-1, -2, -1), scene);
    light.intensity = 2.0;

    const hemisphericLight = new HemisphericLight("hemiLight", new Vector3(0, 1, 0), scene);
    hemisphericLight.intensity = 1.0;

    // Load the bottling machine model
    SceneLoader.ImportMesh(
      "",
      `${window.location.origin}/models/`,
      "drumsense.glb",
      scene,
      (meshes) => {
        console.log("Model loaded successfully");
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
              () => {
                setHoveredMesh(mesh.name);
                onMeshHover && onMeshHover(mesh.name);
              }
            )
          );

          mesh.actionManager.registerAction(
            new ExecuteCodeAction(
              ActionManager.OnPointerOutTrigger,
              () => {
                setHoveredMesh(null);
                onMeshHover && onMeshHover(null);
              }
            )
          );
        });
      }
    );

    engine.runRenderLoop(() => {
      scene.render();
    });

    const handleResize = () => {
      engine.resize();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      scene.dispose();
      engine.dispose();
    };
  }, [onMeshHover]);

  // Update materials based on component data
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

    // Direct mapping of mesh names to component keys
    const meshToComponent: { [key: string]: string } = {
      'conveyor': 'conveyor',
      'filler': 'filler',
      'control': 'control',
      'collector': 'collector'
    };

    // Update all mesh materials
    sceneRef.current.meshes.forEach((mesh: AbstractMesh) => {
      if (!(mesh instanceof Mesh) || mesh.name.includes("__root__")) return;

      // Debug: Log all meshes being processed
      console.log("Processing mesh:", {
        name: mesh.name,
        parent: mesh.parent?.name,
        hasChildren: mesh.getChildren().length > 0
      });

      // Get the mesh name in lowercase
      const meshName = mesh.name.toLowerCase();
      
      // Check if this mesh is one of our monitored components
      if (!meshToComponent[meshName] || !componentData[meshToComponent[meshName]]) {
        console.log("Skipping mesh:", mesh.name, "- No matching component");
        return;
      }
      
      const matchingComponent = meshToComponent[meshName];
      const componentState = componentData[matchingComponent];

      console.log("Found matching component:", {
        meshName: mesh.name,
        component: matchingComponent,
        status: componentState.status
      });

      if (mesh.material && sceneRef.current) {
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
  }, [componentData, modelLoaded, hoveredMesh]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ outline: 'none' }}
      />
      {!modelLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80">
          <div className="text-white">Loading 3D model...</div>
        </div>
      )}
      <div className="absolute top-4 left-4 bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 border border-gray-700">
        <h3 className="text-sm font-medium text-white mb-2">3D View Controls</h3>
        <div className="text-xs text-gray-300 space-y-1">
          <div>• Mouse: Rotate view</div>
          <div>• Wheel: Zoom in/out</div>
          <div>• Right-click: Pan</div>
        </div>
      </div>
    </div>
  );
}
