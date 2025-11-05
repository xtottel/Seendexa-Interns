// controllers/finance/index.ts - UPDATED
import { getFinanceOverview, getRecentTransactions, getTopClients } from "./overview.controller";
import { getInvoices, getInvoiceStats, cancelInvoice } from "./invoices.controller";
import { getTransactions, getTransactionStats } from "./transactions.controller";
import { getClientBalances, getBalanceStats } from "./balances.controller";

export const financeController = {
  // Overview
  getFinanceOverview,
  getRecentTransactions,
  getTopClients,
  
  // Invoices
  getInvoices,
  getInvoiceStats,
  cancelInvoice,
  
  // Transactions
  getTransactions,
  getTransactionStats,
  
  // Client Balances
  getClientBalances,
  getBalanceStats,
};