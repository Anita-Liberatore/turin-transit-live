<template>
  <div class="app">
    <AppNavbar />
    <RouterView v-slot="{ Component }">
      <Transition name="page">
        <component :is="Component" :key="$route.path" />
      </Transition>
    </RouterView>
    <footer class="app-footer">
      <div class="app-footer__inner">
        <div class="app-footer__credits">
          <span>Creato da <a href="https://anitaliberatore.dev" target="_blank" rel="noopener" class="app-footer__link">Anita Liberatore</a></span>
          <span class="app-footer__sep">·</span>
          <span>Dati da <a href="https://gpa.madbob.org" target="_blank" rel="noopener" class="app-footer__link">GTT Pirate API</a> & <a href="https://mato.muoversiatorino.it" target="_blank" rel="noopener" class="app-footer__link">MATO 5T</a></span>
        </div>
        <span class="app-footer__disclaimer">Servizio non ufficiale</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import AppNavbar from '@/components/ui/AppNavbar.vue'
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-footer {
  border-top: 1px solid var(--color-border);
  background: var(--color-bg-card);
  padding: var(--space-5) var(--space-4);
  margin-top: auto;
}

.app-footer__inner {
  max-width: var(--container-max);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-3);
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  text-align: center;
}

.app-footer__credits {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: center;
}

.app-footer__sep {
  opacity: 0.4;
}

.app-footer__link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: color var(--transition-fast);
}

.app-footer__link:hover {
  color: var(--color-primary-light);
}

.app-footer__disclaimer {
  background: var(--color-warning-light);
  color: var(--color-warning);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-full);
  font-weight: var(--font-weight-medium);
}

@media (min-width: 600px) {
  .app-footer__inner {
    flex-direction: row;
    justify-content: space-between;
    text-align: left;
  }

  .app-footer__credits {
    justify-content: flex-start;
  }
}
</style>
