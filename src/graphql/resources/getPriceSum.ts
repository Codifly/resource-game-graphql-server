import getPrice from './getPrice';

export default function getPriceSum(
  basePrice: number,
  currentAmount: number,
  amount: number,
) {
  const nextAmount = currentAmount + amount;
  let cumulativePrice = 0;
  for (let i = currentAmount; i < nextAmount; i++) {
    cumulativePrice += getPrice(basePrice, i);
  }
  return cumulativePrice;
}
