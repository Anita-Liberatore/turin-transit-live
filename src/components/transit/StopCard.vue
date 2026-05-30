<template>
  <div class="stop-card">

    <div class="stop-card__header">
      <div class="stop-card__title">
        <div class="stop-card__icon">
          <AppIcon name="stop" size="sm" />
        </div>
        <div>
          <p class="stop-card__label">Fermata</p>
          <strong class="stop-card__id">{{ stopId }}</strong>
        </div>
      </div>
      <div class="stop-card__actions">
        <button class="stop-card__btn" :disabled="loading" aria-label="Aggiorna" @click="$emit('refresh')">
          <AppIcon name="refresh" size="sm" />
        </button>
        <button class="stop-card__btn stop-card__btn--close" aria-label="Chiudi" @click="$emit('close')">
          <AppIcon name="close" size="sm" />
        </button>
      </div>
    </div>

    <div class="stop-card__body">
      <LoadingSpinner v-if="loading && !lines.length" size="sm" label="Caricamento…" />
      <ErrorAlert v-else-if="error" :message="error" @retry="$emit('refresh')" />
      <p v-else-if="!lines.length" class="stop-card__empty">Nessuna partenza disponibile</p>

      <div v-else class="stop-card__lines">
        <div v-for="line in lines" :key="line.line" class="stop-line">
          <div class="stop-line__head">
            <span class="stop-line__badge" :style="{ background: lineColor(line.line) }">
              {{ line.line }}
            </span>
            <span class="stop-line__direction">{{ titleCase(line.direction) }}</span>
            <span v-if="line.hasAlert" class="stop-line__alert" title="Avviso attivo">!</span>
          </div>

          <div class="stop-line__times">
            <span
              v-for="time in line.realtimeTimes"
              :key="time"
              class="time-chip time-chip--live"
            >
              {{ time }}
            </span>
          </div>

          <a
            v-if="line.hasAlert"
            href="https://www.gtt.to.it/cms/index.php?option=com_gtt&view=avvisi"
            target="_blank"
            rel="noopener"
            class="stop-line__alert-note"
          >
            Potrebbero esserci variazioni di percorso — verifica sul sito GTT
          </a>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import ErrorAlert from '@/components/ui/ErrorAlert.vue'
import { lineColor } from '@/utils/lineColors'
import { titleCase } from '@/utils/formatText'

defineProps({
  stopId:  { type: String,  required: true },
  lines:   { type: Array,   default: () => [] },
  loading: { type: Boolean, default: false },
  error:   { type: String,  default: null },
})

defineEmits(['refresh', 'close'])
</script>

<style scoped>
.stop-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
  animation: fadeInUp var(--transition-base) ease both;
}

.stop-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-4) var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  gap: var(--space-3);
}

.stop-card__title {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.stop-card__icon {
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

.stop-card__label {
  font-size: 10px;
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  line-height: 1;
  margin-bottom: 2px;
}

.stop-card__id {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-primary-light);
  font-family: var(--font-family-mono);
  letter-spacing: -0.01em;
}

.stop-card__actions {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.stop-card__btn {
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

.stop-card__btn:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
}

.stop-card__btn--close:hover {
  background: var(--color-danger-light) !important;
  color: var(--color-danger) !important;
}

.stop-card__body {
  padding: var(--space-2) 0;
  min-height: 60px;
}

.stop-card__empty {
  padding: var(--space-8);
  text-align: center;
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}

.stop-card__lines {
  display: flex;
  flex-direction: column;
}

/* Singola linea */
.stop-line {
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stop-line:last-child {
  border-bottom: none;
}

.stop-line__head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.stop-line__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 26px;
  padding: 0 var(--space-2);
  border-radius: var(--radius-sm);
  color: #fff;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
  font-family: var(--font-family-mono);
  flex-shrink: 0;
  letter-spacing: 0.03em;
}

.stop-line__direction {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stop-line__alert {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--color-warning);
  color: #fff;
  font-size: 11px;
  font-weight: var(--font-weight-extrabold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stop-line__times {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.stop-line__alert-note {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-warning);
  text-decoration: none;
  padding: var(--space-1) 0;
  transition: opacity var(--transition-fast);
}

.stop-line__alert-note:hover {
  opacity: 0.75;
  text-decoration: underline;
}

/* Chip orario */
.time-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  font-family: var(--font-family-mono);
  letter-spacing: 0.02em;
}

.time-chip--live {
  background: rgba(46, 204, 113, 0.15);
  color: var(--color-realtime);
  border: 1px solid rgba(46, 204, 113, 0.3);
}

</style>
