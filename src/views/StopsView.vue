<template>
  <main class="stops-view">
    <div class="stops-view__inner">

      <header class="stops-view__header">
        <div class="stops-view__title-row">
          <AppIcon name="stop" size="lg" class="stops-view__title-icon" />
          <h1 class="stops-view__title">Fermate</h1>
        </div>
        <p class="stops-view__sub">Cerca una fermata GTT per vedere le prossime partenze in tempo reale</p>
      </header>

      <!-- Ricerca -->
      <div class="stops-view__search">
        <BaseInput
          v-model="inputStop"
          placeholder="Numero fermata"
          clearable
          class="stops-view__input"
          @keyup.enter="addStop"
        >
          <template #icon><AppIcon name="search" size="sm" /></template>
        </BaseInput>
        <BaseButton @click="addStop" :disabled="!inputStop.trim()">
          <template #icon><AppIcon name="plus" size="sm" /></template>
          Aggiungi
        </BaseButton>
      </div>

      <!-- Pills suggerite -->
      <div class="stops-view__pills">
        <span class="stops-view__pills-label">Fermate rapide:</span>
        <button
          v-for="s in suggestions"
          :key="s.id"
          class="stops-pill"
          @click="addStopId(s.id)"
        >
          {{ s.name }}
          <em>{{ s.id }}</em>
        </button>
      </div>

      <!-- Griglia fermate -->
      <div v-if="activeStops.length" class="stops-view__grid">
        <StopPanel
          v-for="stop in activeStops"
          :key="stop"
          :stop-id="stop"
          @remove="removeStop(stop)"
        />
      </div>

      <!-- Empty state -->
      <div v-else class="stops-view__empty">
        <div class="stops-view__empty-icon">
          <AppIcon name="bus" size="xl" />
        </div>
        <h2>Nessuna fermata attiva</h2>
        <p>Cerca una fermata sopra o selezionane una tra quelle rapide</p>
      </div>

    </div>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StopPanel from '@/components/transit/StopPanel.vue'

const route = useRoute()
const inputStop = ref('')
const activeStops = ref([])

const suggestions = [
  { id: '1572', name: 'Porta Nuova' },
  { id: '631',  name: 'Porta Susa' },
  { id: '204',  name: 'P.za Vittorio' },
  { id: '1800', name: 'C.so Francia' },
  { id: '885',  name: 'Lingotto' },
]

function addStop() {
  const id = inputStop.value.trim()
  if (id) { addStopId(id); inputStop.value = '' }
}

function addStopId(id) {
  if (!activeStops.value.includes(id)) activeStops.value.push(id)
}

function removeStop(id) {
  activeStops.value = activeStops.value.filter(s => s !== id)
}

onMounted(() => {
  if (route.query.stop) addStopId(String(route.query.stop))
})
</script>

<style scoped>
.stops-view {
  flex: 1;
  padding: var(--space-5) var(--space-4);
}

.stops-view__inner {
  max-width: var(--container-max);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* Header */
.stops-view__header {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stops-view__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.stops-view__title-icon {
  color: var(--color-primary);
}

.stops-view__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.02em;
}

.stops-view__sub {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  padding-left: calc(24px + var(--space-3));
}

/* Search */
.stops-view__search {
  display: flex;
  gap: var(--space-3);
}

.stops-view__input { flex: 1; }

/* Pills */
.stops-view__pills {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.stops-view__pills-label {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
  white-space: nowrap;
}

.stops-pill {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: 3px var(--space-3);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.stops-pill em {
  font-style: normal;
  color: var(--color-text-muted);
  font-size: 10px;
}

.stops-pill:hover {
  background: var(--color-primary-alpha);
  border-color: var(--color-border-active);
  color: var(--color-primary-light);
}

/* Grid */
.stops-view__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

/* Empty */
.stops-view__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
  padding: var(--space-16) var(--space-4);
  text-align: center;
  color: var(--color-text-muted);
}

.stops-view__empty-icon {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-2xl);
  background: var(--color-bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-muted);
}

.stops-view__empty h2 {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

.stops-view__empty p {
  font-size: var(--font-size-sm);
  max-width: 300px;
}

/* ── Tablet ── */
@media (min-width: 600px) {
  .stops-view {
    padding: var(--space-8) var(--space-6);
  }

  .stops-view__title {
    font-size: var(--font-size-3xl);
  }
}

/* ── Desktop ── */
@media (min-width: 900px) {
  .stops-view__grid {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  }
}
</style>
