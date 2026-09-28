<template>
  <div class="vehicle-map">

    <!-- Toolbar -->
    <div class="vehicle-map__toolbar">
      <SearchBar
        v-model="lineFilter"
        placeholder="Cerca linea"
        button-label="Cerca"
        variant="yellow"
        class="vehicle-map__search"
        @search="onSearch"
      />
      <div v-if="connected && activeFilter && !lineLoading" class="vm-status">
        <span class="vm-status__dot"></span>
        Linea {{ activeFilter }} · {{ filteredVehicles.length }} mezzi
      </div>
      <div class="vehicle-map__route-status">
        <span v-if="lineLoading">Caricamento linea {{ activeFilter }}...</span>
        <span v-else-if="routeError" class="vehicle-map__route-error">Errore percorso: {{ routeError }}</span>
        <span v-else-if="geoError" class="vehicle-map__route-error">{{ geoError }}</span>
      </div>
    </div>


    <!-- Mappa -->
    <div class="vehicle-map__wrap">
      <div ref="mapEl" class="vehicle-map__leaflet"></div>

      <!-- Overlay di connessione iniziale -->
      <Transition name="fade-overlay">
        <div v-if="connecting || lineLoading" class="vm-overlay">
          <div class="vm-overlay__box">
            <div class="vm-big-spinner"></div>
            <p class="vm-overlay__msg">{{ lineLoading ? `Caricamento linea ${activeFilter}...` : 'Connessione in corso...' }}</p>
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

      <!-- Locate FAB: visible only when vehicles are on map -->
      <Transition name="vm-locate-pop">
        <button
          v-if="geoSupported && activeFilter && filteredVehicles.length > 0"
          class="vm-locate-fab"
          :class="{ 'vm-locate-fab--active': geoActive, 'vm-locate-fab--loading': geoLoading }"
          :aria-pressed="geoActive"
          @click="geoToggle"
        >
          <AppIcon name="locate" size="md" />
          <span class="vm-locate-fab__label">
            {{ geoLoading ? 'Ricerca...' : geoActive ? 'Posizione attiva' : 'La mia posizione' }}
          </span>
          <span v-if="geoActive && !geoLoading" class="vm-locate-fab__dot"></span>
        </button>
      </Transition>

      <Transition name="slide-up">
        <aside v-if="selectedVehicle" class="vehicle-map__detail-panel">
          <VehicleCard
            :vehicle="selectedVehicle"
            :color="lineColor(selectedVehicle.line)"
            @close="selectedVehicleId = ''"
            @go-to-stop="goToStop"
          />
        </aside>
      </Transition>

    </div>

  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import SearchBar from '@/components/ui/SearchBar.vue'
import VehicleCard from '@/components/transit/VehicleCard.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { lineColor } from '@/utils/lineColors'
import { escapeHtml } from '@/utils/formatText'
import { useMqttVehicles } from '@/composables/useMqttVehicles'
import { useLineRoutes } from '@/composables/useLineRoutes'
import { useGeolocation } from '@/composables/useGeolocation'

const router = useRouter()
const mapEl          = ref(null)
const lineFilter     = ref('')
const activeFilter   = ref('')
const selectedVehicleId = ref('')
const selectedVehicleSnapshot = ref(null)
const lineLoading = ref(false)
const vehicleWaitElapsed = ref(false)
const routeRequestPending = ref(false)
let map = null
let markers = {}
let paths = {}
let routeLayers = []
let fittedOnce = false
let vehicleWaitTimer = null

const { vehicles, updateTick, connected, connecting, error, connect, disconnect } = useMqttVehicles()
const { routes: routeVariants, loading: routeLoading, error: routeError, load: loadRoutes, clear: clearRoutes } = useLineRoutes()
const { coords: geoCoords, error: geoError, loading: geoLoading, active: geoActive, supported: geoSupported, toggle: geoToggle } = useGeolocation()

let locationMarker = null
let accuracyCircle = null

const rawFilteredVehicles = computed(() =>
  activeFilter.value
    ? Object.values(vehicles.value).filter(v => v.line === activeFilter.value)
    : []
)

