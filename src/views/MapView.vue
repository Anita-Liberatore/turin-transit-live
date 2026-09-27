<template>
  <main class="map-view">
    <div class="map-view__inner">
      <header class="map-view__header">
        <div class="map-view__title-row">
          <AppIcon name="location" size="lg" class="map-view__title-icon" />
          <h1 class="map-view__title">Mappa Live</h1>
        </div>
        <p class="map-view__sub">Posizioni GPS in tempo reale</p>
      </header>
      <VehicleMap class="map-view__map" />
    </div>
  </main>
</template>

<script setup>
import AppIcon from '@/components/ui/AppIcon.vue'
import VehicleMap from '@/components/transit/VehicleMap.vue'
</script>

<style scoped>
.map-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-4);
}

.map-view__inner {
  max-width: var(--container-max);
  margin: 0 auto;
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* ── Header con gradiente GTT ── */
.map-view__header {
  position: relative;
  overflow: hidden;
  border-radius: var(--radius-xl);
  background: linear-gradient(120deg, var(--gtt-imperial) 0%, var(--gtt-french) 55%, var(--gtt-azure) 100%);
  padding: var(--space-5) var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex-shrink: 0;
}

/* Blob giallo decorativo */
.map-view__header::before {
  content: '';
  position: absolute;
  right: -40px;
  top: -40px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(253,197,0,0.22) 0%, transparent 70%);
  filter: blur(24px);
  pointer-events: none;
}

.map-view__title-row {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  position: relative;
}

.map-view__title-icon {
  color: var(--gtt-yellow);
}

.map-view__title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.02em;
  color: #ffffff;
}

.map-view__sub {
  font-size: var(--font-size-sm);
  color: rgba(255, 255, 255, 0.72);
  position: relative;
}

.map-view__map {
  flex: 1;
}

@media (min-width: 600px) {
  .map-view {
    padding: var(--space-6) var(--space-6);
  }

  .map-view__title {
    font-size: var(--font-size-3xl);
  }
}
</style>
