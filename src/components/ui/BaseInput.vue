<template>
  <div class="input" :class="{ 'input--focused': focused }">
    <span v-if="$slots.icon" class="input__icon" aria-hidden="true">
      <slot name="icon" />
    </span>
    <input
      v-bind="$attrs"
      class="input__field"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      @focus="focused = true"
      @blur="focused = false"
    />
    <button
      v-if="modelValue && clearable"
      class="input__clear"
      type="button"
      aria-label="Cancella"
      @click="$emit('update:modelValue', '')"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  modelValue: { type: [String, Number], default: '' },
  clearable:  { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
defineOptions({ inheritAttrs: false })

const focused = ref(false)
</script>

<style scoped>
.input {
  display: flex;
  align-items: center;
  background: var(--color-bg-input);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0 var(--space-3);
  gap: var(--space-2);
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.input--focused {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

.input__icon {
  display: flex;
  align-items: center;
  color: var(--color-text-muted);
  flex-shrink: 0;
}

.input--focused .input__icon {
  color: var(--color-primary-light);
}

.input__field {
  flex: 1;
  min-width: 0;
  background: transparent;
  border: none;
  outline: none;
  color: var(--color-text-primary);
  font-family: var(--font-family-base);
  font-size: var(--font-size-sm);
  padding: 10px 0;
}

.input__field::placeholder {
  color: var(--color-text-muted);
}

.input__clear {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: var(--space-1);
  border-radius: var(--radius-sm);
  display: flex;
  align-items: center;
  transition: color var(--transition-fast);
  flex-shrink: 0;
}

.input__clear:hover {
  color: var(--color-text-primary);
}
</style>
