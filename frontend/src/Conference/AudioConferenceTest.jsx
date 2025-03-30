import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import SimplePeer from 'simple-peer';

const AudioConferenceTest = () => {
  const [roomId, setRoomId] = useState('');
  const [isInRoom, setIsInRoom] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [localIP, setLocalIP] = useState('');
  
  const socket = useRef(null);
  const localStream = useRef(null);
  const audioContext = useRef(null);
  const peers = useRef({});

  // Get local IP address
  useEffect(() => {
    window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    const pc = new RTCPeerConnection({iceServers:[]});
    pc.createDataChannel('');
    pc.createOffer().then(pc.setLocalDescription.bind(pc));
    pc.onicecandidate = (ice) => {
      if (ice && ice.candidate && ice.candidate.candidate) {
        const myIP = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/.exec(ice.candidate.candidate)[1];
        setLocalIP(myIP);
        pc.onicecandidate = () => {};
      }
    };
  }, []);

  // Initialize Socket.IO connection
  useEffect(() => {
    // Use the local IP address of the machine running the Flask server
    const serverUrl = 'http://192.168.29.17:5000';
    socket.current = io(serverUrl);
    
    socket.current.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });
    
    socket.current.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
    });
    
    socket.current.on('room_created', (data) => {
      setRoomId(data.room_id);
      setIsInRoom(true);
    });
    
    socket.current.on('room_joined', (data) => {
      setRoomId(data.room_id);
      setIsInRoom(true);
      setParticipants(data.participants);
    });
    
    socket.current.on('new_participant', (data) => {
      setParticipants(prev => [...prev, data.participant_id]);
      initiatePeerConnection(data.participant_id);
    });
    
    socket.current.on('participant_left', (data) => {
      setParticipants(prev => prev.filter(id => id !== data.participant_id));
      if (peers.current[data.participant_id]) {
        peers.current[data.participant_id].destroy();
        delete peers.current[data.participant_id];
      }
    });
    
    socket.current.on('audio_data', (data) => {
      if (peers.current[data.sender_id]) {
        peers.current[data.sender_id].signal(data.audio_data);
      }
    });
    
    return () => {
      if (socket.current) {
        socket.current.disconnect();
      }
    };
  }, [localIP]);

  // Initialize audio
  useEffect(() => {
    if (isInRoom) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          localStream.current = stream;
          audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
          processAudioStream(stream);
        })
        .catch(err => {
          console.error('Error accessing microphone:', err);
        });
    }
    
    return () => {
      if (localStream.current) {
        localStream.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [isInRoom]);

  const processAudioStream = (stream) => {
    const source = audioContext.current.createMediaStreamSource(stream);
    const processor = audioContext.current.createScriptProcessor(1024, 1, 1);
    
    source.connect(processor);
    processor.connect(audioContext.current.destination);
    
    processor.onaudioprocess = (e) => {
      if (!isMuted && isInRoom) {
        const audioData = e.inputBuffer.getChannelData(0);
        const compressed = downsampleAudio(audioData, 16000);
        
        socket.current.emit('audio_data', {
          room_id: roomId,
          audio_data: compressed
        });
      }
    };
  };

  const downsampleAudio = (buffer, targetSampleRate) => {
    const originalSampleRate = audioContext.current.sampleRate;
    if (originalSampleRate === targetSampleRate) {
      return Array.from(buffer);
    }
    
    const ratio = originalSampleRate / targetSampleRate;
    const newLength = Math.round(buffer.length / ratio);
    const result = new Float32Array(newLength);
    
    for (let i = 0; i < newLength; i++) {
      result[i] = buffer[Math.round(i * ratio)];
    }
    
    return Array.from(result);
  };

  const initiatePeerConnection = (participantId) => {
    const peer = new SimplePeer({
      initiator: true,
      trickle: false,
      stream: localStream.current
    });
    
    peer.on('signal', data => {
      socket.current.emit('audio_data', {
        room_id: roomId,
        audio_data: data,
        target: participantId
      });
    });
    
    peer.on('stream', stream => {
      const audio = new Audio();
      audio.srcObject = stream;
      audio.play();
    });
    
    peers.current[participantId] = peer;
  };

  const handleCreateRoom = () => {
    socket.current.emit('create_room');
  };

  const handleJoinRoom = () => {
    const roomId = prompt('Enter room ID:');
    if (roomId) {
      socket.current.emit('join_room', { room_id: roomId });
    }
  };

  const handleLeaveRoom = () => {
    socket.current.emit('leave_room', { room_id: roomId });
    setIsInRoom(false);
    setRoomId('');
    setParticipants([]);
    Object.values(peers.current).forEach(peer => peer.destroy());
    peers.current = {};
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Audio Conference Test</h1>
      <p>Local IP: {localIP || 'Detecting...'}</p>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      
      {!isInRoom ? (
        <div style={{ margin: '20px 0' }}>
          <button 
            onClick={handleCreateRoom} 
            disabled={!isConnected}
            style={{ marginRight: '10px', padding: '10px' }}
          >
            Create Room
          </button>
          <button 
            onClick={handleJoinRoom} 
            disabled={!isConnected}
            style={{ padding: '10px' }}
          >
            Join Room
          </button>
        </div>
      ) : (
        <div style={{ margin: '20px 0' }}>
          <h2>Room: {roomId}</h2>
          <p>Participants: {participants.length + 1}</p>
          <div style={{ margin: '20px 0' }}>
            <button 
              onClick={toggleMute}
              style={{ 
                marginRight: '10px',
                padding: '10px',
                backgroundColor: isMuted ? '#ff4444' : '#44ff44'
              }}
            >
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            <button 
              onClick={handleLeaveRoom}
              style={{ padding: '10px' }}
            >
              Leave Room
            </button>
          </div>
        </div>
      )}
      
      <div style={{ marginTop: '30px', borderTop: '1px solid #ccc', paddingTop: '20px' }}>
        <h3>Testing Instructions:</h3>
        <ol>
          <li>Make sure Flask server is running on one machine</li>
          <li>Note the IP address shown above</li>
          <li>Open this page on two different devices on same WiFi</li>
          <li>On first device: Click "Create Room"</li>
          <li>On second device: Click "Join Room" and enter the room ID</li>
          <li>Speak into one device's microphone - audio should come from the other</li>
        </ol>
      </div>
    </div>
  );
};

export default AudioConferenceTest;