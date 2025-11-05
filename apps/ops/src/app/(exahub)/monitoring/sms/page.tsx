// app/dashboard/operations/sms-monitoring/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Download, Mail, Eye, RefreshCw, MessageSquare, CreditCard, Activity } from "lucide-react";

interface SmsMessage {
  id: string;
  recipient: string;
  message: string;
  type: string;
  status: string;
  cost: number;
  senderId: string;
  business: {
    id: string;
    name: string;
    email: string;
  };
  messageId: string;
  externalId: string;
  errorCode: string;
  errorMessage: string;
  parentSmsId: string;
  resentAt: string;
  createdAt: string;
  updatedAt: string;
}

interface SmsStats {
  total: number;
  delivered: number;
  failed: number;
  pending: number;
  totalCost: number;
  recentActivity: number;
  typeDistribution: Record<string, number>;
  statusDistribution: Record<string, number>;
}

interface SmsOverview {
  totalSent: number;
  delivered: number;
  failed: number;
  pending: number;
  deliveryRate: number;
  totalCost: number;
  sentGrowth: number;
  deliveredGrowth: number;
}

export default function SmsMonitoringPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [smsMessages, setSmsMessages] = useState<SmsMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [smsStats, setSmsStats] = useState<SmsStats | null>(null);
  const [overview, setOverview] = useState<SmsOverview | null>(null);

  useEffect(() => {
    fetchSmsData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSmsData = async () => {
    try {
      setIsLoading(true);
      await Promise.all([
        fetchSmsHistory(),
        fetchSmsStats(),
        fetchSmsOverview()
      ]);
    } catch (error) {
      console.error("Error fetching SMS data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSmsOverview = async () => {
    try {
      const response = await fetch('/api/sms/analytics/overview?range=month');
      const result = await response.json();
      if (result.success) {
        setOverview(result.data);
      }
    } catch (error) {
      console.error("Error fetching SMS overview:", error);
    }
  };

  const fetchSmsStats = async () => {
    try {
      const response = await fetch('/api/sms/history/stats');
      const result = await response.json();
      if (result.success) {
        setSmsStats(result.data);
      }
    } catch (error) {
      console.error("Error fetching SMS stats:", error);
    }
  };

  const fetchSmsHistory = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (typeFilter !== 'all') params.append('type', typeFilter);
      params.append('page', '1');
      params.append('limit', '50');

      const response = await fetch(`/api/sms/history?${params}`);
      const result = await response.json();

      if (result.success) {
        setSmsMessages(result.data);
      } else {
        console.error("Failed to fetch SMS history:", result);
        setSmsMessages([]);
      }
    } catch (error) {
      console.error("Error fetching SMS history:", error);
      setSmsMessages([]);
    }
  };

  const handleRefresh = () => {
    fetchSmsData();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchSmsHistory();
  };

  const handleResend = async (message: SmsMessage) => {
    try {
      console.log("Resending message:", message.id);
      // Implement resend logic here
      // This would call a separate API endpoint to resend the message
    } catch (error) {
      console.error("Error resending message:", error);
    }
  };

  const handleViewDetails = (message: SmsMessage) => {
    console.log("View message details:", message.id);
    // Implement view details logic
  };

  // Utility functions
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
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
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Delivered</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Processing</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
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

  // Stats calculations
  const totalMessages = smsStats?.total || smsMessages.length;
  const deliveredMessages = smsStats?.delivered || smsMessages.filter(m => m.status === 'delivered' || m.status === 'resent_delivered').length;
  const failedMessages = smsStats?.failed || smsMessages.filter(m => m.status === 'failed').length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const pendingMessages = smsStats?.pending || smsMessages.filter(m => m.status === 'pending').length;
  const totalCost = smsStats?.totalCost || smsMessages.reduce((acc, msg) => acc + msg.cost, 0);
  const deliveryRate = overview?.deliveryRate || (totalMessages > 0 ? Math.round((deliveredMessages / totalMessages) * 100) : 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor all individual SMS messages across the platform
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              All individual SMS messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivery Rate</CardTitle>
            <Mail className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveryRate}%</div>
            <p className="text-xs text-muted-foreground">
              {overview?.deliveredGrowth || 0 >= 0 ? '+' : ''}{overview?.deliveredGrowth || 0}% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Messages</CardTitle>
            <Activity className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedMessages}</div>
            <p className="text-xs text-muted-foreground">
              {totalMessages > 0 ? ((failedMessages / totalMessages) * 100).toFixed(1) : 0}% failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalCost)} Credits</div>
            <p className="text-xs text-muted-foreground">
              Cost of all SMS messages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SMS Messages Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>SMS Messages</CardTitle>
              <CardDescription>
                Monitor and manage all individual SMS messages sent through the platform
                {searchTerm && ` - Searching for "${searchTerm}"`}
                {statusFilter !== 'all' && ` - Filtered by ${statusFilter}`}
                {typeFilter !== 'all' && ` - Filtered by ${typeFilter}`}
              </CardDescription>
            </div>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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
              <select 
                className="border rounded-md px-3 py-2 text-sm bg-background"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                disabled={isLoading}
              >
                <option value="all">All Status</option>
                <option value="delivered">Delivered</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="resent_delivered">Resent Delivered</option>
              </select>
              <select 
                className="border rounded-md px-3 py-2 text-sm bg-background"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                disabled={isLoading}
              >
                <option value="all">All Types</option>
                <option value="SMS API">SMS API</option>
                <option value="Outgoing">Outgoing</option>
                <option value="SMS API RESEND">Resend</option>
              </select>
              <Button type="submit" variant="outline" disabled={isLoading}>
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
                  <TableHead>Business</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sender ID</TableHead>
                  <TableHead>Cost</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead >Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {smsMessages.map((message) => (
                  <TableRow key={message.id} className={
                    message.status === 'failed' ? 'bg-red-50 hover:bg-red-100' : 'hover:bg-muted/50'
                  }>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{message.business.name}</span>
                        {/* <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Building className="h-3 w-3" />
                          {message.business.id}
                        </div> */}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {message.recipient}
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={message.message}>
                        {message.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getTypeBadge(message.type)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {message.senderId}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(message.cost)}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(message.status)}
                      {/* {message.errorMessage && (
                        <div className="text-xs text-red-600 mt-1 max-w-[150px]">
                          {message.errorMessage}
                        </div>
                      )} */}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-[150px]">
                      {formatDate(message.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
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
                            <Download className="h-4 w-4 mr-2" />
                            Download Report
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          

          {smsMessages.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground text-lg">No SMS messages found</p>
              {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all') && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your search criteria or clear filters
                </p>
              )}
              <Button variant="outline" className="mt-4" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setTypeFilter('all');
                fetchSmsHistory();
              }}>
                Clear Filters
              </Button>
            </div>
          )}

          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading SMS messages...</p>
            </div>
          )}

          </div>
        </CardContent>
      </Card>
    </div>
  );
}