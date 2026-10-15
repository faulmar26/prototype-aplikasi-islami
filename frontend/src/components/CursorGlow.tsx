import { useEffect } from 'react';

export function CursorGlow() {
  useEffect(() => {
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!pointerQuery.matches || reducedMotionQuery.matches) return;

    let animationFrame = 0;
    function handlePointerMove(event: PointerEvent) {
      const { clientX, clientY } = event;
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame(() => {
        document.documentElement.style.setProperty('--cursor-x', `${clientX}px`);
        document.documentElement.style.setProperty('--cursor-y', `${clientY}px`);
      });
    }

    document.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.cancelAnimationFrame(animationFrame);
      document.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  return <div aria-hidden="true" className="cursor-glow" />;
}
