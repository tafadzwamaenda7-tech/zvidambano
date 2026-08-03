/**
 * Health Checks — Monitor system health and detect issues
 */

import { supabase } from './supabase';

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: boolean;
    auth: boolean;
    storage: boolean;
    realtime: boolean;
  };
  timestamp: string;
}

export async function checkHealth(): Promise<HealthStatus> {
  const services = {
    database: false,
    auth: false,
    storage: false,
    realtime: false,
  };

  // Check database
  try {
    const { error } = await supabase.from('commodities').select('id').limit(1);
    services.database = !error;
  } catch { services.database = false; }

  // Check auth
  try {
    await supabase.auth.getSession();
    services.auth = true;
  } catch { services.auth = false; }

  // Check storage (reachability probe — no listing policy required)
  try {
    const { data } = supabase.storage.from('listing-photos').getPublicUrl('__health_probe__');
    await fetch(data.publicUrl);
    services.storage = true;
  } catch { services.storage = false; }

  // Check realtime
  try {
    const channel = supabase.channel('health-check');
    await new Promise<void>((resolve) => {
      channel.subscribe((status) => {
        services.realtime = status === 'SUBSCRIBED';
        resolve();
      });
      setTimeout(() => resolve(), 3000);
    });
    channel.unsubscribe();
  } catch { services.realtime = false; }

  const allHealthy = Object.values(services).every(v => v);
  const someHealthy = Object.values(services).some(v => v);

  return {
    status: allHealthy ? 'healthy' : someHealthy ? 'degraded' : 'unhealthy',
    services,
    timestamp: new Date().toISOString(),
  };
}