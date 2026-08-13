import gsap from 'gsap';

/**
 * GSAP helper for animating the CurrentTripVisual SVG truck along the route
 */
export function animateCurrentTripTruck(
  truckRef: SVGGElement | null,
  roadRef: SVGLineElement | null,
  dotsRef: (SVGElement | null)[],
  status: 'PLANNING' | 'EN_ROUTE' | 'ARRIVED',
  onComplete?: () => void
) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (truckRef) gsap.killTweensOf(truckRef);
  if (roadRef) gsap.killTweensOf(roadRef);
  if (dotsRef && dotsRef.length > 0) gsap.killTweensOf(dotsRef);

  if (prefersReducedMotion) {
    if (truckRef) {
      const staticX = status === 'PLANNING' ? 10 : status === 'ARRIVED' ? 170 : 115;
      gsap.set(truckRef, { x: staticX, opacity: 1 });
    }
    if (roadRef) gsap.set(roadRef, { strokeDashoffset: 0, opacity: 1 });
    if (dotsRef) gsap.set(dotsRef, { opacity: 1, scale: 1 });
    return null;
  }

  const tl = gsap.timeline({ onComplete });

  // 1. Reveal road stroke
  if (roadRef) {
    const roadLength = roadRef.getTotalLength ? roadRef.getTotalLength() : 200;
    gsap.set(roadRef, { strokeDasharray: roadLength, strokeDashoffset: roadLength, opacity: 1 });
    tl.to(roadRef, { strokeDashoffset: 0, duration: 0.8, ease: 'power2.out' });
  }

  // 2. Reveal route dots sequentially
  if (dotsRef && dotsRef.length > 0) {
    gsap.set(dotsRef.filter(Boolean), { opacity: 0, scale: 0.5, transformOrigin: 'center center' });
    tl.to(
      dotsRef.filter(Boolean),
      { opacity: 1, scale: 1, duration: 0.3, stagger: 0.08, ease: 'back.out(1.5)' },
      '-=0.4'
    );
  }

  // 3. Move truck based on status
  if (truckRef) {
    let targetX = 115; // default EN_ROUTE ~60% position
    if (status === 'PLANNING') targetX = 10;
    if (status === 'ARRIVED') targetX = 170;

    gsap.set(truckRef, { opacity: 0 });
    tl.to(truckRef, { opacity: 1, duration: 0.3 }, '-=0.2');

    tl.to(truckRef, {
      x: targetX,
      duration: status === 'EN_ROUTE' ? 2.4 : 1.2,
      ease: status === 'EN_ROUTE' ? 'power1.inOut' : 'power2.out',
    });
  }

  return tl;
}
