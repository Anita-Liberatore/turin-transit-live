<template>
  <main class="stops-view">
    <div class="stops-view__inner">

      <header class="stops-view__header">
        <AppIcon name="bus" size="md" class="stops-view__title-icon" />
        <h1 class="stops-view__title">Fermate</h1>
      </header>

      <SearchBar
        v-model="inputStop"
        placeholder="Numero o nome fermata"
        button-label="Cerca"
        variant="yellow"
        class="stops-view__search"
        :input-attrs="{ inputmode: 'search', enterkeyhint: 'search', autocomplete: 'off' }"
        @search="searchOnDemand"
      />

      <div class="stops-view__suggestions" v-if="showSuggestions">
        <div class="stops-view__suggestions-header">
          <span>Risultati suggeriti</span>
          <button type="button" class="stops-view__suggestions-clear" @click="clearSearchResults">Annulla</button>
        </div>

        <ul v-if="searchResults.length" class="stops-view__suggestions-list">
          <li v-for="result in searchResults" :key="result.id">
            <button type="button" class="stops-view__suggestion" @click="selectSuggestion(result)">
              <div class="stops-view__suggestion-main">
                <div>
                  <span class="stops-view__suggestion-label">{{ result.stopName }}</span>
                </div>
                <span class="stops-view__suggestion-badge">#{{ result.stopNumber }}</span>
              </div>
            </button>
          </li>
        </ul>

        <p v-else-if="showNoResults" class="stops-view__search-empty">
          Nessuna fermata trovata per "{{ inputStopTrimmed }}"
        </p>

        <p v-else-if="searchLoading" class="stops-view__search-loading">
          Ricerca in corso…
        </p>

        <p v-else-if="searchError" class="stops-view__search-error">
          {{ searchError }}
        </p>
      </div>

      <StopCardSkeleton v-if="showStopSkeleton" />
      <StopCard
        v-else-if="activeStopId"
        :stop-id="activeStopId"
        :stop-name="stopName ?? null"
        :stop-address="stopInfo?.address ?? null"
        :lines="lines"
        :loading="loading"
        :error="stopCardError"
        @refresh="refresh"
        @close="activeStopId = ''"
      />

      <div v-else class="stops-view__empty">
        <div class="stops-view__empty-icon">
          <AppIcon name="bus" size="xl" />
        </div>
        <h2>Nessuna fermata</h2>
        <p>Inserisci un numero di fermata per vedere le partenze</p>
      </div>

    </div>
  </main>
</template>

