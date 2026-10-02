export interface PricePoint {
  time: number;
  price: number;
}

export type GunType = 'RED' | 'GREEN'; // RED = UP prediction, GREEN = DOWN prediction

export interface Bullet {
  id: string;
  x: number;
  y: number;
  speed: number;
  gun: GunType;
  predictionSeconds: number;
  fireIndex: number;
  firePrice: number;
  targetIndex: number;
  createdAt: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  vy: number;
  life: number;
  maxLife: number;
  scale: number;
}

export interface GameStats {
  money: number;
  shots: number;
  hits: number;
  misses: number;
  streak: number;
  maxStreak: number;
  startingMoney: number;
}

export interface MarketDataset {
  id: string;
  name: string;
  description: string;
  prices: PricePoint[];
}
