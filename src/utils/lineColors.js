const COLOR_MAP = [
  [9,   '#e63329'],
  [19,  '#e67e22'],
  [39,  '#27ae60'],
  [59,  '#2980b9'],
  [79,  '#8e44ad'],
  [99,  '#16a085'],
]

export function lineColor(line) {
  const n = parseInt(line) || 0
  for (const [max, color] of COLOR_MAP) {
    if (n <= max) return color
  }
  return '#c0392b'
}
