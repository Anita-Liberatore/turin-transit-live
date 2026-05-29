<template>
  <button
    class="line-chip"
    :class="{ 'line-chip--active': active }"
    :style="{ '--lc': color }"
    @click="$emit('click')"
  >
    <span class="line-chip__number">{{ line }}</span>
    <em v-if="count != null" class="line-chip__count">{{ count }}</em>
  </button>
</template>

<script setup>
import { lineColor } from '@/utils/lineColors'
import { computed } from 'vue'

const props = defineProps({
  line:   { type: String,  required: true },
  count:  { type: Number,  default: null },
  active: { type: Boolean, default: false }
})

defineEmits(['click'])

const color = computed(() => lineColor(props.line))
</script>

<style scoped>
.line-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  padding: 3px 10px;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-mono);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  line-height: 1.4;
}

.line-chip:hover {
  border-color: var(--lc);
  color: var(--lc);
  background: var(--color-bg-card-hover);
}

.line-chip--active {
  background: var(--lc);
  border-color: var(--lc);
  color: #fff;
}

.line-chip__count {
  font-style: normal;
  font-size: 10px;
  opacity: 0.75;
}

.line-chip--active .line-chip__count {
  opacity: 0.85;
}
</style>
