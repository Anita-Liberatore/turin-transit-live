<template>
  <div class="stop-card">

    <div class="stop-card__header">
      <div class="stop-card__hero">
        <div class="stop-card__badge-wrap">
          <span class="stop-card__badge-label">Fermata</span>
          <strong class="stop-card__id">{{ stopId }}</strong>
        </div>
        <div class="stop-card__meta">
          <strong v-if="stopName" class="stop-card__name">{{ stopName }}</strong>
          <span v-else class="stop-card__name stop-card__name--muted">Fermata selezionata</span>
          <span v-if="stopAddress" class="stop-card__address">
            <AppIcon name="location" size="xs" />
            {{ stopAddress }}
          </span>
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
      <LoadingSpinner v-if="loading && !lines.length" size="sm" label="Caricamento..." />
      <div v-else-if="error" class="stop-card__state stop-card__state--error">
        <div class="stop-card__state-icon">
          <AppIcon name="signal" size="lg" />
        </div>
        <div class="stop-card__state-copy">
          <strong>Qualcosa non torna</strong>
          <p>{{ error }}</p>
        </div>
        <button class="stop-card__state-action" type="button" @click="$emit('refresh')">
          Riprova
        </button>
      </div>
      <div v-else-if="!lines.length" class="stop-card__state">
        <div class="stop-card__state-icon">
          <AppIcon name="clock" size="lg" />
        </div>
        <div class="stop-card__state-copy">
          <strong>Nessuna partenza</strong>
          <p>Non risultano passaggi disponibili per questa fermata.</p>
        </div>
      </div>

      <div v-else class="stop-card__lines">
        <div v-for="line in lines" :key="line.line" class="stop-line">
          <div class="stop-line__head">
            <span class="stop-line__badge" :style="{ background: lineColor(line.line) }">
              {{ line.line }}
            </span>
            <span class="stop-line__direction">{{ formatDirection(line.direction) }}</span>
            <span v-if="line.hasAlert" class="stop-line__alert" title="Avviso attivo">!</span>
          </div>

          <div class="stop-line__times">
            <span v-if="line.isScheduled" class="stop-line__scheduled-label">Programmato</span>
            <span
              v-for="time in line.times"
              :key="time"
              class="time-chip"
              :class="line.isScheduled ? 'time-chip--scheduled' : 'time-chip--live'"
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
            Potrebbero esserci variazioni di percorso - verifica sul sito GTT
          </a>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import { lineColor } from '@/utils/lineColors'
import { formatDirection } from '@/utils/formatText'

defineProps({
  stopId:      { type: String,  required: true },
  stopName:    { type: String,  default: null },
  stopAddress: { type: String,  default: null },
  lines:       { type: Array,   default: () => [] },
  loading:     { type: Boolean, default: false },
  error:       { type: String,  default: null },
})

defineEmits(['refresh', 'close'])
</script>

<style scoped>
.stop-card {
  background:
    linear-gradient(180deg, rgba(255,255,255,0.024), transparent 140px),
    var(--color-bg-card);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.24);
  animation: fadeInUp var(--transition-base) ease both;
}

.stop-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  gap: var(--space-4);
}

.stop-card__hero {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  min-width: 0;
  flex: 1;
}

.stop-card__badge-wrap {
  min-width: 64px;
  padding: 0.7rem var(--space-2);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-lg);
  background: linear-gradient(145deg, #c83a31, #9f2c25);
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  flex-shrink: 0;
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.22);
}

.stop-card__badge-label {
  font-size: 10px;
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  line-height: 1;
  text-transform: uppercase;
  opacity: 0.8;
}

.stop-card__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  min-width: 0;
  padding-top: 1px;
}

.stop-card__id {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-extrabold);
  font-family: var(--font-family-mono);
  letter-spacing: 0;
  line-height: 1;
}

.stop-card__name {
  font-size: clamp(1.08rem, 4.5vw, 1.42rem);
  font-weight: var(--font-weight-extrabold);
  color: #f36f64;
  line-height: 1.15;
  letter-spacing: 0;
}

