// app/dashboard/operations/api-health/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, Filter, Download, RefreshCw, Server, Activity, Clock, AlertTriangle, CheckCircle, XCircle, Wifi, WifiOff, BarChart3 } from "lucide-react";

// Mock data for API health monitoring
const mockApiEndpoints = [
  {
    id: "1",
    name: "SMS API - Nalo",
    url: "https://api.nalosolutions.com/sms",
    status: "healthy",
    responseTime: 120,
    uptime: 99.98,
    lastChecked: new Date("2024-06-15T10:30:00"),
    lastIncident: new Date("2024-06-10T14:20:00"),
    errorRate: 0.02,
    throughput: 1250,
    business: {
      id: "1",
      name: "Tech Solutions Ltd"
    }
  },
  {
    id: "2",
    name: "SMS API - Hubtel",
    url: "https://api.hubtel.com/v1/messages",
    status: "degraded",
    responseTime: 450,
    uptime: 99.85,
    lastChecked: new Date("2024-06-15T10:29:00"),
    lastIncident: new Date("2024-06-15T09:45:00"),
    errorRate: 0.15,
    throughput: 890,
    business: {
      id: "2",
      name: "Retail Plus GH"
    }
  },
  {
    id: "3",
    name: "WhatsApp API",
    url: "https://graph.facebook.com/v18.0/messages",
    status: "healthy",
    responseTime: 180,
    uptime: 99.99,
    lastChecked: new Date("2024-06-15T10:28:00"),
    lastIncident: new Date("2024-06-05T11:30:00"),
    errorRate: 0.01,
    throughput: 450,
    business: {
      id: "3",
      name: "Logistics Express"
    }
  },
  {
    id: "4",
    name: "Payment Gateway",
    url: "https://api.paystack.co/transaction",
    status: "down",
    responseTime: 0,
    uptime: 99.70,
    lastChecked: new Date("2024-06-15T10:25:00"),
    lastIncident: new Date("2024-06-15T10:15:00"),
    errorRate: 0.30,
    throughput: 0,
    business: {
      id: "4",
      name: "QuickPay Financial"
    }
  },
  {
    id: "5",
    name: "Email Service",
    url: "https://api.sendgrid.com/v3/mail/send",
    status: "healthy",
    responseTime: 210,
    uptime: 99.95,
    lastChecked: new Date("2024-06-15T10:27:00"),
    lastIncident: new Date("2024-06-12T16:10:00"),
    errorRate: 0.05,
    throughput: 320,
    business: {
      id: "5",
      name: "MediCare Health Services"
    }
  }
];

const mockIncidents = [
  {
    id: "1",
    endpointId: "4",
    endpointName: "Payment Gateway",
    severity: "critical",
    description: "Payment processing service unavailable",
    startTime: new Date("2024-06-15T10:15:00"),
    endTime: null,
    status: "ongoing"
  },
  {
    id: "2",
    endpointId: "2",
    endpointName: "SMS API - Hubtel",
    severity: "warning",
    description: "Increased response times detected",
    startTime: new Date("2024-06-15T09:45:00"),
    endTime: null,
    status: "monitoring"
  },
  {
    id: "3",
    endpointId: "1",
    endpointName: "SMS API - Nalo",
    severity: "info",
    description: "Scheduled maintenance window",
    startTime: new Date("2024-06-10T14:20:00"),
    endTime: new Date("2024-06-10T15:20:00"),
    status: "resolved"
  }
];