const lineReady = computed(() =>
  !!activeFilter.value
  && !routeRequestPending.value
  && !routeLoading.value
  && (
    !!routeError.value
    || rawFilteredVehicles.value.length > 0
    || (vehicleWaitElapsed.value && (connected.value || !!error.value))
  )
)

const filteredVehicles = computed(() => lineReady.value ? rawFilteredVehicles.value : [])

const selectedVehicle = computed(() => selectedVehicleSnapshot.value)

function onSearch() {
  const line = lineFilter.value.trim()
  if (!line) return
  if (!connected.value && !connecting.value) connect()
  lineFilter.value   = ''
  fittedOnce         = false
  startLineLoading()
  if (activeFilter.value === line) {
    reloadActiveLine()
    return
  }
  activeFilter.value = line
}

function startLineLoading() {
  lineLoading.value = true
  vehicleWaitElapsed.value = false
  routeRequestPending.value = true
  if (vehicleWaitTimer) clearTimeout(vehicleWaitTimer)
  vehicleWaitTimer = setTimeout(() => {
    vehicleWaitElapsed.value = true
    vehicleWaitTimer = null
  }, 1800)
}

function finishLineLoading() {
  if (!lineReady.value) return
  lineLoading.value = false
  renderRouteShapes()
  renderMarkers()
  if (!fittedOnce) {
    fittedOnce = true
    fitRouteBounds()
  }
}

function reloadActiveLine() {
  selectedVehicleId.value = ''
  selectedVehicleSnapshot.value = null
  clearRouteShapes()
  clearRoutes()
  renderMarkers()
  loadRoutes(activeFilter.value).finally(() => {
    routeRequestPending.value = false
    finishLineLoading()
  })
}

function clearRouteShapes() {
  routeLayers.forEach(layer => layer.remove())
  routeLayers = []
}

function renderRouteShapes() {
  if (!map || !lineReady.value) return
  clearRouteShapes()

  routeVariants.value.forEach((route, index) => {
    if (!route.shapes?.length) return
    const routeColor = lineColor(route.line)

    route.shapes.forEach(shape => {
      const halo = L.polyline(shape, {
        color: '#ffffff',
        opacity: 0.82,
        weight: 14,
        className: 'route-path route-path--halo',
        interactive: false,
        pane: 'routePane',
      }).addTo(map)

      const main = L.polyline(shape, {
        color: routeColor,
        opacity: index === 0 ? 0.96 : 0.72,
        weight: index === 0 ? 7 : 5,
        className: 'route-path route-path--main',
        interactive: false,
        pane: 'routePane',
      }).addTo(map)

      const shine = L.polyline(shape, {
        color: '#ffffff',
        opacity: 0.28,
        weight: 2,
        dashArray: index === 0 ? '' : '8,12',
        className: 'route-path route-path--shine',
        interactive: false,
        pane: 'routePane',
      }).addTo(map)

      routeLayers.push(halo, main, shine)
    })
  })
}

function fitRouteBounds() {
  if (!map) return
  const allCoords = routeVariants.value.flatMap(route => (route.shapes || []).flat())
  if (!allCoords.length) return
  const bounds = L.latLngBounds(allCoords)
  if (bounds.isValid()) {
    map.fitBounds(bounds.pad(0.1), { maxZoom: 14 })
  }
}

function selectVehicle(id) {
  selectedVehicleId.value = id
  selectedVehicleSnapshot.value = vehicles.value[id] || filteredVehicles.value.find(v => v.id === id) || null
}

function goToStop(id) {
  if (!id) return
  router.push({
    name: 'stops',
    query: { stop: String(id) },
  })
}

function makeBusIcon(vehicle) {
  const heading    = vehicle.heading || 0
  const faded      = !!(activeFilter.value && vehicle.line !== activeFilter.value)
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
    iconSize: [40, 48],
    iconAnchor: [20, 29],
    popupAnchor: [0, -32]
  })
}

function makeVehiclePopup(vehicle) {
  const line     = escapeHtml(vehicle.line)
  const nextStop = vehicle.nextStop ? escapeHtml(vehicle.nextStop) : null
  return `<div style="font-size:0.96rem;line-height:1.4">
    <strong>Linea ${line}</strong><br>
    Prossima fermata: <strong>${nextStop ?? 'non disponibile'}</strong><br>
    Clicca sul marker per i dettagli.
  </div>`
}

