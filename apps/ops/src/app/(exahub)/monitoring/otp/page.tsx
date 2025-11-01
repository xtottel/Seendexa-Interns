// app/dashboard/operations/otp-history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Filter, Download, Shield, Eye, RefreshCw, Building, MessageSquare, CreditCard, Activity, Clock, CheckCircle, XCircle } from "lucide-react";

// Mock data based on your OtpMessage schema
const mockOtpMessages = [
  {
    id: "1",
    phone: "+233 24 123 4567",
    code: "123456",
    status: "delivered",
    codeStatus: "used",
    cost: 0.05,
    channel: "SMS",
    senderId: "1",
    sender: { name: "TechSol" },
    business: {
      id: "1",
      name: "Tech Solutions Ltd",
      email: "contact@techsolutions.com"
    },
    pinLength: 6,
    pinType: "NUMERIC",
    template: "Your verification code is {code}",
    expiryAmount: 10,
    expiryDuration: "minutes",
    validationAttempts: 1,
    maxValidationAttempts: 3,
    createdAt: new Date("2024-06-15T10:30:00"),
    expiresAt: new Date("2024-06-15T10:40:00")
  },
  {
    id: "2",
    phone: "+233 20 987 6543",
    code: "789012",
    status: "failed",
    codeStatus: "expired",
    cost: 0.05,
    channel: "SMS",
    senderId: "2",
    sender: { name: "RetailPlus" },
    business: {
      id: "2",
      name: "Retail Plus GH",
      email: "info@retailplus.com"
    },
    pinLength: 6,
    pinType: "NUMERIC",
    template: "Your OTP is {code}",
    expiryAmount: 10,
    expiryDuration: "minutes",
    validationAttempts: 0,
    maxValidationAttempts: 3,
    createdAt: new Date("2024-06-15T09:15:00"),
    expiresAt: new Date("2024-06-15T09:25:00")
  },
  {
    id: "3",
    phone: "+233 54 555 1234",
    code: "ABCDEF",
    status: "delivered",
    codeStatus: "active",
    cost: 0.05,
    channel: "WhatsApp",
    senderId: "3",
    sender: { name: "LogisticsExp" },
    business: {
      id: "3",
      name: "Logistics Express",
      email: "support@logisticsexpress.com"
    },
    pinLength: 6,
    pinType: "ALPHANUMERIC",
    template: "Your access code: {code}",
    expiryAmount: 15,
    expiryDuration: "minutes",
    validationAttempts: 0,
    maxValidationAttempts: 3,
    createdAt: new Date("2024-06-15T08:45:00"),
    expiresAt: new Date("2024-06-15T09:00:00")
  },
  {
    id: "4",
    phone: "+233 27 888 9999",
    code: "987654",
    status: "pending",
    codeStatus: "active",
    cost: 0.05,
    channel: "SMS",
    senderId: "4",
    sender: { name: "MediCare" },
    business: {
      id: "5",
      name: "MediCare Health Services",
      email: "admin@medicare.com"
    },
    pinLength: 6,
    pinType: "NUMERIC",
    template: "Verification code: {code}",
    expiryAmount: 10,
    expiryDuration: "minutes",
    validationAttempts: 0,
    maxValidationAttempts: 3,
    createdAt: new Date("2024-06-15T07:20:00"),
    expiresAt: new Date("2024-06-15T07:30:00")
  },
  {
    id: "5",
    phone: "+233 54 333 4444",
    code: "112233",
    status: "delivered",
    codeStatus: "blocked",
    cost: 0.05,
    channel: "SMS",
    senderId: "5",
    sender: { name: "QuickPay" },
    business: {
      id: "4",
      name: "QuickPay Financial",
      email: "support@quickpay.com"
    },
    pinLength: 6,
    pinType: "NUMERIC",
    template: "Your security code is {code}",
    expiryAmount: 5,
    expiryDuration: "minutes",
    validationAttempts: 3,
    maxValidationAttempts: 3,
    createdAt: new Date("2024-06-14T16:45:00"),
    expiresAt: new Date("2024-06-14T16:50:00")
  }
];

