/* Utilidades de cálculo de temporizadores */
export interface TimerInput {
  lastDeathAt: number;
  minRespawnMinutes: number;
  maxRespawnMinutes: number;
}

export interface TimerWindow {
  spawnStart: number;
  spawnEnd: number;
  status: 'DEAD' | 'WINDOW' | 'AVAILABLE';
  ttlSeconds: number;
}

export const calculateTimerWindow = (input: TimerInput, now: number): TimerWindow => {
  /* Se calcula la ventana temporal usando los parámetros del MVP */
  const spawnStart = input.lastDeathAt + input.minRespawnMinutes * 60_000;
  const spawnEnd = input.lastDeathAt + input.maxRespawnMinutes * 60_000;
  let status: 'DEAD' | 'WINDOW' | 'AVAILABLE';
  if (now < spawnStart) {
    status = 'DEAD';
  } else if (now <= spawnEnd) {
    status = 'WINDOW';
  } else {
    status = 'AVAILABLE';
  }
  const ttlSeconds = Math.floor(spawnEnd / 1000);
  return { spawnStart, spawnEnd, status, ttlSeconds };
};
