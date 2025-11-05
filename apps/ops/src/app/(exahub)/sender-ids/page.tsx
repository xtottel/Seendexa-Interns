// app/dashboard/operations/sender-ids/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Filter, Download, CheckCircle, XCircle, Clock, Mail } from "lucide-react";
import Image from "next/image";

interface SenderId {
  id: string;
  name: string;
  business: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  status: "approved" | "pending" | "rejected";
  createdAt: string;
  updatedAt: string;
  smsCount: number;
}

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export default function SenderIdsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [senderIds, setSenderIds] = useState<SenderId[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, approved: 0, pending: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSenderIds();
    fetchStats();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm]);

  const fetchSenderIds = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/sender-ids?${params}`);
      const result = await response.json();
      
      if (result.success) {
        setSenderIds(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch sender IDs:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/sender-ids/stats/overview');
      const result = await response.json();
      
      if (result.success) {
        setStats(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const handleApprove = async (senderId: SenderId) => {
    try {
      const response = await fetch(`/api/sender-ids/${senderId.id}/approve`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        // Refresh the data
        fetchSenderIds();
        fetchStats();
      } else {
        console.error("Failed to approve:", result.message);
      }
    } catch (error) {
      console.error("Error approving sender ID:", error);
    }
  };

  const handleReject = async (senderId: SenderId) => {
    try {
      const response = await fetch(`/api/sender-ids/${senderId.id}/reject`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        // Refresh the data
        fetchSenderIds();
        fetchStats();
      } else {
        console.error("Failed to reject:", result.message);
      }
    } catch (error) {
      console.error("Error rejecting sender ID:", error);
    }
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
      case "approved":
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case "pending":
        return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sender ID Management</h1>
          <p className="text-muted-foreground">
            Manage all sender IDs across all businesses
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sender IDs</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Across all businesses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <p className="text-xs text-muted-foreground">Active sender IDs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Not approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>All Sender IDs</CardTitle>
              <CardDescription>
                View and manage all sender ID registrations across businesses
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search sender IDs..."
                  className="pl-8 w-full sm:w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("approved")}>Approved</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("rejected")}>Rejected</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            // <div className="text-center py-8">Loading...</div>
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
                    <TableHead>Sender ID</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>SMS Count</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {senderIds.map((senderId) => (
                    <TableRow key={senderId.id}>
                      <TableCell className="font-medium">{senderId.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{senderId.business.name}</span>
                          {/* <span className="text-sm text-muted-foreground">{senderId.business.email}</span> */}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{senderId.smsCount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>{formatDate(senderId.createdAt)}</TableCell>
                      <TableCell>{getStatusBadge(senderId.status)}</TableCell>
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
                            {senderId.status === "pending" && (
                              <>
                                <DropdownMenuItem 
                                  className="cursor-pointer text-green-600"
                                  onClick={() => handleApprove(senderId)}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Approve
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="cursor-pointer text-red-600"
                                  onClick={() => handleReject(senderId)}
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Reject
                                </DropdownMenuItem>
                              </>
                            )}
                            {senderId.status === "approved" && (
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600"
                                onClick={() => handleReject(senderId)}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Revoke Approval
                              </DropdownMenuItem>
                            )}
                            {senderId.status === "rejected" && (
                              <DropdownMenuItem 
                                className="cursor-pointer text-green-600"
                                onClick={() => handleApprove(senderId)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
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

              {senderIds.length === 0 && (
                <div className="text-center py-8">
                  <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No sender IDs found</p>
                </div>
              )}

            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}