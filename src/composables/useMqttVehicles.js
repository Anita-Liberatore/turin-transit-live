import { ref, onUnmounted } from 'vue'
import mqtt from 'mqtt'

const BROKER       = 'wss://mapi.5t.torino.it/scre'
const BATCH_MS     = 250
const TORINO_BOUNDS = { latMin: 44, latMax: 46, lngMin: 7, lngMax: 8.5 }
const LINE_PATTERN  = /^\d+[A-Z]?$/

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
  const vehicles    = ref({})
  const updateTick  = ref(0)   // counter incrementato al flush — watch su questo invece di deep:true
  const connected   = ref(false)
  const connecting  = ref(false)
  const error       = ref(null)
  let client = null
  let batch  = {}
  let batchTimer = null

  function flushBatch() {
    batchTimer = null
    if (Object.keys(batch).length === 0) return
    Object.assign(vehicles.value, batch)
    batch = {}
    updateTick.value++
  }

  function scheduleBatch() {
    if (!batchTimer) batchTimer = setTimeout(flushBatch, BATCH_MS)
  }

  function connect() {
    disconnect()
    vehicles.value   = {}
    batch            = {}
    updateTick.value = 0
    error.value      = null
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
          const previous = vehicles.value[id] || {}
          const trail = [...(previous.trail || [])]
          const latestPoint = [flatLat, flatLng]

          if (!trail.length || trail[trail.length - 1][0] !== flatLat || trail[trail.length - 1][1] !== flatLng) {
            trail.push(latestPoint)
            if (trail.length > 24) trail.shift()
          }

          batch[id] = {
            ...previous,
            id,
            line:      parseTopic(topic),
            lat:       flatLat,
            lng:       flatLng,
            heading:   parseFloat(heading) || 0,
            speed:     parseFloat(speed)   || 0,
            direction: direction || '',
            nextStop:  nextStop ? String(nextStop).replace('gtt:', '') : '',
            trail,
          }

          scheduleBatch()
        } catch { /* malformed payload */ }
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
    if (batchTimer) { clearTimeout(batchTimer); batchTimer = null }
    if (client) { try { client.end(true) } catch { /* ignore */ } client = null }
    connected.value  = false
    connecting.value = false
    batch = {}
  }

  onUnmounted(disconnect)

  return { vehicles, updateTick, connected, connecting, error, connect, disconnect }
}
