// app/dashboard/finance/transactions/page.tsx
"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  MessageSquare,
  Wallet,
  RefreshCw,
  TrendingUp,
  BarChart3,
  Filter,
} from "lucide-react";
import { useState, useEffect } from "react";

interface Transaction {
  id: string;
  transactionId: string;
  clientName: string;
  type: "purchase" | "usage" | "refund" | "transfer";
  amount: number;
  balance: number;
  description: string;
  accountType: "WALLET" | "SMS";
  createdAt: string;
  status: "completed" | "pending" | "failed";
  reference: string;
}

interface TransactionStats {
  totalTransactions: number;
  totalVolume: number; // Monetary volume (GHS)
  smsCreditsVolume: number; // SMS credits volume
  completedTransactions: number;
  pendingTransactions: number;
  typeCounts: {
    purchase: number;
    usage: number;
    refund: number;
    transfer: number;
  };
  accountTypeCounts: {
    WALLET: number;
    SMS: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: {
    transactions: Transaction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

interface StatsResponse {
  success: boolean;
  data: TransactionStats;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("30days");
  const [accountFilter, setAccountFilter] = useState<string>("all");
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchTransactions();
    fetchTransactionStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (typeFilter !== "all") params.append("type", typeFilter);
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (accountFilter !== "all") params.append("accountType", accountFilter);
      params.append("page", "1");
      params.append("limit", "50");

      const response = await fetch(`/api/finance/transactions?${params}`);
      const result: ApiResponse = await response.json();

      if (result.success) {
        setTransactions(result.data.transactions);
      } else {
        console.error("Failed to fetch transactions:", result);
        setTransactions([]);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionStats = async () => {
    try {
      const response = await fetch("/api/finance/transactions/stats");
      const result: StatsResponse = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        console.error("Failed to fetch transaction stats:", result);
      }
    } catch (error) {
      console.error("Error fetching transaction stats:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTransactions();
  };

  const handleRefresh = () => {
    fetchTransactions();
    fetchTransactionStats();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setAccountFilter("all");
    setDateFilter("30days");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "GHS",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat("en-US").format(Math.abs(credits));
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "purchase":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
          >
            Purchase
          </Badge>
        );
      case "usage":
        return (
          <Badge
            variant="secondary"
            className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200"
          >
            Usage
          </Badge>
        );
      case "refund":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200"
          >
            Refund
          </Badge>
        );
      case "transfer":
        return (
          <Badge
            variant="outline"
            className="bg-orange-100 text-orange-800 hover:bg-orange-100 border-orange-200"
          >
            Transfer
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
          >
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge
            variant="secondary"
            className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200"
          >
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge
            variant="destructive"
            className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200"
          >
            Failed
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAccountIcon = (accountType: string) => {
    switch (accountType) {
      case "WALLET":
        return <Wallet className="h-4 w-4 text-orange-600" />;
      case "SMS":
        return <MessageSquare className="h-4 w-4 text-blue-600" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAmountDisplay = (transaction: Transaction) => {
    const isPositive = transaction.amount > 0;
    const absoluteAmount = Math.abs(transaction.amount);

    if (transaction.accountType === "SMS") {
      return {
        text: `${isPositive ? "+" : "-"}${formatCredits(absoluteAmount)} credits`,
        className: isPositive ? "text-green-600" : "text-red-600",
        icon: isPositive ? (
          <ArrowDownRight className="h-4 w-4" />
        ) : (
          <ArrowUpRight className="h-4 w-4" />
        ),
      };
    } else {
      return {
        text: `${isPositive ? "+" : "-"}${formatCurrency(absoluteAmount)}`,
        className: isPositive ? "text-green-600" : "text-red-600",
        icon: isPositive ? (
          <ArrowDownRight className="h-4 w-4" />
        ) : (
          <ArrowUpRight className="h-4 w-4" />
        ),
      };
    }
  };

  const getBalanceDisplay = (transaction: Transaction) => {
    if (transaction.accountType === "SMS") {
      return `${formatCredits(transaction.balance)} credits`;
    } else {
      return formatCurrency(transaction.balance);
    }
  };

  // Update the statistics calculation in the component
  // Calculate statistics
  const totalTransactions = stats?.totalTransactions || transactions.length;
  const totalVolume =
    stats?.totalVolume ||
    transactions
      .filter((tx) => tx.accountType === "WALLET")
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const smsCreditsVolume =
    stats?.smsCreditsVolume ||
    transactions
      .filter((tx) => tx.accountType === "SMS")
      .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  const completedTransactions =
    stats?.completedTransactions ||
    transactions.filter((tx) => tx.status === "completed").length;
  const pendingTransactions =
    stats?.pendingTransactions ||
    transactions.filter((tx) => tx.status === "pending").length;

  // Type counts
  const purchaseCount =
    stats?.typeCounts?.purchase ||
    transactions.filter((tx) => tx.type === "purchase").length;
  const usageCount =
    stats?.typeCounts?.usage ||
    transactions.filter((tx) => tx.type === "usage").length;
  const refundCount =
    stats?.typeCounts?.refund ||
    transactions.filter((tx) => tx.type === "refund").length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const transferCount =
    stats?.typeCounts?.transfer ||
    transactions.filter((tx) => tx.type === "transfer").length;

  // Account type distribution
  const walletTransactions = transactions.filter(
    (tx) => tx.accountType === "WALLET"
  ).length;
  const smsTransactions = transactions.filter(
    (tx) => tx.accountType === "SMS"
  ).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Transactions
          </h1>
          <p className="text-muted-foreground mt-2">
            Monitor and manage all financial transactions and SMS credit usage
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Transactions
                </p>
                <p className="text-2xl font-bold mt-2">{totalTransactions}</p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <CreditCard className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Volume
                </p>
                <p className="text-2xl font-bold mt-2">
                  {formatCurrency(totalVolume)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCredits(smsCreditsVolume)} SMS credits
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Completed
                </p>
                <p className="text-2xl font-bold mt-2">
                  {completedTransactions}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalTransactions > 0
                    ? Math.round(
                        (completedTransactions / totalTransactions) * 100
                      )
                    : 0}
                  % success rate
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <ArrowUpRight className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Pending
                </p>
                <p className="text-2xl font-bold mt-2">{pendingTransactions}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Awaiting processing
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <RefreshCw className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction Types */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="h-5 w-5" />
              Transaction Types
            </CardTitle>
            <CardDescription>Breakdown by transaction category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ArrowDownRight className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-800">Purchases</p>
                  <p className="text-2xl font-bold text-green-600">
                    {purchaseCount}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ArrowUpRight className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-800">Usage</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {usageCount}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg border border-purple-100">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <RefreshCw className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-purple-800">Refunds</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {refundCount}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Distribution */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Account Distribution
            </CardTitle>
            <CardDescription>Transactions by account type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Wallet className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium text-orange-800">
                    Wallet Transactions
                  </p>
                  <p className="text-2xl font-bold text-orange-600">
                    {walletTransactions}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-blue-800">
                    SMS Credit Transactions
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {smsTransactions}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
            <CardDescription>Manage your transactions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? "Hide Filters" : "Show Filters"}
            </Button>
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={clearFilters}
            >
              <Download className="h-4 w-4 mr-2" />
              Clear All Filters
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                {transactions.length} transactions found
                {searchTerm && ` for "${searchTerm}"`}
              </CardDescription>
            </div>
            <form
              onSubmit={handleSearch}
              className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
            >
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search transactions, clients, references..."
                  className="pl-9 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button type="submit" className="sm:hidden">
                Search
              </Button>
            </form>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Transaction Type
                  </label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="purchase">Purchases</option>
                    <option value="usage">Usage</option>
                    <option value="refund">Refunds</option>
                    <option value="transfer">Transfers</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Status
                  </label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="completed">Completed</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Account Type
                  </label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={accountFilter}
                    onChange={(e) => setAccountFilter(e.target.value)}
                  >
                    <option value="all">All Accounts</option>
                    <option value="WALLET">Wallet</option>
                    <option value="SMS">SMS Credits</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Time Period
                  </label>
                  <select
                    className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  >
                    <option value="7days">Last 7 days</option>
                    <option value="30days">Last 30 days</option>
                    <option value="90days">Last 90 days</option>
                    <option value="year">This year</option>
                    <option value="all">All time</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="button" onClick={handleSearch}>
                  Apply Filters
                </Button>
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[140px]">Transaction ID</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="w-[160px]">Date</TableHead>
                  <TableHead className="w-[100px]">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => {
                  const amountDisplay = getAmountDisplay(transaction);
                  const balanceDisplay = getBalanceDisplay(transaction);

                  return (
                    <TableRow
                      key={transaction.id}
                      className="hover:bg-muted/50"
                    >
                      <TableCell className="font-mono font-medium text-sm">
                        {transaction.transactionId}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {transaction.clientName}
                          </p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {transaction.reference}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getAccountIcon(transaction.accountType)}
                          <span className="capitalize text-sm font-medium">
                            {transaction.accountType.toLowerCase()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {amountDisplay.icon}
                          <span
                            className={`font-medium ${amountDisplay.className}`}
                          >
                            {amountDisplay.text}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {balanceDisplay}
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div
                          className="truncate"
                          title={transaction.description}
                        >
                          {transaction.description}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDateTime(transaction.createdAt)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(transaction.status)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {transactions.length === 0 && (
            <div className="text-center py-12">
              <CreditCard className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">
                No transactions found
              </p>
              {searchTerm && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search criteria or clear filters
                </p>
              )}
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
