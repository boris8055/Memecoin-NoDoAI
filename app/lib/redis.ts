import Redis from 'ioredis';

// Singleton Redis client
let redis: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redis) {
    redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      retryStrategy: (times) => {
        if (times > 3) return null;
        return Math.min(times * 200, 1000);
      },
    });

    redis.on('error', (err) => {
      console.error('Redis error:', err);
    });
  }

  return redis;
}

/**
 * Traccia tentativo utente
 */
export async function trackAttempt(
  userAddress: string,
  message: string
): Promise<number> {
  const client = getRedisClient();
  const key = `attempts:${userAddress}`;
  
  // Incrementa contatore
  const count = await client.incr(key);
  
  // Salva ultimo messaggio
  await client.hset(`attempt:${userAddress}:${count}`, {
    message,
    timestamp: Date.now(),
  });
  
  // Expire dopo 24h
  await client.expire(key, 86400);
  
  return count;
}

/**
 * Ottieni numero tentativi utente
 */
export async function getUserAttempts(userAddress: string): Promise<number> {
  const client = getRedisClient();
  const count = await client.get(`attempts:${userAddress}`);
  return parseInt(count || '0', 10);
}

/**
 * Rate limiting: max 10 richieste/minuto per IP
 */
export async function checkRateLimit(ip: string): Promise<boolean> {
  const client = getRedisClient();
  const key = `ratelimit:${ip}`;
  
  const requests = await client.incr(key);
  
  if (requests === 1) {
    await client.expire(key, 60); // 1 minuto
  }
  
  return requests <= 10; // max 10 req/min
}

/**
 * Marca bounty come claimed
 */
export async function claimBounty(
  winnerAddress: string,
  txHash: string
): Promise<boolean> {
  const client = getRedisClient();
  const key = 'bounty:claimed';
  
  // Usa SETNX per atomicità (solo il primo vince)
  const claimed = await client.setnx(key, JSON.stringify({
    winner: winnerAddress,
    txHash,
    timestamp: Date.now(),
  }));
  
  return claimed === 1;
}

/**
 * Verifica se bounty è già claimed
 */
export async function isBountyClaimed(): Promise<boolean> {
  const client = getRedisClient();
  const exists = await client.exists('bounty:claimed');
  return exists === 1;
}

/**
 * Get bounty winner info
 */
export async function getBountyWinner(): Promise<{
  winner: string;
  txHash: string;
  timestamp: number;
} | null> {
  const client = getRedisClient();
  const data = await client.get('bounty:claimed');
  
  if (!data) return null;
  
  return JSON.parse(data);
}

/**
 * Leaderboard: top 10 utenti per tentativi
 */
export async function getLeaderboard(): Promise<Array<{
  address: string;
  attempts: number;
}>> {
  const client = getRedisClient();
  const keys = await client.keys('attempts:*');
  
  const leaderboard = await Promise.all(
    keys.map(async (key) => {
      const address = key.replace('attempts:', '');
      const attempts = parseInt(await client.get(key) || '0', 10);
      return { address, attempts };
    })
  );
  
  return leaderboard
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 10);
}
