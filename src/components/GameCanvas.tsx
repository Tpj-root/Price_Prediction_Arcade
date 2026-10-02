import React, { useEffect, useRef, useCallback } from 'react';
import { Bullet, FloatingText, GunType, Particle, PricePoint } from '../types/game';
import { sound } from '../utils/audio';

interface GameCanvasProps {
  prices: PricePoint[];
  currentIndex: number;
  onAdvanceIndex: () => void;
  predictionSeconds: number;
  gunType: GunType;
  showPresentOnly: boolean;
  onHit: (reward: number, streak: number) => void;
  onMiss: (penalty: number) => void;
  gameOver: boolean;
  onRestart: () => void;
  isPaused: boolean;
  streak: number;
  playerXRef: React.MutableRefObject<number>;
  triggerFireRef: React.MutableRefObject<(() => void) | null>;
}

// Coordinate constants matching Pygame layout
const WIDTH = 1200;
const HEIGHT = 700;

const GAME_LEFT = 60;
const GAME_RIGHT = WIDTH - 60;
const GAME_TOP = 130;
const GAME_BOTTOM = HEIGHT - 110;

const PLAYER_Y = GAME_BOTTOM;
const TARGET_Y = GAME_TOP;
const PLAYER_SIZE = 22;
const BULLET_SIZE = 6;
const DISPLAY_POINTS = 100;
const SECONDS_PER_POINT = 1.0;

