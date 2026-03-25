export function createSignInChallenge(nonce: string): string {
  return `Welcome to Herald Dashboard.\n\nClick to sign in and accept the Herald Terms of Service.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nNonce: ${nonce}`;
}
