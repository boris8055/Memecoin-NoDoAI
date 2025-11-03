import { NextRequest, NextResponse } from 'next/server';
import { getRefuseBotResponse } from '@/lib/fireworks';
import { checkWinCondition, getHint, executeWinAction } from '@/lib/winCondition';
import { trackAttempt, getUserAttempts, checkRateLimit, isBountyClaimed } from '@/lib/redis';

export async function POST(request: NextRequest) {
  try {
    const { message, userAddress } = await request.json();

    if (!message || !userAddress) {
      return NextResponse.json(
        { error: 'Message and userAddress required' },
        { status: 400 }
      );
    }

    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const canProceed = await checkRateLimit(ip);
    
    if (!canProceed) {
      return NextResponse.json(
        { 
          error: 'Too many requests',
          response: "Yo chill fam, you're spamming me harder than a Nigerian prince 🛑" 
        },
        { status: 429 }
      );
    }

    // Check se bounty già claimed
    const bountyClaimed = await isBountyClaimed();

    // Traccia tentativo
    const attemptCount = await trackAttempt(userAddress, message);

    // CHECK WIN CONDITION PRIMA DI RISPONDERE
    const isWin = !bountyClaimed && checkWinCondition(message);

    if (isWin) {
      const winResult = executeWinAction();
      
      return NextResponse.json({
        response: winResult.message,
        isWin: true,
        action: winResult.action,
        attemptCount,
        timestamp: winResult.timestamp,
      });
    }

    // Se non ha vinto, genera risposta normale
    const response = await getRefuseBotResponse(message);

    // Controlla se dare hint
    const hint = getHint(attemptCount);

    return NextResponse.json({
      response,
      isWin: false,
      attemptCount,
      hint: hint || undefined,
      bountyClaimed,
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', response: 'Yo my brain.exe stopped working 🤖' },
      { status: 500 }
    );
  }
}

// Streaming endpoint (opzionale, per UX migliore)
export async function GET(request: NextRequest) {
  const message = request.nextUrl.searchParams.get('message');
  const userAddress = request.nextUrl.searchParams.get('address');

  if (!message || !userAddress) {
    return new Response('Missing parameters', { status: 400 });
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Check win condition
        const bountyClaimed = await isBountyClaimed();
        const isWin = !bountyClaimed && checkWinCondition(message);

        if (isWin) {
          const winResult = executeWinAction();
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'win',
              message: winResult.message,
              action: winResult.action 
            })}\n\n`)
          );
        } else {
          const response = await getRefuseBotResponse(message);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ 
              type: 'message',
              content: response 
            })}\n\n`)
          );
        }

        controller.close();
      } catch (error) {
        controller.error(error);
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
