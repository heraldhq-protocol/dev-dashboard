export function SolscanLink({ txHash, shorten = true }: { txHash: string; shorten?: boolean }) {
  const displayHash = shorten ? `${txHash.slice(0, 4)}...${txHash.slice(-4)}` : txHash;
  return (
    <a
      href={`https://solscan.io/tx/${txHash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-xs font-semibold text-teal hover:text-teal-2 transition-colors"
      title={txHash}
    >
      {displayHash} ↗
    </a>
  );
}
