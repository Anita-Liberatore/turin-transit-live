import { formatDirection } from '@/utils/formatText'

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
    name:    formatDirection(nameMatch[1].trim()),
    address: addressMatch ? formatDirection(addressMatch[1].trim()) : null,
  }
}

export async function searchStopsByName(query) {
  if (!query) return []

  const url = `${BASE_URL}?option=com_gtt&view=palinejson&term=${encodeURIComponent(query)}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Ricerca fermata non disponibile (${res.status})`)
  }

  const payload = await res.json()
  const items = normalizeSearchPayload(payload)
  return items
}

function normalizeSearchPayload(payload) {
  let items = []

  if (Array.isArray(payload)) {
    items = payload
  } else if (Array.isArray(payload.data)) {
    items = payload.data
  } else if (Array.isArray(payload.items)) {
    items = payload.items
  } else if (Array.isArray(payload.results)) {
    items = payload.results
  }

  return items
    .map(normalizeStopSuggestion)
    .filter(Boolean)
}

async function fetchPageText(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Impossibile caricare i percorsi (${res.status})`)
  return await res.text()
}

export async function fetchLineRouteVariants(line) {
  if (!line) return []
  const url = `/gtt-proxy/cms/percorari/urbano?view=percorsi&bacino=U&linea=${encodeURIComponent(line)}&Regol=GE`
  const html = await fetchPageText(url)
  const variants = []
  const linkRe = /<a[^>]+href="([^"]*view=percorso[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi

  let match
  while ((match = linkRe.exec(html)) !== null) {
    const href = match[1].replace(/&amp;/g, '&')
    const title = match[2].replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (!title) continue

    const absolute = new URL(href, 'https://www.gtt.to.it')
    const percorso = absolute.searchParams.get('percorso')
    const verso = absolute.searchParams.get('verso')
    if (!percorso || !verso) continue

    variants.push({
      line,
      percorso,
      verso,
      description: title,
      href: absolute.toString(),
    })
  }

  return variants
}

export async function fetchRouteShapes(line, percorso, verso) {
  if (!line || !percorso || !verso) return []
  const url = `/gtt-proxy/cms/percorari/urbano?view=percorso&bacino=U&linea=${encodeURIComponent(line)}&percorso=${encodeURIComponent(percorso)}&verso=${encodeURIComponent(verso)}&Regol=GE`
  const html = await fetchPageText(url)
  const shapes = []
  const polylineRe = /new\s+L\.Polyline\s*\(\s*\[([\s\S]*?)\]\s*,\s*\{[\s\S]*?\}\s*\)/gi
  let match

  while ((match = polylineRe.exec(html)) !== null) {
    const coords = []
    const coordRe = /new\s+L\.LatLng\s*\(\s*([\d\.\-]+)\s*,\s*([\d\.\-]+)\s*\)/gi
    let coord
    while ((coord = coordRe.exec(match[1])) !== null) {
      coords.push([parseFloat(coord[1]), parseFloat(coord[2])])
    }

    if (coords.length > 1) {
      shapes.push(coords)
    }
  }

  return shapes
}

function normalizeStopSuggestion(item) {
  const stopNumber = String(item.value ?? item.id ?? item.palina ?? item.codice ?? item.stopId ?? '')
  const stopName = String(item.data ?? item.label ?? item.name ?? item.nome ?? item.titolo ?? item.description ?? item.desc ?? '')
  const subtitleParts = []

  if (item.localita) subtitleParts.push(String(item.localita))
  if (item.bacino) subtitleParts.push(`bacino ${String(item.bacino)}`)

  const subtitle = subtitleParts.length ? subtitleParts.join(' · ') : null

  if (!stopNumber || !stopName) return null

  return {
    id: stopNumber,
    stopNumber,
    stopName,
    subtitle,
    raw: item,
  }
}

export async function fetchStopLines(stopId) {
  const url = `${BASE_URL}?option=com_gtt&task=palina.getTransitiOld&palina=${encodeURIComponent(stopId)}&realtime=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fermata ${stopId} non disponibile (${res.status})`)
  const data = await res.json()
  if (!Array.isArray(data)) throw new Error('Risposta API non valida')
  const lines = data
    .map(normalizeStopLine)
    .filter(line => line.times.length > 0)

  if (!lines.length) {
    throw new Error(`Fermata ${stopId} non trovata o senza passaggi disponibili.`)
  }

  return lines
}

function normalizeStopLine(raw) {
  const realtimeTimes = raw.PassaggiRT ?? []
  const hasRealtime   = realtimeTimes.length > 0

  return {
    line:          raw.Linea,
    direction:     formatDirection(raw.Direzione),
    times:         hasRealtime ? realtimeTimes : parseScheduled(raw.PassaggiPR ?? []),
    isScheduled:   !hasRealtime,
    hasAlert:      !!raw.Avviso,
  }
}

function parseScheduled(times) {
  return times.map(t => t.replace(/[^\d:]/g, ''))
}
