import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import Draggable from 'react-draggable';
import { GripHorizontal, AlertTriangle } from 'lucide-react';

const ProctoringControl = ({ onViolation, isExamActive }) => {
  const videoRef = useRef(null);
  const nodeRef = useRef(null);
  const [status, setStatus] = useState('initializing'); // initializing, active, critical
  const [message, setMessage] = useState('Initializing Proctored Session...');
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [stream, setStream] = useState(null);
  
  const [defaultPos] = useState(() => {
    const saved = localStorage.getItem('proctor_pos');
    return saved ? JSON.parse(saved) : { x: 20, y: window.innerHeight - 220 };
  });

  // 1. Initial Load: Models & Visibility
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models'; 
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        setModelsLoaded(true); 
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isExamActive) {
        onViolation('TAB_SWITCH', 'Switched tabs/windows detected.');
      }
    };

    loadModels();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isExamActive, onViolation]);

  // 2. Hardware Lifecycle: Webcam
  useEffect(() => {
    const startVideo = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 320, height: 240, frameRate: 15 } 
        });
        if (videoRef.current) videoRef.current.srcObject = userStream;
        setStream(userStream);
        setStatus('active');
        setMessage('Proctoring Active');
      } catch (err) {
        setStatus('critical');
        setMessage('Camera Access Required');
        onViolation('CAMERA_DENIED', 'Camera access was denied.');
      }
    };

    if (modelsLoaded) startVideo();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [modelsLoaded, onViolation]);

  // 3. AI Inference Heartbeat
  useEffect(() => {
    let interval;
    if (isExamActive && stream && videoRef.current && modelsLoaded) {
      interval = setInterval(async () => {
        if (!videoRef.current) return;

        try {
          if (!faceapi.nets.tinyFaceDetector.params || !faceapi.nets.faceLandmark68Net.params) {
            return;
          }

          const detections = await faceapi.detectAllFaces(
            videoRef.current, 
            new faceapi.TinyFaceDetectorOptions()
          ).withFaceLandmarks();

          if (detections.length === 0) {
            setStatus('critical');
            setMessage('Face Not Detected');
            onViolation('NO_FACE', 'No face detected in frame.');
          } else if (detections.length > 1) {
            setStatus('critical');
            setMessage('Multiple Faces');
            onViolation('MULTIPLE_FACES', 'Multiple people detected.');
          } else {
            const landmarks = detections[0].landmarks;
            const nose = landmarks.getNose()[0];
            const leftEye = landmarks.getLeftEye()[0];
            const rightEye = landmarks.getRightEye()[0];

            const eyeDist = Math.abs(rightEye.x - leftEye.x);
            const noseCenterDist = Math.abs(nose.x - (leftEye.x + rightEye.x) / 2);

            if (noseCenterDist > eyeDist * 0.3) {
              setStatus('critical');
              setMessage('⚠️ Please face the screen');
              onViolation('HEAD_MOVEMENT', 'Maintain eye contact with the assessment node.');
            } else {
              setStatus('active');
              setMessage('Proctoring Active');
            }
          }
        } catch (e) {
          console.error("Inference skip:", e);
        }
      }, 2000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isExamActive, stream, modelsLoaded, onViolation]);

  const handleDragStop = (e, data) => {
    localStorage.setItem('proctor_pos', JSON.stringify({ x: data.x, y: data.y }));
  };

  return (
    <Draggable 
      nodeRef={nodeRef}
      bounds="parent" 
      defaultPosition={defaultPos}
      onStop={handleDragStop}
      handle=".drag-handle"
    >
      <div ref={nodeRef} className="fixed z-[999] group cursor-default">
        <div className={`relative overflow-hidden rounded-[2.5rem] border-[6px] transition-all duration-300 shadow-2xl bg-gray-900 w-52 ${
          status === 'active' ? 'border-green-500 shadow-green-100/50' :
          'border-rose-600 shadow-rose-200 animate-pulse'
        }`}>
          
          {/* Drag Handle */}
          <div className="drag-handle absolute top-0 left-0 right-0 h-8 bg-transparent cursor-move flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 z-10">
             <GripHorizontal className="text-white w-5 h-5" />
          </div>

          {/* Live Video Preview */}
          <video 
            ref={videoRef}
            autoPlay 
            muted 
            playsInline
            className="w-full h-36 object-cover scale-x-[-1]"
          />

          {/* Status Label */}
          <div className={`p-2.5 text-[10px] font-black uppercase tracking-widest text-white text-center transition-colors ${
            status === 'active' ? 'bg-green-500' : 'bg-rose-600'
          }`}>
            {message}
          </div>

          {/* Critical Warning Indicator */}
          {status === 'critical' && (
            <div className="absolute inset-x-0 bottom-12 flex justify-center pointer-events-none">
               <div className="bg-rose-600 text-white px-3 py-1 rounded-full text-[8px] font-black animate-bounce shadow-lg flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  VIOLATION
               </div>
            </div>
          )}
        </div>
      </div>
    </Draggable>
  );
};

export default ProctoringControl;
