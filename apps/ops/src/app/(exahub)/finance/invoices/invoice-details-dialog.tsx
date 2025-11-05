// components/invoice-details-dialog.tsx - UPDATED
"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  User, 
  Mail, 
  DollarSign,
  Copy,
  X
} from "lucide-react";
import { useState } from "react";

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

interface InvoiceDetailsDialogProps {
  invoice: Invoice | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCancelInvoice?: (invoiceId: string) => Promise<void>;
}

export function InvoiceDetailsDialog({ 
  invoice, 
  open, 
  onOpenChange,
  onCancelInvoice 
}: InvoiceDetailsDialogProps) {
  const [cancelling, setCancelling] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'GHS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(dateString));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="default" className="bg-green-100 text-green-800">Paid</Badge>;
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

  const handleCopyInvoiceNumber = () => {
    if (invoice) {
      navigator.clipboard.writeText(invoice.invoiceNumber);
      // You can add a toast notification here
    }
  };

  const handleCancelInvoice = async () => {
    if (!invoice || !onCancelInvoice) return;
    
    try {
      setCancelling(true);
      await onCancelInvoice(invoice.id);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to cancel invoice:", error);
    } finally {
      setCancelling(false);
    }
  };

  if (!invoice) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Details
          </DialogTitle>
          <DialogDescription>
            Detailed information for {invoice.invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invoice Header */}
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">{invoice.invoiceNumber}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyInvoiceNumber}
                  className="h-6 w-6 p-0"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
              {getStatusBadge(invoice.status)}
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(invoice.amount)}
              </p>
              <p className="text-sm text-muted-foreground">Total Amount</p>
            </div>
          </div>

          {/* Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Client Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="font-medium">{invoice.clientName}</p>
                    <p className="text-sm text-muted-foreground">Client Name</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{invoice.clientEmail}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Service Details
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="font-medium">{invoice.type}</p>
                    <p className="text-sm text-muted-foreground">Service Type</p>
                  </div>
                  {invoice.description && (
                    <div>
                      <p className="text-sm">{invoice.description}</p>
                      <p className="text-sm text-muted-foreground">Description</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Dates
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium">{formatDate(invoice.date)}</p>
                    <p className="text-sm text-muted-foreground">Invoice Date</p>
                  </div>
                  <div>
                    <p className="font-medium">{formatDate(invoice.dueDate)}</p>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                  </div>
                  <div>
                    <p className="font-medium">
                      {Math.ceil((new Date(invoice.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.dueDate) > new Date() ? 'Days until due' : 'Days overdue'}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Payment Information
                </h4>
                <div className="space-y-2">
                  <div>
                    <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                    <p className="text-sm text-muted-foreground">Amount Due</p>
                  </div>
                  <div>
                    <p className="font-medium">
                      {invoice.status === 'paid' ? 'Paid' : 'Unpaid'}
                    </p>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            {(invoice.status === 'pending' || invoice.status === 'overdue') && (
              <Button 
                variant="destructive" 
                className="flex-1 flex items-center gap-2"
                onClick={handleCancelInvoice}
                disabled={cancelling}
              >
                <X className="h-4 w-4" />
                {cancelling ? 'Cancelling...' : 'Cancel Invoice'}
              </Button>
            )}
          </div>

          {/* Status Notes */}
          {invoice.status === 'overdue' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm font-medium">
                This invoice is overdue. Consider sending a payment reminder to the client.
              </p>
            </div>
          )}

          {invoice.status === 'pending' && new Date(invoice.dueDate) < new Date() && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-orange-800 text-sm font-medium">
                This invoice is pending but past its due date. It will be marked as overdue soon.
              </p>
            </div>
          )}

          {invoice.status === 'cancelled' && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-800 text-sm font-medium">
                This invoice has been cancelled and is no longer active.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}