<script setup>
import { computed, ref, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'
import SearchBar from '@/components/ui/SearchBar.vue'
import StopCard from '@/components/transit/StopCard.vue'
import StopCardSkeleton from '@/components/transit/StopCardSkeleton.vue'
import { useStopDepartures } from '@/composables/useStopDepartures'
import { useStopInfo }       from '@/composables/useStopInfo'
import { useStopSearch }      from '@/composables/useStopSearch'

const route = useRoute()

const inputStop       = ref('')
const activeStopId    = ref('')
const selectedResult  = ref(null)
let searchTimer       = null
const SEARCH_DEBOUNCE_MS = 300

const { lines, loading, error, refresh } = useStopDepartures(activeStopId)
const { info: stopInfo, loading: stopInfoLoading, error: stopInfoError } = useStopInfo(activeStopId)
const { results: searchResults, loading: searchLoading, error: searchError, search: searchByName, clear: clearSearchResults } = useStopSearch()

const inputStopTrimmed = computed(() => inputStop.value.trim())
const stopName = computed(() => selectedResult.value?.stopName || stopInfo.value?.name)
const showStopSkeleton = computed(() => {
  return !!activeStopId.value
      && !error.value
      && lines.value.length === 0
      && (loading.value || stopInfoLoading.value)
})

const stopCardError = computed(() => {
  if (error.value) {
    if (/non trovata|senza passaggi/i.test(error.value)) {
      return error.value
    }

    return 'Non riesco a caricare gli orari della fermata. Controlla la connessione o riprova tra poco.'
  }

  if (stopInfoError.value && lines.value.length === 0) {
    return 'Non riesco a recuperare i dati della fermata. Controlla la connessione o riprova tra poco.'
  }

  return null
})
const showNoResults = computed(() => {
  return (
    !searchLoading.value &&
    !searchError.value &&
    inputStopTrimmed.value.length >= 2 &&
    !/^\d+$/.test(inputStopTrimmed.value) &&
    searchResults.value.length === 0
  )
})
const showSuggestions = computed(() => {
  return !!inputStopTrimmed.value && !activeStopId.value && (
    searchLoading.value || searchError.value || searchResults.value.length > 0 || showNoResults.value
  )
})

function setActiveStopId(id) {
  activeStopId.value = id
  selectedResult.value = null
  clearSearchResults()
}

async function searchOnDemand() {
  const query = inputStopTrimmed.value
  if (!query) return

  if (/^\d+$/.test(query)) {
    setActiveStopId(query)
    inputStop.value = ''
    return
  }

  await searchByName(query)
}

function selectSuggestion(result) {
  selectedResult.value = result
  setActiveStopId(result.id)
  inputStop.value = ''
}

watch(inputStop, query => {
  clearTimeout(searchTimer)

  if (!query.trim() || /^\d+$/.test(query.trim()) || query.trim().length < 2) {
    clearSearchResults()
    return
  }

  searchTimer = window.setTimeout(() => {
    searchByName(query.trim())
  }, SEARCH_DEBOUNCE_MS)
})

onUnmounted(() => clearTimeout(searchTimer))

watch(
  () => route.query.stop,
  val => {
    if (val) {
      const id = String(val)
      setActiveStopId(id)
      inputStop.value = ''
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.stops-view {
  flex: 1;
  padding: var(--space-5) var(--space-4);
}

.stops-view__inner {
  max-width: 640px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

/* ── Header pill ── */
.stops-view__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: linear-gradient(105deg, var(--gtt-imperial) 0%, var(--gtt-french) 60%, var(--gtt-azure) 100%);
  border-radius: var(--radius-full);
  padding: var(--space-4) var(--space-5);
  width: 100%;
}

.stops-view__title-icon {
  color: #ffffff;
  flex-shrink: 0;
}

.stops-view__search {
  width: 100%;
}

.stops-view__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.01em;
  color: #ffffff;
}


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
}

.stops-view__empty h2 {
  font-size: var(--font-size-lg);
  color: var(--color-text-secondary);
}

.stops-view__empty p {
  font-size: var(--font-size-sm);
  max-width: 280px;
}

@media (max-width: 599px) {
  .stops-view {
    padding: var(--space-3);
  }

  .stops-view__inner {
    gap: var(--space-3);
  }

  .stops-view__header {
    border-radius: var(--radius-xl);
  }
}

@media (min-width: 600px) {
  .stops-view {
    padding: var(--space-8) var(--space-6);
  }

  .stops-view__title {
    font-size: var(--font-size-3xl);
  }
}

.stops-view__suggestions {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-4);
}

.stops-view__suggestions-header {
  display: flex;
  justify-content: space-between;
  gap: var(--space-3);
  align-items: center;
  margin-bottom: var(--space-3);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.stops-view__suggestions-clear {
  background: transparent;
  border: none;
  color: var(--color-primary);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
}

.stops-view__suggestions-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: var(--space-2);
}

.stops-view__suggestion {
  width: 100%;
  text-align: left;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: var(--color-bg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: var(--color-text-primary);
  cursor: pointer;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast);
}

.stops-view__suggestion:hover,
.stops-view__suggestion:focus-visible {
  border-color: var(--color-primary);
  background: var(--color-bg-elevated);
  transform: translateY(-1px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
}

.stops-view__suggestion-main {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
}

.stops-view__suggestion-label {
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-md);
}

.stops-view__suggestion-badge {
  background: var(--color-primary-light);
  color: #fff;
  padding: 0.35rem 0.8rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
}

.stops-view__search-error,
.stops-view__search-loading,
.stops-view__search-empty {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.stops-view__search-error {
  color: var(--color-danger);
}
</style>
