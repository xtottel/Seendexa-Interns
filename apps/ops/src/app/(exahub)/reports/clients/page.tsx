// app/dashboard/operations/clients-report/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Filter, Download, RefreshCw, Building, Users, MessageSquare, CreditCard, TrendingUp, TrendingDown, Eye, Calendar, Mail, Phone, CheckCircle, XCircle } from "lucide-react";

// Mock data for clients report
const mockClientsReport = {
  overview: {
    totalClients: 45,
    activeClients: 38,
    newClients: 5,
    churnedClients: 2,
    totalRevenue: 12500.75,
    revenueGrowth: 12.5,
    totalMessages: 125000,
    avgMessagesPerClient: 2778
  },
  clientPerformance: [
    {
      id: "1",
      name: "Tech Solutions Ltd",
      email: "contact@techsolutions.com",
      phone: "+233 24 123 4567",
      status: "verified",
      isActive: true,
      businessType: "Technology",
      subscription: "Enterprise",
      joinedDate: new Date("2024-01-15"),
      lastActive: new Date("2024-06-15T10:30:00"),
      metrics: {
        totalMessages: 15700,
        smsMessages: 12500,
        otpMessages: 3200,
        successRate: 96.2,
        totalCost: 785.00,
        totalRevenue: 2500.50,
        balance: 1500.75,
        users: 12,
        senderIds: 3,
        apiKeys: 2
      },
      growth: {
        messageGrowth: 15.2,
        revenueGrowth: 18.5,
        userGrowth: 20.0
      }
    },
    {
      id: "2",
      name: "Retail Plus GH",
      email: "info@retailplus.com",
      phone: "+233 20 987 6543",
      status: "verified",
      isActive: true,
      businessType: "Retail",
      subscription: "Professional",
      joinedDate: new Date("2024-02-20"),
      lastActive: new Date("2024-06-15T09:15:00"),
      metrics: {
        totalMessages: 10000,
        smsMessages: 8500,
        otpMessages: 1500,
        successRate: 94.8,
        totalCost: 500.00,
        totalRevenue: 1800.25,
        balance: 750.25,
        users: 8,
        senderIds: 2,
        apiKeys: 1
      },
      growth: {
        messageGrowth: 8.7,
        revenueGrowth: 12.3,
        userGrowth: 14.3
      }
    },
    {
      id: "3",
      name: "Logistics Express",
      email: "support@logisticsexpress.com",
      phone: "+233 54 555 1234",
      status: "suspended",
      isActive: false,
      businessType: "Logistics",
      subscription: "Starter",
      joinedDate: new Date("2024-03-10"),
      lastActive: new Date("2024-05-01T14:20:00"),
      metrics: {
        totalMessages: 0,
        smsMessages: 0,
        otpMessages: 0,
        successRate: 0,
        totalCost: 0,
        totalRevenue: 0,
        balance: 0,
        users: 1,
        senderIds: 0,
        apiKeys: 0
      },
      growth: {
        messageGrowth: -100,
        revenueGrowth: -100,
        userGrowth: 0
      }
    },
    {
      id: "4",
      name: "QuickPay Financial",
      email: "support@quickpay.com",
      phone: "+233 54 333 4444",
      status: "verified",
      isActive: true,
      businessType: "Finance",
      subscription: "Professional",
      joinedDate: new Date("2024-04-05"),
      lastActive: new Date("2024-06-15T08:45:00"),
      metrics: {
        totalMessages: 7700,
        smsMessages: 3200,
        otpMessages: 4500,
        successRate: 97.1,
        totalCost: 385.00,
        totalRevenue: 1500.80,
        balance: 1200.00,
        users: 6,
        senderIds: 2,
        apiKeys: 1
      },
      growth: {
        messageGrowth: 25.8,
        revenueGrowth: 32.1,
        userGrowth: 50.0
      }
    },
    {
      id: "5",
      name: "MediCare Health Services",
      email: "admin@medicare.com",
      phone: "+233 27 888 9999",
      status: "pending",
      isActive: true,
      businessType: "Healthcare",
      subscription: "Starter",
      joinedDate: new Date("2024-05-12"),
      lastActive: new Date("2024-06-15T07:20:00"),
      metrics: {
        totalMessages: 4000,
        smsMessages: 2800,
        otpMessages: 1200,
        successRate: 95.4,
        totalCost: 200.00,
        totalRevenue: 950.45,
        balance: 500.00,
        users: 4,
        senderIds: 1,
        apiKeys: 1
      },
      growth: {
        messageGrowth: 5.4,
        revenueGrowth: 7.8,
        userGrowth: 33.3
      }
    }
  ],
  subscriptionDistribution: {
    enterprise: 8,
    professional: 15,
    starter: 20,
    trial: 2
  },
  businessTypeDistribution: {
    technology: 12,
    retail: 8,
    finance: 6,
    healthcare: 5,
    logistics: 4,
    education: 3,
    other: 7
  }
};

