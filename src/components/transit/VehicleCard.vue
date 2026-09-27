<template>
  <section
    class="vehicle-card"
    :style="{ '--line-color': color }"
  >
    <div class="vehicle-card__top">
      <div class="vehicle-card__heading">
        <span class="vehicle-card__kicker">Mezzo in servizio</span>
        <strong class="vehicle-card__line">Linea {{ vehicle.line }}</strong>
      </div>
      <button
        class="vehicle-card__close"
        type="button"
        aria-label="Chiudi dettagli mezzo"
        @click="$emit('close')"
      >×</button>
    </div>

    <div class="vehicle-card__next-stop">
      <span class="vehicle-card__label">Prossima fermata</span>
      <strong>{{ vehicle.nextStop || 'Non disponibile' }}</strong>
    </div>

    <div class="vehicle-card__actions">
      <button
        class="vehicle-card__action"
        type="button"
        :disabled="!vehicle.nextStop"
        @click="$emit('go-to-stop', vehicle.nextStop)"
      >
        Vedi orari fermata
      </button>
    </div>
  </section>
</template>

<script setup>
defineProps({
  vehicle: { type: Object, required: true },
  color:   { type: String, default: 'var(--color-primary)' },
})

defineEmits(['close', 'go-to-stop'])
</script>

<style scoped>
.vehicle-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-top: 3px solid var(--line-color);
  border-radius: var(--radius-xl);
  box-shadow: 0 8px 32px rgba(0, 41, 107, 0.14);
  overflow: hidden;
  padding: var(--space-3);
}

.vehicle-card__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
}

.vehicle-card__kicker,
.vehicle-card__label {
  display: block;
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
}

.vehicle-card__line {
  display: inline-flex;
  align-items: center;
  margin-top: var(--space-1);
  color: var(--line-color);
  font-size: clamp(1.2rem, 4.8vw, 1.55rem);
  font-weight: var(--font-weight-extrabold);
  line-height: 1;
}

.vehicle-card__line::before {
  content: '';
  width: 0.55rem;
  height: 0.55rem;
  margin-right: var(--space-2);
  border-radius: var(--radius-full);
  background: var(--line-color);
  box-shadow: 0 0 0 0.28rem color-mix(in srgb, var(--line-color) 20%, transparent);
}

.vehicle-card__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  flex: 0 0 auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
  color: var(--color-text-secondary);
  cursor: pointer;
  font-size: var(--font-size-xl);
  line-height: 1;
  transition: background var(--transition-fast), color var(--transition-fast), transform var(--transition-fast);
}

.vehicle-card__close:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
  transform: translateY(-1px);
}

.vehicle-card__next-stop {
  display: grid;
  gap: var(--space-1);
  margin-top: var(--space-3);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-elevated);
}

.vehicle-card__next-stop strong {
  color: var(--color-text-primary);
  font-size: var(--font-size-md);
  line-height: 1.25;
}

.vehicle-card__actions {
  display: grid;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.vehicle-card__action {
  min-height: 40px;
  padding: var(--space-2) var(--space-3);
  border: none;
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  color: #fff;
  cursor: pointer;
  font-weight: var(--font-weight-semibold);
  transition: background var(--transition-fast), transform var(--transition-fast), box-shadow var(--transition-fast);
  box-shadow: 0 4px 14px rgba(0, 41, 107, 0.25);
}

.vehicle-card__action:hover:not(:disabled) {
  background: var(--color-primary-dark);
  transform: translateY(-1px);
}

.vehicle-card__action:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
}
</style>
