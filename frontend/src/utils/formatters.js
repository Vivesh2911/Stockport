export const currency = (val, symbol = '$') =>
  `${symbol}${Number(val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const pct = (val) =>
  `${val >= 0 ? '+' : ''}${Number(val || 0).toFixed(2)}%`

export const num = (val, dec = 2) => Number(val || 0).toFixed(dec)

export const colorByValue = (val) =>
  val >= 0 ? 'text-green-600' : 'text-red-600'
