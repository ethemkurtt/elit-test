"use client"

import { useQuery } from "@tanstack/react-query"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

type MonthlyData = {
  month: number
  total: number
}

type CategoryData = {
  category: string
  total: number
}

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a4de6c", "#d0ed57", "#8dd1e1"
]

const monthNames = [
  "", "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
]

export default function AnalyticsPage() {
  const { data: monthly = [] } = useQuery<MonthlyData[]>({
    queryKey: ["monthly-analytics"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/analytics/monthly-summary")
      const json = await res.json()
      return Array.isArray(json.data) ? json.data : []
    },
  })

  const { data: category = [] } = useQuery<CategoryData[]>({
    queryKey: ["category-analytics"],
    queryFn: async () => {
      const res = await fetch("http://localhost:5000/api/analytics/category-summary")
      const json = await res.json()
      return Array.isArray(json.data) ? json.data : []
    },
  })

  const monthlyChartData = monthly.map((d) => ({
    name: monthNames[d.month],
    rezervasyon: d.total,
  }))

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-7xl mx-auto mt-10 px-4">
      {/* 🟦 Aylık Rezervasyon BarChart */}
      <Card>
        <CardHeader>
          <CardTitle>Aylık Rezervasyon Dağılımı</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="rezervasyon" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 🟪 Kategoriye Göre PieChart */}
      <Card>
        <CardHeader>
          <CardTitle>Kategoriye Göre Rezervasyon</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={category}
                dataKey="total"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label
              >
                {category.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
