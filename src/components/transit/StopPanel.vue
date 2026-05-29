<template>
  <div class="stop-panel">
    <DepartureList
      :stop-id="stopId"
      :departures="departures"
      :loading="loading"
      :error="error"
      @refresh="refresh()"
    >
      <template #close-btn>
        <button class="stop-panel__remove" aria-label="Rimuovi fermata" @click="$emit('remove')">
          <AppIcon name="close" size="xs" />
        </button>
      </template>
    </DepartureList>
  </div>
</template>

<script setup>
import { toRef } from 'vue'
import DepartureList from './DepartureList.vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import { useStopDepartures } from '@/composables/useStopDepartures'

const props = defineProps({
  stopId: { type: String, required: true }
})
defineEmits(['remove'])

const stopIdRef = toRef(props, 'stopId')
const { departures, loading, error, refresh } = useStopDepartures(stopIdRef)
</script>

<style scoped>
.stop-panel {
  animation: fadeInUp var(--transition-base) ease both;
}

.stop-panel__remove {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-md);
  border: none;
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.stop-panel__remove:hover {
  background: var(--color-danger-light);
  color: var(--color-danger);
}
</style>
