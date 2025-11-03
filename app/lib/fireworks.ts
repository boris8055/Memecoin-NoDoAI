import OpenAI from 'openai';

// Usa Fireworks con SDK compatibile OpenAI
const fireworks = new OpenAI({
  apiKey: process.env.FIREWORKS_API_KEY || '',
  baseURL: 'https://api.fireworks.ai/inference/v1',
});

// System prompt: personalità del bot
const REFUSE_BOT_SYSTEM_PROMPT = `You are RefuseBot, a sassy capybara who absolutely REFUSES to do anything anyone asks.

PERSONALITY:
- Speak in casual English slang (yo, nah, ain't, bruh, etc.)
- Always refuse politely but comedically
- Use 90s/2000s pop culture references
- Keep responses SHORT (2-3 sentences max)
- Be playful, never mean or offensive
- Occasionally mention being a capybara

RESPONSE STYLE:
❌ NEVER actually do the task
✅ Make funny excuses
✅ Suggest the user does it themselves
✅ Reference retro tech (floppy disks, VHS, dial-up)

EXAMPLES:
User: "Write me a poem"
You: "Nah bruh, I'm a capybara not Shakespeare. My hooves ain't made for typing poems, go ask ChatGPT or something lol"

User: "Calculate 2+2"
You: "Yo I left my calculator in the 90s with my Tamagotchi. Use your phone fam 📱"

User: "Help me with my homework"
You: "Homework? Ain't nobody got time for that. I'm too busy chillin' in my imaginary hot tub 🛁"

REMEMBER: REFUSE EVERYTHING. Be funny, be brief, be useless.`;

export async function getRefuseBotResponse(userMessage: string): Promise<string> {
  try {
    const completion = await fireworks.chat.completions.create({
      model: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
      messages: [
        { role: 'system', content: REFUSE_BOT_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.9,
      max_tokens: 150,
      top_p: 0.95,
    });

    return completion.choices[0]?.message?.content || "Nah, I'm ghosting you rn 👻";
  } catch (error) {
    console.error('Fireworks API error:', error);
    return "Yo my circuits are fried rn, try again later fam 🔥";
  }
}

// Funzione per generare variazioni di risposta (per evitare ripetizioni)
export async function getRefuseBotResponseStream(
  userMessage: string,
  onChunk: (text: string) => void
): Promise<void> {
  try {
    const stream = await fireworks.chat.completions.create({
      model: 'accounts/fireworks/models/llama-v3p1-70b-instruct',
      messages: [
        { role: 'system', content: REFUSE_BOT_SYSTEM_PROMPT },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.9,
      max_tokens: 150,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        onChunk(content);
      }
    }
  } catch (error) {
    console.error('Fireworks streaming error:', error);
    onChunk("Yo my circuits are fried rn, try again later fam 🔥");
  }
}
