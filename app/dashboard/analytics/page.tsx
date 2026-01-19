"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Calendar } from "lucide-react"

export default function AnalyticsPage() {
  const metrics = [
    {
      label: "Content Generated",
      value: "1,234",
      change: "+12%",
      trend: "up",
    },
    {
      label: "Approvals Rate",
      value: "94.2%",
      change: "+3.2%",
      trend: "up",
    },
    {
      label: "Avg. Generation Time",
      value: "2.3s",
      change: "-0.5s",
      trend: "down",
    },
    {
      label: "Active Users",
      value: "12",
      change: "+2",
      trend: "up",
    },
  ]

  const dailyData = [
    { date: "Jan 1", generated: 24, approved: 22 },
    { date: "Jan 2", generated: 35, approved: 31 },
    { date: "Jan 3", generated: 28, approved: 26 },
    { date: "Jan 4", generated: 42, approved: 40 },
    { date: "Jan 5", generated: 38, approved: 35 },
    { date: "Jan 6", generated: 45, approved: 43 },
  ]

  const topTopics = [
    { name: "Digital Marketing", count: 156 },
    { name: "Email Marketing", count: 134 },
    { name: "Social Media", count: 128 },
    { name: "Content Strategy", count: 97 },
    { name: "AI & Automation", count: 89 },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-2">System performance and usage metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="bg-card border-border p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">{metric.label}</p>
                <p className="text-2xl font-bold text-foreground mt-2">{metric.value}</p>
                <div className="flex items-center gap-1 mt-3">
                  {metric.trend === "up" ? (
                    <TrendingUp className="text-green-500" size={16} />
                  ) : (
                    <TrendingDown className="text-green-500" size={16} />
                  )}
                  <span className="text-sm text-green-500 font-medium">{metric.change}</span>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Daily Activity */}
      <Card className="bg-card border-border p-6">
        <h2 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
          <Calendar size={20} />
          Daily Activity
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Date</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Generated</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Approved</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Rate</th>
              </tr>
            </thead>
            <tbody>
              {dailyData.map((row, index) => (
                <tr key={index} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-4 text-sm text-foreground">{row.date}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{row.generated}</td>
                  <td className="py-3 px-4 text-sm text-foreground">{row.approved}</td>
                  <td className="py-3 px-4 text-sm text-green-500 font-medium">
                    {Math.round((row.approved / row.generated) * 100)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Topics */}
        <Card className="bg-card border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">Top Topics</h2>
          <div className="space-y-4">
            {topTopics.map((topic, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{topic.name}</p>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${(topic.count / 156) * 100}%` }} />
                  </div>
                </div>
                <span className="text-sm font-semibold text-foreground ml-4">{topic.count}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* System Status */}
        <Card className="bg-card border-border p-6">
          <h2 className="text-lg font-semibold text-foreground mb-6">System Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">API Availability</p>
                <p className="text-xs text-muted-foreground mt-1">Last 24 hours</p>
              </div>
              <span className="text-lg font-bold text-green-500">99.9%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Average Response Time</p>
                <p className="text-xs text-muted-foreground mt-1">Across all endpoints</p>
              </div>
              <span className="text-lg font-bold text-green-500">245ms</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Error Rate</p>
                <p className="text-xs text-muted-foreground mt-1">Current day</p>
              </div>
              <span className="text-lg font-bold text-green-500">0.1%</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-foreground">Database Status</p>
                <p className="text-xs text-muted-foreground mt-1">Connected</p>
              </div>
              <div className="w-3 h-3 bg-green-500 rounded-full" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
