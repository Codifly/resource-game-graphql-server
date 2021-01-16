import Config from './Config';

export default function getPrice(basePrice: number, currentAmount: number) {
  const price =
    basePrice * Math.pow(Config.OBJECT_PRICE_INCREASE, currentAmount);
  return Math.ceil(price);
}
