<template>
  <main class="stops-view">
    <div class="stops-view__inner">

      <header class="stops-view__header">
        <div class="stops-view__title-row">
          <AppIcon name="stop" size="lg" class="stops-view__title-icon" />
          <h1 class="stops-view__title">Fermate</h1>
        </div>
        <p class="stops-view__sub">Inserisci il numero della fermata GTT</p>
      </header>

      <div class="stops-view__search">
        <BaseInput
          v-model="inputStop"
          placeholder="Numero fermata"
          clearable
          class="stops-view__input"
          @keyup.enter="search"
        >
          <template #icon><AppIcon name="search" size="sm" /></template>
        </BaseInput>
        <button
          class="stops-view__search-btn"
          :disabled="!inputStop.trim()"
          aria-label="Cerca fermata"
          @click="search"
        >
          <AppIcon name="arrow_right" size="md" />
        </button>
      </div>

      <StopCard
        v-if="activeStopId"
        :stop-id="activeStopId"
        :lines="lines"
        :loading="loading"
        :error="error"
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
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import StopCard from '@/components/transit/StopCard.vue'
import { useStopDepartures } from '@/composables/useStopDepartures'

const route = useRoute()

const inputStop   = ref('')
const activeStopId = ref('')

const { lines, loading, error, refresh } = useStopDepartures(activeStopId)

function search() {
  const id = inputStop.value.trim()
  if (!id) return
  activeStopId.value = id
  inputStop.value = ''
}

watch(
  () => route.query.stop,
  val => {
    if (val) {
      const id = String(val)
      inputStop.value    = id
      activeStopId.value = id
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
}

.stops-view__search {
  display: flex;
  gap: var(--space-3);
}

.stops-view__input { flex: 1; }

.stops-view__search-btn {
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

.stops-view__search-btn:hover:not(:disabled) {
  background: var(--color-primary-dark);
  box-shadow: 0 4px 14px rgba(230, 51, 41, 0.45);
  transform: translateY(-1px);
}

.stops-view__search-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  box-shadow: none;
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

@media (min-width: 600px) {
  .stops-view {
    padding: var(--space-8) var(--space-6);
  }

  .stops-view__title {
    font-size: var(--font-size-3xl);
  }
}
</style>
