import { ref, onUnmounted } from 'vue'
import mqtt from 'mqtt'

const BROKER = 'wss://mapi.5t.torino.it/scre'
const TORINO_BOUNDS = { latMin: 44, latMax: 46, lngMin: 7, lngMax: 8.5 }
const LINE_PATTERN = /^\d+[A-Z]?$/

function parseTopic(topic) {
  const parts = topic.split('/')
  const raw = parts.find(p => LINE_PATTERN.test(p) && p !== '0') ?? parts[1] ?? '?'
  return raw.replace(/U$/, '')
}

function isInTorino(lat, lng) {
  return lat >= TORINO_BOUNDS.latMin && lat <= TORINO_BOUNDS.latMax
      && lng >= TORINO_BOUNDS.lngMin && lng <= TORINO_BOUNDS.lngMax
}

export function useMqttVehicles() {
  const vehicles   = ref({})
  const connected  = ref(false)
  const connecting = ref(false)
  const error      = ref(null)
  let client = null

  function connect() {
    disconnect()
    vehicles.value = {}
    error.value    = null
    connecting.value = true

    try {
      client = mqtt.connect(BROKER, {
        keepalive:       30,
        reconnectPeriod: 5000,
        connectTimeout:  10000,
        clean:           true,
      })

      client.on('connect', () => {
        connected.value  = true
        connecting.value = false
        client.subscribe('#')
      })

      client.on('message', (topic, payload) => {
        try {
          const data = JSON.parse(payload.toString())
          if (!Array.isArray(data) || data.length < 2) return

          const [lat, lng, heading, speed, tripId, direction, nextStop] = data
          const flatLat = parseFloat(lat)
          const flatLng = parseFloat(lng)

          if (!flatLat || !flatLng || !isInTorino(flatLat, flatLng)) return

          const id = tripId || topic

          vehicles.value[id] = {
            id,
            line:      parseTopic(topic),
            lat:       flatLat,
            lng:       flatLng,
            heading:   parseFloat(heading) || 0,
            speed:     parseFloat(speed)   || 0,
            direction: direction  || '',
            nextStop:  nextStop ? String(nextStop).replace('gtt:', '') : '',
          }
        } catch { /* malformed payload — skip silently */ }
      })

      client.on('error',     err => { error.value = err.message; connected.value = false; connecting.value = false })
      client.on('close',     ()  => { connected.value = false })
      client.on('reconnect', ()  => { connecting.value = true; error.value = null })
    } catch (e) {
      error.value      = e.message
      connecting.value = false
    }
  }

  function disconnect() {
    if (client) { try { client.end(true) } catch { /* ignore */ } client = null }
    connected.value  = false
    connecting.value = false
  }

  onUnmounted(disconnect)

  return { vehicles, connected, connecting, error, connect, disconnect }
}
