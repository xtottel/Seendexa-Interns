// app/dashboard/operations/pending-requests/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Filter, Download, Building, CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";

interface PendingRequest {
  id: string;
  name: string;
  business: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
  purpose: string;
  status: "pending";
  submittedBy: string;
  submittedAt: string;
  updatedAt: string;
}

export default function PendingRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [requests, setRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequests();
  }, [purposeFilter, searchTerm]);

  const fetchPendingRequests = async () => {
    try {
      const params = new URLSearchParams();
      params.append('status', 'pending');
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await fetch(`/api/sender-ids?${params}`);
      const result = await response.json();
      
      if (result.success) {
        // For pending requests, we'll use the same data but might need to adjust
        // In a real app, you might have additional fields for pending requests
        setRequests(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch pending requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: PendingRequest) => {
    try {
      const response = await fetch(`/api/sender-ids/${request.id}/approve`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        // Remove from pending list
        setRequests(prev => prev.filter(req => req.id !== request.id));
      } else {
        console.error("Failed to approve:", result.message);
      }
    } catch (error) {
      console.error("Error approving request:", error);
    }
  };

  const handleReject = async (request: PendingRequest) => {
    try {
      const response = await fetch(`/api/sender-ids/${request.id}/reject`, {
        method: 'POST'
      });
      const result = await response.json();
      
      if (result.success) {
        // Remove from pending list
        setRequests(prev => prev.filter(req => req.id !== request.id));
      } else {
        console.error("Failed to reject:", result.message);
      }
    } catch (error) {
      console.error("Error rejecting request:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getPurposeBadge = (purpose: string) => {
    switch (purpose) {
      case "marketing":
        return <Badge variant="default" className="bg-purple-100 text-purple-800 hover:bg-purple-100">Marketing</Badge>;
      case "transactional":
        return <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Transactional</Badge>;
      case "educational":
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Educational</Badge>;
      default:
        return <Badge variant="outline">{purpose}</Badge>;
    }
  };

  const getStatusBadge = () => {
    return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
  };

  const stats = {
    total: requests.length,
    marketing: requests.filter(r => r.purpose === 'marketing').length,
    transactional: requests.filter(r => r.purpose === 'transactional').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Approval Requests</h1>
          <p className="text-muted-foreground">
            Review and approve pending Sender ID registration requests
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Sender IDs awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Marketing</CardTitle>
            <MessageSquare className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.marketing}</div>
            <p className="text-xs text-muted-foreground">Marketing purposes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Transactional</CardTitle>
            <Building className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.transactional}</div>
            <p className="text-xs text-muted-foreground">Transactional purposes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Pending Sender IDs</CardTitle>
              <CardDescription>
                Review and take action on all pending Sender ID requests
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
                    Purpose
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setPurposeFilter("all")}>All Purposes</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPurposeFilter("marketing")}>Marketing</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPurposeFilter("transactional")}>Transactional</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setPurposeFilter("educational")}>Educational</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sender ID</TableHead>
                    <TableHead>Business</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{request.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{request.business.name}</span>
                          <span className="text-sm text-muted-foreground">{request.business.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getPurposeBadge(request.purpose)}</TableCell>
                      <TableCell>{formatDate(request.submittedAt)}</TableCell>
                      <TableCell>{getStatusBadge()}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50"
                            onClick={() => handleApprove(request)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                            onClick={() => handleReject(request)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {requests.length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No pending sender ID requests found</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    All sender ID requests have been processed
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}