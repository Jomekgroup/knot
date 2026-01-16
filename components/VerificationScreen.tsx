
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ShieldCheckIcon } from './icons/ShieldCheckIcon';
import { CameraShutterIcon } from './icons/CameraShutterIcon';
import { VerifiedIcon } from './icons/VerifiedIcon';
import { User } from '../types';

type VerificationStep = 'initial' | 'camera' | 'preview' | 'verifying' | 'success';

interface VerificationScreenProps {
  onVerificationComplete: () => void;
  onBack: () => void;
}

const VerificationScreen: React.FC<VerificationScreenProps> = ({ onVerificationComplete, onBack }) => {
  const [step, setStep] = useState<VerificationStep>('initial');
  const [error, setError] = useState<string | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
      setStep('camera');
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Could not access the camera. Please check your browser permissions.");
      setStep('initial');
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      setPhoto(canvas.toDataURL('image/jpeg'));
      cleanupCamera();
      setStep('preview');
    }
  };

  const handleSubmit = () => {
    setStep('verifying');
    // Simulate AI verification process
    setTimeout(() => {
      setStep('success');
      setTimeout(() => {
        onVerificationComplete();
      }, 2000); // Wait 2 seconds on success screen before navigating
    }, 2500); // Simulate 2.5 second API call
  };

  useEffect(() => {
    return () => cleanupCamera();
  }, [cleanupCamera]);

  const renderContent = () => {
    switch(step) {
      case 'initial':
        return (
          <div className="text-center p-8 flex flex-col items-center justify-center h-full">
            <ShieldCheckIcon className="w-20 h-20 text-brand-primary mb-6" />
            <h1 className="text-2xl font-bold text-brand-dark mb-3">Verify with a Photo</h1>
            <p className="text-gray-600 mb-8">To ensure the safety and authenticity of our community, we require a quick photo verification. This helps prove you're the person in your profile pictures.</p>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <button onClick={startCamera} className="w-full flex items-center justify-center gap-3 bg-brand-primary text-white font-bold py-3 rounded-lg text-lg hover:bg-brand-secondary transition-colors">
              <CameraShutterIcon className="w-6 h-6" /> Get Verified
            </button>
          </div>
        );
      case 'camera':
        return (
          <div className="relative w-full h-full bg-black flex flex-col items-center justify-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
               <div className="w-[70vw] h-[50vh] max-w-[300px] max-h-[420px] border-4 border-white border-dashed rounded-[50%]" />
            </div>
            <div className="absolute bottom-10 z-10">
              <button onClick={takePhoto} className="p-4 rounded-full bg-white group" aria-label="Take Photo">
                <CameraShutterIcon className="w-10 h-10 text-brand-primary group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>
        );
      case 'preview':
        return (
          <div className="relative w-full h-full bg-black flex flex-col items-center justify-center p-4">
            <img src={photo!} alt="Verification selfie" className="max-w-full max-h-[70vh] rounded-lg" />
            <div className="absolute bottom-10 z-10 w-full px-8 space-y-3">
              <button onClick={handleSubmit} className="w-full bg-brand-primary text-white font-bold py-3 rounded-lg">Submit for Verification</button>
              <button onClick={startCamera} className="w-full bg-gray-600 text-white font-bold py-3 rounded-lg">Retake Photo</button>
            </div>
          </div>
        );
      case 'verifying':
        return (
          <div className="text-center p-8 flex flex-col items-center justify-center h-full">
            <div className="w-16 h-16 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-6"></div>
            <h1 className="text-2xl font-bold text-brand-dark">Verifying...</h1>
            <p className="text-gray-600">Our AI is checking your photo. This will only take a moment.</p>
          </div>
        );
      case 'success':
        return (
           <div className="text-center p-8 flex flex-col items-center justify-center h-full bg-green-50">
            <VerifiedIcon className="w-20 h-20 text-green-500 mb-6" />
            <h1 className="text-2xl font-bold text-green-800">You're Verified!</h1>
            <p className="text-green-700">Your profile now has the verified badge. Welcome to our trusted community!</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col">
       {step === 'initial' && (
        <header className="p-4 bg-white border-b border-gray-200">
            <button onClick={onBack} className="text-gray-600 p-1 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            </button>
        </header>
       )}
      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
        <canvas ref={canvasRef} className="hidden" />
      </main>
    </div>
  );
};

export default VerificationScreen;