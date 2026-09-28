<template>
  <nav class="navbar" :class="{ 'navbar--menu-open': menuOpen }">
    <div class="navbar__inner">

      <RouterLink to="/" class="navbar__brand">
        <div class="navbar__brand-icon">
          <AppIcon name="bus" size="md" />
        </div>
        <div class="navbar__brand-text">
          <span class="navbar__brand-name">Anduma Bus</span>
          <span class="navbar__brand-sub">Live</span>
        </div>
      </RouterLink>

      <ul class="navbar__links">
        <li v-for="link in navLinks" :key="link.to">
          <RouterLink :to="link.to" class="navbar__link" active-class="navbar__link--active">
            <AppIcon :name="link.icon" size="sm" />
            <span class="navbar__link-label">{{ link.label }}</span>
          </RouterLink>
        </li>
      </ul>

      <div class="navbar__live">
        <span class="navbar__live-dot"></span>
        <span class="navbar__live-text">In tempo reale</span>
      </div>

      <button
        class="navbar__menu-toggle"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="mobile-navigation"
        aria-label="Apri menu"
        @click="menuOpen = !menuOpen"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

    </div>

    <Transition name="navbar-menu">
      <div v-if="menuOpen" id="mobile-navigation" class="navbar__mobile-panel">
        <RouterLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          class="navbar__mobile-link"
          active-class="navbar__mobile-link--active"
          @click="menuOpen = false"
        >
          <AppIcon :name="link.icon" size="sm" />
          <span>{{ link.label }}</span>
        </RouterLink>
      </div>
    </Transition>
  </nav>

  <!-- Bottom tab bar — mobile only -->
  <nav class="bottom-nav" aria-label="Navigazione principale">
    <RouterLink
      v-for="link in navLinks"
      :key="link.to"
      :to="link.to"
      class="bottom-nav__tab"
      active-class="bottom-nav__tab--active"
    >
      <AppIcon :name="link.icon" size="md" />
      <span class="bottom-nav__label">{{ link.label }}</span>
    </RouterLink>
  </nav>
</template>

<script setup>
import { onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'

const route = useRoute()
const menuOpen = ref(false)

const navLinks = [
  { to: '/',        icon: 'home',  label: 'Home' },
  { to: '/fermate', icon: 'stop',  label: 'Fermate' },
  { to: '/mappa',   icon: 'map',   label: 'Mappa Live' },
]

watch(() => route.fullPath, () => {
  menuOpen.value = false
})

function closeMenuOnDesktop() {
  if (window.innerWidth >= 600) {
    menuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', closeMenuOnDesktop)
})

onUnmounted(() => {
  window.removeEventListener('resize', closeMenuOnDesktop)
})
</script>

<style scoped>
.navbar {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  height: var(--nav-height);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border);
  isolation: isolate;
}

.navbar--menu-open {
  z-index: 10000;
}

.navbar__inner {
  position: relative;
  z-index: 3;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-4);
  height: 100%;
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

/* Brand */
.navbar__brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  flex-shrink: 0;
}

.navbar__brand-icon {
  width: 36px;
  height: 36px;
  background: var(--color-primary);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  box-shadow: 0 2px 8px rgba(0, 85, 164, 0.5);
}

.navbar__brand-text {
  display: none;
  flex-direction: column;
  line-height: 1.15;
}

.navbar__brand-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-extrabold);
  color: var(--color-text-primary);
  letter-spacing: -0.02em;
}

.navbar__brand-sub {
  font-size: 9px;
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

/* Nav links */
.navbar__links {
  display: none;
  list-style: none;
  gap: var(--space-1);
  flex: 1;
  justify-content: center;
}

.navbar__link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: all var(--transition-fast);
}

.navbar__link:hover {
  color: var(--color-text-primary);
  background: var(--color-bg-card);
}

.navbar__link:active {
  color: var(--color-primary-light);
  background: var(--color-primary-alpha);
}

.navbar__link--active {
  color: var(--color-primary-light);
  background: var(--color-primary-alpha);
}

.navbar__link-label {
  display: none;
}

/* Live badge */
.navbar__live {
  display: none;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.navbar__live-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--color-realtime);
  animation: glow-pulse 2s ease-in-out infinite;
}

.navbar__live-text {
  font-size: var(--font-size-xs);
  color: var(--color-text-muted);
  font-weight: var(--font-weight-medium);
}

.navbar__menu-toggle {
  width: 42px;
  height: 42px;
  margin-left: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-card);
  color: var(--color-text-primary);
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast), color var(--transition-fast);
}

.navbar__menu-toggle span {
  width: 18px;
  height: 2px;
  border-radius: var(--radius-full);
  background: currentColor;
  transition: transform var(--transition-fast), opacity var(--transition-fast);
}

.navbar__menu-toggle[aria-expanded="true"] {
  border-color: var(--color-border-active);
  background: var(--color-primary-alpha);
  color: var(--color-primary-light);
}

.navbar__menu-toggle[aria-expanded="true"] span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.navbar__menu-toggle[aria-expanded="true"] span:nth-child(2) {
  opacity: 0;
}

.navbar__menu-toggle[aria-expanded="true"] span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

.navbar__mobile-panel {
  position: absolute;
  top: calc(100% + var(--space-2));
  left: var(--space-3);
  right: var(--space-3);
  z-index: 2;
  display: grid;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: var(--shadow-lg);
}

.navbar__mobile-link {
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: 0 var(--space-3);
  border-radius: var(--radius-lg);
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.navbar__mobile-link:active {
  color: var(--color-primary-light);
  background: var(--color-primary-alpha);
}

.navbar__mobile-link--active {
  color: var(--color-primary-light);
  background: var(--color-primary-alpha);
}

.navbar-menu-enter-active,
.navbar-menu-leave-active {
  transition: opacity var(--transition-fast), transform var(--transition-fast);
}

.navbar-menu-enter-from,
.navbar-menu-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* ── Tablet ── */
@media (min-width: 600px) {
  .navbar__inner {
    padding: 0 var(--space-6);
    gap: var(--space-6);
  }

  .navbar__brand-text {
    display: flex;
  }

  .navbar__links {
    display: flex;
  }

  .navbar__link-label {
    display: inline;
  }

  .navbar__live {
    display: flex;
  }

  .navbar__menu-toggle,
  .navbar__mobile-panel {
    display: none;
  }
}

/* ── Bottom tab bar ── */
.bottom-nav {
  display: none;
}

@media (max-width: 599px) {
  /* Nascondi hamburger — la bottom nav sostituisce */
  .navbar__menu-toggle {
    display: none;
  }

  .bottom-nav {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: var(--z-sticky);
    height: calc(60px + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background: rgba(255, 255, 255, 0.97);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid var(--color-border);
    justify-content: space-around;
    align-items: stretch;
  }

  .bottom-nav__tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: var(--color-text-muted);
    text-decoration: none;
    font-size: 10px;
    font-weight: var(--font-weight-semibold);
    letter-spacing: 0.02em;
    transition: color var(--transition-fast);
    padding: var(--space-2) 0;
  }

  .bottom-nav__tab:active {
    color: var(--color-primary-light);
  }

  .bottom-nav__tab--active {
    color: var(--color-primary);
  }

  .bottom-nav__tab--active .bottom-nav__label {
    font-weight: var(--font-weight-bold);
  }

  .bottom-nav__label {
    display: block;
  }
}

</style>
