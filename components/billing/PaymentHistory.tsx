"use client";

import { PaymentDto } from "@/types/api";

interface PaymentHistoryProps {
  payments: PaymentDto[];
}

export function PaymentHistory({ payments }: PaymentHistoryProps) {
  if (!payments || payments.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-xl font-bold text-foreground mb-4">
        Payment History
      </h2>
      <div className="bg-card rounded-xl border border-border overflow-x-auto">
        <table className="w-full text-left text-sm text-text-secondary min-w-[600px]">
          <thead className="bg-card-2 text-xs uppercase tracking-widest text-text-muted border-b border-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Date</th>
              <th className="px-6 py-4 font-semibold">Amount</th>
              <th className="px-6 py-4 font-semibold">Period</th>
              <th className="px-6 py-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-card-2/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-foreground">
                  {new Date(p.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-semibold text-foreground">
                  ${(Number(p.amountUsdc) / 1_000_000).toFixed(2)}{" "}
                  <span className="text-text-muted font-normal">{p.tokenSymbol}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-text-muted text-xs font-mono">
                  {new Date(p.periodStart).toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
                  {new Date(p.periodEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      p.status === "completed"
                        ? "bg-teal/10 text-teal border border-teal/20"
                        : "bg-gold/10 text-gold border border-gold/20"
                    }`}
                  >
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
