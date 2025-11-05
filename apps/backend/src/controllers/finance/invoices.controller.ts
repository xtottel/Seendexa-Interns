// controllers/finance/invoices.controller.ts - UPDATED
import { prisma } from "@/utils/prisma";

// Function to update overdue invoices
const updateOverdueInvoices = async () => {
  try {
    const today = new Date();
    
    // Find pending invoices where due date has passed
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: 'PENDING',
        date: {
          lt: today // Changed to check if invoice date is in the past
        }
      }
    });

    // Update them to OVERDUE status
    for (const invoice of overdueInvoices) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'OVERDUE' }
      });
    }

    if (overdueInvoices.length > 0) {
      console.log(`Updated ${overdueInvoices.length} invoices to OVERDUE status`);
    }
  } catch (error) {
    console.error("Error updating overdue invoices:", error);
  }
};

// Function to cancel an invoice
export const cancelInvoice = async ({ params, set }: any) => {
  try {
    const { id } = params;

    // Check if invoice exists
    const invoice = await prisma.invoice.findUnique({
      where: { id }
    });

    if (!invoice) {
      set.status = 404;
      return {
        success: false,
        message: "Invoice not found"
      };
    }

    // Update invoice status to CANCELLED
    const updatedInvoice = await prisma.invoice.update({
      where: { id },
      data: { status: 'CANCELLED' }
    });

    set.status = 200;
    return {
      success: true,
      message: "Invoice cancelled successfully",
      data: updatedInvoice
    };
  } catch (error: any) {
    console.error("Cancel Invoice Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to cancel invoice",
      error: error.message 
    };
  }
};

export const getInvoices = async ({ query, set }: any) => {
  try {
    const { 
      search,
      status = 'all',
      page = 1,
      limit = 10
    } = query;

    const skip = (page - 1) * limit;

    // Update overdue invoices before fetching
    await updateOverdueInvoices();

    // Build where clause
    const where: any = {};

    if (status !== 'all') {
      // Map frontend status to database status
      const statusMap: any = {
        'paid': 'PAID',
        'pending': 'PENDING',
        'overdue': 'OVERDUE',
        'cancelled': 'CANCELLED'
      };
      where.status = statusMap[status] || status;
    }

    if (search) {
      where.OR = [
        { invoiceId: { contains: search, mode: 'insensitive' } },
        { business: { 
            name: { contains: search, mode: 'insensitive' } 
          } 
        },
        { business: {
            email: { contains: search, mode: 'insensitive' }
          }
        }
      ];
    }

    // Get invoices with pagination
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          business: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.invoice.count({ where })
    ]);

    // Enhanced data formatting to match frontend expectations
    const formattedInvoices = invoices.map(invoice => {
      // Calculate due date (30 days from invoice date)
      const dueDate = new Date(invoice.date);
      dueDate.setDate(dueDate.getDate() + 30);

      // Map database status to frontend status
      let status: 'paid' | 'pending' | 'overdue' | 'cancelled' = 'pending';
      if (invoice.status === 'PAID') status = 'paid';
      else if (invoice.status === 'OVERDUE') status = 'overdue';
      else if (invoice.status === 'CANCELLED') status = 'cancelled';
      else if (invoice.status === 'PENDING') {
        // Check if invoice is actually overdue based on current date
        const today = new Date();
        status = today > dueDate ? 'overdue' : 'pending';
      }

      return {
        id: invoice.id,
        invoiceNumber: invoice.invoiceId,
        clientName: invoice.business.name,
        clientEmail: invoice.business.email,
        amount: invoice.amount,
        date: invoice.date.toISOString().split('T')[0],
        dueDate: dueDate.toISOString().split('T')[0],
        status,
        type: invoice.type || 'Service',
        description: invoice.description
      };
    });

    set.status = 200;
    return {
      success: true,
      data: formattedInvoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error: any) {
    console.error("Get Invoices Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch invoices",
      error: error.message 
    };
  }
};

export const getInvoiceStats = async ({ set }: any) => {
  try {
    // Update overdue invoices before fetching stats
    await updateOverdueInvoices();

    const [
      totalInvoices,
      totalAmountResult,
      paidAmountResult,
      pendingAmountResult,
      overdueAmountResult
    ] = await Promise.all([
      prisma.invoice.count(),
      prisma.invoice.aggregate({
        _sum: {
          amount: true
        }
      }),
      prisma.invoice.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'PAID'
        }
      }),
      prisma.invoice.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'PENDING'
        }
      }),
      prisma.invoice.aggregate({
        _sum: {
          amount: true
        },
        where: {
          status: 'OVERDUE'
        }
      })
    ]);

    // Get status counts with proper mapping
    const statusCounts = await prisma.invoice.groupBy({
      by: ['status'],
      _count: {
        id: true
      }
    });

    // Map database status to frontend status
    const statusCountMap: any = {
      paid: 0,
      pending: 0,
      overdue: 0,
      cancelled: 0
    };

    statusCounts.forEach(item => {
      if (item.status === 'PAID') statusCountMap.paid = item._count.id;
      else if (item.status === 'CANCELLED') statusCountMap.cancelled = item._count.id;
      else if (item.status === 'OVERDUE') statusCountMap.overdue = item._count.id;
      else if (item.status === 'PENDING') statusCountMap.pending = item._count.id;
    });

    set.status = 200;
    return {
      success: true,
      data: {
        totalInvoices,
        totalAmount: totalAmountResult._sum.amount || 0,
        paidAmount: paidAmountResult._sum.amount || 0,
        pendingAmount: pendingAmountResult._sum.amount || 0,
        overdueAmount: overdueAmountResult._sum.amount || 0,
        statusCounts: statusCountMap
      }
    };
  } catch (error: any) {
    console.error("Get Invoice Stats Error:", error);
    set.status = 500;
    return { 
      success: false, 
      message: "Failed to fetch invoice stats",
      error: error.message 
    };
  }
};