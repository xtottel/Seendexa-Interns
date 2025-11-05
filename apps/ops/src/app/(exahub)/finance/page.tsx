// app/dashboard/finance/page.tsx
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  CreditCard, 
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  MessageSquare,
  Activity,
  RefreshCw,
  FileText,
  
} from "lucide-react";
import { useState, useEffect } from "react";

interface FinanceStats {
  totalRevenue: number;
  monthlyRevenue: number;
  revenueGrowth: number;
  activeClients: number;
  pendingInvoices: number;
  totalTransactions: number;
  walletBalances: number;
  smsCredits: number;
}

interface RecentTransaction {
  id: string;
  clientName: string;
  type: string;
  amount: number;
  date: string;
  status: string;
}

interface TopClient {
  id: string;
  name: string;
  spent: number;
  growth: number;
}

export default function FinanceOverviewPage() {
  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState('month');

  useEffect(() => {
    fetchFinanceData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  const fetchFinanceData = async () => {
    try {
      setLoading(true);
      
      const [overviewRes, transactionsRes, clientsRes] = await Promise.all([
        fetch(`/api/finance/overview?range=${timeRange}`),
        fetch('/api/finance/recent-transactions?limit=5'),
        fetch('/api/finance/top-clients?limit=5')
      ]);

      const overviewData = await overviewRes.json();
      const transactionsData = await transactionsRes.json();
      const clientsData = await clientsRes.json();

      if (overviewData.success) setStats(overviewData.data);
      if (transactionsData.success) setRecentTransactions(transactionsData.data);
      if (clientsData.success) setTopClients(clientsData.data);
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchFinanceData();
  };

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting finance data...");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatCompactCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const getGrowthBadge = (growth: number) => {
    if (growth > 0) {
      return (
        <Badge variant="default" className="flex items-center gap-1 bg-green-50 text-green-700 border-green-200">
          <ArrowUpRight className="h-3 w-3" />
          {growth}%
        </Badge>
      );
    } else if (growth < 0) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <ArrowDownRight className="h-3 w-3" />
          {Math.abs(growth)}%
        </Badge>
      );
    } else {
      return (
        <Badge variant="secondary" className="flex items-center gap-1">
          <ArrowUpRight className="h-3 w-3" />
          0%
        </Badge>
      );
    }
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return (
        <div className="p-2 rounded-full bg-green-100 text-green-600">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      );
    } else {
      return (
        <div className="p-2 rounded-full bg-red-100 text-red-600">
          <ArrowDownRight className="h-4 w-4" />
        </div>
      );
    }
  };

  const getTransactionTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      purchase: 'text-blue-600 bg-blue-50',
      usage: 'text-orange-600 bg-orange-50',
      refund: 'text-green-600 bg-green-50',
      transfer: 'text-purple-600 bg-purple-50'
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-9 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Metrics Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between mb-4 last:mb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
                      <div className="space-y-1">
                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                      <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Finance Overview
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor your financial performance and revenue in real-time
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button 
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-primary/90"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Time Range Tabs */}
      <div className="bg-muted/30 rounded-lg p-1 w-fit">
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="week" className="text-xs">Week</TabsTrigger>
            <TabsTrigger value="month" className="text-xs">Month</TabsTrigger>
            <TabsTrigger value="quarter" className="text-xs">Quarter</TabsTrigger>
            <TabsTrigger value="year" className="text-xs">Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <Card className="relative overflow-hidden border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            {stats?.revenueGrowth !== undefined && (
              <div className="flex items-center gap-2 mt-2">
                {getGrowthBadge(stats.revenueGrowth)}
                <span className="text-xs text-muted-foreground">vs last period</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Revenue */}
        <Card className="relative overflow-hidden border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <div className="p-2 bg-green-500/10 rounded-lg">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.monthlyRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Current month performance</p>
          </CardContent>
        </Card>

        {/* Active Clients */}
        <Card className="relative overflow-hidden border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activeClients || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Paying customers</p>
          </CardContent>
        </Card>

        {/* Pending Invoices */}
        <Card className="relative overflow-hidden border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <div className="p-2 bg-orange-500/10 rounded-lg">
              <FileText className="h-4 w-4 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.pendingInvoices || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting payment</p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balances */}
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-800">Wallet Balances</CardTitle>
            <Wallet className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {formatCompactCurrency(stats?.walletBalances || 0)}
            </div>
            <p className="text-xs text-orange-700 mt-1">Total client funds</p>
          </CardContent>
        </Card>

        {/* SMS Credits */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">SMS Credits</CardTitle>
            <MessageSquare className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">
              {formatNumber(stats?.smsCredits || 0)}
            </div>
            <p className="text-xs text-blue-700 mt-1">Available credits</p>
          </CardContent>
        </Card>

        {/* Total Transactions */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Total Transactions</CardTitle>
            <Activity className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">
              {formatNumber(stats?.totalTransactions || 0)}
            </div>
            <p className="text-xs text-purple-700 mt-1">All-time transactions</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Recent Transactions
                </CardTitle>
                <CardDescription>Latest financial activities across all clients</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {recentTransactions.length} transactions
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 px-6 pb-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => (
                  <div 
                    key={transaction.id} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {getTransactionIcon(transaction.type, transaction.amount)}
                      <div>
                        <p className="font-medium text-sm">{transaction.clientName}</p>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline" 
                            className={`text-xs capitalize ${getTransactionTypeColor(transaction.type)}`}
                          >
                            {transaction.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(transaction.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {transaction.status}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No recent transactions</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Transactions will appear here as they occur
                  </p>
                </div>
              )}
            </div>
            <div className="border-t px-6 py-4">
              <Button variant="outline" className="w-full" asChild>
                <a href="/finance/transactions">
                  View All Transactions
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Top Clients */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Top Clients
                </CardTitle>
                <CardDescription>Highest spending customers by revenue</CardDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {topClients.length} clients
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 px-6 pb-4">
              {topClients.length > 0 ? (
                topClients.map((client, index) => (
                  <div 
                    key={client.id} 
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                        ${index === 0 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
                          index === 1 ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                          index === 2 ? 'bg-orange-100 text-orange-800 border border-orange-200' :
                          'bg-blue-100 text-blue-800 border border-blue-200'}
                      `}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{client.name}</p>
                        <div className="flex items-center gap-2">
                          {getGrowthBadge(client.growth)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(client.spent)}</p>
                      <p className="text-xs text-muted-foreground">Total spent</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground">No client data</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Client spending data will appear here
                  </p>
                </div>
              )}
            </div>
            <div className="border-t px-6 py-4">
              <Button variant="outline" className="w-full" asChild>
                <a href="/finance/balances">
                  View All Balances
                  <ArrowUpRight className="h-4 w-4 ml-2" />
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}