.stop-card__name--muted {
  color: var(--color-text-secondary);
}

.stop-card__address {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-secondary);
  line-height: 1.35;
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
  border: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(255,255,255,0.035);
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.stop-card__btn:hover:not(:disabled) {
  background: var(--color-bg-elevated);
  border-color: var(--color-border);
  color: var(--color-text-primary);
}

.stop-card__btn--close:hover {
  background: var(--color-danger-light) !important;
  color: var(--color-danger) !important;
}

.stop-card__body {
  padding: var(--space-2);
  min-height: 60px;
}

.stop-card__lines {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.stop-card__state {
  margin: var(--space-2);
  padding: var(--space-6) var(--space-5);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-xl);
  background:
    radial-gradient(circle at top left, rgba(255,255,255,0.055), transparent 45%),
    rgba(255,255,255,0.025);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  text-align: center;
}

.stop-card__state--error {
  border-color: rgba(231, 76, 60, 0.22);
  background:
    radial-gradient(circle at top left, rgba(231, 76, 60, 0.12), transparent 45%),
    rgba(231, 76, 60, 0.045);
}

.stop-card__state-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-2xl);
  background: rgba(255,255,255,0.06);
  color: var(--color-text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stop-card__state--error .stop-card__state-icon {
  background: var(--color-danger-light);
  color: var(--color-danger);
}

.stop-card__state-copy {
  display: grid;
  gap: var(--space-2);
  max-width: 360px;
}

.stop-card__state-copy strong {
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
}

.stop-card__state-copy p {
  font-size: var(--font-size-sm);
  line-height: var(--line-height-relaxed);
  color: var(--color-text-secondary);
}

.stop-card__state-action {
  min-height: 38px;
  border: 1px solid rgba(231, 76, 60, 0.28);
  border-radius: var(--radius-full);
  background: rgba(231, 76, 60, 0.08);
  color: var(--color-danger);
  padding: 0 var(--space-5);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  cursor: pointer;
  transition: transform var(--transition-fast), background var(--transition-fast), border-color var(--transition-fast);
}

.stop-card__state-action:hover {
  transform: translateY(-1px);
  background: rgba(231, 76, 60, 0.14);
  border-color: rgba(231, 76, 60, 0.42);
}

.stop-line {
  padding: var(--space-4);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: var(--radius-xl);
  background: rgba(255,255,255,0.025);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.stop-line__head {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: var(--space-2);
}

.stop-line__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  height: 30px;
  padding: 0 var(--space-3);
  border-radius: var(--radius-md);
  color: #fff;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
  font-family: var(--font-family-mono);
  flex-shrink: 0;
  letter-spacing: 0;
  box-shadow: 0 8px 18px rgba(0,0,0,0.16);
}

.stop-line__direction {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  min-width: 0;
  line-height: 1.35;
  overflow-wrap: anywhere;
}

.stop-line__alert {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--color-warning);
  color: #fff;
  font-size: 12px;
  font-weight: var(--font-weight-extrabold);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stop-line__times {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-2);
}

.stop-line__scheduled-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-right: var(--space-1);
}

.stop-line__alert-note {
  display: block;
  font-size: var(--font-size-xs);
  color: var(--color-warning);
  text-decoration: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: var(--color-warning-light);
  transition: opacity var(--transition-fast);
}

.stop-line__alert-note:hover {
  opacity: 0.75;
  text-decoration: underline;
}

.time-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 54px;
  min-height: 32px;
  padding: 5px 10px;
  border-radius: var(--radius-md);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-extrabold);
  font-family: var(--font-family-mono);
  letter-spacing: 0;
}

.time-chip--live {
  background: rgba(46, 204, 113, 0.15);
  color: var(--color-realtime);
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.time-chip--scheduled {
  background: var(--color-bg-elevated);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}

@media (min-width: 600px) {
  .stop-card__header {
    padding: var(--space-4) var(--space-5);
  }

  .stop-card__body {
    padding: var(--space-3);
  }

  .stop-line {
    padding: var(--space-4) var(--space-5);
  }
}
</style>

