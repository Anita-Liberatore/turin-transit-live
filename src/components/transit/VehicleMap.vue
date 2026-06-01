<template>
  <div class="vehicle-map">

    <!-- Toolbar -->
    <div class="vehicle-map__toolbar">
      <div class="vehicle-map__search">
        <BaseInput
          v-model="lineFilter"
          placeholder="Cerca linea"
          clearable
          class="vm-filter-input"
          @keyup.enter="onSearch"
        >
          <template #icon><AppIcon name="search" size="sm" /></template>
        </BaseInput>
        <button
          class="vm-search-btn"
          :disabled="!lineFilter.trim()"
          aria-label="Cerca"
          @click="onSearch"
        >
          <AppIcon name="arrow_right" size="md" />
        </button>
      </div>

      <div v-if="connected && activeFilter" class="vm-status">
        <span class="vm-status__dot"></span>
        Linea {{ activeFilter }} · {{ filteredVehicles.length }} mezzi
      </div>
    </div>

    <!-- Mappa -->
    <div class="vehicle-map__wrap">
      <div ref="mapEl" class="vehicle-map__leaflet"></div>

      <!-- Overlay di connessione iniziale -->
      <Transition name="fade-overlay">
        <div v-if="connecting" class="vm-overlay">
          <div class="vm-overlay__box">
            <div class="vm-big-spinner"></div>
            <p class="vm-overlay__msg">Connessione in corso…</p>
          </div>
        </div>
      </Transition>

      <!-- Overlay errore -->
      <Transition name="fade-overlay">
        <div v-if="error && !connected" class="vm-overlay vm-overlay--error">
          <div class="vm-overlay__box">
            <div class="vm-overlay__icon">⚠️</div>
            <p>{{ error }}</p>
            <BaseButton @click="connect()" variant="secondary">Riprova</BaseButton>
          </div>
        </div>
      </Transition>

      <!-- Hint: nessuna linea cercata -->
      <Transition name="fade-overlay">
        <div v-if="!activeFilter" class="vm-overlay vm-overlay--hint">
          <div class="vm-overlay__box">
            <div class="vm-overlay__icon">🚌</div>
            <p class="vm-overlay__msg">Cerca una linea GTT</p>
          </div>
        </div>
      </Transition>

    </div>

  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import L from 'leaflet'
import BaseInput from '@/components/ui/BaseInput.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { lineColor } from '@/utils/lineColors'
import { useMqttVehicles } from '@/composables/useMqttVehicles'

const mapEl    = ref(null)
const lineFilter = ref('')
const activeFilter = ref('')
let map = null
let markers = {}
let fittedOnce = false

const { vehicles, updateTick, connected, connecting, error, connect, disconnect } = useMqttVehicles()

const filteredVehicles = computed(() =>
  activeFilter.value
    ? Object.values(vehicles.value).filter(v => v.line === activeFilter.value)
    : []
)

function onSearch() {
  const line = lineFilter.value.trim()
  if (!line) return
  if (!connected.value && !connecting.value) connect()
  activeFilter.value = line
  lineFilter.value   = ''
  fittedOnce         = false
}

function makeBusIcon(vehicle) {
  const heading    = vehicle.heading || 0
  const faded      = !!(lineFilter.value && vehicle.line !== lineFilter.value)
  const color      = faded ? '#6b7280' : lineColor(vehicle.line)
  const opacity    = faded ? 0.4 : 1
  const counterRot = -heading

  return L.divIcon({
    className: '',
    html: `
      <div class="bus-icon" style="opacity:${opacity};transform:rotate(${heading}deg)">
        <svg class="bus-icon__arrow" viewBox="0 0 24 10" xmlns="http://www.w3.org/2000/svg">
          <polygon points="12,0 24,10 0,10" fill="${color}"/>
        </svg>
        <div class="bus-icon__body" style="background:${color}">
          <span class="bus-icon__num" style="transform:rotate(${counterRot}deg)">${vehicle.line}</span>
        </div>
      </div>`,
    iconSize: [40, 54],
    iconAnchor: [20, 44],
    popupAnchor: [0, -46]
  })
}

function scheduleRender() {
  renderMarkers()
}

function renderMarkers() {
  if (!map) return
  const current = filteredVehicles.value
  if (!current.length) return

  const currentIds = new Set(current.map(v => v.id))

  Object.keys(markers).forEach(id => {
    if (!currentIds.has(id)) { markers[id].remove(); delete markers[id] }
  })

  current.forEach(v => {
    if (markers[v.id]) {
      markers[v.id].setLatLng([v.lat, v.lng])
      markers[v.id].setIcon(makeBusIcon(v))
    } else {
      const m = L.marker([v.lat, v.lng], { icon: makeBusIcon(v) })
        .addTo(map)
      markers[v.id] = m
    }
  })

  if (!fittedOnce && current.length >= 3) {
    fittedOnce = true
    fitAll()
  }
}

