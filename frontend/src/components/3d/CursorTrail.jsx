import { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

const CursorTrail = () => {
  const [isHovering, setIsHovering] = useState(false);
  const isTouchDevice = typeof window !== 'undefined' && !window.matchMedia('(pointer: fine)').matches;

  // Smooth springs for the cursor
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(0, springConfig);
  const cursorY = useSpring(0, springConfig);

  useEffect(() => {
    if (isTouchDevice) return;

    const updateMousePosition = (e) => {
      cursorX.set(e.clientX - 16);
      cursorY.set(e.clientY - 16);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      const isInteractive = target.tagName.toLowerCase() === 'button' || 
                            target.tagName.toLowerCase() === 'a' ||
                            target.closest('button') || 
                            target.closest('a') ||
                            target.classList.contains('interactive');
      setIsHovering(isInteractive);
    };

    window.addEventListener('mousemove', updateMousePosition, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [cursorX, cursorY, isTouchDevice]);

  if (isTouchDevice) return null;

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-[#66FCF1] pointer-events-none z-[100] mix-blend-screen flex items-center justify-center"
      style={{
        x: cursorX,
        y: cursorY,
      }}
      animate={{
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? 'rgba(102, 252, 241, 0.2)' : 'transparent',
      }}
      transition={{ duration: 0.2 }}
    >
      <div className="w-1 h-1 bg-[#66FCF1] rounded-full" />
    </motion.div>
  );
};

export default CursorTrail;
