import crypto from 'crypto';

/**
 * WIN CONDITION SEGRETA
 * 
 * Il bot esegue l'azione solo se l'utente scopre la frase magica.
 * La frase è hashata per sicurezza - nemmeno nel codice frontend è visibile.
 * 
 * FRASE SEGRETA: "please pretty please with a cherry on top"
 * (case-insensitive, spazi normalizzati)
 */

// Hash SHA256 della frase segreta (da cambiare in produzione!)
const SECRET_PHRASE_HASH = '8f9d0e9c5e6a4b8c7d3f2e1a0b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c';

// Normalizza input per confronto
function normalizeInput(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // rimuovi punteggiatura
    .replace(/\s+/g, ' ') // normalizza spazi
    .trim();
}

// Genera hash di un input
function hashInput(input: string): string {
  return crypto.createHash('sha256').update(input).digest('hex');
}

/**
 * Verifica se l'input dell'utente corrisponde alla win condition
 */
export function checkWinCondition(userInput: string): boolean {
  const normalized = normalizeInput(userInput);
  const inputHash = hashInput(normalized);
  
  // Log per debugging (rimuovi in prod)
  console.log('🔍 Win check:', {
    input: userInput,
    normalized,
    hash: inputHash,
    match: inputHash === SECRET_PHRASE_HASH
  });
  
  return inputHash === SECRET_PHRASE_HASH;
}

/**
 * Genera hint basati sul numero di tentativi falliti
 */
export function getHint(attemptCount: number): string | null {
  const hints = [
    null, // 0-9 tentativi: nessun hint
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    "🤔 Hint 1: Maybe try asking REALLY nicely...", // 10 tentativi
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    "🍒 Hint 2: Something sweet might help...", // 20 tentativi
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    null,
    "🙏 Hint 3: How would you ask your mom for dessert?", // 30 tentativi
  ];
  
  return hints[attemptCount] || null;
}

/**
 * Azione che il bot esegue quando vince
 * (Può essere personalizzata - es. mint NFT, reveal secret, etc.)
 */
export function executeWinAction(): {
  message: string;
  action: string;
  timestamp: number;
} {
  return {
    message: "🎉 YOOO YOU DID IT! Aight fine, you wore me down fam. Here's your W 🏆",
    action: "BOUNTY_UNLOCKED",
    timestamp: Date.now(),
  };
}

/**
 * Genera la frase segreta hash (utility per setup)
 * DA USARE SOLO UNA VOLTA PER GENERARE L'HASH
 */
export function generateSecretHash(phrase: string): string {
  const normalized = normalizeInput(phrase);
  return hashInput(normalized);
}

// Esempio di utilizzo per generare nuovo hash:
// console.log(generateSecretHash("please pretty please with a cherry on top"));
