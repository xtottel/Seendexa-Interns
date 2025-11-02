// app/dashboard/operations/sender-ids/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,  DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Filter, Download, CheckCircle, XCircle, Clock,  Mail } from "lucide-react";

// Mock data based on your schema
const mockSenderIds = [
  {
    id: "1",
    name: "TechSol",
    business: {
      id: "1",
      name: "Tech Solutions Ltd",
      email: "contact@techsolutions.com",
      phone: "+233 24 123 4567"
    },
    status: "approved",
    atWhitelisted: "Submitted",
    createdAt: new Date("2024-01-20"),
    updatedAt: new Date("2024-01-25"),
    smsCount: 1250
  },
  {
    id: "2",
    name: "TSolutions",
    business: {
      id: "1",
      name: "Tech Solutions Ltd",
      email: "contact@techsolutions.com",
      phone: "+233 24 123 4567"
    },
    status: "pending",
    atWhitelisted: "Not Submitted",
    createdAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01"),
    smsCount: 0
  },
  {
    id: "3",
    name: "RetailPlus",
    business: {
      id: "2",
      name: "Retail Plus GH",
      email: "info@retailplus.com",
      phone: "+233 20 987 6543"
    },
    status: "approved",
    atWhitelisted: "Submitted",
    createdAt: new Date("2024-02-20"),
    updatedAt: new Date("2024-03-01"),
    smsCount: 850
  },
  {
    id: "4",
    name: "QuickPay",
    business: {
      id: "4",
      name: "QuickPay Financial",
      email: "support@quickpay.com",
      phone: "+233 54 333 4444"
    },
    status: "rejected",
    atWhitelisted: "Submitted",
    createdAt: new Date("2024-05-15"),
    updatedAt: new Date("2024-05-20"),
    smsCount: 0
  },
  {
    id: "5",
    name: "MediCare",
    business: {
      id: "5",
      name: "MediCare Health Services",
      email: "admin@medicare.com",
      phone: "+233 27 888 9999"
    },
    status: "pending",
    atWhitelisted: "Not Submitted",
    createdAt: new Date("2024-06-10"),
    updatedAt: new Date("2024-06-10"),
    smsCount: 0
  }
];

export default function SenderIdsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [senderIds] = useState(mockSenderIds);

  const filteredSenderIds = senderIds.filter(senderId => {
    const matchesSearch = senderId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senderId.business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      senderId.business.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || senderId.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
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

  const getAtStatusBadge = (status: string) => {
    return status === "Submitted" ? 
      <Badge variant="default">AT Whitelisted</Badge> : 
      <Badge variant="outline">Not Submitted</Badge>;
  };

  const handleApprove = (senderId: any) => {
    console.log("Approve sender ID:", senderId.id);
    // Implement approval logic
  };

  const handleReject = (senderId: any) => {
    console.log("Reject sender ID:", senderId.id);
    // Implement rejection logic
  };

  const stats = {
    total: senderIds.length,
    approved: senderIds.filter(s => s.status === 'approved').length,
    pending: senderIds.filter(s => s.status === 'pending').length,
    rejected: senderIds.filter(s => s.status === 'rejected').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sender ID Management</h1>
          <p className="text-muted-foreground">
            Manage and approve sender IDs for SMS messaging
          </p>
        </div>
        <div className="flex gap-2">
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
            <CardTitle className="text-sm font-medium">Total Sender IDs</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Across all businesses
            </p>
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
              <CardTitle>Registered Sender IDs</CardTitle>
              <CardDescription>
                Review and manage all sender ID registrations
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender ID</TableHead>
                <TableHead>Business</TableHead>
                <TableHead>AT Status</TableHead>
                <TableHead>SMS Count</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSenderIds.map((senderId) => (
                <TableRow key={senderId.id}>
                  <TableCell className="font-medium">{senderId.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{senderId.business.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getAtStatusBadge(senderId.atWhitelisted)}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{senderId.smsCount.toLocaleString()}</span>
                  </TableCell>
                  <TableCell>
                    {formatDate(senderId.createdAt)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(senderId.status)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        
                        {/* <DropdownMenuSeparator /> */}
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

          {filteredSenderIds.length === 0 && (
            <div className="text-center py-8">
              <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No sender IDs found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}