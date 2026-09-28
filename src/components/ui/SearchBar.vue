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
  min-width: 0;
}

.search-bar__input:deep(.input) {
  height: 46px;
  min-height: 46px;
  border-radius: var(--radius-lg);
  background: var(--color-bg-input);
  border-color: var(--color-border);
}

.search-bar__input:deep(.input--focused) {
  border-color: var(--color-border-active);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.search-bar__input:deep(.input__field) {
  font-size: var(--font-size-sm);
}

.search-bar__input:deep(.input__icon) {
  color: var(--color-text-muted);
}

.search-bar__btn {
  flex-shrink: 0;
  height: 46px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-lg);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  transition: background var(--transition-fast), transform var(--transition-fast);
}

.search-bar__btn--yellow {
  background: var(--gtt-yellow);
  color: var(--gtt-imperial);
}
.search-bar__btn--yellow:hover {
  background: var(--gtt-gold);
}

.search-bar__btn--blue {
  background: var(--gtt-imperial);
  color: #fff;
}
.search-bar__btn--blue:hover {
  background: var(--gtt-french);
}

.search-bar__btn:disabled {
  opacity: 0.45;
  cursor: default;
}
</style>
