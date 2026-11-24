import React, { useEffect, useRef } from 'react';

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  speed?: number;
  className?: string;
  children?: React.ReactNode;
}

export function Aurora({
  colorStops = ['#3A29FF', '#FF94B4', '#FF3232'],
  amplitude = 1.0,
  blend = 0.5,
  speed = 1.0,
  className = '',
  children
}: AuroraProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      time += 0.005 * speed;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const width = canvas.width;
      const height = canvas.height;

      const grad1 = ctx.createRadialGradient(
        width * 0.3 + Math.sin(time) * 100 * amplitude,
        height * 0.4 + Math.cos(time * 0.7) * 80 * amplitude,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.6
      );
      grad1.addColorStop(0, colorStops[0] || '#3A29FF');
      grad1.addColorStop(1, 'transparent');

      const grad2 = ctx.createRadialGradient(
        width * 0.7 + Math.cos(time * 0.8) * 120 * amplitude,
        height * 0.6 + Math.sin(time * 0.9) * 100 * amplitude,
        50,
        width * 0.5,
        height * 0.5,
        Math.max(width, height) * 0.7
      );
      grad2.addColorStop(0, colorStops[1] || '#FF94B4');
      grad2.addColorStop(1, 'transparent');

      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = blend;

      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'source-over';
      ctx.globalAlpha = 1.0;

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, [colorStops, amplitude, blend, speed]);

  return (
    <div className={`relative overflow-hidden w-full h-full bg-[#0a0a0c] ${className}`}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