export default function OtpHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [codeStatusFilter, setCodeStatusFilter] = useState("all");
  const [channelFilter, setChannelFilter] = useState("all");
  const [otpMessages, setOtpMessages] = useState(mockOtpMessages);
  const [isLoading, setIsLoading] = useState(false);

  const filteredMessages = otpMessages.filter(message => {
    const matchesSearch = message.phone.includes(searchTerm) ||
      message.code.includes(searchTerm) ||
      message.business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.sender?.name && message.sender.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    const matchesCodeStatus = codeStatusFilter === "all" || message.codeStatus === codeStatusFilter;
    const matchesChannel = channelFilter === "all" || message.channel === channelFilter;

    return matchesSearch && matchesStatus && matchesCodeStatus && matchesChannel;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge variant="default" className="flex items-center gap-1">Delivered</Badge>;
      case "pending":
        return <Badge variant="secondary" className="flex items-center gap-1">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive" className="flex items-center gap-1">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCodeStatusBadge = (codeStatus: string) => {
    switch (codeStatus) {
      case "active":
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Active</Badge>;
      case "used":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Used</Badge>;
      case "expired":
        return <Badge variant="outline" className="border-amber-500 text-amber-700">Expired</Badge>;
      case "blocked":
        return <Badge variant="destructive">Blocked</Badge>;
      default:
        return <Badge variant="outline">{codeStatus}</Badge>;
    }
  };

  const getChannelBadge = (channel: string) => {
    switch (channel) {
      case "SMS":
        return <Badge variant="default">SMS</Badge>;
      case "WhatsApp":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">WhatsApp</Badge>;
      default:
        return <Badge variant="outline">{channel}</Badge>;
    }
  };

  const getPinTypeBadge = (pinType: string) => {
    switch (pinType) {
      case "NUMERIC":
        return <Badge variant="outline">Numeric</Badge>;
      case "ALPHANUMERIC":
        return <Badge variant="outline">Alphanumeric</Badge>;
      case "ALPHABETIC":
        return <Badge variant="outline">Alphabetic</Badge>;
      default:
        return <Badge variant="outline">{pinType}</Badge>;
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleViewDetails = (message: any) => {
    console.log("View OTP details:", message.id);
    // Implement view details logic
  };

  const handleResendOtp = (message: any) => {
    console.log("Resend OTP:", message.id);
    // Implement resend logic
  };

  // Calculate stats
  const stats = {
    total: otpMessages.length,
    delivered: otpMessages.filter(m => m.status === 'delivered').length,
    failed: otpMessages.filter(m => m.status === 'failed').length,
    active: otpMessages.filter(m => m.codeStatus === 'active').length,
    used: otpMessages.filter(m => m.codeStatus === 'used').length,
    expired: otpMessages.filter(m => m.codeStatus === 'expired').length,
    blocked: otpMessages.filter(m => m.codeStatus === 'blocked').length,
    totalCost: otpMessages.reduce((acc, msg) => acc + msg.cost, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">OTP History</h1>
          <p className="text-muted-foreground">
            Monitor all OTP messages and verification attempts across all businesses
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total OTPs</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time OTP messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <p className="text-xs text-muted-foreground">
              Successfully delivered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              Delivery failed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              Across all OTPs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Code Status Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Used</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.used}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired</CardTitle>
            <XCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.expired}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked</CardTitle>
            <Shield className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.blocked}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>OTP Messages</CardTitle>
              <CardDescription>
                Monitor and manage all OTP verification messages
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search OTPs..."
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
                  <DropdownMenuItem onClick={() => setStatusFilter("delivered")}>Delivered</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("failed")}>Failed</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
                    <Filter className="h-4 w-4 mr-2" />
                    Code Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setCodeStatusFilter("all")}>All Code Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCodeStatusFilter("active")}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCodeStatusFilter("used")}>Used</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCodeStatusFilter("expired")}>Expired</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setCodeStatusFilter("blocked")}>Blocked</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
                    <Filter className="h-4 w-4 mr-2" />
                    Channel
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setChannelFilter("all")}>All Channels</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setChannelFilter("SMS")}>SMS</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setChannelFilter("WhatsApp")}>WhatsApp</DropdownMenuItem>
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
                <TableHead>Phone</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Sender ID</TableHead>
                <TableHead>Pin Type</TableHead>
                <TableHead>Attempts</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Code Status</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message.id} className={message.status === 'failed' ? "bg-muted/50" : ""}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{message.business.name}</span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Building className="h-3 w-3" />
                        {message.business.email}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {message.phone}
                  </TableCell>
                  <TableCell className="font-mono">
                    {message.code}
                  </TableCell>
                  <TableCell>
                    {getChannelBadge(message.channel)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {message.sender?.name || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getPinTypeBadge(message.pinType)}
                  </TableCell>
                  <TableCell>
                    <div className="text-center">
                      <span className={`font-medium ${
                        message.validationAttempts >= message.maxValidationAttempts ? 'text-red-600' : ''
                      }`}>
                        {message.validationAttempts}/{message.maxValidationAttempts}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(message.status)}
                  </TableCell>
                  <TableCell>
                    {getCodeStatusBadge(message.codeStatus)}
                  </TableCell>
                  <TableCell>
                    {formatCurrency(message.cost)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {formatDate(message.expiresAt)}
                      {message.codeStatus === 'active' && new Date() > message.expiresAt && (
                        <div className="text-xs text-red-600">Expired</div>
                      )}
                    </div>
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
                            onClick={() => handleViewDetails(message)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          {message.status === 'failed' && (
                            <DropdownMenuItem 
                              className="cursor-pointer text-green-600"
                              onClick={() => handleResendOtp(message)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Resend OTP
                            </DropdownMenuItem>
                          )}
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

          {filteredMessages.length === 0 && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No OTP messages found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}