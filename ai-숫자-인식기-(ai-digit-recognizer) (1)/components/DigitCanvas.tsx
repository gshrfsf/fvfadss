
import React, { useRef, useEffect, useImperativeHandle, useState, useCallback } from 'react';

interface DigitCanvasProps {
  width: number;
  height: number;
}

export interface DigitCanvasRef {
  clear: () => void;
  getCanvasElement: () => HTMLCanvasElement | null;
}

const DigitCanvas = React.forwardRef<HTMLCanvasElement, DigitCanvasProps>(({ width, height }, ref) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState<{ x: number; y: number } | null>(null);

  const getCoordinates = (event: MouseEvent | TouchEvent): { x: number; y: number } | null => {
    if (!internalCanvasRef.current) return null;
    const canvas = internalCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    let x, y;

    if (event instanceof MouseEvent) {
      x = event.clientX - rect.left;
      y = event.clientY - rect.top;
    } else if (event.touches && event.touches.length > 0) {
      x = event.touches[0].clientX - rect.left;
      y = event.touches[0].clientY - rect.top;
    } else {
      return null;
    }
    return { x, y };
  };
  
  const draw = useCallback((currentX: number, currentY: number) => {
    if (!internalCanvasRef.current || !isDrawing || !lastPosition) return;
    const context = internalCanvasRef.current.getContext('2d');
    if (!context) return;

    context.beginPath();
    context.moveTo(lastPosition.x, lastPosition.y);
    context.lineTo(currentX, currentY);
    context.stroke();
    setLastPosition({ x: currentX, y: currentY });
  }, [isDrawing, lastPosition]);

  const startDrawing = useCallback((event: MouseEvent | TouchEvent) => {
    const coords = getCoordinates(event);
    if (!coords || !internalCanvasRef.current) return;
    
    // Prevent page scroll on touch devices
    if (event instanceof TouchEvent) {
        event.preventDefault();
    }

    setIsDrawing(true);
    setLastPosition(coords);
    
    // Mark canvas as not empty
    internalCanvasRef.current.dataset.isEmpty = 'false';

    // Draw a dot for single click/tap
    const context = internalCanvasRef.current.getContext('2d');
    if(context){
        context.beginPath();
        context.arc(coords.x, coords.y, context.lineWidth / 2, 0, Math.PI * 2);
        context.fill();
        // For line drawing ensure the next point connects smoothly
        context.beginPath(); 
        context.moveTo(coords.x, coords.y);
    }

  }, []);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    setLastPosition(null);
  }, []);

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (!isDrawing) return;
    const coords = getCoordinates(event);
    if (coords) {
      draw(coords.x, coords.y);
    }
  }, [isDrawing, draw]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isDrawing) return;
    // Prevent page scroll on touch devices during drawing
    event.preventDefault(); 
    const coords = getCoordinates(event);
    if (coords) {
      draw(coords.x, coords.y);
    }
  }, [isDrawing, draw]);


  useEffect(() => {
    const canvas = internalCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Initialize canvas
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "black";
    context.lineWidth = Math.max(15, width / 20); // Responsive line width
    context.lineCap = "round";
    context.lineJoin = "round";
    
    // Mark canvas as empty initially
    canvas.dataset.isEmpty = 'true';

    // Add event listeners
    canvas.addEventListener('mousedown', startDrawing as EventListener);
    canvas.addEventListener('mousemove', handleMouseMove as EventListener);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', startDrawing as EventListener, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove as EventListener, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);
    canvas.addEventListener('touchcancel', stopDrawing);


    return () => {
      // Cleanup event listeners
      canvas.removeEventListener('mousedown', startDrawing as EventListener);
      canvas.removeEventListener('mousemove', handleMouseMove as EventListener);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseleave', stopDrawing);

      canvas.removeEventListener('touchstart', startDrawing as EventListener);
      canvas.removeEventListener('touchmove', handleTouchMove as EventListener);
      canvas.removeEventListener('touchend', stopDrawing);
      canvas.removeEventListener('touchcancel', stopDrawing);
    };
  }, [width, height, startDrawing, handleMouseMove, stopDrawing, handleTouchMove]);

  // Expose canvas element through the parent ref (App.tsx's canvasRef)
  useImperativeHandle(ref, () => internalCanvasRef.current!, []);


  return (
    <canvas
      ref={internalCanvasRef}
      width={width}
      height={height}
      className="touch-none bg-white rounded-md cursor-crosshair shadow-inner" // touch-none to prevent scrolling while drawing on touch devices
    />
  );
});
DigitCanvas.displayName = 'DigitCanvas';
export default DigitCanvas;
