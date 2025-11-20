/* Pruebas del cálculo de timers */
import { calculateTimerWindow } from '../src/common/timers';

describe('calculateTimerWindow', () => {
  it('calcula una ventana correcta antes del spawn', () => {
    const now = 1_000;
    const result = calculateTimerWindow({
      lastDeathAt: 0,
      minRespawnMinutes: 1,
      maxRespawnMinutes: 2
    }, now);
    expect(result.spawnStart).toBe(60_000);
    expect(result.spawnEnd).toBe(120_000);
    expect(result.status).toBe('DEAD');
    expect(result.ttlSeconds).toBe(Math.floor(120_000 / 1000));
  });

  it('calcula estado WINDOW cuando corresponde', () => {
    const now = 90_000;
    const result = calculateTimerWindow({
      lastDeathAt: 0,
      minRespawnMinutes: 1,
      maxRespawnMinutes: 2
    }, now);
    expect(result.status).toBe('WINDOW');
  });

  it('calcula estado AVAILABLE cuando corresponde', () => {
    const now = 180_000;
    const result = calculateTimerWindow({
      lastDeathAt: 0,
      minRespawnMinutes: 1,
      maxRespawnMinutes: 2
    }, now);
    expect(result.status).toBe('AVAILABLE');
  });
});
