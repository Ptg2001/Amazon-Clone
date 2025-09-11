export function formatCurrency(amount?: number, currency?: string) {
  if (typeof amount !== 'number' || isNaN(amount)) return ''
  const cur = (currency || 'USD').toUpperCase()
  try {
    return new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(amount)
  } catch {
    return `${cur} ${amount.toFixed(2)}`
  }
}

