// app/dashboard/operations/clients/[id]/page.tsx
"use client";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  Mail,
  Phone,
  MapPin,
  Globe,
  Users,
  CreditCard,
  MessageSquare,
  Key,
  Ban,
  CheckCircle,
  ArrowLeft,
  FileText,
  Settings,
  Activity,
  BarChart3,
  Shield,
  Download,
  UserPlus,
  Eye,
  AlertCircle,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
  logo?: string;
  businessCertificate?: string;
  isActive: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastActive: string;
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: string;
    lastLogin: string;
    isActive: boolean;
    createdAt: string;
  }>;
  accounts: Array<{
    id: string;
    type: string;
    balance: number;
    currency: string;
    isActive: boolean;
    createdAt: string;
  }>;
  senderIds: Array<{
    id: string;
    name: string;
    status: string;
    createdAt: string;
  }>;
  settings?: {
    securityLevel: string;
    mfaRequired: boolean;
    sessionTimeout: number;
    maxLoginAttempts: number;
  };
  stats: {
    users: number;
    smsMessages: number;
    otpMessages: number;
    apiKeys: number;
    webhooks: number;
    senderIds: number;
    templates: number;
    contactGroups: number;
    invoices: number;
    totalSpent: number;
    monthlyUsage: number;
    creditBalance: number;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    balance: number;
    description: string;
    accountType: string;
    createdAt: string;
  }>;
}

