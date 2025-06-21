import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import './App.css';

export default function SecurePasswordAnimation() {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [isWeak, setIsWeak] = useState(true);
  const [videoSource, setVideoSource] = useState('/videos/weak.mp4');
  const [playCount, setPlayCount] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [suggestedPassword, setSuggestedPassword] = useState('');
  const videoRef = useRef(null);

  const calculateStrength = (password) => {
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const handlePasswordChange = (e) => {
    const newPass = e.target.value;
    setPassword(newPass);
    const newStrength = calculateStrength(newPass);
    setStrength(newStrength);
    setIsWeak(newStrength < 3);
    setPlayCount(0);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const generateSuggestedPassword = () => {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let suggestion = '';
    for (let i = 0; i < 12; i++) {
      suggestion += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    setSuggestedPassword(suggestion);
  };

  const useSuggestedPassword = () => {
    setPassword(suggestedPassword);
    setStrength(5);
    setIsWeak(false);
  };

  useEffect(() => {
    if (isWeak) {
      setVideoSource('/videos/weak.mp4');
      if (videoRef.current) {
        videoRef.current.loop = true;
      }
      generateSuggestedPassword();
    } else {
      if (videoRef.current) {
        videoRef.current.loop = false;
      }
      if (strength < 4) {
        setVideoSource('/videos/good.mp4');
      } else {
        setVideoSource('/videos/strong.mp4');
      }
    }
  }, [isWeak, strength]);

  useEffect(() => {
    const handleEnded = () => {
      setPlayCount((prevCount) => prevCount + 1);
    };

    if (videoRef.current) {
      videoRef.current.addEventListener('ended', handleEnded);
    }

    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener('ended', handleEnded);
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && playCount > 0 && !isWeak) {
      videoRef.current.pause();
    }
  }, [playCount, isWeak]);

  const strengthColors = ['#e74c3c', '#e74c3c', '#f1c40f', '#2ecc71', '#2ecc71'];

  return (
    <div className="app">
      <video
        ref={videoRef}
        src={videoSource}
        autoPlay
        muted
        className="strength-video"
        style={{ backgroundColor: 'transparent' }}
      />
      <h2 className="app-heading">Choose a strong password</h2>
      <div className="input-container">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={handlePasswordChange}
          placeholder="Enter your password"
          className="password-input"
        />
        <button 
          className="show-password-button" 
          onClick={togglePasswordVisibility}
        >
          {showPassword ? '🙈' : '👁️'}
        </button>
      </div>
      <div className="strength-bar-container">
        <p className={isWeak ? "strength-text weak" : "strength-text"}>
          Password strength: {isWeak ? "Weak" : strength < 4 ? "Fair" : "Strong"}
        </p>
        <motion.div
          className="strength-bar"
          initial={{ width: '0%' }}
          animate={{ width: `${(strength / 5) * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{ backgroundColor: strengthColors[strength - 1] || 'gray' }}
        />
      </div>

      {isWeak && (
        <div className="suggestion-container">
          <p className="suggestion-text">
            Suggested Password: <span onClick={useSuggestedPassword} className="suggested-password">{suggestedPassword}</span>
          </p>
        </div>
      )}
    </div>
  );
}
