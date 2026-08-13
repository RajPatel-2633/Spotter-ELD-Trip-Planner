import gsap from 'gsap';

/**
 * GSAP animation for revealing ELD log 24-hour status blocks sequentially
 */
export function animateELDBlocks(containerElement: HTMLElement | null) {
  if (!containerElement) return;

  const blocks = containerElement.querySelectorAll('.eld-block');
  if (!blocks || blocks.length === 0) return;

  gsap.set(blocks, { scaleX: 0, opacity: 0.2, transformOrigin: 'left center' });

  gsap.to(blocks, {
    scaleX: 1,
    opacity: 1,
    duration: 0.6,
    stagger: 0.06,
    ease: 'power2.out',
  });
}
