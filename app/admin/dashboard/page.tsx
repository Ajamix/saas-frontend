"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAdminDashboardOverview, getTenantGrowth, getRevenueData } from "@/app/api/admin-dashboard";
import { Users, Building2, CreditCard, DollarSign, TrendingUp, LineChart as LineChartIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import TestAuth from "./test-auth";

type Period = 'daily' | 'weekly' | 'monthly';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/80 backdrop-blur-sm p-4 border rounded-lg shadow-xl">
        <p className="text-sm font-medium text-gray-600">{new Date(label).toLocaleDateString()}</p>
        <p className="text-sm font-bold" style={{ color: payload[0].color }}>
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [period, setPeriod] = useState<Period>('weekly');
  const [tenantGrowth, setTenantGrowth] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [overview, growth, revenue] = await Promise.all([
          getAdminDashboardOverview(),
          getTenantGrowth(period),
          getRevenueData(period)
        ]);
        
        setData(overview);
        setTenantGrowth(growth);
        setRevenueData(revenue);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TestAuth />
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your SaaS platform</p>
        </div>
        <Select value={period} onValueChange={(value: Period) => setPeriod(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.overview.totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Active platform users</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.overview.totalTenants}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                {data?.overview.activeTenantsCount} active
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                {data?.overview.inactiveTenantsCount} inactive
              </span>
            </div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Subscriptions</CardTitle>
            <CreditCard className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data?.overview.activeSubscriptions}</div>
            <p className="text-xs text-muted-foreground mt-1">Current paying customers</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data?.overview.totalRevenue.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Lifetime revenue</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tenant Growth</CardTitle>
                <CardDescription>New tenants over time</CardDescription>
              </div>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={tenantGrowth}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="tenantGrowth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#e5e7eb" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="period" 
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    stroke="#9ca3af"
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    fontSize={12} 
                    stroke="#9ca3af"
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="New Tenants"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#tenantGrowth)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Revenue</CardTitle>
                <CardDescription>Revenue over time</CardDescription>
              </div>
              <LineChartIcon className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart 
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.2}/>
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    stroke="#e5e7eb" 
                    vertical={false}
                  />
                  <XAxis 
                    dataKey="period" 
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    stroke="#9ca3af"
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    fontSize={12}
                    tickFormatter={(value) => `$${value}`}
                    stroke="#9ca3af"
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#22c55e', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#22c55e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#revenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Tenants</CardTitle>
              <CardDescription>Latest organizations that joined the platform</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data?.recentTenants.map((tenant: any) => (
              <div
                key={tenant.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div>
                  <div className="font-medium">{tenant.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {tenant.subdomain}.yourdomain.com
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  tenant.isActive 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {tenant.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 