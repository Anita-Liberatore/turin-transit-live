<template>
  <main class="home">

    <!-- Hero -->
    <section class="hero">
      <div class="hero__glow"></div>
      <div class="hero__content">
        <div class="hero__eyebrow">
          <span class="hero__dot"></span>
          Torino in movimento
        </div>
        <h1 class="hero__title">
          Trasporto<br />
          <span class="hero__title-accent">pubblico live</span>
        </h1>
        <p class="hero__sub">
          Orari in tempo reale e posizione GPS dei mezzi GTT direttamente dalla città.
        </p>
        <div class="hero__actions">
          <RouterLink to="/fermate">
            <BaseButton size="lg">
              <template #icon><AppIcon name="stop" size="md" /></template>
              Orari fermate
            </BaseButton>
          </RouterLink>
          <RouterLink to="/mappa">
            <BaseButton size="lg" variant="secondary">
              <template #icon><AppIcon name="map" size="md" /></template>
              Mappa live
            </BaseButton>
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- Feature cards -->
    <section class="features">
      <RouterLink to="/fermate" class="feature-card">
        <div class="feature-card__icon-wrap feature-card__icon-wrap--red">
          <AppIcon name="stop" size="lg" />
        </div>
        <div class="feature-card__body">
          <h3 class="feature-card__title">Orari Fermate</h3>
          <p class="feature-card__desc">Prossime partenze da qualsiasi fermata GTT, aggiornate ogni 30 secondi.</p>
        </div>
        <AppIcon name="arrow_right" size="sm" class="feature-card__arrow" />
      </RouterLink>

      <RouterLink to="/mappa" class="feature-card">
        <div class="feature-card__icon-wrap feature-card__icon-wrap--blue">
          <AppIcon name="location" size="lg" />
        </div>
        <div class="feature-card__body">
          <h3 class="feature-card__title">Mappa Live</h3>
          <p class="feature-card__desc">Posizione GPS in tempo reale di tutti i mezzi attivi sulla rete GTT.</p>
        </div>
        <AppIcon name="arrow_right" size="sm" class="feature-card__arrow" />
      </RouterLink>

      <div class="feature-card feature-card--static">
        <div class="feature-card__icon-wrap feature-card__icon-wrap--green">
          <AppIcon name="signal" size="lg" />
        </div>
        <div class="feature-card__body">
          <h3 class="feature-card__title">Dati MQTT</h3>
          <p class="feature-card__desc">Connessione diretta al broker</p>
        </div>
        <span class="feature-card__tag">LIVE</span>
      </div>
    </section>

    <!-- Quick search -->
    <section class="quick">
      <div class="quick__inner">
        <h2 class="quick__title">Cerca una fermata</h2>
        <p class="quick__sub">Inserisci il numero della fermata GTT</p>
        <div class="quick__form">
          <BaseInput
            v-model="quickStop"
            placeholder="Numero fermata"
            clearable
            @keyup.enter="goToStop"
          >
            <template #icon><AppIcon name="search" size="sm" /></template>
          </BaseInput>
          <BaseButton @click="goToStop" :disabled="!quickStop.trim()">
            Cerca
            <template #icon-right><AppIcon name="arrow_right" size="sm" /></template>
          </BaseButton>
        </div>
        <div class="quick__pills">
          <button
            v-for="s in popularStops"
            :key="s.id"
            class="quick__pill"
            @click="goToStopId(s.id)"
          >
            {{ s.name }}
          </button>
        </div>
      </div>
    </section>

  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const router = useRouter()
const quickStop = ref('')

const popularStops = [
  { id: '1572', name: 'Porta Nuova' },
  { id: '631',  name: 'Porta Susa' },
  { id: '204',  name: 'P.za Vittorio' },
  { id: '1800', name: 'C.so Francia' },
]

function goToStop() {
  const id = quickStop.value.trim()
  if (id) router.push({ path: '/fermate', query: { stop: id } })
}

