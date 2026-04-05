export function createSignInChallenge(wallet: string, timestamp: number): string {
  return `Sign in to Herald Dashboard\nWallet: ${wallet}\nTimestamp: ${timestamp}`;
}
