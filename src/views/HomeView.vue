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
          </BaseButton>
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

function goToStop() {
  const id = quickStop.value.trim()
  if (id) router.push({ path: '/fermate', query: { stop: id } })
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
  padding: var(--space-12) 0 var(--space-10);
  overflow: hidden;
  min-height: 380px;
  display: flex;
  align-items: center;
  background: linear-gradient(125deg,
    #00163d 0%,
    var(--gtt-imperial) 25%,
    var(--gtt-french) 55%,
    var(--gtt-azure) 80%,
    #0077c8 100%
  );
  background-size: 300% 300%;
  animation: hero-shift 7s ease infinite;
}

/* Blob giallo — si muove e cambia forma */
.hero::before {
  content: '';
  position: absolute;
  right: -80px;
  top: -60px;
  width: 560px;
  height: 560px;
  background: radial-gradient(circle, rgba(253,197,0,0.28) 0%, rgba(255,213,0,0.1) 45%, transparent 70%);
  border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
  filter: blur(48px);
  pointer-events: none;
  animation: blob-yellow 9s ease-in-out infinite;
}

/* Blob azzurro chiaro — in basso a sinistra */
.hero::after {
  content: '';
  position: absolute;
  left: -120px;
  bottom: -80px;
  width: 420px;
  height: 420px;
  background: radial-gradient(circle, rgba(255,255,255,0.14) 0%, transparent 65%);
  border-radius: 60% 40% 30% 70% / 50% 60% 40% 50%;
  filter: blur(36px);
  pointer-events: none;
  animation: blob-white 11s ease-in-out infinite reverse;
}

/* Dot grid + sweep luminoso */
.hero__glow {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 26px 26px;
  pointer-events: none;
  will-change: transform;
}

/* Sweep — luce diagonale che attraversa il hero */
.hero__glow::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(
    108deg,
    transparent       35%,
    rgba(255,255,255,0.07) 50%,
    transparent       65%
  );
  background-size: 200% 100%;
  animation: light-sweep 5s ease-in-out infinite;
}

@keyframes hero-shift {
  0%   { background-position: 0%   60%; }
  50%  { background-position: 100% 40%; }
  100% { background-position: 0%   60%; }
}

@keyframes blob-yellow {
  0%   { transform: translate(0,   0)    scale(1)    rotate(0deg);   border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
  25%  { transform: translate(-70px, 60px) scale(1.15) rotate(15deg);  border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
  50%  { transform: translate(-120px, 20px) scale(0.92) rotate(30deg); border-radius: 50% 50% 40% 60% / 50% 40% 60% 50%; }
  75%  { transform: translate(-50px, 80px) scale(1.08) rotate(10deg);  border-radius: 30% 70% 60% 40% / 40% 60% 40% 60%; }
  100% { transform: translate(0,   0)    scale(1)    rotate(0deg);   border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
}

@keyframes blob-white {
  0%   { transform: translate(0,  0)   scale(1);    border-radius: 60% 40% 30% 70% / 50% 60% 40% 50%; }
  33%  { transform: translate(60px, -50px) scale(1.2); border-radius: 40% 60% 70% 30% / 60% 40% 50% 60%; }
  66%  { transform: translate(30px, -90px) scale(0.9); border-radius: 50% 50% 60% 40% / 40% 50% 60% 50%; }
  100% { transform: translate(0,  0)   scale(1);    border-radius: 60% 40% 30% 70% / 50% 60% 40% 50%; }
}

@keyframes light-sweep {
  0%   { background-position: -100% 0; opacity: 0; }
  10%  { opacity: 1; }
  60%  { opacity: 1; }
  100% { background-position: 250% 0; opacity: 0; }
}

.hero__content {
  position: relative;
  width: 100%;
  max-width: var(--container-max);
  margin: 0 auto;
  padding: 0 var(--space-4);
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
  color: var(--gtt-yellow);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gtt-yellow);
  animation: pulse-dot 1.8s ease-in-out infinite;
  flex-shrink: 0;
}

.hero__title {
  font-size: clamp(2rem, 8vw, 3.5rem);
  font-weight: var(--font-weight-extrabold);
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: #ffffff;
}

.hero__title-accent {
  color: var(--gtt-yellow);
  -webkit-text-fill-color: var(--gtt-yellow);
}

.hero__sub {
  font-size: var(--font-size-md);
  color: rgba(255, 255, 255, 0.78);
  line-height: var(--line-height-relaxed);
  max-width: 480px;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
}

.hero__actions a { text-decoration: none; }

/* Bottone primario dentro l'hero: giallo GTT su blu */
.hero__actions :deep(.btn--primary) {
  background: var(--gtt-yellow);
  color: var(--gtt-imperial);
  box-shadow: 0 4px 16px rgba(253, 197, 0, 0.4);
}
.hero__actions :deep(.btn--primary:hover) {
  background: var(--gtt-gold);
  box-shadow: 0 6px 20px rgba(253, 197, 0, 0.5);
}

/* Bottone secondario dentro l'hero scuro */
.hero__actions :deep(.btn--secondary) {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(255, 255, 255, 0.35);
  color: #ffffff;
}
.hero__actions :deep(.btn--secondary:hover) {
  background: rgba(255, 255, 255, 0.22);
  border-color: rgba(255, 255, 255, 0.6);
}

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
  border-left: 3px solid var(--gtt-azure);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: inherit;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-sm);
}

a.feature-card:hover {
  border-color: var(--color-border-active);
  background: var(--color-bg-card-hover);
  transform: translateY(-2px);
  box-shadow: 0 6px 28px rgba(0, 63, 136, 0.18);
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

.feature-card__icon-wrap--red   { background: var(--color-primary-alpha); color: var(--color-primary); }
.feature-card__icon-wrap--blue  { background: var(--color-info-light);    color: var(--color-info); }
.feature-card__icon-wrap--green { background: var(--color-success-light);  color: var(--color-success); }

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
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.feature-card__arrow {
  color: var(--color-text-muted);
  flex-shrink: 0;
  transition: transform var(--transition-fast), color var(--transition-fast);
}

a.feature-card:hover .feature-card__arrow {
  transform: translateX(3px);
  color: var(--color-accent);
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
  align-items: stretch;
  gap: var(--space-2);
}

.quick__form > :first-child {
  flex: 1;
}

.quick__form > :first-child:deep(.input) {
  min-height: 48px;
  border-color: var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-bg-input);
  box-shadow: inset 0 1px 0 var(--color-overlay-subtle);
}

.quick__form > :first-child:deep(.input--focused) {
  border-color: rgba(0, 85, 164, 0.7);
  box-shadow:
    0 0 0 3px rgba(0, 85, 164, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

.quick__form > :first-child:deep(.input__field) {
  font-size: var(--font-size-md);
  padding: 12px 0;
}

.quick__form > :first-child:deep(.input__icon) {
  color: var(--color-primary-light);
}

.quick__form > :last-child {
  min-width: 84px;
  min-height: 48px;
  border-radius: var(--radius-lg);
}

@media (max-width: 420px) {
  .quick__form {
    flex-direction: column;
  }

  .quick__form > :last-child {
    width: 100%;
  }
}


/* ── Tablet ── */
@media (min-width: 600px) {
  .hero {
    padding: var(--space-16) 0 var(--space-12);
    min-height: 460px;
  }

  .hero__content {
    padding: 0 var(--space-8);
  }

  .features {
    padding: var(--space-8) var(--space-8);
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
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
    padding: var(--space-10) var(--space-8);
  }
}
</style>
