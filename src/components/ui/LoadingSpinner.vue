<template>
  <div class="spinner-wrap" :class="`spinner-wrap--${size}`">
    <div class="spinner"></div>
    <p v-if="label" class="spinner-label">{{ label }}</p>
  </div>
</template>

<script setup>
defineProps({
  size: { type: String, default: 'md' },
  label: { type: String, default: null }
})
</script>

<style scoped>
.spinner-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-8);
}

.spinner {
  border-radius: 50%;
  border-style: solid;
  border-color: var(--color-bg-elevated) var(--color-bg-elevated) var(--color-bg-elevated) var(--color-primary);
  animation: spin 0.8s linear infinite;
}

.spinner-wrap--sm .spinner { width: 20px; height: 20px; border-width: 2px; }
.spinner-wrap--md .spinner { width: 36px; height: 36px; border-width: 3px; }
.spinner-wrap--lg .spinner { width: 56px; height: 56px; border-width: 4px; }

.spinner-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-muted);
}
</style>
