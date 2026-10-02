import { PricePoint } from '../types/game';
import { generateCsvString } from '../data/defaultDatasets';

export function generateSingleFileHtml(prices: PricePoint[]): string {
  const csvData = generateCsvString(prices);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CSV Price Prediction Arcade - GitHub Pages Edition</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      background-color: #090d16;
      color: #e2e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace;
      display: flex;
      flex-direction: column;
      align-items: center;
      min-height: 100vh;
      padding: 16px;
    }
    header {
      width: 100%;
      max-width: 1200px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #1e293b;
      margin-bottom: 16px;
    }
    h1 { font-size: 1.25rem; font-weight: 700; color: #38bdf8; font-family: monospace; }
    .hud {
      width: 100%;
      max-width: 1200px;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 14px 20px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 14px;
      font-family: monospace;
    }
    .hud-item { display: flex; flex-direction: column; gap: 4px; }
    .hud-label { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; }
    .hud-val { font-size: 1.25rem; font-weight: bold; color: #ffffff; }
    #canvas-container {
      width: 100%;
      max-width: 1200px;
      aspect-ratio: 1200 / 700;
      position: relative;
      background: #090d16;
      border: 1px solid #334155;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
    }
    canvas { width: 100%; height: 100%; display: block; cursor: crosshair; }
    .controls {
      width: 100%;
      max-width: 1200px;
      background: #0f172a;
      border: 1px solid #1e293b;
      border-radius: 12px;
      padding: 14px 20px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-top: 14px;
    }
    button {
      background: #1e293b;
      color: #f1f5f9;
      border: 1px solid #334155;
      padding: 8px 16px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 0.85rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    button:hover { background: #334155; }
    button.red-gun { background: #dc2626; border-color: #ef4444; color: #fff; }
    button.green-gun { background: #059669; border-color: #10b981; color: #fff; }
    button.fire-btn { background: #eab308; border-color: #facc15; color: #020617; font-weight: bold; }
    .shortcuts-bar {
      width: 100%;
      max-width: 1200px;
      text-align: center;
      font-family: monospace;
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 10px;
    }
  </style>
</head>
<body>
  <header>
    <h1>CSV Price Prediction Arcade</h1>
    <span style="font-family: monospace; font-size: 0.8rem; color: #94a3b8;">GitHub Pages Live Static Edition</span>
  </header>

  <div class="hud">
    <div class="hud-item">
      <span class="hud-label">Capital</span>
      <span id="stat-money" class="hud-val">$10,000</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Present Price</span>
      <span id="stat-price" class="hud-val" style="color: #38bdf8;">$0.00</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Gun Prediction</span>
      <span id="stat-gun" class="hud-val" style="color: #ef4444;">▲ RED (UP)</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Horizon</span>
      <span id="stat-time" class="hud-val" style="color: #eab308;">10s</span>
    </div>
    <div class="hud-item">
      <span class="hud-label">Score (Hits/Misses)</span>
      <span id="stat-stats" class="hud-val" style="color: #94a3b8;">0 / 0</span>
    </div>
  </div>

  <div id="canvas-container">
    <canvas id="gameCanvas" width="1200" height="700"></canvas>
  </div>

  <div class="controls">
    <div style="display:flex; gap: 8px;">
      <button id="btn-toggle-gun" class="red-gun">TAB: GUN (RED)</button>
      <button id="btn-fire" class="fire-btn">SPACE: FIRE</button>
    </div>
    <div style="display:flex; gap: 6px; align-items:center;">
      <span style="font-family:monospace; font-size:0.8rem; color:#94a3b8;">TIME:</span>
      <button onclick="setHorizon(1)">1s</button>
      <button onclick="setHorizon(2)">2s</button>
      <button onclick="setHorizon(5)">5s</button>
      <button onclick="setHorizon(10)">10s</button>
      <button onclick="adjustHorizon(-1)">-</button>
      <button onclick="adjustHorizon(1)">+</button>
    </div>
    <div style="display:flex; gap: 8px;">
      <button id="btn-sfx" onclick="toggleMute()">SFX: ON</button>
      <button onclick="resetGame()">RESET (R)</button>
    </div>
  </div>

  <div class="shortcuts-bar">
    KEYS: [A/D or ARROWS] Move · [SPACE] Fire · [TAB] Switch Gun · [1,2,5,0] Time Horizon · [R] Reset · [M] Mute SFX
  </div>

  <script>
    // Embedded CSV Data
    const rawCsv = ${JSON.stringify(csvData)};

    function parseCsv(text) {
      const lines = text.trim().split(/\\r?\\n/).filter(l => l.trim().length > 0);
      const pts = [];
      const hasHeader = lines[0].toLowerCase().includes('price') || lines[0].toLowerCase().includes('time');
      const start = hasHeader ? 1 : 0;
      for (let i = start; i < lines.length; i++) {
        const parts = lines[i].split(',').map(s => s.trim());
        if (parts.length >= 2) {
          pts.push({ time: Number(parts[0]) || i, price: Number(parts[1]) || 100 });
        }
      }
      return pts;
    }

    const prices = parseCsv(rawCsv);
    let allPrices = prices.map(p => p.price);
    let minPrice = Math.min(...allPrices);
    let maxPrice = Math.max(...allPrices);
    let priceRange = maxPrice - minPrice === 0 ? 1 : maxPrice - minPrice;

    // Web Audio Synthesizer
    let audioCtx = null;
    let isMuted = false;

    function getAudio() {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return audioCtx;
    }

    function playShoot(gun) {
      if (isMuted) return;
      try {
        const ctx = getAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = gun === 'RED' ? 'sawtooth' : 'triangle';
        osc.frequency.setValueAtTime(gun === 'RED' ? 880 : 540, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.13);
      } catch(e){}
    }

    function playHit() {
      if (isMuted) return;
      try {
        const ctx = getAudio();
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const t = ctx.currentTime + i * 0.05;
          osc.frequency.setValueAtTime(f, t);
          gain.gain.setValueAtTime(0.2, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(t);
          osc.stop(t + 0.19);
        });
      } catch(e){}
    }

    function playMiss() {
      if (isMuted) return;
      try {
        const ctx = getAudio();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.19);
      } catch(e){}
    }

    function toggleMute() {
      isMuted = !isMuted;
      document.getElementById('btn-sfx').textContent = isMuted ? 'SFX: OFF' : 'SFX: ON';
    }

    // Game Constants
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

    let money = 10000;
    let shots = 0;
    let hits = 0;
    let misses = 0;
    let streak = 0;
    let playerX = WIDTH / 2;
    let currentIndex = 0;
    let gameTime = 0.0;
    let gunType = 'RED';
    let predictionSeconds = 10.0;
    let gameOver = false;
    let bullets = [];
    let particles = [];
    let floatingTexts = [];

    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    function pointToX(idx) {
      return Math.round(GAME_LEFT + (idx / (DISPLAY_POINTS - 1)) * (GAME_RIGHT - GAME_LEFT));
    }

    function priceToY(price) {
      const norm = Math.max(0, Math.min(1, (price - minPrice) / priceRange));
      return Math.round(GAME_BOTTOM - norm * (GAME_BOTTOM - GAME_TOP));
    }

    function resetGame() {
      money = 10000;
      shots = 0;
      hits = 0;
      misses = 0;
      streak = 0;
      playerX = WIDTH / 2;
      bullets = [];
      currentIndex = 0;
      gameTime = 0;
      gameOver = false;
      updateHud();
    }

    function toggleGun() {
      gunType = gunType === 'RED' ? 'GREEN' : 'RED';
      const btn = document.getElementById('btn-toggle-gun');
      btn.className = gunType === 'RED' ? 'red-gun' : 'green-gun';
      btn.textContent = 'TAB: GUN (' + gunType + ')';
      updateHud();
    }

    function setHorizon(s) {
      predictionSeconds = s;
      updateHud();
    }

    function adjustHorizon(delta) {
      predictionSeconds = Math.max(1, Math.min(100, predictionSeconds + delta));
      updateHud();
    }

    function fireBullet() {
      if (gameOver) return;
      const distance = PLAYER_Y - TARGET_Y;
      const speed = distance / predictionSeconds;
      const futureOffset = Math.round(predictionSeconds / SECONDS_PER_POINT);
      const targetIdx = Math.min(prices.length - 1, currentIndex + futureOffset);

      bullets.push({
        x: playerX,
        y: PLAYER_Y - PLAYER_SIZE - 15,
        speed: speed,
        gun: gunType,
        firePrice: prices[currentIndex].price,
        targetIndex: targetIdx
      });
      shots++;
      playShoot(gunType);
      updateHud();
    }

    function updateHud() {
      document.getElementById('stat-money').textContent = '$' + money.toLocaleString();
      document.getElementById('stat-price').textContent = '$' + (prices[currentIndex] ? prices[currentIndex].price.toFixed(2) : '0.00');
      const gunElem = document.getElementById('stat-gun');
      gunElem.textContent = gunType === 'RED' ? '▲ RED (UP)' : '▼ GREEN (DOWN)';
      gunElem.style.color = gunType === 'RED' ? '#ef4444' : '#10b981';
      document.getElementById('stat-time').textContent = predictionSeconds + 's';
      document.getElementById('stat-stats').textContent = hits + ' / ' + misses + ' (' + shots + ' shots)';
    }

    // Input listeners
    const keys = {};
    window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
      if (e.code === 'Space') { e.preventDefault(); fireBullet(); }
      if (e.code === 'Tab') { e.preventDefault(); toggleGun(); }
      if (e.code === 'Digit1') setHorizon(1);
      if (e.code === 'Digit2') setHorizon(2);
      if (e.code === 'Digit5') setHorizon(5);
      if (e.code === 'Digit0') setHorizon(10);
      if (e.code === 'Minus' || e.code === 'NumpadSubtract') adjustHorizon(-1);
      if (e.code === 'Equal' || e.code === 'NumpadAdd') adjustHorizon(1);
      if (e.code === 'KeyR') resetGame();
      if (e.code === 'KeyM') toggleMute();
    });
    window.addEventListener('keyup', (e) => { keys[e.code] = false; });

    document.getElementById('btn-toggle-gun').onclick = toggleGun;
    document.getElementById('btn-fire').onclick = fireBullet;

    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const scaleX = WIDTH / rect.width;
      playerX = Math.max(GAME_LEFT, Math.min(GAME_RIGHT, (e.clientX - rect.left) * scaleX));
    });

    // Main Game Loop
    let lastTime = performance.now();
    let tickAcc = 0;

    function loop(now) {
      const dt = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;

      if (!gameOver) {
        // Player keyboard move
        const speed = 500;
        if (keys['KeyA'] || keys['ArrowLeft']) playerX = Math.max(GAME_LEFT, playerX - speed * dt);
        if (keys['KeyD'] || keys['ArrowRight']) playerX = Math.min(GAME_RIGHT, playerX + speed * dt);

        // CSV tick
        tickAcc += dt;
        while (tickAcc >= SECONDS_PER_POINT) {
          tickAcc -= SECONDS_PER_POINT;
          currentIndex++;
          if (currentIndex >= prices.length - 1) {
            currentIndex = prices.length - 1;
            break;
          }
          updateHud();
        }

        // Bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
          const b = bullets[i];
          b.y -= b.speed * dt;
          if (b.y <= TARGET_Y) {
            // Evaluate
            const futurePrice = prices[b.targetIndex].price;
            let dir = futurePrice > b.firePrice ? 'RED' : futurePrice < b.firePrice ? 'GREEN' : 'FLAT';
            const hit = b.gun === dir;
            if (hit) {
              money += 10;
              hits++;
              streak++;
              playHit();
              floatingTexts.push({ x: b.x, y: TARGET_Y - 10, text: '+$10 [HIT!]', color: '#10b981', life: 0, maxLife: 0.8 });
            } else {
              money -= 10;
              misses++;
              streak = 0;
              playMiss();
              floatingTexts.push({ x: b.x, y: TARGET_Y - 10, text: '-$10 [MISS]', color: '#ef4444', life: 0, maxLife: 0.8 });
            }
            if (money <= 0) { money = 0; gameOver = true; }
            bullets.splice(i, 1);
            updateHud();
          }
        }
      }

      // Render
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, WIDTH, HEIGHT);

      // Playfield Border
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(GAME_LEFT, GAME_TOP, GAME_RIGHT - GAME_LEFT, GAME_BOTTOM - GAME_TOP);

      // Time lines
      ctx.strokeStyle = '#1e293b';
      for (let i = 0; i <= DISPLAY_POINTS; i += 10) {
        const x = pointToX(i);
        ctx.beginPath();
        ctx.moveTo(x, GAME_TOP);
        ctx.lineTo(x, GAME_BOTTOM);
        ctx.stroke();
      }

      // Target Line
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(GAME_LEFT, TARGET_Y);
      ctx.lineTo(GAME_RIGHT, TARGET_Y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Present Point (User requirement: JUST show present point)
      const curPrice = prices[currentIndex] ? prices[currentIndex].price : 100;
      const curY = priceToY(curPrice);
      const curX = pointToX(0);

      // Laser guide line
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.moveTo(GAME_LEFT, curY);
      ctx.lineTo(GAME_RIGHT, curY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Present radar crosshair
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(curX, curY, 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(curX, curY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('PRESENT POINT: $' + curPrice.toFixed(2), curX + 20, curY + 4);

      // Draw Bullets
      for (const b of bullets) {
        ctx.fillStyle = b.gun === 'RED' ? '#ef4444' : '#10b981';
        ctx.fillRect(b.x - BULLET_SIZE/2, b.y - BULLET_SIZE/2, BULLET_SIZE, BULLET_SIZE * 1.5);
      }

      // Draw Player Turret
      ctx.fillStyle = gunType === 'RED' ? '#ef4444' : '#10b981';
      ctx.fillRect(playerX - 12, PLAYER_Y - 20, 24, 20);
      ctx.fillRect(playerX - 2, PLAYER_Y - 38, 4, 18);

      // Floating combat texts
      for (let i = floatingTexts.length - 1; i >= 0; i--) {
        const ft = floatingTexts[i];
        ft.life += dt;
        ft.y -= 40 * dt;
        if (ft.life >= ft.maxLife) {
          floatingTexts.splice(i, 1);
        } else {
          ctx.fillStyle = ft.color;
          ctx.font = 'bold 14px monospace';
          ctx.fillText(ft.text, ft.x - 20, ft.y);
        }
      }

      // Game Over Screen
      if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 44px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', WIDTH / 2, HEIGHT / 2 - 40);
        ctx.fillStyle = '#ffffff';
        ctx.font = '20px monospace';
        ctx.fillText('FINAL CAPITAL: $' + money, WIDTH / 2, HEIGHT / 2 + 10);
        ctx.fillStyle = '#eab308';
        ctx.fillText('PRESS R TO RESTART', WIDTH / 2, HEIGHT / 2 + 50);
        ctx.textAlign = 'left';
      }

      requestAnimationFrame(loop);
    }

    updateHud();
    requestAnimationFrame(loop);
  </script>
</body>
</html>`;
}
