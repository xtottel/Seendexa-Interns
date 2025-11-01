// app/dashboard/operations/pending-requests/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,  DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Filter, Download, Building,  Phone, CheckCircle, XCircle, Clock, MessageSquare } from "lucide-react";

// Mock data for Sender ID approval requests
const mockSenderIdRequests = [
  {
    id: "sid-1",
    name: "TSolutions",
    business: {
      id: "1",
      name: "Tech Solutions Ltd",
      email: "contact@techsolutions.com",
      phone: "+233 24 123 4567"
    },
    purpose: "marketing",
    status: "pending",
    atWhitelisted: "Not Submitted",
    submittedBy: "John Doe",
    submittedAt: new Date("2024-06-01"),
    updatedAt: new Date("2024-06-01")
  },
  {
    id: "sid-2",
    name: "MediCare",
    business: {
      id: "5",
      name: "MediCare Health Services",
      email: "admin@medicare.com",
      phone: "+233 27 888 9999"
    },
    purpose: "transactional",
    status: "pending",
    atWhitelisted: "Not Submitted",
    submittedBy: "Dr. Kwame Appiah",
    submittedAt: new Date("2024-06-10"),
    updatedAt: new Date("2024-06-10")
  },
  {
    id: "sid-3",
    name: "QuickPay",
    business: {
      id: "4",
      name: "QuickPay Financial",
      email: "support@quickpay.com",
      phone: "+233 54 333 4444"
    },
    purpose: "transactional",
    status: "pending",
    atWhitelisted: "Submitted",
    submittedBy: "Ama Johnson",
    submittedAt: new Date("2024-06-15"),
    updatedAt: new Date("2024-06-15")
  },
  {
    id: "sid-4",
    name: "EduLearn",
    business: {
      id: "6",
      name: "EduLearn Academy",
      email: "info@edulearn.com",
      phone: "+233 20 555 6666"
    },
    purpose: "educational",
    status: "pending",
    atWhitelisted: "Not Submitted",
    submittedBy: "Prof. Mensah",
    submittedAt: new Date("2024-06-18"),
    updatedAt: new Date("2024-06-18")
  }
];

export default function PendingRequestsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [requests, setRequests] = useState(mockSenderIdRequests);

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.business.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.submittedBy.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesPurpose = purposeFilter === "all" || request.purpose === purposeFilter;

    return matchesSearch && matchesStatus && matchesPurpose;
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

  const getAtStatusBadge = (status: string) => {
    return status === "Submitted" ? 
      <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">AT Whitelisted</Badge> : 
      <Badge variant="outline">Not Submitted</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return <Badge variant="secondary" className="flex items-center gap-1"><Clock className="h-3 w-3" /> Pending</Badge>;
  };

  const handleApprove = (request: any) => {
    console.log("Approve sender ID:", request.id);
    // Update the request status to approved
    setRequests(prev => 
      prev.map(req => 
        req.id === request.id ? { ...req, status: "approved" } : req
      )
    );
  };

  const handleReject = (request: any) => {
    console.log("Reject sender ID:", request.id);
    // Update the request status to rejected
    setRequests(prev => 
      prev.map(req => 
        req.id === request.id ? { ...req, status: "rejected" } : req
      )
    );
  };


  const stats = {
    total: requests.filter(r => r.status === 'pending').length,
    marketing: requests.filter(r => r.status === 'pending' && r.purpose === 'marketing').length,
    transactional: requests.filter(r => r.status === 'pending' && r.purpose === 'transactional').length,
    atSubmitted: requests.filter(r => r.status === 'pending' && r.atWhitelisted === 'Submitted').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sender ID Approval</h1>
          <p className="text-muted-foreground">
            Review and approve pending Sender ID registration requests
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
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              Sender IDs awaiting approval
            </p>
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

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AT Whitelisted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.atSubmitted}</div>
            <p className="text-xs text-muted-foreground">Submitted to AT</p>
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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-full sm:w-auto">
                    <Filter className="h-4 w-4 mr-2" />
                    AT Status
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending Review</DropdownMenuItem>
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
                <TableHead>Purpose</TableHead>
                <TableHead>AT Status</TableHead>
                {/* <TableHead>Submitted By</TableHead> */}
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{request.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{request.business.name}</span>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {request.business.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPurposeBadge(request.purpose)}
                  </TableCell>
                  <TableCell>
                    {getAtStatusBadge(request.atWhitelisted)}
                  </TableCell>
                  {/* <TableCell>
                    {request.submittedBy}
                  </TableCell> */}
                  <TableCell>
                    {formatDate(request.submittedAt)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(request.status)}
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
                          
                          
                          {/* <DropdownMenuSeparator /> */}
                          
                          <DropdownMenuItem 
                            className="cursor-pointer text-green-600"
                            onClick={() => handleApprove(request)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer text-red-600"
                            onClick={() => handleReject(request)}
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            Reject
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredRequests.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No pending sender ID requests found</p>
              <p className="text-sm text-muted-foreground mt-1">
                All sender ID requests have been processed
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}