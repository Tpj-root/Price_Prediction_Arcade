import { useState, useRef, useEffect, useCallback } from 'react';
import { GunType, MarketDataset, PricePoint } from './types/game';
import { PRESET_DATASETS } from './data/defaultDatasets';
import { sound } from './utils/audio';
import { Header } from './components/Header';
import { GameHud } from './components/GameHud';
import { GameCanvas } from './components/GameCanvas';
import { ArcadeControls } from './components/ArcadeControls';
import { CsvModal } from './components/CsvModal';
import { GitHubPagesModal } from './components/GitHubPagesModal';

const STARTING_MONEY = 10000;
const PLAYER_SPEED = 500; // pixels per second

export default function App() {
  // Current active dataset
  const [activeDataset, setActiveDataset] = useState<MarketDataset>(PRESET_DATASETS[0]);
  const [prices, setPrices] = useState<PricePoint[]>(PRESET_DATASETS[0].prices);
  
  // Game session states
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [money, setMoney] = useState<number>(STARTING_MONEY);
  const [shots, setShots] = useState<number>(0);
  const [hits, setHits] = useState<number>(0);
  const [misses, setMisses] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [maxStreak, setMaxStreak] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Settings
  const [gunType, setGunType] = useState<GunType>('RED');
  const [predictionSeconds, setPredictionSeconds] = useState<number>(10.0);
  const [showPresentOnly, setShowPresentOnly] = useState<boolean>(true); // Default to TRUE as requested!
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  // Modals
  const [isCsvModalOpen, setIsCsvModalOpen] = useState<boolean>(false);
  const [isGitHubModalOpen, setIsGitHubModalOpen] = useState<boolean>(false);

  // Canvas Player position and fire callback references
  const playerXRef = useRef<number>(600);
  const triggerFireRef = useRef<(() => void) | null>(null);

  // Keyboard continuous holding state (for smooth A/D or Arrow movement)
  const keysPressedRef = useRef<{ [key: string]: boolean }>({});

  // Reset Game function
  const handleResetGame = useCallback(() => {
    setMoney(STARTING_MONEY);
    setShots(0);
    setHits(0);
    setMisses(0);
    setStreak(0);
    setCurrentIndex(0);
    setGameOver(false);
    playerXRef.current = 600;
  }, []);

  // Handle hit
  const handleHit = useCallback((reward: number, currentStreak: number) => {
    setMoney(prev => prev + reward);
    setHits(prev => prev + 1);
    setShots(prev => prev + 1);
    setStreak(currentStreak);
    setMaxStreak(prev => Math.max(prev, currentStreak));
  }, []);

  // Handle miss
  const handleMiss = useCallback((penalty: number) => {
    setMisses(prev => prev + 1);
    setShots(prev => prev + 1);
    setStreak(0);
    setMoney(prev => {
      const nextMoney = prev - penalty;
      if (nextMoney <= 0) {
        setGameOver(true);
        sound.playGameOver();
        return 0;
      }
      return nextMoney;
    });
  }, []);

  // Advance index on 1-second ticks
  const handleAdvanceIndex = useCallback(() => {
    setCurrentIndex(prev => {
      if (prev < prices.length - 1) {
        return prev + 1;
      }
      return prev;
    });
  }, [prices.length]);

  // Switch gun type
  const handleToggleGun = useCallback(() => {
    setGunType(prev => (prev === 'RED' ? 'GREEN' : 'RED'));
  }, []);

  // Fire action
  const handleFire = useCallback(() => {
    if (triggerFireRef.current) {
      triggerFireRef.current();
    }
  }, []);

  // Manual nudge movement
  const handleMoveLeft = useCallback(() => {
    playerXRef.current = Math.max(60, playerXRef.current - 45);
  }, []);

  const handleMoveRight = useCallback(() => {
    playerXRef.current = Math.min(1140, playerXRef.current + 45);
  }, []);

  // Audio toggles
  const handleToggleMute = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleToggleMusic = useCallback(() => {
    const playing = sound.toggleMusic();
    setIsMusicPlaying(playing);
  }, []);

  // Dataset selection
  const handleSelectDataset = useCallback((ds: MarketDataset) => {
    setActiveDataset(ds);
    setPrices(ds.prices);
    handleResetGame();
  }, [handleResetGame]);

  const handleLoadCustomPrices = useCallback((name: string, customPts: PricePoint[]) => {
    const customDs: MarketDataset = {
      id: 'custom_' + Date.now(),
      name,
      description: `User provided dataset with ${customPts.length} points`,
      prices: customPts
    };
    setActiveDataset(customDs);
    setPrices(customPts);
    handleResetGame();
  }, [handleResetGame]);

  // Keyboard event handling
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = true;

      // Avoid scrolling on space or arrows
      if (['Space', 'ArrowUp', 'ArrowDown'].includes(e.code)) {
        e.preventDefault();
      }

      if (e.code === 'Space') {
        handleFire();
      } else if (e.code === 'Tab') {
        e.preventDefault();
        setGunType(prev => {
          const next = prev === 'RED' ? 'GREEN' : 'RED';
          sound.playSwitchGun(next);
          return next;
        });
      } else if (e.code === 'Digit1') {
        setPredictionSeconds(1.0);
        sound.playTimeChange();
      } else if (e.code === 'Digit2') {
        setPredictionSeconds(2.0);
        sound.playTimeChange();
      } else if (e.code === 'Digit5') {
        setPredictionSeconds(5.0);
        sound.playTimeChange();
      } else if (e.code === 'Digit0') {
        setPredictionSeconds(10.0);
        sound.playTimeChange();
      } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
        setPredictionSeconds(prev => Math.max(1.0, prev - 1.0));
        sound.playTimeChange();
      } else if (e.code === 'Equal' || e.code === 'NumpadAdd') {
        setPredictionSeconds(prev => Math.min(100.0, prev + 1.0));
        sound.playTimeChange();
      } else if (e.code === 'KeyR') {
        handleResetGame();
      } else if (e.code === 'KeyP') {
        setIsPaused(prev => !prev);
      } else if (e.code === 'KeyM') {
        handleToggleMute();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.code] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    // Continuous keyboard movement loop
    let moveAnimFrame: number;
    let lastMoveTime = performance.now();

    const moveLoop = (time: number) => {
      const dt = (time - lastMoveTime) / 1000;
      lastMoveTime = time;

      if (!gameOver && !isPaused) {
        if (keysPressedRef.current['KeyA'] || keysPressedRef.current['ArrowLeft']) {
          playerXRef.current = Math.max(60, playerXRef.current - PLAYER_SPEED * dt);
        }
        if (keysPressedRef.current['KeyD'] || keysPressedRef.current['ArrowRight']) {
          playerXRef.current = Math.min(1140, playerXRef.current + PLAYER_SPEED * dt);
        }
      }

      moveAnimFrame = requestAnimationFrame(moveLoop);
    };

    moveAnimFrame = requestAnimationFrame(moveLoop);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      cancelAnimationFrame(moveAnimFrame);
    };
  }, [gameOver, isPaused, handleFire, handleResetGame, handleToggleMute]);

  const currentPrice = prices[currentIndex]?.price ?? 100;

  return (
    <div className="min-h-screen bg-[#06090e] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      {/* Top Bar Contract (3 zones) */}
      <Header
        currentDatasetName={activeDataset.name}
        onOpenCsvModal={() => setIsCsvModalOpen(true)}
        onOpenGitHubModal={() => setIsGitHubModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto px-4 py-6 flex flex-col gap-4">
        
        {/* HUD Statistics Bar */}
        <GameHud
          money={money}
          startingMoney={STARTING_MONEY}
          currentPrice={currentPrice}
          gunType={gunType}
          predictionSeconds={predictionSeconds}
          shots={shots}
          hits={hits}
          misses={misses}
          streak={streak}
          maxStreak={maxStreak}
          currentIndex={currentIndex}
          totalPoints={prices.length}
          showPresentOnly={showPresentOnly}
          onTogglePresentOnly={() => setShowPresentOnly(prev => !prev)}
        />

        {/* 60 FPS HTML5 Canvas Viewport */}
        <div className="relative">
          <GameCanvas
            prices={prices}
            currentIndex={currentIndex}
            onAdvanceIndex={handleAdvanceIndex}
            predictionSeconds={predictionSeconds}
            gunType={gunType}
            showPresentOnly={showPresentOnly}
            onHit={handleHit}
            onMiss={handleMiss}
            gameOver={gameOver}
            onRestart={handleResetGame}
            isPaused={isPaused}
            streak={streak}
            playerXRef={playerXRef}
            triggerFireRef={triggerFireRef}
          />
        </div>

        {/* Arcade Control Bar */}
        <ArcadeControls
          gunType={gunType}
          onToggleGun={handleToggleGun}
          predictionSeconds={predictionSeconds}
          onSetPredictionSeconds={setPredictionSeconds}
          onFire={handleFire}
          onMoveLeft={handleMoveLeft}
          onMoveRight={handleMoveRight}
          onRestart={handleResetGame}
          isPaused={isPaused}
          onTogglePause={() => setIsPaused(prev => !prev)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          isMusicPlaying={isMusicPlaying}
          onToggleMusic={handleToggleMusic}
        />

        {/* Clean Typographic Footer & Keyboard Reference */}
        <footer className="py-4 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-2">
          <div className="flex items-center gap-2">
            <span>CSV Price Prediction Arcade</span>
            <span aria-hidden="true">·</span>
            <span>Static GitHub Pages Edition</span>
            <span aria-hidden="true">·</span>
            <span className="text-sky-500">Present Point Tracking</span>
          </div>

          <div className="flex items-center gap-3">
            <span>[A/D] Move</span>
            <span>[SPACE] Fire</span>
            <span>[TAB] Gun Color</span>
            <span>[1,2,5,0] Horizon</span>
            <span>[P] Pause</span>
            <span>[R] Reset</span>
          </div>
        </footer>
      </main>

      {/* CSV Manager Modal */}
      <CsvModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        currentDatasetId={activeDataset.id}
        prices={prices}
        onSelectDataset={handleSelectDataset}
        onLoadCustomPrices={handleLoadCustomPrices}
      />

      {/* GitHub Pages Deployment Modal */}
      <GitHubPagesModal
        isOpen={isGitHubModalOpen}
        onClose={() => setIsGitHubModalOpen(false)}
        prices={prices}
      />
    </div>
  );
}
