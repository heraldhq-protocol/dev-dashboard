"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

const performanceData = [
  { date: "Mar 1", sends: 120 },
  { date: "Mar 2", sends: 340 },
  { date: "Mar 3", sends: 210 },
  { date: "Mar 4", sends: 890 },
  { date: "Mar 5", sends: 1100 },
  { date: "Mar 6", sends: 950 },
  { date: "Mar 7", sends: 1450 },
];

const mockFailedLogs = [
  { id: "notif_8x2f", wallet: "7aV...9xK", category: "defi", reason: "RPC Timeout" },
  { id: "notif_9m1p", wallet: "G2z...4rW", category: "governance", reason: "Invalid Signature" },
  { id: "notif_2k9l", wallet: "4xP...1tB", category: "system", reason: "Rate Limited" },
];

interface FailedLog {
  id: string;
  wallet: string;
  category: string;
  reason: string;
}

const columns = [
  {
    accessorKey: "id",
    header: "ID",
    cell: ({ row }: { row: { original: FailedLog } }) => <span className="font-mono text-text-secondary">{row.original.id}</span>
  },
  {
    accessorKey: "wallet",
    header: "Wallet",
    cell: ({ row }: { row: { original: FailedLog } }) => <span className="font-mono text-teal">{row.original.wallet}</span>
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }: { row: { original: FailedLog } }) => <Badge variant="secondary">{row.original.category}</Badge>
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }: { row: { original: FailedLog } }) => <span className="text-red font-semibold">{row.original.reason}</span>
  }
];

export default function OverviewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-white">Overview</h1>
        <p className="text-sm text-text-muted">Monitor your Herald notification infrastructure.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="bg-navy-2 border-border-2 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted text-left">Total Sends (30d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">42,893</div>
            <p className="text-xs text-teal mt-1">↑ 12% from last month</p>
          </CardContent>
        </Card>
        
        <Card className="bg-navy-2 border-border-2 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted text-left">Delivery Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">99.8%</div>
            <p className="text-xs text-text-muted mt-1">Based on on-chain confirmations</p>
          </CardContent>
        </Card>

        <Card className="bg-navy-2 border-border-2 rounded-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-muted text-left">Active Webhooks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">4</div>
            <p className="text-xs text-text-muted mt-1">Listening to 12 events</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-navy-2 border-border-2 rounded-xl">
          <CardHeader>
            <CardTitle className="text-base text-left">Notification Volume</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-[100%] min-w-0 pb-4 pr-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1A3A52" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#64748B" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#64748B" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#112240", border: "1px solid #1A3A52", borderRadius: "8px" }}
                    itemStyle={{ color: "#00C896" }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sends" 
                    stroke="#00C896" 
                    strokeWidth={3} 
                    dot={{ fill: "#00C896", strokeWidth: 2, r: 4 }} 
                    activeDot={{ r: 6, fill: "#00E5A8" }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 bg-navy-2 border-border-2 rounded-xl flex flex-col overflow-hidden">
          <CardHeader className="border-b border-border/50 pb-4">
            <CardTitle className="text-base text-left">Recent Failures</CardTitle>
          </CardHeader>
          <div className="flex-1 w-full overflow-x-auto p-0">
            <DataTable columns={columns} data={mockFailedLogs} />
          </div>
        </Card>
      </div>
    </div>
  );
}