export default function ApiHealthPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [apiEndpoints, setApiEndpoints] = useState(mockApiEndpoints);
  const [incidents, setIncidents] = useState(mockIncidents);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("endpoints");

  const filteredEndpoints = apiEndpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      endpoint.business.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || endpoint.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeIncidents = incidents.filter(incident => incident.status !== "resolved");

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(2)}%`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 hover:bg-green-100"><CheckCircle className="h-3 w-3" /> Healthy</Badge>;
      case "degraded":
        return <Badge variant="secondary" className="flex items-center gap-1 bg-amber-100 text-amber-800 hover:bg-amber-100"><AlertTriangle className="h-3 w-3" /> Degraded</Badge>;
      case "down":
        return <Badge variant="destructive" className="flex items-center gap-1"><XCircle className="h-3 w-3" /> Down</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "warning":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Warning</Badge>;
      case "info":
        return <Badge variant="default" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Info</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  const getIncidentStatusBadge = (status: string) => {
    switch (status) {
      case "ongoing":
        return <Badge variant="destructive">Ongoing</Badge>;
      case "monitoring":
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Monitoring</Badge>;
      case "resolved":
        return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Resolved</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getResponseTimeColor = (responseTime: number) => {
    if (responseTime === 0) return "text-red-600";
    if (responseTime <= 200) return "text-green-600";
    if (responseTime <= 500) return "text-amber-600";
    return "text-red-600";
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call to refresh health status
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  const handleTestEndpoint = (endpoint: any) => {
    console.log("Testing endpoint:", endpoint.id);
    // Implement endpoint testing logic
  };

  const handleViewMetrics = (endpoint: any) => {
    console.log("View metrics for:", endpoint.id);
    // Implement metrics view logic
  };

  // Calculate overall stats
  const stats = {
    totalEndpoints: apiEndpoints.length,
    healthy: apiEndpoints.filter(e => e.status === 'healthy').length,
    degraded: apiEndpoints.filter(e => e.status === 'degraded').length,
    down: apiEndpoints.filter(e => e.status === 'down').length,
    activeIncidents: activeIncidents.length,
    avgResponseTime: apiEndpoints.reduce((acc, e) => acc + e.responseTime, 0) / apiEndpoints.length,
    avgUptime: apiEndpoints.reduce((acc, e) => acc + e.uptime, 0) / apiEndpoints.length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Health Monitor</h1>
          <p className="text-muted-foreground">
            Monitor the health and performance of all API endpoints
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh All
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEndpoints}</div>
            <p className="text-xs text-muted-foreground">
              Monitored APIs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Healthy</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.healthy}</div>
            <p className="text-xs text-muted-foreground">
              Operating normally
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.activeIncidents}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgResponseTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">
              Across all endpoints
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Incidents Alert */}
      {activeIncidents.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Active Incidents ({activeIncidents.length})
            </CardTitle>
            <CardDescription className="text-red-700">
              There are ongoing issues that require attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeIncidents.map(incident => (
                <div key={incident.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                  <div className="flex items-center gap-3">
                    {getSeverityBadge(incident.severity)}
                    <div>
                      <div className="font-medium">{incident.endpointName}</div>
                      <div className="text-sm text-muted-foreground">{incident.description}</div>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Started: {formatDate(incident.startTime)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs for Endpoints and Incidents */}
      <div className="flex space-x-1 rounded-lg bg-muted p-1">
        <Button
          variant={activeTab === "endpoints" ? "default" : "ghost"}
          className="flex-1"
          onClick={() => setActiveTab("endpoints")}
        >
          <Server className="h-4 w-4 mr-2" />
          API Endpoints
        </Button>
        <Button
          variant={activeTab === "incidents" ? "default" : "ghost"}
          className="flex-1"
          onClick={() => setActiveTab("incidents")}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Incidents ({incidents.length})
        </Button>
      </div>

      {/* API Endpoints Table */}
      {activeTab === "endpoints" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>API Endpoints</CardTitle>
                <CardDescription>
                  Monitor health status and performance metrics for all API endpoints
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search endpoints..."
                    className="pl-8 w-full sm:w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
                      <Filter className="h-4 w-4 mr-2" />
                      Status
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Status</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("healthy")}>Healthy</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("degraded")}>Degraded</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("down")}>Down</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>API Endpoint</TableHead>
                  <TableHead>Business</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>Error Rate</TableHead>
                  <TableHead>Throughput</TableHead>
                  <TableHead>Last Checked</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEndpoints.map((endpoint) => (
                  <TableRow key={endpoint.id} className={
                    endpoint.status === 'down' ? "bg-red-50" : 
                    endpoint.status === 'degraded' ? "bg-amber-50" : ""
                  }>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{endpoint.name}</span>
                        <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                          {endpoint.url}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {endpoint.business.name}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(endpoint.status)}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${getResponseTimeColor(endpoint.responseTime)}`}>
                        {endpoint.responseTime > 0 ? `${endpoint.responseTime}ms` : 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatUptime(endpoint.uptime)}
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        endpoint.errorRate > 0.1 ? 'text-red-600' : 
                        endpoint.errorRate > 0.05 ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {endpoint.errorRate}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {endpoint.throughput.toLocaleString()}/hr
                      </span>
                    </TableCell>
                    <TableCell>
                      {formatDate(endpoint.lastChecked)}
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
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleTestEndpoint(endpoint)}
                            >
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Test Endpoint
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="cursor-pointer"
                              onClick={() => handleViewMetrics(endpoint)}
                            >
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Metrics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer">
                              View Logs
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredEndpoints.length === 0 && (
              <div className="text-center py-8">
                <Server className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No API endpoints found matching your criteria</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Incidents Table */}
      {activeTab === "incidents" && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Incident History</CardTitle>
                <CardDescription>
                  Track and manage all API incidents and outages
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>End Time</TableHead>
                  <TableHead>Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incidents.map((incident) => (
                  <TableRow key={incident.id} className={
                    incident.severity === 'critical' ? "bg-red-50" : 
                    incident.severity === 'warning' ? "bg-amber-50" : ""
                  }>
                    <TableCell className="font-medium">
                      {incident.endpointName}
                    </TableCell>
                    <TableCell>
                      {getSeverityBadge(incident.severity)}
                    </TableCell>
                    <TableCell>
                      {incident.description}
                    </TableCell>
                    <TableCell>
                      {getIncidentStatusBadge(incident.status)}
                    </TableCell>
                    <TableCell>
                      {formatDate(incident.startTime)}
                    </TableCell>
                    <TableCell>
                      {incident.endTime ? formatDate(incident.endTime) : "Ongoing"}
                    </TableCell>
                    <TableCell>
                      {incident.endTime ? 
                        `${Math.round((incident.endTime.getTime() - incident.startTime.getTime()) / 60000)}min` : 
                        `${Math.round((new Date().getTime() - incident.startTime.getTime()) / 60000)}min`
                      }
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {incidents.length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No incidents recorded</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All systems are operating normally
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}