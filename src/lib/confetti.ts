/*
 * Lightweight confetti implementation using Canvas 2D
 * Replaces canvas-confetti to avoid npm install issues
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  shape: 'rect' | 'circle';
}

const COLORS = ['#6B9AC4', '#E9C46A', '#F4A261', '#F8C8DC', '#A3D9A5', '#8AB4D6', '#D6EBF5'];

let canvas: HTMLCanvasElement | null = null;
let ctx: CanvasRenderingContext2D | null = null;
let animationId: number | null = null;
let particles: Particle[] = [];

function createCanvas(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.style.position = 'fixed';
  c.style.top = '0';
  c.style.left = '0';
  c.style.width = '100%';
  c.style.height = '100%';
  c.style.pointerEvents = 'none';
  c.style.zIndex = '100';
  document.body.appendChild(c);
  return c;
}

function createParticles(originX: number, originY: number, count: number): Particle[] {
  const result: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (Math.random() * Math.PI * 2);
    const speed = 2 + Math.random() * 6;
    result.push({
      x: originX,
      y: originY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      size: 4 + Math.random() * 6,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      opacity: 1,
      shape: Math.random() > 0.5 ? 'rect' : 'circle',
    });
  }
  return result;
}

function updateAndDraw(): void {
  if (!ctx || !canvas) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let alive = 0;
  for (const p of particles) {
    if (p.opacity <= 0) continue;
    alive++;

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15; // gravity
    p.vx *= 0.99; // air resistance
    p.rotation += p.rotationSpeed;
    p.opacity -= 0.005;

    if (p.opacity <= 0) continue;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rotation * Math.PI) / 180);
    ctx.globalAlpha = Math.max(0, p.opacity);
    ctx.fillStyle = p.color;

    if (p.shape === 'rect') {
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
    } else {
      ctx.beginPath();
      ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  if (alive > 0) {
    animationId = requestAnimationFrame(updateAndDraw);
  } else {
    cleanup();
  }
}

function cleanup(): void {
  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (canvas) {
    canvas.remove();
    canvas = null;
    ctx = null;
  }
  particles = [];
}

/**
 * Trigger a confetti burst from the center of the viewport
 */
export function triggerConfetti(): void {
  // Clean up any previous confetti
  cleanup();

  canvas = createCanvas();
  const dpr = window.devicePixelRatio || 1;
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.scale(dpr, dpr);

  const originX = window.innerWidth / 2;
  const originY = window.innerHeight * 0.55;
  particles = createParticles(originX, originY, 120);

  animationId = requestAnimationFrame(updateAndDraw);
}
