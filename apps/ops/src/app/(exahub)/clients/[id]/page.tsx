/* eslint-disable @typescript-eslint/no-explicit-any */
// app/dashboard/operations/clients/[id]/page.tsx
"use client"
import { useParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Mail, Phone, MapPin, Globe, Users, CreditCard, MessageSquare, Key, Ban, CheckCircle, ArrowLeft  } from "lucide-react";
import Link from "next/link";

// Mock data - in real app, you'd fetch from your database
const mockClients = [
  {
    id: "1",
    name: "Tech Solutions Ltd",
    email: "contact@techsolutions.com",
    phone: "+233 24 123 4567",
    address: "123 Tech Street, Accra",
    businessType: "Technology",
    businessSector: "IT Services",
    description: "Leading technology solutions provider specializing in enterprise software and digital transformation.",
    website: "https://techsolutions.com",
    isActive: true,
    status: "verified",
    createdAt: new Date("2024-01-15"),
    updatedAt: new Date("2024-06-15"),
    lastActive: new Date("2024-06-15"),
    users: [
      { 
        id: "user1",
        firstName: "John", 
        lastName: "Doe", 
        email: "john@techsolutions.com", 
        phone: "+233 24 123 4568",
        role: { name: "Admin" }, 
        lastLogin: new Date("2024-06-15"),
        isActive: true,
        createdAt: new Date("2024-01-15")
      },
      { 
        id: "user2",
        firstName: "Jane", 
        lastName: "Smith", 
        email: "jane@techsolutions.com", 
        phone: "+233 24 123 4569",
        role: { name: "Manager" }, 
        lastLogin: new Date("2024-06-14"),
        isActive: true,
        createdAt: new Date("2024-02-01")
      }
    ],
    accounts: [{ 
      id: "acc1", 
      balance: 1500.75, 
      currency: "GHS", 
      type: "WALLET",
      isActive: true,
      createdAt: new Date("2024-01-15")
    }],
    _count: {
      users: 3,
      smsMessages: 1250,
      otpMessages: 320,
      apiKeys: 2,
      webhooks: 1,
      senderIds: 2,
      templates: 5,
      contactGroups: 3,
      invoices: 4
    },
    transactions: [
      { id: "tx1", type: "purchase", amount: 500, balance: 1500.75, description: "SMS Credits Purchase", createdAt: new Date("2024-06-01") },
      { id: "tx2", type: "usage", amount: -25.50, balance: 1475.25, description: "SMS Usage", createdAt: new Date("2024-06-02") },
      { id: "tx3", type: "purchase", amount: 300, balance: 1775.25, description: "SMS Credits Top-up", createdAt: new Date("2024-05-15") },
      { id: "tx4", type: "usage", amount: -45.75, balance: 1729.50, description: "SMS Usage", createdAt: new Date("2024-05-10") }
    ]
  }
];

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  
  const client = mockClients.find(c => c.id === clientId);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <Building className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Client Not Found</h2>
        <p className="text-muted-foreground mt-2">The client you&apos;re looking for doesn&apos;t exist.</p>
        <Button asChild className="mt-4">
          <Link href="/clients/all">
            Back to Clients
          </Link>
        </Button>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const formatDateTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        return <Badge variant="secondary" className="flex items-center gap-1"><Ban className="h-3 w-3" /> Pending</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/clients/all">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <Building className="h-8 w-8 text-muted-foreground" />
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  {getStatusBadge(client)}
                  <span className="text-sm text-muted-foreground">
                    Client since {formatDate(client.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Business Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Business Information</CardTitle>
                <CardDescription>
                  Complete business details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Email:</span>
                    </div>
                    <p className="text-sm">{client.email}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Phone:</span>
                    </div>
                    <p className="text-sm">{client.phone}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Address:</span>
                    </div>
                    <p className="text-sm">{client.address || "Not provided"}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Website:</span>
                    </div>
                    <p className="text-sm">{client.website || "Not provided"}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="font-medium">Description:</span>
                  <p className="text-sm text-muted-foreground">{client.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="font-medium">Business Type:</span>
                    <p className="text-sm">{client.businessType}</p>
                  </div>
                  <div className="space-y-2">
                    <span className="font-medium">Sector:</span>
                    <p className="text-sm">{client.businessSector}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Account Balance</span>
                  </div>
                  <p className="text-2xl font-bold">{formatCurrency(client.accounts[0]?.balance || 0)}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Team Members</span>
                  </div>
                  <p className="text-2xl font-bold">{client._count.users}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">SMS Sent</span>
                  </div>
                  <p className="text-2xl font-bold">{client._count.smsMessages.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Key className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">API Keys</span>
                  </div>
                  <p className="text-2xl font-bold">{client._count.apiKeys}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                Users associated with this business account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role.name}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.isActive ? "default" : "destructive"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDateTime(user.lastLogin)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                Recent financial transactions and account activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {client.transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{formatDateTime(transaction.createdAt)}</TableCell>
                      <TableCell>
                        <Badge variant={
                          transaction.type === 'purchase' ? 'default' : 
                          transaction.type === 'usage' ? 'secondary' : 'outline'
                        }>
                          {transaction.type}
                        </Badge>
                      </TableCell>
                      <TableCell className={
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }>
                        {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                      </TableCell>
                      <TableCell>{formatCurrency(transaction.balance)}</TableCell>
                      <TableCell>{transaction.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}