export default function ClientsReportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subscriptionFilter, setSubscriptionFilter] = useState("all");
  const [reportData, setReportData] = useState(mockClientsReport);
  const [isLoading, setIsLoading] = useState(false);

  const filteredClients = reportData.clientPerformance.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.businessType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && client.isActive) ||
      (statusFilter === "inactive" && !client.isActive) ||
      (statusFilter === "verified" && client.status === "verified") ||
      (statusFilter === "pending" && client.status === "pending");

    const matchesSubscription = subscriptionFilter === "all" || client.subscription === subscriptionFilter;

    return matchesSearch && matchesStatus && matchesSubscription;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const getStatusBadge = (client: any) => {
    if (!client.isActive) {
      return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Suspended</Badge>;
    }
    
    switch (client.status) {
      case "verified":
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Verified</Badge>;
      case "pending":
        return <Badge variant="secondary" className="flex items-center gap-1">Pending</Badge>;
      default:
        return <Badge variant="outline">{client.status}</Badge>;
    }
  };

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case "Enterprise":
        return <Badge variant="default" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Enterprise</Badge>;
      case "Professional":
        return <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Professional</Badge>;
      case "Starter":
        return <Badge variant="secondary">Starter</Badge>;
      case "Trial":
        return <Badge variant="outline">Trial</Badge>;
      default:
        return <Badge variant="outline">{subscription}</Badge>;
    }
  };

  const getGrowthBadge = (growth: number) => {
    const isPositive = growth > 0;
    return (
      <Badge variant={isPositive ? "default" : "destructive"} className="flex items-center gap-1">
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(growth).toFixed(1)}%
      </Badge>
    );
  };

  const getSuccessRateBadge = (rate: number) => {
    if (rate >= 95) return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">{rate.toFixed(1)}%</Badge>;
    if (rate >= 90) return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">{rate.toFixed(1)}%</Badge>;
    return <Badge variant="destructive">{rate.toFixed(1)}%</Badge>;
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call to refresh report data
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleViewClientDetails = (client: any) => {
    console.log("View client details:", client.id);
    // Implement view details logic
  };

  const handleExportClientReport = (client: any) => {
    console.log("Export client report:", client.id);
    // Implement export logic
  };

  const handleGenerateClientAnalytics = (client: any) => {
    console.log("Generate analytics for:", client.id);
    // Implement analytics generation
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients Report</h1>
          <p className="text-muted-foreground">
            Comprehensive analysis of client performance and engagement
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => console.log("Export as PDF")}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Export as Excel")}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Export as CSV")}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.overview.totalClients}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.overview.activeClients} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(reportData.overview.totalRevenue)}</div>
            <div className="flex items-center gap-2 mt-1">
              {getGrowthBadge(reportData.overview.revenueGrowth)}
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(reportData.overview.totalMessages)}</div>
            <p className="text-xs text-muted-foreground">
              {formatNumber(reportData.overview.avgMessagesPerClient)} avg per client
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Client Growth</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+{reportData.overview.newClients}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.overview.churnedClients} churned this period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
            <CardDescription>
              Distribution of clients across subscription tiers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(reportData.subscriptionDistribution).map(([plan, count]) => (
                <div key={plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {plan}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{count}</span>
                    <span className="text-sm text-muted-foreground">
                      ({((count / reportData.overview.totalClients) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Business Type Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Business Types</CardTitle>
            <CardDescription>
              Client distribution across different industries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(reportData.businessTypeDistribution).map(([type, count]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="capitalize">
                      {type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{count}</span>
                    <span className="text-sm text-muted-foreground">
                      ({((count / reportData.overview.totalClients) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Performance Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Client Performance</CardTitle>
              <CardDescription>
                Detailed performance metrics for all clients
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
                  className="pl-8 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
                    <Filter className="h-4 w-4 mr-2" />
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>Inactive</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("verified")}>Verified</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
                    <Filter className="h-4 w-4 mr-2" />
                    Subscription
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setSubscriptionFilter("all")}>All Plans</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSubscriptionFilter("Enterprise")}>Enterprise</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSubscriptionFilter("Professional")}>Professional</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSubscriptionFilter("Starter")}>Starter</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSubscriptionFilter("Trial")}>Trial</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Subscription</TableHead>
                <TableHead>Messages</TableHead>
                <TableHead>Success Rate</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className={!client.isActive ? "bg-muted/50" : ""}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {client.businessType}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(client)}
                  </TableCell>
                  <TableCell>
                    {getSubscriptionBadge(client.subscription)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{formatNumber(client.metrics.totalMessages)}</span>
                      <div className="flex items-center gap-1">
                        {getGrowthBadge(client.growth.messageGrowth)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getSuccessRateBadge(client.metrics.successRate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{formatCurrency(client.metrics.totalRevenue)}</span>
                      <div className="flex items-center gap-1">
                        {getGrowthBadge(client.growth.revenueGrowth)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium ${
                      client.metrics.balance === 0 ? "text-muted-foreground" : "text-green-600"
                    }`}>
                      {formatCurrency(client.metrics.balance)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{client.metrics.users}</span>
                      {client.growth.userGrowth > 0 && (
                        <Badge variant="default" className="h-5 px-1">
                          +{client.growth.userGrowth}%
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(client.joinedDate)}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => handleViewClientDetails(client)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => handleGenerateClientAnalytics(client)}
                          >
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Generate Analytics
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => handleExportClientReport(client)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Export Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredClients.length === 0 && (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No clients found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}