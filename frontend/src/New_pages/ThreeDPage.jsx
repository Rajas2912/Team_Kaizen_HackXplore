import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
 // Adjust the import path as needed
import { OnlyModel } from '../3DModels/OnlyModel';

function ThreeDPage() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />
        <Suspense fallback={null}>
          <OnlyModel></OnlyModel>
        </Suspense>
        <OrbitControls />
      </Canvas>
    </div>
  );
}

export default ThreeDPage;