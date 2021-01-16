import Config from './Config';

export default function getLevelPrice(basePrice: number, currentLevel: number) {
  const price = basePrice * Math.pow(Config.LEVEL_PRICE_INCREASE, currentLevel);
  return Math.ceil(price);
}
