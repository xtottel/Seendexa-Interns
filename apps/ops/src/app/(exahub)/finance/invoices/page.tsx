// app/dashboard/finance/invoices/page.tsx - UPDATED
"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Search, 
  Eye, 
  FileText, 
  Plus,
  Calendar,
  DollarSign,
  MoreHorizontal,
  RefreshCw,
  Filter,
  AlertCircle,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { InvoiceDetailsDialog } from "./invoice-details-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  amount: number;
  date: string;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue' | 'cancelled';
  type: string;
  description?: string;
}

interface InvoiceStats {
  totalInvoices: number;
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  statusCounts: {
    paid: number;
    pending: number;
    overdue: number;
    cancelled: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: Invoice[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface StatsResponse {
  success: boolean;
  data: InvoiceStats;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancellingInvoice, setCancellingInvoice] = useState<string | null>(null);
  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const [invoiceToCancel, setInvoiceToCancel] = useState<Invoice | null>(null);

  // Fetch data on component mount
  useEffect(() => {
    fetchInvoices();
    fetchInvoiceStats();
  }, []);

  const fetchInvoices = async (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams();
      if (params?.search !== undefined) queryParams.append('search', params.search);
      if (params?.status && params.status !== 'all') queryParams.append('status', params.status);
      if (params?.page) queryParams.append('page', params.page.toString());
      if (params?.limit) queryParams.append('limit', params.limit.toString());

      const response = await fetch(`/api/finance/invoices?${queryParams}`);
      const result: ApiResponse = await response.json();

      if (result.success) {
        setInvoices(result.data);
      } else {
        setError("Failed to fetch invoices");
        console.error("API Error:", result);
        setInvoices([]);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError("Failed to connect to server");
      setInvoices([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchInvoiceStats = async () => {
    try {
      const response = await fetch('/api/finance/invoices/stats');
      const result: StatsResponse = await response.json();

      if (result.success) {
        setStats(result.data);
      } else {
        console.error("Failed to fetch invoice stats:", result);
      }
    } catch (error) {
      console.error("Error fetching invoice stats:", error);
    }
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    try {
      setCancellingInvoice(invoiceId);
      
      const response = await fetch(`/api/finance/invoices/${invoiceId}/cancel`, {
        method: 'PATCH'
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the invoices list
        await fetchInvoices({ search: searchTerm, status: statusFilter });
        await fetchInvoiceStats();
        setCancelConfirmOpen(false);
        setInvoiceToCancel(null);
      } else {
        throw new Error(result.message || 'Failed to cancel invoice');
      }
    } catch (error) {
      console.error("Error cancelling invoice:", error);
      setError("Failed to cancel invoice");
    } finally {
      setCancellingInvoice(null);
    }
  };

  const handleCancelFromDropdown = (invoice: Invoice) => {
    setInvoiceToCancel(invoice);
    setCancelConfirmOpen(true);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchInvoices({ search: searchTerm, status: statusFilter });
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    fetchInvoices({ search: searchTerm, status: value });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchInvoices({ search: searchTerm, status: statusFilter });
    fetchInvoiceStats();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    fetchInvoices({ search: '', status: 'all' });
  };

  const handleViewDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
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
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'overdue':
        return <Badge variant="destructive">Overdue</Badge>;
      case 'cancelled':
        return <Badge variant="outline">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusCount = (status: string) => {
    if (stats?.statusCounts) {
      return stats.statusCounts[status as keyof typeof stats.statusCounts] || 0;
    }
    return invoices.filter(invoice => invoice.status === status).length;
  };

  // Calculate amounts from current data if stats not available
  const totalInvoices = stats?.totalInvoices || invoices.length;
  const totalAmount = stats?.totalAmount || invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
  const paidAmount = stats?.paidAmount || invoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const pendingAmount = stats?.pendingAmount || invoices
    .filter(invoice => invoice.status === 'pending')
    .reduce((sum, invoice) => sum + invoice.amount, 0);

  const hasActiveFilters = searchTerm || statusFilter !== 'all';

  if (loading && invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-muted-foreground">Loading invoices...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Invoices
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage and track all client invoices
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-4 w-4" />
            <span className="font-medium">Error</span>
          </div>
          <p className="text-red-700 text-sm mt-1">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 border-red-200 text-red-700 hover:bg-red-100"
            onClick={handleRefresh}
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Invoices</p>
                <p className="text-2xl font-bold mt-2">{totalInvoices}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  All time
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-full">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Amount</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(totalAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Gross revenue
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
                <p className="text-sm font-medium text-muted-foreground">Paid Amount</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(paidAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Collected
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Amount</p>
                <p className="text-2xl font-bold mt-2">{formatCurrency(pendingAmount)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Outstanding
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Invoice Status Overview
          </CardTitle>
          <CardDescription>Distribution of invoices by status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-green-100 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-green-800">Paid</p>
                <p className="text-2xl font-bold text-green-600">{getStatusCount('paid')}</p>
                <p className="text-sm text-green-600">{formatCurrency(paidAmount)}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div>
                <p className="font-medium text-orange-800">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{getStatusCount('pending')}</p>
                <p className="text-sm text-orange-600">{formatCurrency(pendingAmount)}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-red-100 rounded-lg border border-red-200">
              <div>
                <p className="font-medium text-red-800">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{getStatusCount('overdue')}</p>
                <p className="text-sm text-red-600">
                  {stats?.overdueAmount ? formatCurrency(stats.overdueAmount) : 'N/A'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
              <div>
                <p className="font-medium text-gray-800">Cancelled</p>
                <p className="text-2xl font-bold text-gray-600">{getStatusCount('cancelled')}</p>
                <p className="text-sm text-gray-600">Voided invoices</p>
              </div>
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>All Invoices</CardTitle>
              <CardDescription>
                {invoices.length} invoices found
                {hasActiveFilters && ' with current filters'}
              </CardDescription>
            </div>
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search invoices..."
                  className="pl-9 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <select 
                className="border rounded-md px-3 py-2 text-sm bg-background"
                value={statusFilter}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Button type="submit" variant="outline">
                Apply Filters
              </Button>
              {hasActiveFilters && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleClearFilters}
                  className="text-muted-foreground"
                >
                  Clear
                </Button>
              )}
            </form>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Loading invoices...</p>
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Client</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-blue-600" />
                            {invoice.invoiceNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{invoice.clientName}</p>
                            <p className="text-sm text-muted-foreground">{invoice.clientEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>{formatDate(invoice.date)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {formatDate(invoice.dueDate)}
                            {invoice.status === 'overdue' && (
                              <AlertCircle className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {invoice.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem 
                                className="flex items-center gap-2"
                                onClick={() => handleViewDetails(invoice)}
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              {(invoice.status === 'pending' || invoice.status === 'overdue') && (
                                <DropdownMenuItem 
                                  className="flex items-center gap-2 text-red-600"
                                  onClick={() => handleCancelFromDropdown(invoice)}
                                  disabled={cancellingInvoice === invoice.id}
                                >
                                  <X className="h-4 w-4" />
                                  {cancellingInvoice === invoice.id ? 'Cancelling...' : 'Cancel Invoice'}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {invoices.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground text-lg">
                    {hasActiveFilters ? 'No invoices match your filters' : 'No invoices found'}
                  </p>
                  {hasActiveFilters && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Try adjusting your search criteria or clear filters
                    </p>
                  )}
                  {hasActiveFilters && (
                    <Button variant="outline" className="mt-4" onClick={handleClearFilters}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Invoice Details Dialog */}
      <InvoiceDetailsDialog
        invoice={selectedInvoice}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCancelInvoice={handleCancelInvoice}
      />

      {/* Cancel Confirmation Dialog */}
      <Dialog open={cancelConfirmOpen} onOpenChange={setCancelConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Cancel Invoice
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel invoice{" "}
              <strong>{invoiceToCancel?.invoiceNumber}</strong> for{" "}
              <strong>{invoiceToCancel?.clientName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelConfirmOpen(false);
                setInvoiceToCancel(null);
              }}
            >
              Keep Invoice
            </Button>
            <Button
              variant="destructive"
              onClick={() => invoiceToCancel && handleCancelInvoice(invoiceToCancel.id)}
              disabled={cancellingInvoice === invoiceToCancel?.id}
            >
              {cancellingInvoice === invoiceToCancel?.id ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  Cancelling...
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Cancel Invoice
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}