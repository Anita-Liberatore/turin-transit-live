<template>
  <Transition name="slide-up">
    <div v-if="vehicle" class="info-panel" :style="{ '--lc': color }">
      <div class="info-panel__head">
        <div class="info-panel__badge">{{ vehicle.line }}</div>
        <button class="info-panel__close" @click="$emit('close')" aria-label="Chiudi">✕</button>
      </div>

      <div v-if="vehicle.direction" class="info-panel__row">
        <span class="info-panel__icon" aria-hidden="true">→</span>
        <span class="info-panel__text">{{ vehicle.direction }}</span>
      </div>

      <div v-if="vehicle.nextStop" class="info-panel__row">
        <span class="info-panel__icon" aria-hidden="true">🚏</span>
        <div class="info-panel__text">
          <span class="info-panel__label">Prossima fermata</span>
          <strong class="info-panel__value">{{ vehicle.nextStop }}</strong>
        </div>
      </div>

      <div v-if="!vehicle.direction && !vehicle.nextStop" class="info-panel__empty">
        Dati non disponibili
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { lineColor } from '@/utils/lineColors'

const props = defineProps({
  vehicle: { type: Object, default: null }
})

defineEmits(['close'])

const color = computed(() => props.vehicle ? lineColor(props.vehicle.line) : '#e63329')
</script>

<style scoped>
.info-panel {
  position: absolute;
  bottom: var(--space-6);
  left: var(--space-6);
  z-index: 700;
  background: #fff;
  border-radius: var(--radius-xl);
  padding: var(--space-4) var(--space-5);
  min-width: 210px;
  max-width: 290px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  border-left: 4px solid var(--lc, #e63329);
}

.info-panel__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.info-panel__badge {
  background: var(--lc, #e63329);
  color: #fff;
  font-family: var(--font-family-mono);
  font-weight: var(--font-weight-extrabold);
  font-size: var(--font-size-lg);
  padding: var(--space-1) var(--space-4);
  border-radius: var(--radius-md);
  letter-spacing: 0.02em;
  min-width: 48px;
  text-align: center;
}

.info-panel__close {
  width: 28px;
  height: 28px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  color: #888;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.info-panel__close:hover {
  background: #ebebeb;
  color: #333;
}

.info-panel__row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-2) 0;
  border-top: 1px solid #f0f0f0;
}

.info-panel__icon {
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 2px;
  width: 16px;
  text-align: center;
}

.info-panel__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.info-panel__label {
  font-size: 10px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: var(--font-weight-semibold);
}

.info-panel__value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: #222;
}

.info-panel__text:not(:has(.info-panel__label)) {
  font-size: var(--font-size-sm);
  color: #444;
  line-height: 1.4;
}

.info-panel__empty {
  font-size: var(--font-size-xs);
  color: #aaa;
  text-align: center;
  padding: var(--space-2) 0;
}

/* Transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.25s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