export default function ClientDetailPage() {
  const params = useParams();
  const clientId = params.id as string;
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  // Add to your useState declarations
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    fetchClientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/clients/${clientId}`);
      const result = await response.json();

      if (result.success) {
        setClient(result.data);
      } else {
        console.error("Failed to fetch client:", result.message);
      }
    } catch (error) {
      console.error("Error fetching client:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async () => {
    if (!client) return;

    try {
      const response = await fetch(`/api/clients/${clientId}/status`, {
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
        setClient((prev) =>
          prev
            ? { ...prev, isActive: !prev.isActive, status: result.data.status }
            : null
        );
      } else {
        console.error("Failed to update status:", result.message);
      }
    } catch (error) {
      console.error("Error updating client status:", error);
    }
  };

  // Add this function to fetch transactions with pagination
  const fetchTransactions = async (page: number = 1) => {
    if (!client) return;

    try {
      setTransactionsLoading(true);
      const response = await fetch(
        `/api/clients/${clientId}/transactions?page=${page}&limit=15`
      );
      const result = await response.json();

      if (result.success) {
        setClient((prev) =>
          prev
            ? {
                ...prev,
                recentTransactions: result.data.transactions,
              }
            : null
        );
        setTransactionsPage(page);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  };

  const formatDateTime = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  const formatCurrency = (amount: number, currency: string = "GHS") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const formatCredits = (credits: number) => {
    return new Intl.NumberFormat("en-US").format(credits);
  };

  const getStatusBadge = (client: Client) => {
    if (!client.isActive) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <Ban className="h-3 w-3" /> Suspended
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3" /> Active
      </Badge>
    );
  };

  const getSenderIdStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <CheckCircle className="h-2 w-2" /> Approved
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-2 w-2" /> Pending
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-2 w-2" /> Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case "purchase":
        return (
          <Badge variant="default" className="flex items-center gap-1">
            <DollarSign className="h-2 w-2" /> Purchase
          </Badge>
        );
      case "usage":
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Activity className="h-2 w-2" /> Usage
          </Badge>
        );
      case "refund":
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <Download className="h-2 w-2" /> Refund
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // if (loading) {
  //   return (
  //     <div className="flex flex-col items-center justify-center min-h-96">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  //       <p className="text-muted-foreground mt-4">Loading client details...</p>
  //     </div>
  //   );
  // }

   if (loading) {
      return (
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
      )
    }

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96">
        <Building className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold">Client Not Found</h2>
        <p className="text-muted-foreground mt-2">
          The client you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild className="mt-4">
          <Link href="/clients">Back to Clients</Link>
        </Button>
      </div>
    );
  }

  const walletAccount = client.accounts.find((acc) => acc.type === "WALLET");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const smsAccount = client.accounts.find((acc) => acc.type === "SMS");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/clients">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-4">
            {client.logo ? (
              <Image
                src={client.logo}
                alt={client.name}
                className="h-12 w-12 rounded-lg object-cover"
                width={48}
                height={48}
              />
            ) : (
              <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Building className="h-6 w-6 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {client.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                {getStatusBadge(client)}
                <span className="text-sm text-muted-foreground">
                  Client since {formatDate(client.createdAt)}
                </span>
                <span className="text-sm text-muted-foreground">
                  Last active {formatDate(client.lastActive)}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleStatusToggle}>
            {client.isActive ? (
              <>
                <Ban className="h-4 w-4 mr-2" />
                Suspend
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Quick Stats - Updated to match stats card design */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Financial Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Wallet Balance
            </CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(walletAccount?.balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Available funds</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Credits</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCredits(client.stats.creditBalance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Available credits</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(client.stats.totalSpent || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Lifetime spending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(client.stats.monthlyUsage || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        {/* Usage Cards */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Sent</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCredits(client.stats.smsMessages)}
            </div>
            <p className="text-xs text-muted-foreground">Total messages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OTP Messages</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCredits(client.stats.otpMessages)}
            </div>
            <p className="text-xs text-muted-foreground">
              Authentication messages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.stats.users}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sender IDs</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{client.stats.senderIds}</div>
            <p className="text-xs text-muted-foreground">Registered IDs</p>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team
          </TabsTrigger>
          <TabsTrigger value="finance" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Finance
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
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
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Email Address</span>
                      </div>
                      <p className="text-sm">
                        {client.email || "Not provided"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Phone Number</span>
                      </div>
                      <p className="text-sm">{client.phone}</p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Website</span>
                      </div>
                      <p className="text-sm">
                        {client.website ? (
                          <a
                            href={client.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {client.website}
                          </a>
                        ) : (
                          "Not provided"
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Business Address</span>
                      </div>
                      <p className="text-sm">
                        {client.address || "Not provided"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Business Type</span>
                      </div>
                      <p className="text-sm">
                        {client.businessType || "Not specified"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Activity className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Business Sector</span>
                      </div>
                      <p className="text-sm">
                        {client.businessSector || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                {client.description && (
                  <div className="space-y-2">
                    <span className="font-medium">Business Description</span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {client.description}
                    </p>
                  </div>
                )}

                {client.businessCertificate && (
                  <div className="space-y-2">
                    <span className="font-medium">Business Certificate</span>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Certificate uploaded</span>
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Activity Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Summary</CardTitle>
                <CardDescription>
                  Recent business activity and performance
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">SMS Messages</span>
                    <Badge variant="outline">
                      {client.stats.smsMessages.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">OTP Messages</span>
                    <Badge variant="outline">
                      {client.stats.otpMessages.toLocaleString()}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Templates</span>
                    <Badge variant="outline">{client.stats.templates}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Contact Groups</span>
                    <Badge variant="outline">
                      {client.stats.contactGroups}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Webhooks</span>
                    <Badge variant="outline">{client.stats.webhooks}</Badge>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">
                        Account Created
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(client.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Last Updated</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(client.updatedAt)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Last Active</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(client.lastActive)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Sender IDs */}
          <Card>
            <CardHeader>
              <CardTitle>Sender IDs</CardTitle>
              <CardDescription>
                Approved and pending sender IDs for this business
              </CardDescription>
            </CardHeader>
            <CardContent>
              {client.senderIds.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {client.senderIds.map((senderId) => (
                    <div key={senderId.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">{senderId.name}</span>
                        {getSenderIdStatusBadge(senderId.status)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created {formatDate(senderId.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No sender IDs registered
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Users associated with this business account
                  </CardDescription>
                </div>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite User
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Joined</TableHead>
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
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.isActive ? "default" : "destructive"}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.lastLogin
                          ? formatDateTime(user.lastLogin)
                          : "Never"}
                      </TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finance Tab - Updated */}
        <TabsContent value="finance">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Account Balances</CardTitle>
                <CardDescription>
                  Current balances across all account types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.accounts.map((account) => (
                  <div
                    key={account.id}
                    className="flex justify-between items-center p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium capitalize">
                        {account.type.toLowerCase()} Account
                      </p>
                      {account.type === "SMS" ? (
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCredits(account.balance)} credits
                        </p>
                      ) : (
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(account.balance, account.currency)}
                        </p>
                      )}
                    </div>
                    {account.type === "SMS" ? (
                      <MessageSquare className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <CreditCard className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
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
                      <TableHead>Account</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {client.recentTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          {formatDateTime(transaction.createdAt)}
                        </TableCell>
                        <TableCell>
                          {getTransactionTypeBadge(transaction.type)}
                        </TableCell>
                        <TableCell className="capitalize">
                          {transaction.accountType.toLowerCase()}
                        </TableCell>
                        <TableCell
                          className={
                            transaction.amount > 0
                              ? "text-green-600 font-medium"
                              : "text-red-600 font-medium"
                          }
                        >
                          {transaction.accountType === "SMS" ? (
                            <>
                              {transaction.amount > 0 ? "+" : ""}
                              {formatCredits(transaction.amount)} credits
                            </>
                          ) : (
                            <>
                              {transaction.amount > 0 ? "+" : ""}
                              {formatCurrency(Math.abs(transaction.amount))}
                            </>
                          )}
                        </TableCell>
                        <TableCell>
                          {transaction.accountType === "SMS"
                            ? `${formatCredits(transaction.balance)} credits`
                            : formatCurrency(transaction.balance)}
                        </TableCell>
                        <TableCell>{transaction.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {client.recentTransactions.length === 0 && (
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No transactions found
                    </p>
                  </div>
                )}

                {/* Pagination Controls */}
                {client.recentTransactions.length > 0 && (
                  <div className="flex items-center justify-between mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={transactionsPage === 1 || transactionsLoading}
                      onClick={() => fetchTransactions(transactionsPage - 1)}
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {transactionsPage}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={transactionsLoading}
                      onClick={() => fetchTransactions(transactionsPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Additional Financial Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(client.stats.totalSpent || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Lifetime value
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Monthly Average
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency((client.stats.totalSpent || 0) / 12)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Per month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">
                  Credit Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {client.stats.creditBalance > 0
                    ? `${Math.round(((client.stats.smsMessages + client.stats.otpMessages) / client.stats.creditBalance) * 100)}%`
                    : "0%"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Of purchased credits
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>API Configuration</CardTitle>
                <CardDescription>API keys and webhook settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">API Keys</p>
                    <p className="text-sm text-muted-foreground">
                      {client.stats.apiKeys} active keys
                    </p>
                  </div>
                  <Badge
                    variant={client.stats.apiKeys > 0 ? "default" : "secondary"}
                  >
                    {client.stats.apiKeys > 0 ? "Configured" : "Not Setup"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Webhooks</p>
                    <p className="text-sm text-muted-foreground">
                      {client.stats.webhooks} active webhooks
                    </p>
                  </div>
                  <Badge
                    variant={
                      client.stats.webhooks > 0 ? "default" : "secondary"
                    }
                  >
                    {client.stats.webhooks > 0 ? "Configured" : "Not Setup"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message Services</CardTitle>
                <CardDescription>SMS and OTP messaging usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">SMS Messages</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {client.stats.smsMessages.toLocaleString()}
                    </p>
                  </div>
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>

                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">OTP Messages</p>
                    <p className="text-2xl font-bold text-green-600">
                      {client.stats.otpMessages.toLocaleString()}
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Business security configuration and policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {client.settings ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Security Level</p>
                        <p className="text-sm text-muted-foreground capitalize">
                          {client.settings.securityLevel.toLowerCase()}
                        </p>
                      </div>
                      <Shield className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">MFA Required</p>
                        <p className="text-sm text-muted-foreground">
                          {client.settings.mfaRequired
                            ? "Enabled for all users"
                            : "Optional"}
                        </p>
                      </div>
                      <Badge
                        variant={
                          client.settings.mfaRequired ? "default" : "secondary"
                        }
                      >
                        {client.settings.mfaRequired ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Session Timeout</p>
                        <p className="text-sm text-muted-foreground">
                          {client.settings.sessionTimeout} minutes
                        </p>
                      </div>
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    </div>

                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">Max Login Attempts</p>
                        <p className="text-sm text-muted-foreground">
                          {client.settings.maxLoginAttempts} attempts
                        </p>
                      </div>
                      <AlertCircle className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No security settings configured
                  </p>
                  <Button className="mt-4">
                    <Shield className="h-4 w-4 mr-2" />
                    Configure Security
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
