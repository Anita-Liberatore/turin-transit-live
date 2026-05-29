import { ref, onUnmounted } from 'vue'
import mqtt from 'mqtt'

const BROKER = 'wss://mapi.5t.torino.it/scre'

export function useMqttVehicles() {
  const vehicles = ref({})
  const connected = ref(false)
  const connecting = ref(false)
  const error = ref(null)
  let client = null
  let fittedOnce = false

  function connect() {
    disconnect()
    vehicles.value = {}
    error.value = null
    connecting.value = true
    fittedOnce = false

    try {
      client = mqtt.connect(BROKER, {
        keepalive: 30,
        reconnectPeriod: 5000,
        connectTimeout: 10000,
        clean: true,
      })

      client.on('connect', () => {
        connected.value = true
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

          // Coordinate valide: Torino è circa 44.9–45.2 N, 7.5–7.9 E
          if (!flatLat || !flatLng) return
          if (flatLat < 44 || flatLat > 46 || flatLng < 7 || flatLng > 8.5) return

          // Estrai linea dal topic
          const parts = topic.split('/')
          const line = parts.find(p => /^\d+[A-Z]?$/.test(p) && p !== '0') || parts[1] || '?'

          const vehicleId = tripId || (topic + Math.random())

          vehicles.value[vehicleId] = {
            id: vehicleId,
            line: line.replace(/U$/, ''),  // togli la U finale
            lat: flatLat,
            lng: flatLng,
            heading: parseFloat(heading) || 0,
            speed: parseFloat(speed) || 0,
            direction: direction || '',
            nextStop: nextStop ? String(nextStop).replace('gtt:', '') : '',
            topic,
            ts: Date.now()
          }
        } catch {}
      })

      client.on('error', (err) => {
        error.value = err.message
        connected.value = false
        connecting.value = false
      })

      client.on('close', () => {
        connected.value = false
      })

      client.on('reconnect', () => {
        connecting.value = true
        error.value = null
      })
    } catch (e) {
      error.value = e.message
      connecting.value = false
    }
  }

  function disconnect() {
    if (client) {
      try { client.end(true) } catch {}
      client = null
    }
    connected.value = false
    connecting.value = false
  }

  onUnmounted(disconnect)

  return { vehicles, connected, connecting, error, connect, disconnect }
}
