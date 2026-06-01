const BASE_URL   = '/gtt-proxy/cms/index.php'
const ARRIVI_URL = '/gtt-proxy/cms/percorari/arrivi'

export async function fetchStopInfo(stopId) {
  const res = await fetch(`${ARRIVI_URL}?palina=${encodeURIComponent(stopId)}&view=palina`)
  if (!res.ok) return null
  const html = await res.text()

  const nameMatch    = html.match(/<strong><u>\d+\s*-\s*([^<]+)<\/u><\/strong>/)
  const addressMatch = html.match(/Fermata:\s*<strong>[^<]+<\/strong><br>([^<]+)<\/p>/)

  if (!nameMatch) return null

  return {
    name:    titleCaseStop(nameMatch[1].trim()),
    address: addressMatch ? titleCaseStop(addressMatch[1].trim()) : null,
  }
}

function titleCaseStop(str) {
  return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase())
}

export async function fetchStopLines(stopId) {
  const url = `${BASE_URL}?option=com_gtt&task=palina.getTransitiOld&palina=${encodeURIComponent(stopId)}&realtime=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fermata ${stopId} non disponibile (${res.status})`)
  const data = await res.json()
  if (!Array.isArray(data)) throw new Error('Risposta API non valida')
  return data.map(normalizeStopLine)
}

function normalizeStopLine(raw) {
  const realtimeTimes = raw.PassaggiRT ?? []
  const hasRealtime   = realtimeTimes.length > 0

  return {
    line:          raw.Linea,
    direction:     raw.Direzione,
    times:         hasRealtime ? realtimeTimes : parseScheduled(raw.PassaggiPR ?? []),
    isScheduled:   !hasRealtime,
    hasAlert:      !!raw.Avviso,
  }
}

function parseScheduled(times) {
  return times.map(t => t.replace(/[^\d:]/g, ''))
}
