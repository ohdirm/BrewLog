export const formatScaledAmount = (rawAmount: string, multiplier: number): string => {
  if (multiplier === 1) return rawAmount;
  const normalized = rawAmount.replace(',', '.').trim();
  const num = Number(normalized);
  if (!Number.isFinite(num) || normalized === '') return rawAmount;
  const scaled = num * multiplier;
  return Number.isInteger(scaled) ? String(scaled) : String(Number(scaled.toFixed(2)));
};

export const calculateWaterFromRatio = (coffeeGrams: number, ratioWaterPart: number): number => {
  if (!Number.isFinite(coffeeGrams) || !Number.isFinite(ratioWaterPart) || coffeeGrams <= 0 || ratioWaterPart <= 0) {
    return 0;
  }
  return Math.round(coffeeGrams * ratioWaterPart);
};

