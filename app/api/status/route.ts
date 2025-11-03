import { NextRequest, NextResponse } from 'next/server';
import { 
  isBountyClaimed, 
  getBountyWinner, 
  getLeaderboard,
  getUserAttempts 
} from '@/lib/redis';

export async function GET(request: NextRequest) {
  try {
    const userAddress = request.nextUrl.searchParams.get('address');

    const [claimed, winner, leaderboard] = await Promise.all([
      isBountyClaimed(),
      getBountyWinner(),
      getLeaderboard(),
    ]);

    let userStats = null;
    if (userAddress) {
      const attempts = await getUserAttempts(userAddress);
      userStats = { attempts };
    }

    return NextResponse.json({
      bounty: {
        amount: '10000',
        currency: 'USDC',
        claimed,
        winner: winner ? {
          address: `${winner.address.slice(0, 6)}...${winner.address.slice(-4)}`,
          timestamp: winner.timestamp,
          txHash: winner.txHash,
        } : null,
      },
      leaderboard: leaderboard.map(entry => ({
        address: `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}`,
        attempts: entry.attempts,
      })),
      userStats,
    });

  } catch (error) {
    console.error('Status API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
