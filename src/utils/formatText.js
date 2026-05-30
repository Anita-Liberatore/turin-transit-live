const ROMAN_RE = /^m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/i

const STOPWORDS = new Set([
  'di','da','del','dei','della','delle','degli',
  'il','lo','la','le','li','gli',
  'al','alla','alle','agli','dai','dal','dalla',
  'ci','mi','si','ti',
])

function isRomanNumeral(word) {
  if (word.length < 1)        return false
  if (STOPWORDS.has(word))    return false
  if (!/^[ivxlcdm]+$/i.test(word)) return false
  return ROMAN_RE.test(word)
}

export function titleCase(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .replace(/\b[a-z]+\b/g, word =>
      isRomanNumeral(word)
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
}