function goToStopId(id) {
  router.push({ path: '/fermate', query: { stop: id } })
}
</script>

<style scoped>
.home {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* ── Hero ── */
.hero {
  position: relative;
  padding: var(--space-12) var(--space-4) var(--space-10);
  overflow: hidden;
  min-height: 380px;
  display: flex;
  align-items: center;
}

.hero__glow {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 70% 60% at 50% -10%, rgba(230, 51, 41, 0.18) 0%, transparent 65%),
    radial-gradient(ellipse 40% 30% at 85% 90%, rgba(41, 128, 185, 0.08) 0%, transparent 60%);
  pointer-events: none;
}

.hero__content {
  position: relative;
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-primary-light);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.hero__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  animation: pulse-dot 1.8s ease-in-out infinite;
  flex-shrink: 0;
}

.hero__title {
  font-size: clamp(2rem, 8vw, 3.5rem);
  font-weight: var(--font-weight-extrabold);
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--color-text-primary);
}

.hero__title-accent {
  background: linear-gradient(120deg, var(--color-primary-light) 0%, var(--color-accent-light) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero__sub {
  font-size: var(--font-size-md);
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  max-width: 480px;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.hero__actions a { text-decoration: none; }

/* ── Feature cards ── */
.features {
  padding: var(--space-6) var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  max-width: var(--container-max);
  margin: 0 auto;
  width: 100%;
}

.feature-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-base);
}

a.feature-card:hover {
  border-color: var(--color-border-active);
  background: var(--color-bg-card-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-primary);
}

.feature-card--static {
  cursor: default;
}

.feature-card__icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.feature-card__icon-wrap--red   { background: rgba(230,51,41,0.12);  color: var(--color-primary); }
.feature-card__icon-wrap--blue  { background: rgba(41,128,185,0.12); color: var(--color-info); }
.feature-card__icon-wrap--green { background: rgba(39,174,96,0.12);  color: var(--color-success); }

.feature-card__body {
  flex: 1;
  min-width: 0;
}

.feature-card__title {
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--space-1);
}

.feature-card__desc {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  line-height: var(--line-height-normal);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feature-card__arrow {
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform var(--transition-fast), color var(--transition-fast);
}

a.feature-card:hover .feature-card__arrow {
  transform: translateX(3px);
  color: var(--color-primary-light);
}

.feature-card__tag {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  letter-spacing: 0.08em;
  color: var(--color-success);
  background: var(--color-success-light);
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

/* ── Quick search ── */
.quick {
  margin-top: auto;
  background: var(--color-bg-card);
  border-top: 1px solid var(--color-border);
  padding: var(--space-8) var(--space-4);
}

.quick__inner {
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.quick__title {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
}

.quick__sub {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-top: calc(-1 * var(--space-2));
}

.quick__form {
  display: flex;
  gap: var(--space-3);
}

.quick__form > :first-child { flex: 1; }

.quick__pills {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.quick__pill {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  color: var(--color-text-secondary);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  padding: var(--space-1) var(--space-3);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.quick__pill:hover {
  background: var(--color-primary-alpha);
  border-color: var(--color-border-active);
  color: var(--color-primary-light);
}

/* ── Tablet ── */
@media (min-width: 600px) {
  .hero {
    padding: var(--space-16) var(--space-8) var(--space-12);
    min-height: 460px;
  }

  .features {
    padding: var(--space-8) var(--space-8);
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  .feature-card {
    flex-direction: column;
    align-items: flex-start;
    padding: var(--space-6);
  }

  .feature-card__desc {
    white-space: normal;
  }

  .feature-card__arrow {
    display: none;
  }

  .quick {
    padding: var(--space-10) var(--space-8);
  }
}

/* ── Desktop ── */
@media (min-width: 1024px) {
  .features {
    grid-template-columns: 1fr 1fr 1fr;
    padding: var(--space-10) var(--space-8);
  }
}
</style>
