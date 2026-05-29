<template>
  <div class="departure-row" :class="{ 'departure-row--realtime': departure.realtime }">
    <div class="departure-row__line">
      <span class="line-badge">{{ departure.line }}</span>
    </div>

    <div class="departure-row__info">
      <span class="departure-row__dest">{{ departure.destination || 'Capolinea' }}</span>
      <span v-if="departure.realtime" class="status-badge status-badge--live">
        <span class="status-badge__dot"></span>
        In tempo reale
      </span>
      <span v-else class="status-badge status-badge--scheduled">
        Programmato
      </span>
    </div>

    <div class="departure-row__time">
      <span class="departure-row__hour">{{ departure.hour }}</span>
      <span class="departure-row__minutes">{{ minutesLeft }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  departure: { type: Object, required: true }
})

const minutesLeft = computed(() => {
  const [h, m, s] = (props.departure.hour || '').split(':').map(Number)
  if (isNaN(h)) return ''
  const now = new Date()
  const dep = new Date()
  dep.setHours(h, m, s || 0, 0)
  const diff = Math.round((dep - now) / 60000)
  if (diff < 0) return 'partito'
  if (diff === 0) return 'ora'
  return `${diff} min`
})
</script>

<style scoped>
.departure-row {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  transition: background var(--transition-fast);
  animation: fadeInUp var(--transition-base) ease both;
}

.departure-row:last-child {
  border-bottom: none;
}

.departure-row:hover {
  background: var(--color-bg-elevated);
}

.departure-row--realtime {
  border-left: 3px solid var(--color-realtime);
}

.line-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 32px;
  padding: 0 var(--space-2);
  background: var(--color-primary);
  color: #fff;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
  border-radius: var(--radius-sm);
  font-family: var(--font-family-mono);
  box-shadow: var(--shadow-primary);
  letter-spacing: 0.05em;
}

.departure-row__info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.departure-row__dest {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.status-badge--live {
  color: var(--color-realtime);
}

.status-badge--scheduled {
  color: var(--color-text-muted);
}

.status-badge__dot {
  width: 6px;
  height: 6px;
  background: var(--color-realtime);
  border-radius: 50%;
  animation: pulse-dot 1.5s ease-in-out infinite;
}

.departure-row__time {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-1);
}

.departure-row__hour {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-bold);
  font-family: var(--font-family-mono);
  color: var(--color-text-primary);
}

.departure-row__minutes {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}
</style>
