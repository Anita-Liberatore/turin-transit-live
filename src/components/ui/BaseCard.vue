<template>
  <div class="base-card" :class="[`base-card--${variant}`, { 'base-card--hoverable': hoverable }]">
    <div v-if="$slots.header" class="base-card__header">
      <slot name="header" />
    </div>
    <div class="base-card__body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="base-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: { type: String, default: 'default' },
  hoverable: { type: Boolean, default: false }
})
</script>

<style scoped>
.base-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: all var(--transition-base);
}

.base-card--hoverable:hover {
  border-color: var(--color-border-active);
  background: var(--color-bg-card-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-primary);
}

.base-card--elevated {
  background: var(--color-bg-elevated);
  box-shadow: var(--shadow-md);
}

.base-card--primary {
  border-color: var(--color-primary-alpha);
  background: linear-gradient(135deg, var(--color-bg-card) 0%, rgba(230, 51, 41, 0.05) 100%);
}

.base-card__header {
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.base-card__body {
  padding: var(--space-6);
}

.base-card__footer {
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  background: rgba(0, 0, 0, 0.15);
}
</style>
