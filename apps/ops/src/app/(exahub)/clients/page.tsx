// app/dashboard/operations/clients/page.tsx
"use client";

import { useState, useEffect } from "react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Eye,
  Mail,
  Phone,
  Building,
  CreditCard,
  Users,
  Filter,
  Download,
  Activity,
  Ban,
  CheckCircle,
  AlertCircle,
  User,
  MessageSquare,
  Key,
} from "lucide-react";
import Link from "next/link";
import  Image  from "next/image";

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  businessType?: string;
  businessSector?: string;
  description?: string;
  website?: string;
  isActive: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  primaryUser?: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    lastLogin: string;
    isActive: boolean;
  };
  walletBalance: number;
  smsBalance: number;
  stats: {
    users: number;
    smsMessages: number;
    otpMessages: number;
    apiKeys: number;
    webhooks: number;
    senderIds: number;
    templates: number;
    contactGroups: number;
  };
}

interface Stats {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  pending: number;
  totalBalance: number;
  totalSmsSent: number;
}

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clients, setClients] = useState<Client[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    inactive: 0,
    verified: 0,
    pending: 0,
    totalBalance: 0,
    totalSmsSent: 0,
  });
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchClients();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm, pagination.page]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      const response = await fetch(`/api/clients?${params}`);
      const result = await response.json();

      if (result.success) {
        setClients(result.data);
        setPagination((prev) => ({
          ...prev,
          ...result.pagination,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/clients/stats");
      const result = await response.json();

      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleToggleStatus = async (client: Client) => {
    try {
      const response = await fetch(`/api/clients/${client.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !client.isActive,
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Refresh the data
        fetchClients();
        fetchStats();
      } else {
        console.error("Failed to update status:", result.message);
        alert(`Failed to update status: ${result.message}`);
      }
    } catch (error) {
      console.error("Error updating client status:", error);
      alert("Error updating client status");
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchClients();
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount: number, currency: string = "GHS") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = (client: Client) => {
    if (!client.isActive) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Ban className="h-3 w-3" /> Suspended
        </Badge>
      );
    }

    switch (client.status) {
      case "verified":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Verified
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Pending
          </Badge>
        );
      case "active":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" /> Active
          </Badge>
        );
      default:
        return <Badge variant="outline">{client.status}</Badge>;
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Client Management
          </h1>
          <p className="text-muted-foreground">
            Manage business clients, monitor activity, and handle account status
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button>
            <User className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active, {stats.inactive} suspended
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalBalance)}
            </div>
            <p className="text-xs text-muted-foreground">Across all accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Volume</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalSmsSent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total messages sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Sender IDs
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.reduce((acc, client) => acc + client.stats.senderIds, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Registered sender IDs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total SMS Sent
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients
                .reduce((acc, client) => acc + client.stats.smsMessages, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total OTP Messages
            </CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients
                .reduce((acc, client) => acc + client.stats.otpMessages, 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Templates
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.reduce((acc, client) => acc + client.stats.templates, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Contact Groups
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.reduce(
                (acc, client) => acc + client.stats.contactGroups,
                0
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Business Clients</CardTitle>
              <CardDescription>
                Monitor and manage all registered businesses
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <form onSubmit={handleSearch} className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search clients..."
                    className="pl-8 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Button type="submit" variant="outline">
                  Search
                </Button>
              </form>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>
                    All Clients
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>
                    Active
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>
                    Suspended
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("verified")}>
                    Verified
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>
                    Pending
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            // <div className="text-center py-8">
            //   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            //   <p className="text-muted-foreground mt-2">Loading clients...</p>
            // </div>
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
              {/* Using a loading GIF */}
              <Image
                src="/exaloader.gif"
                alt="Loading..."
                width={100}
                height={100}
                className="mb-4"
              />
            </div>
          ) : (
            <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Wallet Balance</TableHead>
                    <TableHead>SMS Credits</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Activity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow
                      key={client.id}
                      className={!client.isActive ? "bg-muted/50" : ""}
                    >
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{client.name}</span>
                          {/* <div className="flex items-center gap-1 mt-1">
                            <Globe className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {client.businessType || "No type specified"}
                            </span>
                          </div> */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-1">
                          {/* <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{client.email}</span>
                          </div> */}
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{client.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span
                            className={`font-medium ${client.walletBalance === 0 ? "text-muted-foreground" : "text-green-600"}`}
                          >
                            {formatCurrency(client.walletBalance)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                          <span
                            className={
                              client.smsBalance === 0
                                ? "text-muted-foreground"
                                : "text-blue-600"
                            }
                          >
                            {client.smsBalance.toLocaleString()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{client.stats.users}</span>
                          {client.stats.apiKeys > 0 && (
                            <Badge variant="outline" className="ml-1">
                              <Key className="h-3 w-3 mr-1" />
                              {client.stats.apiKeys}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {/* <span className="text-sm">
                            {client.stats.smsMessages.toLocaleString()} SMS
                          </span> */}
                          <span className="text-xs text-muted-foreground">
                            Last active: {formatDate(client.lastActive)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(client)}</TableCell>
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
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/clients/${client.id}`}
                                className="cursor-pointer flex items-center"
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="cursor-pointer"
                              onClick={() => handleToggleStatus(client)}
                            >
                              {client.isActive ? (
                                <>
                                  <Ban className="h-4 w-4 mr-2" />
                                  Suspend Account
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Activate Account
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer">
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    of {pagination.total} clients
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {clients.length === 0 && (
                <div className="text-center py-12">
                  <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No clients found</h3>
                  <p className="text-muted-foreground mt-2">
                    {searchTerm || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria"
                      : "No clients have been registered yet"}
                  </p>
                  {(searchTerm || statusFilter !== "all") && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchTerm("");
                        setStatusFilter("all");
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}
</div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
