<template>
  <div class="search-bar">
    <BaseInput
      :model-value="modelValue"
      :placeholder="placeholder"
      clearable
      class="search-bar__input"
      v-bind="inputAttrs"
      @update:model-value="$emit('update:modelValue', $event)"
      @keyup.enter="$emit('search')"
    >
      <template #icon><AppIcon name="search" size="sm" /></template>
    </BaseInput>
    <button
      class="search-bar__btn"
      :class="`search-bar__btn--${variant}`"
      :disabled="!modelValue?.trim() || disabled"
      :aria-label="buttonLabel"
      @click="$emit('search')"
    >
      <span>{{ buttonLabel }}</span>
    </button>
  </div>
</template>

<script setup>
import BaseInput from './BaseInput.vue'
import AppIcon from './AppIcon.vue'

defineProps({
  modelValue:  { type: String,  default: '' },
  placeholder: { type: String,  default: 'Cerca...' },
  buttonLabel: { type: String,  default: 'Cerca' },
  disabled:    { type: Boolean, default: false },
  variant:     { type: String,  default: 'yellow' }, // 'yellow' | 'blue'
  inputAttrs:  { type: Object,  default: () => ({}) },
})

defineEmits(['update:modelValue', 'search'])
</script>

<style scoped>
.search-bar {
  display: flex;
  align-items: stretch;
  gap: var(--space-2);
}

.search-bar__input {
  flex: 1;
}

.search-bar__input:deep(.input) {
  min-height: 48px;
  border-color: var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-input);
}

.search-bar__input:deep(.input--focused) {
  border-color: var(--color-border-active);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.search-bar__input:deep(.input__field) {
  font-size: var(--font-size-md);
  padding: 12px 0;
}

.search-bar__input:deep(.input__icon) {
  color: var(--color-primary);
}

.search-bar__btn {
  min-width: 78px;
  height: 48px;
  padding: 0 var(--space-4);
  flex-shrink: 0;
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  transition: all var(--transition-fast);
}

/* Yellow variant — primary CTA (coerente con hero) */
.search-bar__btn--yellow {
  background: var(--gtt-yellow);
  color: var(--gtt-imperial);
  box-shadow: 0 4px 14px rgba(253, 197, 0, 0.4);
}
.search-bar__btn--yellow:hover:not(:disabled) {
  background: var(--gtt-gold);
  box-shadow: 0 6px 18px rgba(253, 197, 0, 0.5);
  transform: translateY(-1px);
}

/* Blue variant — su sfondi chiari */
.search-bar__btn--blue {
  background: var(--gtt-imperial);
  color: #fff;
  box-shadow: 0 4px 12px rgba(0, 41, 107, 0.3);
}
.search-bar__btn--blue:hover:not(:disabled) {
  background: var(--gtt-french);
  box-shadow: 0 6px 16px rgba(0, 41, 107, 0.4);
  transform: translateY(-1px);
}

.search-bar__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

@media (max-width: 420px) {
  .search-bar__btn {
    min-width: 68px;
    padding: 0 var(--space-3);
  }
}
</style>
