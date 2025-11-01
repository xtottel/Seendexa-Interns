// app/dashboard/operations/services-report/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Filter, Download, RefreshCw, BarChart3, TrendingUp, TrendingDown, Users, MessageSquare, Shield, CreditCard, Calendar, Building, PieChart } from "lucide-react";

// Mock data for services report
const mockServicesReport = {
  overview: {
    totalBusinesses: 45,
    activeBusinesses: 38,
    totalRevenue: 12500.75,
    revenueGrowth: 12.5,
    totalMessages: 125000,
    messageGrowth: 8.2,
    activeUsers: 156,
    userGrowth: 5.8
  },
  businessPerformance: [
    {
      id: "1",
      name: "Tech Solutions Ltd",
      status: "active",
      messages: {
        sms: 12500,
        otp: 3200,
        total: 15700,
        growth: 15.2
      },
      revenue: 2500.50,
      revenueGrowth: 18.5,
      users: 12,
      senderIds: 3,
      lastActive: new Date("2024-06-15T10:30:00")
    },
    {
      id: "2",
      name: "Retail Plus GH",
      status: "active",
      messages: {
        sms: 8500,
        otp: 1500,
        total: 10000,
        growth: 8.7
      },
      revenue: 1800.25,
      revenueGrowth: 12.3,
      users: 8,
      senderIds: 2,
      lastActive: new Date("2024-06-15T09:15:00")
    },
    {
      id: "3",
      name: "Logistics Express",
      status: "inactive",
      messages: {
        sms: 0,
        otp: 0,
        total: 0,
        growth: -100
      },
      revenue: 0,
      revenueGrowth: -100,
      users: 1,
      senderIds: 0,
      lastActive: new Date("2024-05-01T14:20:00")
    },
    {
      id: "4",
      name: "QuickPay Financial",
      status: "active",
      messages: {
        sms: 3200,
        otp: 4500,
        total: 7700,
        growth: 25.8
      },
      revenue: 1500.80,
      revenueGrowth: 32.1,
      users: 6,
      senderIds: 2,
      lastActive: new Date("2024-06-15T08:45:00")
    },
    {
      id: "5",
      name: "MediCare Health Services",
      status: "active",
      messages: {
        sms: 2800,
        otp: 1200,
        total: 4000,
        growth: 5.4
      },
      revenue: 950.45,
      revenueGrowth: 7.8,
      users: 4,
      senderIds: 1,
      lastActive: new Date("2024-06-15T07:20:00")
    }
  ],
  serviceUsage: {
    sms: {
      total: 27000,
      delivered: 25800,
      failed: 1200,
      successRate: 95.6,
      cost: 1350.00,
      revenue: 2700.00
    },
    otp: {
      total: 10400,
      delivered: 9920,
      failed: 480,
      successRate: 95.4,
      cost: 520.00,
      revenue: 1040.00
    },
    whatsapp: {
      total: 1200,
      delivered: 1150,
      failed: 50,
      successRate: 95.8,
      cost: 180.00,
      revenue: 360.00
    }
  },
  revenueBreakdown: {
    sms: 2700.00,
    otp: 1040.00,
    whatsapp: 360.00,
    subscriptions: 8400.75,
    total: 12500.75
  }
};

