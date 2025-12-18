import React, { useEffect, useRef, useState } from 'react';

interface WavyBackgroundProps {
  className?: string;
  colors?: string[];
  waveWidth?: number;
  blur?: number;
  speed?: 'slow' | 'fast';
  waveOpacity?: number;
}

export const WavyBackground: React.FC<WavyBackgroundProps> = ({
  className = '',
  colors,
  waveWidth = 50,
  blur = 10,
  speed = 'fast',
  waveOpacity = 0.5,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Default colors based on theme - brighter in dark mode
  const defaultColors = isDark 
    ? ['rgba(255, 255, 255, 0.45)', 'rgba(255, 255, 255, 0.35)']
    : ['rgba(107, 114, 128, 0.2)', 'rgba(156, 163, 175, 0.15)'];
  
  const waveColors = colors || defaultColors;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.offsetWidth * dpr;
      canvas.height = canvas.offsetHeight * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let time = 0;
    const speedMultiplier = speed === 'fast' ? 0.015 : 0.008;

    const drawWave = (color: string, offset: number, amplitude: number, frequency: number, baseY: number) => {
      ctx.beginPath();
      
      // Draw wave as a simple line, not a filled shape
      // Increased frequency multiplier for more undulations
      for (let x = 0; x <= canvas.width; x += 1) {
        const y =
          baseY +
          Math.sin((x * frequency + time * 100 + offset) * 0.015) * amplitude +
          Math.cos((x * frequency * 0.7 + time * 50 + offset) * 0.015) * amplitude * 0.3 +
          Math.sin((x * frequency * 1.3 + time * 75 + offset) * 0.02) * amplitude * 0.2;
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.stroke();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Apply blur effect
      ctx.filter = `blur(${blur}px)`;
      
      // Draw multiple waves as thin lines, positioned in the middle area
      const centerY = canvas.height / 2;
      waveColors.forEach((color, index) => {
        const offset = index * Math.PI * 0.5;
        // Slightly larger amplitude for bigger waves
        const amplitude = waveWidth * 0.4 + (index * 4);
        // Higher frequency for more undulations
        const frequency = 1.2 + (index * 0.3);
        // Position waves around center, not too spread out
        const baseY = centerY + (index - (waveColors.length - 1) / 2) * 20;
        
        drawWave(color, offset, amplitude, frequency, baseY);
      });

      ctx.filter = 'none';
      time += speedMultiplier;

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [waveColors, waveWidth, blur, speed, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ pointerEvents: 'none' }}
    />
  );
};

