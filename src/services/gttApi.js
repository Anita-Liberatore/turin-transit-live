const GPA_BASE = 'https://gpa.madbob.org'

export async function fetchStopDepartures(stopId) {
  const res = await fetch(`${GPA_BASE}/query.php?stop=${encodeURIComponent(stopId)}`)
  if (!res.ok) throw new Error(`Errore API fermata ${stopId}: ${res.status}`)
  return res.json()
}
