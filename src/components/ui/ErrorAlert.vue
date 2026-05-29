<template>
  <div class="error-alert">
    <span class="error-alert__icon">⚠️</span>
    <div class="error-alert__content">
      <strong class="error-alert__title">{{ title }}</strong>
      <p class="error-alert__msg">{{ message }}</p>
    </div>
    <button v-if="retry" class="error-alert__retry" @click="$emit('retry')">↺ Riprova</button>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: 'Errore' },
  message: { type: String, required: true },
  retry: { type: Boolean, default: true }
})
defineEmits(['retry'])
</script>

<style scoped>
.error-alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-5);
  background: var(--color-danger-light);
  border: 1px solid rgba(231, 76, 60, 0.3);
  border-radius: var(--radius-lg);
  color: var(--color-text-primary);
}

.error-alert__icon {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.error-alert__content {
  flex: 1;
}

.error-alert__title {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--space-1);
}

.error-alert__msg {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.error-alert__retry {
  background: none;
  border: 1px solid rgba(231, 76, 60, 0.4);
  border-radius: var(--radius-sm);
  color: var(--color-danger);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.error-alert__retry:hover {
  background: var(--color-danger-light);
}
</style>
