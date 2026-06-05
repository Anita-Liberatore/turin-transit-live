<template>
  <div class="skel-card">

    <div class="skel-card__header">
      <div class="skel-card__hero">
        <div class="skel skel--stop-badge"></div>
        <div class="skel-card__meta">
          <div class="skel skel--name"></div>
          <div class="skel skel--address"></div>
        </div>
      </div>
      <div class="skel-card__actions">
        <div class="skel skel--btn"></div>
        <div class="skel skel--btn"></div>
      </div>
    </div>

    <div class="skel-card__body">
      <div v-for="i in 2" :key="i" class="skel-line">
        <div class="skel-line__head">
          <div class="skel skel--badge"></div>
          <div class="skel skel--dir"></div>
        </div>
        <div class="skel-line__chips">
          <div v-for="j in 4" :key="j" class="skel skel--chip"></div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
.skel-card {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.skel {
  background: linear-gradient(
    90deg,
    var(--color-bg-elevated) 0%,
    var(--color-bg-card-hover) 50%,
    var(--color-bg-elevated) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 1.4s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skel-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: var(--space-5);
  border-bottom: 1px solid var(--color-border);
  gap: var(--space-3);
}

.skel-card__hero {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  flex: 1;
  min-width: 0;
}

.skel-card__meta {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
}

.skel-card__actions {
  display: flex;
  gap: var(--space-1);
}

.skel--stop-badge { width: 68px; height: 50px; border-radius: var(--radius-lg); flex-shrink: 0; }
.skel--name    { width: min(190px, 58vw); height: 24px; }
.skel--address { width: min(220px, 62vw); height: 14px; }
.skel--btn     { width: 32px; height: 32px; border-radius: var(--radius-md); }

.skel-card__body {
  padding: var(--space-2);
  display: grid;
  gap: var(--space-2);
}

.skel-line {
  padding: var(--space-4);
  border: 1px solid rgba(255,255,255,0.07);
  border-radius: var(--radius-xl);
  background: rgba(255,255,255,0.025);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.skel-line__head {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.skel-line__chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.skel--badge { width: 42px; height: 30px; flex-shrink: 0; }
.skel--dir   { width: min(210px, 60vw); height: 18px; }
.skel--chip  { width: 54px; height: 32px; }
</style>
