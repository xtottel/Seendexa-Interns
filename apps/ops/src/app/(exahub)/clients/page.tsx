/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/operations/clients/page.tsx
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Eye,  User, Mail, Phone, Building, CreditCard, Users, Filter, Download,  Activity, Ban, CheckCircle, AlertCircle } from "lucide-react";
import Link from "next/link";

// Enhanced mock data following your schema
const mockClients = [
  {
    id: "1",
    name: "Tech Solutions Ltd",
    email: "contact@techsolutions.com",
    phone: "+233 24 123 4567",
    address: "123 Tech Street, Accra",
    businessType: "Technology",
    businessSector: "IT Services",
    description: "Leading technology solutions provider",
    website: "https://techsolutions.com",
    isActive: true,
    status: "verified",
    createdAt: new Date("2024-01-15"),
    lastActive: new Date("2024-06-15"),
    users: [
      { 
        firstName: "John", 
        lastName: "Doe", 
        email: "john@techsolutions.com", 
        role: { name: "Admin" }, 
        lastLogin: new Date("2024-06-15"),
        isActive: true 
      }
    ],
    accounts: [{ balance: 1500.75, currency: "GHS", type: "WALLET" }, { balance: 3000, currency: "GHS",  type: "SMS" }],
    _count: {
      users: 3,
      smsMessages: 1250,
      otpMessages: 320,
      apiKeys: 2,
      webhooks: 1,
      senderIds: 2,
      templates: 5,
      contactGroups: 3
    },
    settings: {
      mfaRequired: true,
      sessionTimeout: 1440,
      maxLoginAttempts: 5,
      securityLevel: "ENHANCED"
    },
    senderIds: [
      { name: "TechSol", status: "approved" },
      { name: "TSolutions", status: "pending" }
    ],
    invoices: [
      { amount: 500, status: "paid", date: new Date("2024-06-01") },
      { amount: 750, status: "paid", date: new Date("2024-05-01") }
    ]
  },
  {
    id: "2",
    name: "Retail Plus GH",
    email: "info@retailplus.com",
    phone: "+233 20 987 6543",
    address: "45 Market Circle, Kumasi",
    businessType: "Retail",
    businessSector: "E-commerce",
    description: "Online retail store",
    website: "https://retailplusgh.com",
    isActive: true,
    status: "pending",
    createdAt: new Date("2024-02-20"),
    lastActive: new Date("2024-06-14"),
    users: [
      { 
        firstName: "Sarah", 
        lastName: "Mensah", 
        email: "sarah@retailplus.com", 
        role: { name: "Owner" }, 
        lastLogin: new Date("2024-06-14"),
        isActive: true 
      }
    ],
    accounts: [{ balance: 750.25, currency: "GHS", type: "WALLET" }, { balance: 1200, currency: "GHS", type: "SMS" }],
    _count: {
      users: 2,
      smsMessages: 850,
      otpMessages: 150,
      apiKeys: 1,
      webhooks: 0,
      senderIds: 1,
      templates: 2,
      contactGroups: 1
    },
    settings: {
      mfaRequired: false,
      sessionTimeout: 1440,
      maxLoginAttempts: 5,
      securityLevel: "STANDARD"
    },
    senderIds: [
      { name: "RetailPlus", status: "approved" }
    ],
    invoices: [
      { amount: 300, status: "paid", date: new Date("2024-06-05") }
    ]
  },
  {
    id: "3",
    name: "Logistics Express",
    email: "support@logisticsexpress.com",
    phone: "+233 54 555 1234",
    address: "78 Transport Ave, Tema",
    businessType: "Logistics",
    businessSector: "Transportation",
    description: "Nationwide logistics and delivery",
    website: "https://logisticsexpress.com",
    isActive: false,
    status: "suspended",
    createdAt: new Date("2024-03-10"),
    lastActive: new Date("2024-05-01"),
    users: [
      { 
        firstName: "Kwame", 
        lastName: "Appiah", 
        email: "kwame@logisticsexpress.com", 
        role: { name: "Manager" }, 
        lastLogin: new Date("2024-05-01"),
        isActive: false 
      }
    ],
    accounts: [{ balance: 0, currency: "GHS", type: "WALLET" }, { balance: 0, currency: "GHS", type: "SMS" }],
    _count: {
      users: 1,
      smsMessages: 0,
      otpMessages: 0,
      apiKeys: 0,
      webhooks: 0,
      senderIds: 0,
      templates: 0,
      contactGroups: 0
    },
    settings: {
      mfaRequired: false,
      sessionTimeout: 1440,
      maxLoginAttempts: 5,
      securityLevel: "STANDARD"
    },
    senderIds: [],
    invoices: []
  }
];

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [clients] = useState(mockClients);

  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.includes(searchTerm);
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "active" && client.isActive) ||
      (statusFilter === "inactive" && !client.isActive) ||
      (statusFilter === "verified" && client.status === "verified") ||
      (statusFilter === "pending" && client.status === "pending");

    return matchesSearch && matchesStatus;
  });

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatCurrency = (amount: number, currency: string = 'GHS') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusBadge = (client: any) => {
    if (!client.isActive) {
      return <Badge variant="destructive" className="flex items-center gap-1"><Ban className="h-3 w-3" /> Suspended</Badge>;
    }
    
    switch (client.status) {
      case "verified":
        return <Badge variant="default" className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> Verified</Badge>;
      case "pending":
        return <Badge variant="secondary" className="flex items-center gap-1"><AlertCircle className="h-3 w-3" /> Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const handleToggleStatus = (client: any) => {
    // Implement status toggle logic
    console.log("Toggle status for:", client.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
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
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">
              {clients.filter(c => c.isActive).length} active
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
              {formatCurrency(clients.reduce((acc, client) => acc + (client.accounts[0]?.balance || 0), 0))}
            </div>
            <p className="text-xs text-muted-foreground">Across all accounts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Volume</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.reduce((acc, client) => acc + client._count.smsMessages, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Total messages sent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sender IDs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients.reduce((acc, client) => acc + client._count.senderIds, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Registered sender IDs</p>
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
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search clients..."
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
                  <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Clients</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("active")}>Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("inactive")}>Suspended</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("verified")}>Verified</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>SMS Credits</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Activity</TableHead>
               
                <TableHead>Status</TableHead>
                <TableHead >Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id} className={!client.isActive ? "bg-muted/50" : ""}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{client.name}</span>
                      
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                    
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{client.phone}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {/* <CreditCard className="h-4 w-4 text-muted-foreground" /> */}
                      <span className={`font-medium ${client.accounts[0]?.balance === 0 ? "text-muted-foreground" : ""}`}>
                        {formatCurrency(client.accounts[0]?.balance || 0)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{client.accounts[1]?.balance || 0} </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{client._count.users}</span>
                      
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      
                      <span className="text-xs text-muted-foreground">
                        Last active: {formatDate(client.lastActive)}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {getStatusBadge(client)}
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
                        <DropdownMenuItem asChild>
                          <Link href={`/clients/${client.id}`} className="cursor-pointer flex items-center">
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
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredClients.length === 0 && (
            <div className="text-center py-8">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No clients found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}