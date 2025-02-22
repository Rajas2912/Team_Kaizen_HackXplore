import React, { useState } from 'react';
import Mindmap from '../../pages_rajas/Mindmap';
 // Import the Mindmap component

const SelfStudy = () => {
  const [showMindmap, setShowMindmap] = useState(false); // State to control mindmap visibility

  return (
    <div>
      {/* Create Mindmap Button */}
      <button
        onClick={() => setShowMindmap(!showMindmap)} // Toggle mindmap visibility
        style={{
          padding: '10px 20px',
          backgroundColor: '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        {showMindmap ? 'Hide Mindmap' : 'Create Mindmap'}
      </button>

      {/* Conditionally Render the Mindmap */}
      {showMindmap && (
        <div style={{ marginTop: '20px' }}>
          <Mindmap></Mindmap>
        </div>
      )}
    </div>
  );
};

export default SelfStudy;