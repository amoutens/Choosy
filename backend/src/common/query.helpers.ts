export const toArray = (v?: string | string[]): string[] | undefined =>
  v ? (Array.isArray(v) ? v : [v]) : undefined;

export const toFloat = (v?: string): number | undefined =>
  v ? parseFloat(v) : undefined;

export const toInt = (v?: string): number | undefined =>
  v ? parseInt(v) : undefined;
