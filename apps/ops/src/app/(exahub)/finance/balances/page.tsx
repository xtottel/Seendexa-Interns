// app/dashboard/finance/balances/page.tsx
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search,  
  Download, 
  Eye, 
  Plus,
  Wallet,
  MessageSquare,
  AlertTriangle,
  User,
  CreditCard,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  RefreshCw
} from "lucide-react";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface ClientBalance {
  id: string;
  clientName: string;
  email: string;
  walletBalance: number;
  smsCredits: number;
  totalSpent: number;
  monthlyUsage: number;
  status: 'active' | 'inactive' | 'suspended';
  lastTransaction: string;
  lowBalanceAlert: boolean;
}

interface BalanceStats {
  totalClients: number;
  activeClients: number;
  totalWalletBalance: number;
  totalSmsCredits: number;
  lowBalanceClients: number;
}

interface ApiResponse {
  success: boolean;
  data: ClientBalance[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface StatsResponse {
  success: boolean;
  data: BalanceStats;
}

export default function ClientBalancesPage() {
  const [clients, setClients] = useState<ClientBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [balanceFilter, setBalanceFilter] = useState<string>('all');
  const [stats, setStats] = useState<BalanceStats | null>(null);

  useEffect(() => {
    fetchClientBalances();
    fetchBalanceStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchClientBalances = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (balanceFilter !== 'all') params.append('balance', balanceFilter);
      params.append('page', '1');
      params.append('limit', '50');

      const response = await fetch(`/api/finance/balances?${params}`);
      const result: ApiResponse = await response.json();

      if (result.success) {
        setClients(result.data);
      } else {
        console.error("Failed to fetch client balances:", result);
        setClients([]);
      }
    } catch (error) {
      console.error("Error fetching client balances:", error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalanceStats = async () => {
    try {
      const response = await fetch('/api/finance/balances/stats');
      const result: StatsResponse = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        console.error("Failed to fetch balance stats:", result);
      }
    } catch (error) {
      console.error("Error fetching balance stats:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClientBalances();
  };

  const handleRefresh = () => {
    fetchClientBalances();
    fetchBalanceStats();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat('en-US').format(credits);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Suspended</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getBalanceStatus = (walletBalance: number, smsCredits: number) => {
    if (walletBalance < 100 || smsCredits < 500) {
      return 'low';
    } else if (walletBalance > 5000 || smsCredits > 10000) {
      return 'high';
    }
    return 'normal';
  };

  const getBalanceStatusBadge = (walletBalance: number, smsCredits: number) => {
    const status = getBalanceStatus(walletBalance, smsCredits);
    switch (status) {
      case 'low':
        return <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="h-3 w-3" /> Low</Badge>;
      case 'high':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> High</Badge>;
      default:
        return <Badge variant="outline" className="flex items-center gap-1"><TrendingDown className="h-3 w-3" /> Normal</Badge>;
    }
  };

  // Use stats data for calculations
  const totalClients = stats?.totalClients || clients.length;
  const activeClients = stats?.activeClients || clients.filter(client => client.status === 'active').length;
  const totalWalletBalance = stats?.totalWalletBalance || clients.reduce((sum, client) => sum + client.walletBalance, 0);
  const totalSmsCredits = stats?.totalSmsCredits || clients.reduce((sum, client) => sum + client.smsCredits, 0);
  const lowBalanceClients = stats?.lowBalanceClients || clients.filter(client => 
    getBalanceStatus(client.walletBalance, client.smsCredits) === 'low'
  ).length;

  // Calculate balance distribution for overview
  const lowBalanceCount = clients.filter(client => getBalanceStatus(client.walletBalance, client.smsCredits) === 'low').length;
  const normalBalanceCount = clients.filter(client => getBalanceStatus(client.walletBalance, client.smsCredits) === 'normal').length;
  const highBalanceCount = clients.filter(client => getBalanceStatus(client.walletBalance, client.smsCredits) === 'high').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading client balances...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Client Balances
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor client wallet balances and SMS credits
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Credits
          </Button>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Clients</p>
                <p className="text-2xl font-bold mt-2">{totalClients}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {activeClients} active
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wallet Balance</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(totalWalletBalance)}</p>
                <p className="text-xs text-muted-foreground mt-1">Total GHS</p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">SMS Credits</p>
                <p className="text-2xl font-bold mt-2">{formatCredits(totalSmsCredits)}</p>
                <p className="text-xs text-muted-foreground mt-1">Total credits</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <MessageSquare className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Balances</p>
                <p className="text-2xl font-bold text-red-600 mt-2">{lowBalanceClients}</p>
                <p className="text-xs text-muted-foreground mt-1">Need attention</p>
              </div>
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Balance Status Overview
          </CardTitle>
          <CardDescription>Distribution of client balance levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
              <div>
                <p className="font-medium text-red-800">Low Balance</p>
                <p className="text-2xl font-bold text-red-600">{lowBalanceCount}</p>
                <p className="text-sm text-red-600">Clients needing attention</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-800">Normal Balance</p>
                <p className="text-2xl font-bold text-gray-600">{normalBalanceCount}</p>
                <p className="text-sm text-gray-600">Healthy balances</p>
              </div>
              <TrendingDown className="h-8 w-8 text-gray-600" />
            </div>
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-green-800">High Balance</p>
                <p className="text-2xl font-bold text-green-600">{highBalanceCount}</p>
                <p className="text-sm text-green-600">Well-funded clients</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Client Balances Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Client Accounts</CardTitle>
              <CardDescription>
                {clients.length} clients found
                {searchTerm && ` for "${searchTerm}"`}
              </CardDescription>
            </div>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search clients..."
                  className="pl-9 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="border rounded-md px-3 py-2 text-sm bg-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
              <select 
                className="border rounded-md px-3 py-2 text-sm bg-background"
                value={balanceFilter}
                onChange={(e) => setBalanceFilter(e.target.value)}
              >
                <option value="all">All Balances</option>
                <option value="low">Low Balance</option>
                <option value="normal">Normal Balance</option>
                <option value="high">High Balance</option>
              </select>
              <Button type="submit" variant="outline">
                Apply Filters
              </Button>
            </form>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Wallet Balance</TableHead>
                  <TableHead>SMS Credits</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Monthly Usage</TableHead>
                  <TableHead>Balance Status</TableHead>
                  <TableHead>Last Transaction</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} className={
                    getBalanceStatus(client.walletBalance, client.smsCredits) === 'low' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-muted/50'
                  }>
                    <TableCell>
                      <div>
                        <p className="font-medium">{client.clientName}</p>
                        <p className="text-sm text-muted-foreground">{client.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(client.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">{formatCurrency(client.walletBalance)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">{formatCredits(client.smsCredits)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{formatCurrency(client.totalSpent)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(client.monthlyUsage)}</TableCell>
                    <TableCell>
                      {getBalanceStatusBadge(client.walletBalance, client.smsCredits)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(client.lastTransaction)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add Credits
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4" />
                            Transaction History
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center gap-2">
                            <Download className="h-4 w-4" />
                            Export Statement
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {clients.length === 0 && (
            <div className="text-center py-12">
              <Wallet className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No clients found</p>
              {searchTerm && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search criteria or clear filters
                </p>
              )}
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setBalanceFilter('all');
                fetchClientBalances();
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}