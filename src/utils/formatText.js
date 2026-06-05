const ROMAN_RE = /^m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$/i

const STOPWORDS = new Set([
  'di','da','del','dei','della','delle','degli',
  'il','lo','la','le','li','gli',
  'al','alla','alle','agli','dai','dal','dalla',
  'ci','mi','si','ti',
])

const STREET_ABBREVIATIONS = [
  [/\bV\.\s*P\.\s*/gi, 'Via Palazzo '],
  [/\bV\.\s*/gi, 'Via '],
  [/\bP\.\s*/gi, 'Piazza '],
  [/\bC\.so\s*/gi, 'Corso '],
  [/\bC\.le\s*/gi, 'Corso '],
]

function isRomanNumeral(word) {
  if (word.length < 1)        return false
  if (STOPWORDS.has(word))    return false
  if (!/^[ivxlcdm]+$/i.test(word)) return false
  return ROMAN_RE.test(word)
}

export function titleCase(str) {
  if (!str) return ''
  let isFirstWord = true

  return normalizeEscapedText(str)
    .toLowerCase()
    .replace(/\b[a-z]+\b/g, word =>
    {
      if (isRomanNumeral(word)) {
        isFirstWord = false
        return word.toUpperCase()
      }

      const shouldKeepLowercase = !isFirstWord && STOPWORDS.has(word)
      isFirstWord = false

      return shouldKeepLowercase
        ? word
        : capitalizeWord(word)
    }
    )
}

export function formatDirection(str) {
  if (!str) return ''

  const expanded = STREET_ABBREVIATIONS.reduce(
    (value, [pattern, replacement]) => value.replace(pattern, replacement),
    normalizeEscapedText(str)
  )

  return titleCase(expanded)
}

function normalizeEscapedText(str) {
  return String(str)
    .replace(/\\+'/g, "'")
    .replace(/\\+/g, '')
    .replace(/&#039;|&apos;/gi, "'")
    .replace(/&nbsp;/gi, ' ')
    .replace(/\bCitta'/gi, 'Città')
    .replace(/\s*\/\s*/g, ' / ')
    .replace(/\s+/g, ' ')
    .trim()
}

function capitalizeWord(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}