function fitAll() {
  if (!map) return
  const pts = filteredVehicles.value
  if (!pts.length) return
  if (pts.length === 1) {
    map.setView([pts[0].lat, pts[0].lng], 16)
  } else {
    const bounds = L.latLngBounds(pts.map(v => [v.lat, v.lng]))
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.1), { maxZoom: 15 })
  }
}

watch(updateTick, scheduleRender)
watch(activeFilter, () => { fittedOnce = false; renderMarkers() })

// ——— Leaflet init ———
onMounted(async () => {
  await nextTick()
  map = L.map(mapEl.value, {
    center: [45.0703, 7.6869],
    zoom: 13,
    zoomControl: false,
    attributionControl: true
  })

  L.control.zoom({ position: 'bottomright' }).addTo(map)

  L.tileLayer(
    `https://api.mapbox.com/styles/v1/mapbox/navigation-day-v1/tiles/256/{z}/{x}/{y}@2x?access_token=${import.meta.env.VITE_MAPBOX_TOKEN}`,
    {
      attribution: '© <a href="https://www.mapbox.com/">Mapbox</a> © <a href="https://www.openstreetmap.org/">OSM</a>',
      tileSize: 512,
      zoomOffset: -1,
      maxZoom: 22,
    }
  ).addTo(map)

  map.invalidateSize()
})

onUnmounted(() => {
  disconnect()
  Object.values(markers).forEach(m => m.remove())
  markers = {}
  if (map) { map.remove(); map = null }
})
</script>

<style>
/* Bus marker — globale per Leaflet divIcon */
.bus-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  filter: drop-shadow(0 3px 6px rgba(0,0,0,0.35));
  transition: filter 0.2s, transform 0.4s;
}
.bus-icon:hover {
  filter: drop-shadow(0 0 10px rgba(230,51,41,0.7));
  z-index: 9999 !important;
}
.bus-icon__arrow {
  width: 22px;
  height: 10px;
  display: block;
  flex-shrink: 0;
}
.bus-icon__body {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2.5px solid #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}
.bus-icon__num {
  font-size: 11px;
  font-weight: 900;
  color: #fff;
  font-family: 'JetBrains Mono', monospace;
  letter-spacing: -0.5px;
  display: block;
  text-align: center;
  line-height: 1;
  white-space: nowrap;
}

/* Popup leaflet override per mappa chiara */
.leaflet-popup-content-wrapper {
  background: #fff !important;
  color: #111 !important;
  border-radius: 12px !important;
  box-shadow: 0 8px 24px rgba(0,0,0,0.18) !important;
  border: none !important;
}
.leaflet-popup-tip {
  background: #fff !important;
}
</style>

<style scoped>
.vehicle-map {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  height: 100%;
}

/* Toolbar */
.vehicle-map__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.vehicle-map__search {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  max-width: 420px;
}

.vm-filter-input { flex: 1; }

.vm-search-btn {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-primary);
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 8px rgba(230, 51, 41, 0.3);
}

.vm-search-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
  box-shadow: 0 4px 14px rgba(230, 51, 41, 0.45);
  transform: translateY(-1px);
}

.vm-search-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
}

.vm-status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-success);
}

.vm-status__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-realtime);
  animation: glow-pulse 2s ease-in-out infinite;
}

/* Map */
.vehicle-map__wrap {
  position: relative;
  flex: 1;
  min-height: clamp(320px, 60dvh, 700px);
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
}
.vehicle-map__leaflet {
  position: absolute;
  inset: 0;
}

/* Overlay generico */
.vm-overlay {
  position: absolute;
  inset: 0;
  z-index: 800;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(248,249,252,0.88);
  backdrop-filter: blur(10px);
}
.vm-overlay--hint {
  background: rgba(248,249,252,0.82);
}
.vm-overlay--error {
  background: rgba(254,242,242,0.92);
}
.vm-overlay__box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-5);
  text-align: center;
  max-width: 380px;
  padding: var(--space-10) var(--space-8);
  background: #fff;
  border-radius: var(--radius-2xl);
  box-shadow: 0 20px 60px rgba(0,0,0,0.12);
}
.vm-overlay__icon { font-size: 3.5rem; line-height: 1; }
.vm-overlay__box h3 {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-secondary);
}
.vm-overlay__box p {
  font-size: var(--font-size-sm);
  color: #666;
  line-height: var(--line-height-relaxed);
}
.vm-overlay__msg {
  font-size: var(--font-size-md) !important;
  font-weight: var(--font-weight-semibold) !important;
  color: var(--color-secondary) !important;
}
.vm-big-spinner {
  width: 60px; height: 60px;
  border: 4px solid #eee;
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 0.9s linear infinite;
}



/* Transitions */
.fade-overlay-enter-active,
.fade-overlay-leave-active { transition: opacity 0.25s; }
.fade-overlay-enter-from,
.fade-overlay-leave-to { opacity: 0; }

.slide-up-enter-active,
.slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from,
.slide-up-leave-to { opacity: 0; transform: translateY(16px); }
</style>
