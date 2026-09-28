<template>
  <main class="map-view">
    <div class="map-view__inner">
      <header class="map-view__header">
        <AppIcon name="map" size="md" class="map-view__title-icon" />
        <h1 class="map-view__title">Mappa Live</h1>
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

.map-view__header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  background: linear-gradient(105deg, var(--gtt-imperial) 0%, var(--gtt-french) 60%, var(--gtt-azure) 100%);
  border-radius: var(--radius-full);
  padding: 0 var(--space-5);
  height: var(--nav-height);
  width: 100%;
  flex-shrink: 0;
}

.map-view__title-icon { color: #ffffff; flex-shrink: 0; }

.map-view__title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-extrabold);
  letter-spacing: -0.01em;
  color: #ffffff;
}

.map-view__map { flex: 1; }

@media (max-width: 599px) {
  .map-view { padding: var(--space-3); }
  .map-view__inner { gap: var(--space-3); }
  .map-view__header { border-radius: var(--radius-xl); }
}

@media (min-width: 600px) {
  .map-view { padding: var(--space-6); }
}
</style>
