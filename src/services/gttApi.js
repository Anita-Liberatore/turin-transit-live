const BASE_URL = '/gtt-proxy/cms/index.php'

export async function fetchStopLines(stopId) {
  const url = `${BASE_URL}?option=com_gtt&task=palina.getTransitiOld&palina=${encodeURIComponent(stopId)}&realtime=true`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Fermata ${stopId} non disponibile (${res.status})`)
  const data = await res.json()
  if (!Array.isArray(data)) throw new Error('Risposta API non valida')
  return data.map(normalizeStopLine)
}

function normalizeStopLine(raw) {
  return {
    line:          raw.Linea,
    direction:     raw.Direzione,
    realtimeTimes: raw.PassaggiRT ?? [],
    hasAlert:      !!raw.Avviso,
  }
}