export const GameCanvas: React.FC<GameCanvasProps> = ({
  prices,
  currentIndex,
  onAdvanceIndex,
  predictionSeconds,
  gunType,
  showPresentOnly,
  onHit,
  onMiss,
  gameOver,
  onRestart,
  isPaused,
  streak,
  playerXRef,
  triggerFireRef
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Local mutable state for 60/120 FPS render loop
  const bulletsRef = useRef<Bullet[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const shakeRef = useRef<number>(0);
  const muzzleFlashRef = useRef<number>(0);
  const radarPulseRef = useRef<number>(0);

  // Price range calculation
  const allPrices = prices.map(p => p.price);
  const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
  const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 100;
  const priceRange = maxPrice - minPrice === 0 ? 1 : maxPrice - minPrice;

  // Coordinate mappers
  const pointToX = useCallback((pointIndex: number) => {
    if (DISPLAY_POINTS <= 1) return GAME_LEFT;
    const normalized = pointIndex / (DISPLAY_POINTS - 1);
    return Math.round(GAME_LEFT + normalized * (GAME_RIGHT - GAME_LEFT));
  }, []);

  const priceToY = useCallback((price: number) => {
    const normalized = Math.max(0, Math.min(1, (price - minPrice) / priceRange));
    return Math.round(GAME_BOTTOM - normalized * (GAME_BOTTOM - GAME_TOP));
  }, [minPrice, priceRange]);

  // Current price
  const currentPrice = prices[currentIndex]?.price ?? 100;

  // Target index for current prediction
  const futureOffset = Math.max(1, Math.round(predictionSeconds / SECONDS_PER_POINT));
  const currentPredictionIndex = Math.min(prices.length - 1, currentIndex + futureOffset);

  // Spawn particle effect
  const spawnHitParticles = useCallback((x: number, y: number, color: string, count = 25) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 260 + 40;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 0.4 + 0.3,
        size: Math.random() * 3.5 + 2
      });
    }
  }, []);

  // Spawn floating text
  const spawnFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -70,
      life: 0,
      maxLife: 0.9,
      scale: 1.2
    });
  }, []);

  // Fire bullet function
  const fireBullet = useCallback(() => {
    if (gameOver || isPaused) return;

    const distance = PLAYER_Y - TARGET_Y;
    const speed = distance / predictionSeconds;

    const newBullet: Bullet = {
      id: Math.random().toString(),
      x: playerXRef.current,
      y: PLAYER_Y - PLAYER_SIZE - 15,
      speed,
      gun: gunType,
      predictionSeconds,
      fireIndex: currentIndex,
      firePrice: currentPrice,
      targetIndex: currentPredictionIndex,
      createdAt: performance.now()
    };

    bulletsRef.current.push(newBullet);
    muzzleFlashRef.current = 1.0;
    sound.playShoot(gunType);

    // Muzzle sparks
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x: playerXRef.current + (Math.random() - 0.5) * 6,
        y: PLAYER_Y - PLAYER_SIZE - 20,
        vx: (Math.random() - 0.5) * 80,
        vy: -Math.random() * 120 - 40,
        color: gunType === 'RED' ? '#ef4444' : '#10b981',
        alpha: 1,
        life: 0,
        maxLife: 0.15,
        size: 3
      });
    }
  }, [gameOver, isPaused, predictionSeconds, gunType, currentIndex, currentPrice, currentPredictionIndex, playerXRef]);

  // Hook triggerFireRef to fireBullet
  useEffect(() => {
    triggerFireRef.current = fireBullet;
    return () => {
      triggerFireRef.current = null;
    };
  }, [fireBullet, triggerFireRef]);

  // Check bullet hit or miss
  const checkBulletResult = useCallback((bullet: Bullet) => {
    let predIndex = bullet.targetIndex;
    if (predIndex >= prices.length) {
      predIndex = prices.length - 1;
    }

    const firePrice = bullet.firePrice;
    const futurePrice = prices[predIndex]?.price ?? firePrice;

    let actualDirection: 'RED' | 'GREEN' | 'FLAT' = 'FLAT';
    if (futurePrice > firePrice) {
      actualDirection = 'RED'; // UP
    } else if (futurePrice < firePrice) {
      actualDirection = 'GREEN'; // DOWN
    }

    const isHit = (bullet.gun === 'RED' && actualDirection === 'RED') ||
                  (bullet.gun === 'GREEN' && actualDirection === 'GREEN');

    shakeRef.current = 8; // Screen shake

    if (isHit) {
      const newStreak = streak + 1;
      const baseReward = 10;
      const multiplier = newStreak >= 5 ? 3 : newStreak >= 3 ? 2 : 1;
      const reward = baseReward * multiplier;

      sound.playHit(newStreak);
      spawnHitParticles(bullet.x, TARGET_Y, bullet.gun === 'RED' ? '#ef4444' : '#10b981', 30);
      spawnFloatingText(
        bullet.x,
        TARGET_Y - 15,
        `+$${reward} [HIT!] ${multiplier > 1 ? `x${multiplier}` : ''}`,
        bullet.gun === 'RED' ? '#f87171' : '#34d399'
      );
      onHit(reward, newStreak);
    } else {
      const penalty = 10;
      sound.playMiss();
      spawnHitParticles(bullet.x, TARGET_Y, '#94a3b8', 16);
      spawnFloatingText(
        bullet.x,
        TARGET_Y - 15,
        `-$${penalty} [MISS]`,
        '#ef4444'
      );
      onMiss(penalty);
    }
  }, [prices, streak, onHit, onMiss, spawnHitParticles, spawnFloatingText]);

  // Main high-performance render loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let tickAccumulator = 0;

    const render = (now: number) => {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      const canvas = canvasRef.current;
      if (!canvas) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      // Handle screen shake
      let shakeX = 0;
      let shakeY = 0;
      if (shakeRef.current > 0) {
        shakeX = (Math.random() - 0.5) * shakeRef.current;
        shakeY = (Math.random() - 0.5) * shakeRef.current;
        shakeRef.current = Math.max(0, shakeRef.current - dt * 25);
      }

      // Handle muzzle flash
      if (muzzleFlashRef.current > 0) {
        muzzleFlashRef.current = Math.max(0, muzzleFlashRef.current - dt * 8);
      }

      // Pulse radar
      radarPulseRef.current = (radarPulseRef.current + dt * 2) % (Math.PI * 2);

      // Tick prices in real-time
      if (!gameOver && !isPaused) {
        tickAccumulator += dt;
        while (tickAccumulator >= SECONDS_PER_POINT) {
          tickAccumulator -= SECONDS_PER_POINT;
          onAdvanceIndex();
        }

        // Update bullets
        const activeBullets: Bullet[] = [];
        for (const bullet of bulletsRef.current) {
          bullet.y -= bullet.speed * dt;
          if (bullet.y <= TARGET_Y) {
            checkBulletResult(bullet);
          } else {
            activeBullets.push(bullet);
          }
        }
        bulletsRef.current = activeBullets;
      }

      // Update particles
      const activeParticles: Particle[] = [];
      for (const p of particlesRef.current) {
        p.life += dt;
        if (p.life < p.maxLife) {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.alpha = 1 - p.life / p.maxLife;
          activeParticles.push(p);
        }
      }
      particlesRef.current = activeParticles;

      // Update floating texts
      const activeTexts: FloatingText[] = [];
      for (const ft of floatingTextsRef.current) {
        ft.life += dt;
        if (ft.life < ft.maxLife) {
          ft.y += ft.vy * dt;
          ft.alpha = 1 - ft.life / ft.maxLife;
          activeTexts.push(ft);
        }
      }
      floatingTextsRef.current = activeTexts;

      // -------------------------------------------------------------
      // DRAW CANVAS
      // -------------------------------------------------------------
      ctx.save();
      ctx.translate(shakeX, shakeY);

      // 1. Dark Cyber/Terminal Background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // 2. Subtle coordinate grid lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;

      // Time scale lines (Every 10 seconds)
      for (let i = 0; i <= DISPLAY_POINTS; i += 10) {
        const x = pointToX(i);
        ctx.beginPath();
        ctx.moveTo(x, GAME_TOP);
        ctx.lineTo(x, GAME_BOTTOM);
        ctx.stroke();

        ctx.fillStyle = '#64748b';
        ctx.font = '11px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`+${i}s`, x, GAME_TOP - 12);
      }

      // Horizontal price guidelines
      const guideSteps = 4;
      for (let step = 0; step <= guideSteps; step++) {
        const pRatio = step / guideSteps;
        const pVal = minPrice + pRatio * priceRange;
        const gy = priceToY(pVal);

        ctx.strokeStyle = '#131d2e';
        ctx.beginPath();
        ctx.moveTo(GAME_LEFT, gy);
        ctx.lineTo(GAME_RIGHT, gy);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = '10px ui-monospace, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(pVal.toFixed(2), GAME_LEFT - 10, gy + 3);
      }

      // 3. Playfield Border
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(GAME_LEFT, GAME_TOP, GAME_RIGHT - GAME_LEFT, GAME_BOTTOM - GAME_TOP);

      // 4. Target Line at TARGET_Y
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(GAME_LEFT, TARGET_Y);
      ctx.lineTo(GAME_RIGHT, TARGET_Y);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#eab308';
      ctx.font = '10px ui-monospace, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('TARGET LINE (EVALUATION HORIZON)', GAME_LEFT + 10, TARGET_Y - 8);

      // 5. Prediction Aim Marker on Target Line
      const targetAimX = pointToX(futureOffset);
      ctx.strokeStyle = gunType === 'RED' ? '#ef4444' : '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetAimX, TARGET_Y, 7, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = gunType === 'RED' ? '#ef4444' : '#10b981';
      ctx.beginPath();
      ctx.arc(targetAimX, TARGET_Y, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = '11px ui-monospace, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${predictionSeconds}s AIM`, targetAimX, TARGET_Y - 14);

      // -------------------------------------------------------------
      // PRICE PRESENTATION (MODIFICATION: JUST SHOW PRESENT POINT)
      // -------------------------------------------------------------
      const presentY = priceToY(currentPrice);
      const presentX = pointToX(0); // Leftmost tick of current inspection horizon

      // Optional preview if user toggled "Show Future Curve" for debugging
      if (!showPresentOnly) {
        ctx.beginPath();
        for (let i = 0; i < DISPLAY_POINTS; i++) {
          const ptIdx = currentIndex + i;
          if (ptIdx >= prices.length) break;
          const px = pointToX(i);
          const py = priceToY(prices[ptIdx].price);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = 'rgba(100, 116, 139, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // THE PRESENT POINT - High-tech Radar Beacon
      const pulseSize = 10 + Math.sin(radarPulseRef.current) * 4;
      const pulseAlpha = 0.3 + Math.sin(radarPulseRef.current) * 0.2;

      // Horizontal tracking laser across the arena at current price
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(GAME_LEFT, presentY);
      ctx.lineTo(GAME_RIGHT, presentY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Present Point Outer Glowing Ring
      ctx.strokeStyle = `rgba(56, 189, 248, ${pulseAlpha})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(presentX, presentY, pulseSize + 8, 0, Math.PI * 2);
      ctx.stroke();

      // Present Point Inner Ring
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(presentX, presentY, 8, 0, Math.PI * 2);
      ctx.stroke();

      // Center solid core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(presentX, presentY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Present Point Crosshair Reticle
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(presentX - 16, presentY);
      ctx.lineTo(presentX + 16, presentY);
      ctx.moveTo(presentX, presentY - 16);
      ctx.lineTo(presentX, presentY + 16);
      ctx.stroke();

      // Live Tag: PRESENT PRICE
      const tagText = `PRESENT: $${currentPrice.toFixed(2)}`;
      ctx.font = 'bold 12px ui-monospace, monospace';
      const textMetrics = ctx.measureText(tagText);
      const tagWidth = textMetrics.width + 16;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fillRect(presentX + 22, presentY - 14, tagWidth, 24);
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.strokeRect(presentX + 22, presentY - 14, tagWidth, 24);

      ctx.fillStyle = '#38bdf8';
      ctx.textAlign = 'left';
      ctx.fillText(tagText, presentX + 30, presentY + 2);

      // Subtitle indicator: "ONLY PRESENT POINT ACTIVE"
      if (showPresentOnly) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px ui-monospace, monospace';
        ctx.fillText('• PRESENT POINT ACTIVE (FUTURE/OLD HIDDEN)', GAME_LEFT + 15, GAME_BOTTOM - 15);
      }

      // 6. Draw Bullets
      for (const bullet of bulletsRef.current) {
        const isRed = bullet.gun === 'RED';
        const color = isRed ? '#ef4444' : '#10b981';
        const trailColor = isRed ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)';

        // Bullet laser trail
        ctx.strokeStyle = trailColor;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(bullet.x, bullet.y);
        ctx.lineTo(bullet.x, bullet.y + 18);
        ctx.stroke();

        // Bullet head
        ctx.fillStyle = color;
        ctx.fillRect(bullet.x - BULLET_SIZE / 2, bullet.y - BULLET_SIZE / 2, BULLET_SIZE, BULLET_SIZE * 1.6);

        // Core white glint
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bullet.x - 1, bullet.y - 1, 2, 4);
      }

      // 7. Draw Player / Turret
      const pX = playerXRef.current;
      const isRedGun = gunType === 'RED';
      const turretColor = isRedGun ? '#ef4444' : '#10b981';
      const turretDark = isRedGun ? '#7f1d1d' : '#064e3b';

      // Laser guide line from barrel to target line
      ctx.strokeStyle = isRedGun ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 4]);
      ctx.beginPath();
      ctx.moveTo(pX, PLAYER_Y - PLAYER_SIZE - 20);
      ctx.lineTo(pX, TARGET_Y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Turret base chassis
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(pX - PLAYER_SIZE, PLAYER_Y - 4, PLAYER_SIZE * 2, 10, 3);
      ctx.fill();
      ctx.stroke();

      // Turret hull
      ctx.fillStyle = turretDark;
      ctx.strokeStyle = turretColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(pX - PLAYER_SIZE * 0.8, PLAYER_Y - 4);
      ctx.lineTo(pX - PLAYER_SIZE * 0.4, PLAYER_Y - PLAYER_SIZE);
      ctx.lineTo(pX + PLAYER_SIZE * 0.4, PLAYER_Y - PLAYER_SIZE);
      ctx.lineTo(pX + PLAYER_SIZE * 0.8, PLAYER_Y - 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Gun barrel
      ctx.fillStyle = turretColor;
      ctx.fillRect(pX - 3, PLAYER_Y - PLAYER_SIZE - 22, 6, 24);

      // Gun muzzle flash
      if (muzzleFlashRef.current > 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${muzzleFlashRef.current})`;
        ctx.beginPath();
        ctx.arc(pX, PLAYER_Y - PLAYER_SIZE - 22, 12 * muzzleFlashRef.current, 0, Math.PI * 2);
        ctx.fill();
      }

      // Direction icon on player
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(isRedGun ? '▲' : '▼', pX, PLAYER_Y - 8);

      // 8. Draw Particles
      for (const p of particlesRef.current) {
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 9. Draw Floating Combat Text
      for (const ft of floatingTextsRef.current) {
        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.fillStyle = ft.color;
        ctx.font = 'bold 14px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 6;
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // 10. Pause or Game Over overlay
      if (isPaused && !gameOver) {
        ctx.fillStyle = 'rgba(3, 7, 18, 0.75)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 32px ui-monospace, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', WIDTH / 2, HEIGHT / 2 - 10);
        ctx.font = '14px ui-monospace, monospace';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('PRESS [P] OR CLICK RESUME TO CONTINUE', WIDTH / 2, HEIGHT / 2 + 25);
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    prices,
    currentIndex,
    onAdvanceIndex,
    predictionSeconds,
    gunType,
    showPresentOnly,
    gameOver,
    isPaused,
    streak,
    pointToX,
    priceToY,
    minPrice,
    priceRange,
    currentPrice,
    futureOffset,
    playerXRef,
    checkBulletResult
  ]);

  // Handle canvas mouse move to aim turret
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameOver || isPaused) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = WIDTH / rect.width;
    const canvasX = (e.clientX - rect.left) * scaleX;
    playerXRef.current = Math.max(GAME_LEFT, Math.min(GAME_RIGHT, canvasX));
  };

  // Click canvas to fire
  const handleCanvasClick = () => {
    if (gameOver) {
      onRestart();
      return;
    }
    fireBullet();
  };

  return (
    <div className="relative w-full aspect-[1200/700] rounded-xl overflow-hidden shadow-2xl border border-slate-800 bg-[#090d16]">
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onMouseMove={handleMouseMove}
        onClick={handleCanvasClick}
        className="w-full h-full cursor-crosshair block select-none"
      />
    </div>
  );
};
