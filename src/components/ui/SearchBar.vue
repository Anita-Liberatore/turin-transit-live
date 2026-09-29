<template>
  <div class="search-bar" :class="[`search-bar--${variant}`, { 'search-bar--seamless': seamless }]">
    <span class="search-bar__icon" aria-hidden="true">
      <AppIcon name="search" size="sm" />
    </span>
    <input
      class="search-bar__field"
      :value="modelValue"
      :placeholder="placeholder"
      v-bind="inputAttrs"
      @input="$emit('update:modelValue', $event.target.value)"
      @keyup.enter="$emit('search')"
    />
    <button
      class="search-bar__btn"
      :disabled="!modelValue?.trim() || disabled"
      :aria-label="buttonLabel"
      @click="$emit('search')"
    >
      {{ buttonLabel }}
    </button>
  </div>
</template>

<script setup>
import AppIcon from './AppIcon.vue'

defineProps({
  modelValue:  { type: String,  default: '' },
  placeholder: { type: String,  default: 'Cerca...' },
  buttonLabel: { type: String,  default: 'Cerca' },
  disabled:    { type: Boolean, default: false },
  variant:     { type: String,  default: 'yellow' },
  inputAttrs:  { type: Object,  default: () => ({}) },
  seamless:    { type: Boolean, default: false }, // rimuove bordo/radius, usato dentro un wrapper
})

defineEmits(['update:modelValue', 'search'])
</script>

<style scoped>
/* ── Container unico ── */
.search-bar {
  display: flex;
  align-items: center;
  width: 100%;
  height: 48px;
  background: var(--color-bg-card);
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.search-bar:focus-within {
  border-color: var(--color-border-active);
  box-shadow: 0 0 0 3px var(--color-primary-alpha);
}

/* Icona search */
.search-bar__icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  padding: 0 var(--space-3);
  color: var(--color-text-muted);
}

/* Campo testo */
.search-bar__field {
  flex: 1;
  min-width: 0;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: var(--font-size-sm);
  color: var(--color-text-primary);
  padding: 0;
}

.search-bar__field::placeholder {
  color: var(--color-text-muted);
}

/* Separatore visivo prima del button */
.search-bar__btn {
  flex-shrink: 0;
  height: 100%;
  padding: 0 var(--space-4);
  border: none;
  border-left: 1.5px solid var(--color-border);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  white-space: nowrap;
  transition: background var(--transition-fast);
}

/* Variante gialla */
.search-bar--yellow .search-bar__btn {
  background: var(--gtt-yellow);
  color: var(--gtt-imperial);
  border-left-color: transparent;
}
.search-bar--yellow .search-bar__btn:hover:not(:disabled) {
  background: var(--gtt-gold);
}

/* Variante blu */
.search-bar--blue .search-bar__btn {
  background: var(--gtt-imperial);
  color: #fff;
  border-left-color: transparent;
}
.search-bar--blue .search-bar__btn:hover:not(:disabled) {
  background: var(--gtt-french);
}

.search-bar__btn:disabled {
  opacity: 0.45;
  cursor: default;
}

/* Modalità seamless: niente bordo/radius propri, il wrapper li gestisce */
.search-bar--seamless {
  border: none;
  border-radius: 0;
  background: transparent;
  flex: 1;
}
.search-bar--seamless:focus-within {
  box-shadow: none;
  border-color: transparent;
}
</style>