export default function ServicesReportPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateRange, setDateRange] = useState("month");
  const [reportData, setReportData] = useState(mockServicesReport);
  const [isLoading, setIsLoading] = useState(false);

  const filteredBusinesses = reportData.businessPerformance.filter(business => {
    const matchesSearch = business.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || business.status === statusFilter;

    return matchesSearch && matchesStatus;
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

  const getStatusBadge = (status: string) => {
    return status === "active" ? 
      <Badge variant="default">Active</Badge> : 
      <Badge variant="destructive">Inactive</Badge>;
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

  const handleGenerateReport = (type: string) => {
    console.log("Generate report:", type);
    // Implement report generation logic
  };

  const handleViewBusinessDetails = (business: any) => {
    console.log("View business details:", business.id);
    // Implement view details logic
  };

  const handleExportData = (format: string) => {
    console.log("Export data as:", format);
    // Implement export logic
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services Report</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of platform performance and business metrics
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
              <DropdownMenuItem onClick={() => handleExportData("pdf")}>
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData("excel")}>
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportData("csv")}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Date Range Filter */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Report Period</CardTitle>
              <CardDescription>
                Select the time period for the report
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Calendar className="w-4 h-4 mr-2" />
                    {dateRange === "day" ? "Today" : 
                     dateRange === "week" ? "This Week" : 
                     dateRange === "month" ? "This Month" : 
                     "This Quarter"}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setDateRange("day")}>Today</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateRange("week")}>This Week</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateRange("month")}>This Month</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setDateRange("quarter")}>This Quarter</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
            <div className="flex items-center gap-2 mt-1">
              {getGrowthBadge(reportData.overview.messageGrowth)}
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Businesses</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.overview.activeBusinesses}</div>
            <p className="text-xs text-muted-foreground">
              of {reportData.overview.totalBusinesses} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.overview.activeUsers}</div>
            <div className="flex items-center gap-2 mt-1">
              {getGrowthBadge(reportData.overview.userGrowth)}
              <span className="text-xs text-muted-foreground">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Usage Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Total Messages</span>
              <span className="font-medium">{formatNumber(reportData.serviceUsage.sms.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Success Rate</span>
              {getSuccessRateBadge(reportData.serviceUsage.sms.successRate)}
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Revenue</span>
              <span className="font-medium">{formatCurrency(reportData.serviceUsage.sms.revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Cost</span>
              <span className="font-medium text-muted-foreground">{formatCurrency(reportData.serviceUsage.sms.cost)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              OTP Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Total OTPs</span>
              <span className="font-medium">{formatNumber(reportData.serviceUsage.otp.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Success Rate</span>
              {getSuccessRateBadge(reportData.serviceUsage.otp.successRate)}
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Revenue</span>
              <span className="font-medium">{formatCurrency(reportData.serviceUsage.otp.revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Cost</span>
              <span className="font-medium text-muted-foreground">{formatCurrency(reportData.serviceUsage.otp.cost)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              WhatsApp Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm">Total Messages</span>
              <span className="font-medium">{formatNumber(reportData.serviceUsage.whatsapp.total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Success Rate</span>
              {getSuccessRateBadge(reportData.serviceUsage.whatsapp.successRate)}
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Revenue</span>
              <span className="font-medium">{formatCurrency(reportData.serviceUsage.whatsapp.revenue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Cost</span>
              <span className="font-medium text-muted-foreground">{formatCurrency(reportData.serviceUsage.whatsapp.cost)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Revenue Breakdown
          </CardTitle>
          <CardDescription>
            Distribution of revenue across different services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">SMS Services</span>
                <span className="font-medium">{formatCurrency(reportData.revenueBreakdown.sms)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(reportData.revenueBreakdown.sms / reportData.revenueBreakdown.total) * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">OTP Services</span>
                <span className="font-medium">{formatCurrency(reportData.revenueBreakdown.otp)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ width: `${(reportData.revenueBreakdown.otp / reportData.revenueBreakdown.total) * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">WhatsApp</span>
                <span className="font-medium">{formatCurrency(reportData.revenueBreakdown.whatsapp)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full" 
                  style={{ width: `${(reportData.revenueBreakdown.whatsapp / reportData.revenueBreakdown.total) * 100}%` }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Subscriptions</span>
                <span className="font-medium">{formatCurrency(reportData.revenueBreakdown.subscriptions)}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-amber-600 h-2 rounded-full" 
                  style={{ width: `${(reportData.revenueBreakdown.subscriptions / reportData.revenueBreakdown.total) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between font-bold">
              <span>Total Revenue</span>
              <span>{formatCurrency(reportData.revenueBreakdown.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Performance */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Business Performance</CardTitle>
              <CardDescription>
                Performance metrics for all registered businesses
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search businesses..."
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
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Total Messages</TableHead>
                <TableHead>Message Growth</TableHead>
                <TableHead>Revenue</TableHead>
                <TableHead>Revenue Growth</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBusinesses.map((business) => (
                <TableRow key={business.id} className={business.status === 'inactive' ? "bg-muted/50" : ""}>
                  <TableCell className="font-medium">
                    {business.name}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(business.status)}
                  </TableCell>
                  <TableCell>
                    {formatNumber(business.messages.total)}
                  </TableCell>
                  <TableCell>
                    {getGrowthBadge(business.messages.growth)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{formatCurrency(business.revenue)}</span>
                  </TableCell>
                  <TableCell>
                    {getGrowthBadge(business.revenueGrowth)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{business.users}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatDate(business.lastActive)}
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
                            onClick={() => handleViewBusinessDetails(business)}
                          >
                            <BarChart3 className="h-4 w-4 mr-2" />
                            View Analytics
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="cursor-pointer">
                            Download Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredBusinesses.length === 0 && (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No businesses found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}