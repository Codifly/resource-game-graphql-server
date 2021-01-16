const levelMultiplierMap: { [key: number]: number } = {
  1: 1,
  2: 2,
  3: 5,
  4: 7.5,
  5: 10,
};

export default function getLevelMultiplier(level: number) {
  return levelMultiplierMap[level];
}
