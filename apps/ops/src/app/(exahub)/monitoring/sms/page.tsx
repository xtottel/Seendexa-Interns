// app/dashboard/operations/sms-history/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Filter, Download, Mail, Eye, RefreshCw, Building, MessageSquare, CreditCard, Activity } from "lucide-react";

// Mock data based on your SmsMessage schema
const mockSmsMessages = [
  {
    id: "1",
    recipient: "+233 24 123 4567",
    message: "Your OTP code is 123456",
    type: "SMS API",
    status: "delivered",
    cost: 0.05,
    senderId: "1",
    sender: { name: "TechSol" },
    business: {
      id: "1",
      name: "Tech Solutions Ltd",
      email: "contact@techsolutions.com"
    },
    messageId: "msg_001",
    externalId: "nalo_001",
    errorCode: null,
    errorMessage: null,
    createdAt: new Date("2024-06-15T10:30:00"),
    updatedAt: new Date("2024-06-15T10:30:00")
  },
  {
    id: "2",
    recipient: "+233 20 987 6543",
    message: "Welcome to our service! Get started now.",
    type: "Outgoing",
    status: "failed",
    cost: 0.05,
    senderId: "2",
    sender: { name: "RetailPlus" },
    business: {
      id: "2",
      name: "Retail Plus GH",
      email: "info@retailplus.com"
    },
    messageId: "msg_002",
    externalId: null,
    errorCode: "INVALID_NUMBER",
    errorMessage: "Invalid phone number format",
    createdAt: new Date("2024-06-15T09:15:00"),
    updatedAt: new Date("2024-06-15T09:15:00")
  },
  {
    id: "3",
    recipient: "+233 54 555 1234",
    message: "Your delivery is arriving today between 2-4 PM",
    type: "SMS API RESEND",
    status: "resent_delivered",
    cost: 0.05,
    senderId: "3",
    sender: { name: "LogisticsExp" },
    business: {
      id: "3",
      name: "Logistics Express",
      email: "support@logisticsexpress.com"
    },
    messageId: "msg_003",
    externalId: "nalo_003",
    errorCode: null,
    errorMessage: null,
    parentSmsId: "3_original",
    resentAt: new Date("2024-06-15T08:45:00"),
    createdAt: new Date("2024-06-15T08:30:00"),
    updatedAt: new Date("2024-06-15T08:45:00")
  },
  {
    id: "4",
    recipient: "+233 27 888 9999",
    message: "Special offer: 20% off all items this weekend!",
    type: "SMS API",
    status: "pending",
    cost: 0.05,
    senderId: "4",
    sender: { name: "MediCare" },
    business: {
      id: "5",
      name: "MediCare Health Services",
      email: "admin@medicare.com"
    },
    messageId: "msg_004",
    externalId: null,
    errorCode: null,
    errorMessage: null,
    createdAt: new Date("2024-06-15T07:20:00"),
    updatedAt: new Date("2024-06-15T07:20:00")
  },
  {
    id: "5",
    recipient: "+233 54 333 4444",
    message: "Payment confirmed. Transaction ID: TXN789012",
    type: "Outgoing",
    status: "delivered",
    cost: 0.05,
    senderId: "5",
    sender: { name: "QuickPay" },
    business: {
      id: "4",
      name: "QuickPay Financial",
      email: "support@quickpay.com"
    },
    messageId: "msg_005",
    externalId: "nalo_005",
    errorCode: null,
    errorMessage: null,
    createdAt: new Date("2024-06-14T16:45:00"),
    updatedAt: new Date("2024-06-14T16:45:00")
  }
];

export default function SmsHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [smsMessages, setSmsMessages] = useState(mockSmsMessages);
  const [isLoading, setIsLoading] = useState(false);

  const filteredMessages = smsMessages.filter(message => {
    const matchesSearch = message.recipient.includes(searchTerm) ||
      message.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (message.sender?.name && message.sender.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "all" || message.status === statusFilter;
    const matchesType = typeFilter === "all" || message.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
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
      case "resent_delivered":
        return <Badge variant="default" className="flex items-center gap-1">Delivered</Badge>;
      case "pending":
        return <Badge variant="secondary" className="flex items-center gap-1">Pending</Badge>;
      case "failed":
        return <Badge variant="destructive" className="flex items-center gap-1">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "SMS API":
        return <Badge variant="default">SMS API</Badge>;
      case "SMS API RESEND":
        return <Badge variant="secondary">Resend</Badge>;
      case "Outgoing":
        return <Badge variant="outline">Outgoing</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const handleResend = (message: any) => {
    console.log("Resend message:", message.id);
    // Implement resend logic
  };

  const handleViewDetails = (message: any) => {
    console.log("View message details:", message.id);
    // Implement view details logic
  };

  // Calculate stats
  const stats = {
    total: smsMessages.length,
    delivered: smsMessages.filter(m => m.status === 'delivered' || m.status === 'resent_delivered').length,
    failed: smsMessages.filter(m => m.status === 'failed').length,
    pending: smsMessages.filter(m => m.status === 'pending').length,
    totalCost: smsMessages.reduce((acc, msg) => acc + msg.cost, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS History</h1>
          <p className="text-muted-foreground">
            Monitor all SMS messages across all businesses
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
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All time messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
            <Mail className="h-4 w-4 text-green-600" />
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
            <Activity className="h-4 w-4 text-red-600" />
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
              Across all messages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>SMS Messages</CardTitle>
              <CardDescription>
                Monitor and manage all SMS messages sent through the platform
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
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
                  <DropdownMenuItem onClick={() => setStatusFilter("resent_delivered")}>Resent Delivered</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
                    <Filter className="h-4 w-4 mr-2" />
                    Type
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setTypeFilter("all")}>All Types</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("SMS API")}>SMS API</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("Outgoing")}>Outgoing</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTypeFilter("SMS API RESEND")}>Resend</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business ID</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sender ID</TableHead>
                <TableHead>Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMessages.map((message) => (
                <TableRow key={message.id} className={message.status === 'failed' ? "bg-muted/50" : ""}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{message.business.id}</span>
                      {/* <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        {message.business.email}
                      </div> */}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {message.recipient}
                  </TableCell>
                  <TableCell>
                    <div className="max-w-[100px] truncate" title={message.message}>
                      {message.message}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(message.type)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {message.sender?.name || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {formatCurrency(message.cost)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(message.status)}
                    {message.errorMessage && (
                      <div className="text-xs text-red-600 mt-1">
                        {message.errorMessage}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatDate(message.createdAt)}
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
                              onClick={() => handleResend(message)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Resend Message
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
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No SMS messages found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}