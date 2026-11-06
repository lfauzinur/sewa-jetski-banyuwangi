export const DEFAULT_DEPOSIT_PERCENT = 30;

export function calculateDepositAmount(total, percent = DEFAULT_DEPOSIT_PERCENT) {
  const safeTotal = Math.max(0, Number(total) || 0);
  if (!safeTotal) return 0;
  return Math.min(safeTotal, Math.ceil((safeTotal * percent / 100) / 1000) * 1000);
}
