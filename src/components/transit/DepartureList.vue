<template>
  <div class="departure-list">

    <!-- Header -->
    <div class="departure-list__header">
      <div class="departure-list__title">
        <div class="departure-list__stop-badge">
          <AppIcon name="stop" size="sm" />
        </div>
        <div class="departure-list__stop-info">
          <span class="departure-list__stop-label">Fermata</span>
          <strong class="departure-list__stop-id">{{ stopId }}</strong>
        </div>
      </div>
      <div class="departure-list__actions">
        <button
          class="departure-list__btn"
          :class="{ 'departure-list__btn--loading': loading }"
          :disabled="loading"
          aria-label="Aggiorna"
          @click="$emit('refresh')"
        >
          <AppIcon name="refresh" size="sm" />
        </button>
        <slot name="close-btn" />
      </div>
    </div>

    <!-- Body -->
    <div class="departure-list__body">
      <LoadingSpinner v-if="loading && !departures.length" size="sm" label="Caricamento…" />
      <ErrorAlert v-else-if="error" :message="error" @retry="$emit('refresh')" />
      <div v-else-if="!departures.length" class="departure-list__empty">
        <AppIcon name="clock" size="lg" />
        <p>Nessuna partenza trovata</p>
      </div>
      <div v-else class="departure-list__rows">
        <DepartureRow v-for="(dep, i) in departures" :key="i" :departure="dep" />
      </div>
    </div>

    <!-- Footer -->
    <div v-if="departures.length" class="departure-list__footer">
      <span>{{ departures.length }} partenze</span>
    </div>

  </div>
</template>

<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ErrorAlert from '@/components/ui/ErrorAlert.vue'
import DepartureRow from './DepartureRow.vue'

defineProps({
  stopId:     { type: [String, Number], required: true },
  departures: { type: Array,   default: () => [] },
  loading:    { type: Boolean, default: false },
  error:      { type: String,  default: null },
})
defineEmits(['refresh'])
</script>

<style scoped>
.departure-list {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: box-shadow var(--transition-base);
}

.departure-list:hover {
  box-shadow: var(--shadow-md);
}

/* Header */
.departure-list__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4) var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  gap: var(--space-3);
}

.departure-list__title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 0;
}

.departure-list__stop-badge {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-primary-alpha);
  color: var(--color-primary-light);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.departure-list__stop-info {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  min-width: 0;
}

.departure-list__stop-label {
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.departure-list__stop-id {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-primary-light);
  font-family: var(--font-family-mono);
  letter-spacing: -0.01em;
}

.departure-list__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  flex-shrink: 0;
}

.departure-list__btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.departure-list__btn:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.departure-list__btn--loading {
  opacity: 0.5;
  animation: spin 0.8s linear infinite;
}

/* Body */
.departure-list__body {
  min-height: 80px;
}

.departure-list__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-8) var(--space-4);
  color: var(--color-text-muted);
  font-size: var(--font-size-sm);
}

.departure-list__rows {
  /* niente padding — DepartureRow gestisce il proprio */
}

/* Footer */
.departure-list__footer {
  padding: var(--space-3) var(--space-5);
  border-top: 1px solid var(--color-border);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  background: rgba(0, 0, 0, 0.1);
}
</style>
