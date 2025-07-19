// import { useEffect, useRef, useState } from "react";
// import { Engine, Scene, ArcRotateCamera, Vector3, HemisphericLight, SceneLoader, StandardMaterial, Color3, Mesh } from "@babylonjs/core";
// import "@babylonjs/loaders/glTF";

// interface ComponentStatus {
//   status: 'operational' | 'stopped' | 'warning';
//   efficiency: number;
//   [key: string]: any;
// }

// interface FactoryStatus {
//   [key: string]: ComponentStatus;
// }

// export const TwinViewer = () => {
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const sceneRef = useRef<Scene | null>(null);
//   const meshMapRef = useRef<Map<string, Mesh>>(new Map());
//   const [factoryStatus, setFactoryStatus] = useState<FactoryStatus>({});

//   useEffect(() => {
//     if (!canvasRef.current) return;

//     const engine = new Engine(canvasRef.current, true);
//     const scene = new Scene(engine);
//     sceneRef.current = scene;

//     // Camera setup
//     const camera = new ArcRotateCamera("camera", 0, Math.PI / 3, 10, Vector3.Zero(), scene);
//     camera.setTarget(Vector3.Zero());
//     camera.attachControl(canvasRef.current, true);

//     // Lighting
//     new HemisphericLight("light", new Vector3(0, 1, 0), scene);

//     // Load the model
//     SceneLoader.ImportMesh("", "/models/", "simple_factory_line.glb", scene, (meshes) => {
//       console.log("All loaded meshes:", meshes.map(m => m.name)); // Debug log all mesh names
      
//       meshes.forEach((mesh) => {
//         // Store meshes by their names for later highlighting
//         if (mesh instanceof Mesh) {
//           const meshName = mesh.name.toLowerCase();
//           meshMapRef.current.set(meshName, mesh);
//           console.log("Mapped mesh:", meshName); // Debug log each mapped mesh
//         }
//       });

//       // Adjust camera position after loading
//       camera.setPosition(new Vector3(0, 5, -10));
//     });

//     // Start the render loop
//     engine.runRenderLoop(() => {
//       scene.render();
//     });

//     // Cleanup
//     return () => {
//       engine.dispose();
//     };
//   }, []);

//   // Update component colors based on status
//   useEffect(() => {
//     if (!sceneRef.current) return;

//     // Update each component's material based on its status
//     Object.entries(factoryStatus).forEach(([component, status]) => {
//       console.log(`Updating ${component} status:`, status.status); // Debug log component status
//       const mesh = meshMapRef.current.get(component.toLowerCase());
//       console.log(`Found mesh for ${component}:`, !!mesh); // Debug if mesh was found
      
//       if (mesh && sceneRef.current) {
//         const material = new StandardMaterial(component + "Material", sceneRef.current);
        
//         // Set color based on status
//         if (status.status === 'stopped') {
//           material.diffuseColor = new Color3(1, 0, 0); // Red for stopped
//         } else if (status.status === 'warning') {
//           material.diffuseColor = new Color3(1, 0.6, 0); // Orange for warning
//         } else {
//           material.diffuseColor = new Color3(0.7, 0.7, 0.7); // Default gray
//         }
        
//         mesh.material = material;
//       }
//     });
//   }, [factoryStatus]);

//   // Fetch status updates
//   useEffect(() => {
//     const fetchStatus = async () => {
//       try {
//         const response = await fetch('http://localhost:5000/api/status');
//         const data = await response.json();
//         setFactoryStatus(data);
//       } catch (error) {
//         console.error('Error fetching status:', error);
//       }
//     };

//     const interval = setInterval(fetchStatus, 1000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <div className="w-full h-full">
//       <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
//     </div>
//   );
// };
