import gsap from 'gsap';

/**
 * GSAP path drawing and marker reveal sequence for RouteMap
 */
export function animateRouteReveal(
  pathElement: SVGPathElement | null,
  markerElements: Element[],
  onComplete?: () => void
) {
  if (!pathElement) return;

  const length = pathElement.getTotalLength();
  
  // Set initial hidden path
  gsap.set(pathElement, {
    strokeDasharray: length,
    strokeDashoffset: length,
    opacity: 1,
  });

  if (markerElements && markerElements.length > 0) {
    gsap.set(markerElements, { scale: 0, opacity: 0, transformOrigin: 'center center' });
  }

  const tl = gsap.timeline({ onComplete });

  // 1. Trace route line
  tl.to(pathElement, {
    strokeDashoffset: 0,
    duration: 1.6,
    ease: 'power2.inOut',
  });

  // 2. Sequential marker pop-in along route
  if (markerElements && markerElements.length > 0) {
    tl.to(
      markerElements,
      {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        stagger: 0.15,
        ease: 'back.out(1.7)',
      },
      '-=0.6'
    );
  }

  return tl;
}

/**
 * GSAP numerical counter animation for metric cards
 */
export function animateMetricCounter(
  targetElement: HTMLElement | null,
  finalValue: number,
  formatFn: (val: number) => string
) {
  if (!targetElement) return;

  const obj = { val: 0 };
  gsap.to(obj, {
    val: finalValue,
    duration: 1.2,
    ease: 'power1.out',
    onUpdate: () => {
      if (targetElement) {
        targetElement.innerText = formatFn(obj.val);
      }
    },
  });
}
