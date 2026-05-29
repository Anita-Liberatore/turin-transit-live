<template>
  <button
    class="btn"
    :class="[`btn--${variant}`, `btn--${size}`, { 'btn--loading': loading }]"
    :disabled="disabled || loading"
    v-bind="$attrs"
  >
    <span v-if="loading" class="btn__spinner" aria-hidden="true"></span>
    <span v-if="$slots.icon && !loading" class="btn__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <span v-if="$slots.default" class="btn__label"><slot /></span>
    <span v-if="$slots['icon-right'] && !loading" class="btn__icon btn__icon--right" aria-hidden="true">
      <slot name="icon-right" />
    </span>
  </button>
</template>

<script setup>
defineProps({
  variant:  { type: String,  default: 'primary' },
  size:     { type: String,  default: 'md' },
  loading:  { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
})
defineOptions({ inheritAttrs: false })
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-family: var(--font-family-base);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: all var(--transition-fast);
  white-space: nowrap;
  line-height: 1;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Sizes */
.btn--sm { padding: 6px var(--space-3);  font-size: var(--font-size-xs); }
.btn--md { padding: 10px var(--space-5); font-size: var(--font-size-sm); }
.btn--lg { padding: 13px var(--space-6); font-size: var(--font-size-md); }

/* Variants */
.btn--primary {
  background: var(--color-primary);
  color: #fff;
  box-shadow: 0 2px 8px rgba(230, 51, 41, 0.35);
}
.btn--primary:hover:not(:disabled) {
  background: var(--color-primary-dark);
  box-shadow: 0 4px 16px rgba(230, 51, 41, 0.45);
  transform: translateY(-1px);
}
.btn--primary:active:not(:disabled) {
  transform: translateY(0);
}

.btn--secondary {
  background: var(--color-bg-elevated);
  color: var(--color-text-primary);
  border-color: var(--color-border);
}
.btn--secondary:hover:not(:disabled) {
  background: var(--color-bg-card-hover);
  border-color: var(--color-border-active);
}

.btn--ghost {
  background: transparent;
  color: var(--color-text-secondary);
}
.btn--ghost:hover:not(:disabled) {
  background: var(--color-bg-card);
  color: var(--color-text-primary);
}

/* Icon */
.btn__icon,
.btn__icon--right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

/* Spinner */
.btn__spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
</style>
