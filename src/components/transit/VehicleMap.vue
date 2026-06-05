<template>
  <div class="vehicle-map">

    <!-- Toolbar -->
    <div class="vehicle-map__toolbar">
      <div class="vehicle-map__search-grid">
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
            aria-label="Cerca linea"
            @click="onSearch"
          >
            <AppIcon name="arrow_right" size="md" />
          </button>
        </div>

      </div>

      <div class="vm-status-row">
        <div v-if="connected && activeFilter && !lineLoading" class="vm-status">
          <span class="vm-status__dot"></span>
          Linea {{ activeFilter }} · {{ filteredVehicles.length }} mezzi
        </div>
        <div v-else-if="connected" class="vm-status vm-status--hint">
          <span class="vm-status__dot vm-status__dot--info"></span>
          Connesso a MQTT · ricerca linea
        </div>
      </div>
      <div class="vehicle-map__route-status">
        <span v-if="lineLoading">Caricamento linea {{ activeFilter }}...</span>
        <span v-else-if="routeError" class="vehicle-map__route-error">Errore percorso: {{ routeError }}</span>
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

      <Transition name="slide-up">
        <aside v-if="selectedVehicle" class="vehicle-map__detail-panel">
          <div class="vehicle-map__detail-stack">
            <section v-if="selectedVehicle" class="vehicle-map__vehicle-card">
              <div class="vehicle-map__vehicle-top">
                <div class="vehicle-map__vehicle-heading">
                  <span class="vehicle-map__vehicle-kicker">Mezzo in servizio</span>
                  <strong class="vehicle-map__vehicle-line">Linea {{ selectedVehicle.line }}</strong>
                </div>
                <button
                  class="vehicle-map__vehicle-close"
                  type="button"
                  aria-label="Chiudi dettagli mezzo"
                  @click="selectedVehicleId = ''"
                >
                  ×
                </button>
              </div>

              <div class="vehicle-map__vehicle-main">
                <span class="vehicle-map__vehicle-label">Prossima fermata</span>
                <strong>{{ selectedVehicle.nextStop || 'Non disponibile' }}</strong>
              </div>

              <div class="vehicle-map__vehicle-actions">
                <button
                  class="vehicle-map__vehicle-action"
                  type="button"
                  :disabled="!selectedVehicle.nextStop"
                  @click="goToStop(selectedVehicle.nextStop)"
                >
                  Vedi orari fermata
                </button>
              </div>
            </section>
          </div>
        </aside>
      </Transition>

    </div>

  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import L from 'leaflet'
import BaseInput from '@/components/ui/BaseInput.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { lineColor } from '@/utils/lineColors'
import { useMqttVehicles } from '@/composables/useMqttVehicles'
import { useLineRoutes } from '@/composables/useLineRoutes'

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
    iconSize: [40, 48],
    iconAnchor: [20, 29],
    popupAnchor: [0, -32]
  })
}

function makeVehiclePopup(vehicle) {
  return `
    <div style="font-size:0.96rem;line-height:1.4">
      <strong>Linea ${vehicle.line}</strong><br>
      ${vehicle.nextStop ? `Prossima fermata: <strong>${vehicle.nextStop}</strong><br>` : 'Prossima fermata: <strong>non disponibile</strong><br>'}
      Clicca sul marker per aprire i dettagli.
    </div>
  `
}

function scheduleRender() {
  renderMarkers()
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

watch(updateTick, scheduleRender)
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

.vehicle-map__search-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: var(--space-3);
  width: 100%;
}

.vehicle-map__detail-panel {
  position: absolute;
  right: var(--space-3);
  bottom: var(--space-3);
  width: min(340px, calc(100% - 1.5rem));
  max-height: 58vh;
  overflow: auto;
  z-index: 850;
  backdrop-filter: blur(10px);
}

.vehicle-map__detail-stack {
  display: grid;
  gap: var(--space-3);
}

.vehicle-map__vehicle-card {
  background: rgba(26, 26, 46, 0.96);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: 0 22px 60px rgba(0, 0, 0, 0.34);
}

.vehicle-map__vehicle-card {
  padding: var(--space-3);
}

.vehicle-map__vehicle-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.vehicle-map__vehicle-heading {
  min-width: 0;
}

.vehicle-map__vehicle-kicker,
.vehicle-map__vehicle-label {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0;
  text-transform: uppercase;
}

.vehicle-map__vehicle-line {
  display: inline-flex;
  align-items: center;
  margin-top: var(--space-1);
  color: var(--color-text-primary);
  font-size: clamp(1.2rem, 4.8vw, 1.55rem);
  font-weight: var(--font-weight-extrabold);
  line-height: 1;
}

.vehicle-map__vehicle-line::before {
  content: '';
  width: 0.55rem;
  height: 0.55rem;
  margin-right: var(--space-2);
  border-radius: var(--radius-full);
  background: var(--color-primary);
  box-shadow: 0 0 0 0.28rem rgba(230, 51, 41, 0.12);
}

.vehicle-map__vehicle-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.06);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--font-size-xl);
  line-height: 1;
  transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.vehicle-map__vehicle-close:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
  transform: translateY(-1px);
}

.vehicle-map__vehicle-main {
  display: grid;
  gap: var(--space-1);
  margin-top: var(--space-3);
  padding: var(--space-3);
  border: 1px solid rgba(230, 51, 41, 0.16);
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(230, 51, 41, 0.16), rgba(255, 255, 255, 0.04));
}

.vehicle-map__vehicle-main strong {
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  line-height: 1.25;
}

.vehicle-map__vehicle-actions {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.vehicle-map__vehicle-action {
  min-height: 40px;
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
  font-weight: var(--font-weight-semibold);
  transition: background var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: 0 10px 22px rgba(230, 51, 41, 0.22);
}

@media (max-width: 640px) {
  .vehicle-map__detail-panel {
    right: var(--space-2);
    bottom: var(--space-2);
    left: var(--space-2);
    width: auto;
    max-height: 46vh;
  }

  .vehicle-map__vehicle-card {
    padding: var(--space-3);
  }
}

.vehicle-map__vehicle-action:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.vehicle-map__vehicle-action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
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



