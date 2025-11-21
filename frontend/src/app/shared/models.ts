/* Modelos compartidos para tipar datos del backend */
export interface ListSummary {
  listId: string;
  name: string | null;
  role: 'owner' | 'editor' | 'viewer';
}

export interface TimerItem {
  listId: string;
  mvpId: string;
  lastDeathAt: number;
  spawnStart: number;
  spawnEnd: number;
  status: 'DEAD' | 'WINDOW' | 'AVAILABLE';
  ttl: number;
}

export interface MvpItem {
  mvpId: string;
  name: string;
  map: string;
  minRespawn: number;
  maxRespawn: number;
}

export interface ShareRequest {
  email: string;
  role: 'owner' | 'editor' | 'viewer';
}