function renderMarkers() {
  if (!map) return
  const current = filteredVehicles.value
  const currentIds = new Set(current.map(v => v.id))

  Object.keys(markers).forEach(id => {
    if (!currentIds.has(id)) {
      markers[id].remove()
      delete markers[id]
      if (selectedVehicleId.value === id) {
        selectedVehicleId.value = ''
        selectedVehicleSnapshot.value = null
      }
    }
  })

  Object.keys(paths).forEach(id => {
    if (!currentIds.has(id)) {
      paths[id].remove()
      delete paths[id]
    }
  })

  current.forEach(v => {
    const icon = makeBusIcon(v)

    if (markers[v.id]) {
      markers[v.id].setLatLng([v.lat, v.lng])
      markers[v.id].setIcon(icon)
      markers[v.id].off('click')
      markers[v.id].on('click', () => selectVehicle(v.id))
      markers[v.id].setPopupContent(makeVehiclePopup(v))
    } else {
      const m = L.marker([v.lat, v.lng], { icon })
        .addTo(map)
      m.on('click', () => selectVehicle(v.id))
      m.bindPopup(makeVehiclePopup(v))
      markers[v.id] = m
    }

    if (selectedVehicleId.value === v.id) {
      selectedVehicleSnapshot.value = v
    }

    const trail = v.trail || []
    if (trail.length > 1) {
      const highlight = selectedVehicleId.value === v.id
      const lineStyle = {
        color: lineColor(v.line),
        weight: highlight ? 5 : 3,
        opacity: highlight ? 0.95 : 0.55,
        dashArray: highlight ? '' : '6,10',
        interactive: false,
      }

      if (paths[v.id]) {
        paths[v.id].setLatLngs(trail)
        paths[v.id].setStyle(lineStyle)
      } else {
        paths[v.id] = L.polyline(trail, lineStyle).addTo(map)
        paths[v.id].bringToBack()
      }
    } else if (paths[v.id]) {
      paths[v.id].remove()
      delete paths[v.id]
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

watch(updateTick, renderMarkers)
watch(activeFilter, () => {
  fittedOnce = false
  selectedVehicleId.value = ''
  selectedVehicleSnapshot.value = null
  reloadActiveLine()
})
watch(selectedVehicleId, id => {
  if (!id) selectedVehicleSnapshot.value = null
  renderMarkers()
})
watch(routeVariants, finishLineLoading)
watch(lineReady, finishLineLoading)

// ——— Geolocation ———
function makeLocationIcon() {
  return L.divIcon({
    className: '',
    html: '<div class="location-dot"><div class="location-dot__pulse"></div><div class="location-dot__core"></div></div>',
    iconSize:   [20, 20],
    iconAnchor: [10, 10],
  })
}

watch(geoCoords, pos => {
  if (!map || !pos) return
  const latlng = [pos.lat, pos.lng]

  if (!locationMarker) {
    locationMarker = L.marker(latlng, { icon: makeLocationIcon(), zIndexOffset: 1000, interactive: false }).addTo(map)
    accuracyCircle = L.circle(latlng, {
      radius:      pos.accuracy,
      color:       '#00509d',
      fillColor:   '#00509d',
      fillOpacity: 0.08,
      weight:      1,
      interactive: false,
    }).addTo(map)
    map.setView(latlng, Math.max(map.getZoom(), 15))
  } else {
    locationMarker.setLatLng(latlng)
    accuracyCircle.setLatLng(latlng)
    accuracyCircle.setRadius(pos.accuracy)
  }
})

watch(geoActive, active => {
  if (!active) {
    locationMarker?.remove()
    accuracyCircle?.remove()
    locationMarker = null
    accuracyCircle = null
  }
})

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
  map.createPane('routePane')
  map.getPane('routePane').style.zIndex = 350

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
  if (vehicleWaitTimer) clearTimeout(vehicleWaitTimer)
  disconnect()
  Object.values(markers).forEach(m => m.remove())
  Object.values(paths).forEach(p => p.remove())
  clearRouteShapes()
  locationMarker?.remove()
  accuracyCircle?.remove()
  markers = {}
  paths = {}
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
  transform-origin: 20px 29px;
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
.route-path {
  stroke-linecap: round;
  stroke-linejoin: round;
}
.route-path--halo {
  filter: drop-shadow(0 8px 14px rgba(0, 0, 0, 0.18));
}
.route-path--main {
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.62));
}
.route-path--shine {
  mix-blend-mode: screen;
}
.bus-icon__body {
  width: 38px;
  height: 38px;
  box-sizing: border-box;
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

/* Marker posizione utente */
.location-dot {
  position: relative;
  width: 20px;
  height: 20px;
}
.location-dot__core {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 14px;
  height: 14px;
  background: #00509d;
  border: 2.5px solid #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px rgba(0, 80, 157, 0.5);
}
.location-dot__pulse {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%) scale(0.3);
  width: 44px;
  height: 44px;
  background: rgba(0, 80, 157, 0.18);
  border-radius: 50%;
  animation: location-pulse 2s ease-out infinite;
}
@keyframes location-pulse {
  0%   { transform: translate(-50%, -50%) scale(0.3); opacity: 1; }
  100% { transform: translate(-50%, -50%) scale(1);   opacity: 0; }
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
  flex-direction: column;
  gap: var(--space-2);
}

.vehicle-map__search {
  width: 100%;
}

/* ── Locate FAB ── */
.vm-locate-fab {
  position: absolute;
  bottom: var(--space-4);
  left: var(--space-4);
  z-index: 800;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  height: 44px;
  padding: 0 var(--space-4) 0 var(--space-3);
  border-radius: var(--radius-full);
  border: none;
  background: #fff;
  color: var(--color-text-primary);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.18), 0 1px 4px rgba(0, 0, 0, 0.12);
  transition: background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast), transform var(--transition-fast);
  white-space: nowrap;
}

