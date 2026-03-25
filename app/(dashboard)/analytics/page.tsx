import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { SendsBarChart } from "@/components/analytics/SendsBarChart";
import { DeliveryStatusDonut } from "@/components/analytics/DeliveryStatusDonut";
import { CategoryBreakdownBars } from "@/components/analytics/CategoryBreakdownBars";
import { DateRangePicker } from "@/components/analytics/DateRangePicker";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Analytics</h1>
          <p className="text-sm text-text-muted">Deep dive into your protocol&apos;s notification performance.</p>
        </div>
        <DateRangePicker />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        {/* Main Volume Chart */}
        <Card className="bg-navy-2 border-border-2 rounded-xl">
          <CardHeader className="pb-0">
            <CardTitle className="text-sm font-medium text-text-muted text-left">Message Volume</CardTitle>
            <div className="text-3xl font-bold text-white mt-1">19,450 <span className="text-sm font-normal text-teal">+14%</span></div>
          </CardHeader>
          <CardContent>
            <SendsBarChart />
          </CardContent>
        </Card>

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Delivery Status */}
          <Card className="bg-navy-2 border-border-2 rounded-xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-text-muted text-center">Delivery Status</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center">
              <DeliveryStatusDonut />
            </CardContent>
          </Card>

          {/* Category Split */}
          <Card className="bg-navy-2 border-border-2 rounded-xl">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-medium text-text-muted text-left">Category Split</CardTitle>
            </CardHeader>
            <CardContent>
              <CategoryBreakdownBars />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
