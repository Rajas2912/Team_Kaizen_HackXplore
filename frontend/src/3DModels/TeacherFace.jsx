// components/TeacherFace.js
import React from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { Teacher_model } from "./Teacher_model";
import { useEffect } from "react";
import { OnlyModel } from "./OnlyModel";


const cameraPosition1 = [-0.02211314776077668, -0.35060630676144456, 
  0.3876243870952165];  
function CameraLogger() {
  const { camera } = useThree();

  useEffect(() => {
    const logCameraPosition = () => {
      console.log("Camera Position:", camera.position);
    };

    // Log camera position on every frame
    const interval = setInterval(logCameraPosition, 1000); // Log every second

    return () => clearInterval(interval); // Cleanup interval on unmount
  }, [camera]);

  return null; // This component doesn't render anything
}

export default function TeacherFace() {
  return (
    <Canvas
      camera={{ position: cameraPosition1, fov: 55 }}
      style={{ width: "600px", height: "400px" }}
    >
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
      <pointLight position={[-10, -10, -10]} />
      {/* <Teacher_model position={[0, -0.9, 0]} scale={[0.5, 0.5, 0.5]} /> */}
      <OnlyModel position={[0, -0.9, 0]} scale={[0.5, 0.5, 0.5]}></OnlyModel>
    <OrbitControls></OrbitControls>
    <CameraLogger></CameraLogger>
    </Canvas>
  );
}