.vm-locate-fab:hover {
  background: #f0f5ff;
  box-shadow: 0 4px 16px rgba(0, 41, 107, 0.2), 0 1px 4px rgba(0, 0, 0, 0.12);
  transform: translateY(-1px);
}

.vm-locate-fab--active {
  background: var(--gtt-imperial);
  color: #fff;
  box-shadow: 0 4px 16px rgba(0, 41, 107, 0.35), 0 1px 4px rgba(0, 0, 0, 0.12);
}

.vm-locate-fab--active:hover {
  background: var(--gtt-french);
}

.vm-locate-fab--loading .vm-locate-fab__label {
  opacity: 0.7;
}

.vm-locate-fab__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gtt-yellow);
  flex-shrink: 0;
  animation: glow-pulse 2s ease-in-out infinite;
}

.vm-locate-fab--loading > .icon {
  animation: locate-spin 1s linear infinite;
}

@keyframes locate-spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

/* Appear animation */
@keyframes vm-locate-pop-in {
  from { opacity: 0; transform: translateY(8px) scale(0.9); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

.vm-locate-pop-enter-active {
  animation: vm-locate-pop-in 0.2s ease;
}

.vm-locate-pop-leave-active {
  animation: vm-locate-pop-in 0.15s ease reverse;
}

@media (max-width: 640px) {
  .vm-locate-fab {
    bottom: var(--space-3);
    left: var(--space-3);
    height: 48px;
    font-size: var(--font-size-base);
    padding: 0 var(--space-4) 0 var(--space-3);
  }
}

.vehicle-map__search-grid {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  flex: 1;
}

.vehicle-map__detail-panel {
  position: absolute;
  right: var(--space-3);
  bottom: var(--space-3);
  width: min(340px, calc(100% - 1.5rem));
  max-height: 58vh;
  overflow: auto;
  z-index: 850;
}

@media (max-width: 640px) {
  .vehicle-map__detail-panel {
    right: var(--space-2);
    bottom: var(--space-2);
    left: var(--space-2);
    width: auto;
    max-height: 46vh;
  }
}

.vehicle-map__route-status {
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.vehicle-map__route-error {
  color: var(--color-danger);
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

@media (max-width: 599px) {
  .vehicle-map__header {
    padding: var(--space-4);
    gap: var(--space-3);
    border-radius: var(--radius-xl);
  }

  .vehicle-map__wrap {
    min-height: 0;
    border-radius: var(--radius-lg);
  }
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



