"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Calendar, Filter } from "lucide-react";
import { getAllActivityLogs, type ActivityLog, type GetActivityLogsParams } from "@/app/api/activity-logs";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

const LOG_TYPES = [
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "SUBSCRIPTION_CHANGE",
  "ROLE_CHANGE",
  "PERMISSION_CHANGE",
  "SETTINGS_CHANGE",
  "NOTIFICATION_SENT",
  "OTHER"
];

export default function AdminActivityLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit] = useState(10);

  useEffect(() => {
    fetchLogs();
  }, [currentPage, searchQuery, selectedType]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params: GetActivityLogsParams = {
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        type: selectedType || undefined,
      };

      const response = await getAllActivityLogs(params);
      setLogs(response.data);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Failed to fetch activity logs:', error);
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value === 'all' ? null : value);
    setCurrentPage(1);
  };

  const getLogTypeColor = (type: string) => {
    switch (type) {
      case 'CREATE':
        return 'bg-green-500';
      case 'UPDATE':
        return 'bg-blue-500';
      case 'DELETE':
        return 'bg-red-500';
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-purple-500';
      case 'SUBSCRIPTION_CHANGE':
        return 'bg-pink-500';
      case 'ROLE_CHANGE':
      case 'PERMISSION_CHANGE':
        return 'bg-orange-500';
      case 'SETTINGS_CHANGE':
        return 'bg-yellow-500';
      case 'NOTIFICATION_SENT':
        return 'bg-cyan-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatDetails = (details: any) => {
    if (!details) return 'No details available';
    
    // For now, just show basic info
    const parts = [];
    if (details.notificationType) {
      parts.push(`Type: ${details.notificationType}`);
    }
    if (details.channels?.length) {
      parts.push(`Channels: ${details.channels.join(', ')}`);
    }
    return parts.join(' | ') || 'No details available';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">System Activity Logs</h2>
        <p className="text-muted-foreground">Monitor activities across all tenants</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search activity logs..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <Select value={selectedType || undefined} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {LOG_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type.replace(/_/g, ' ')}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Activity History</CardTitle>
          <CardDescription>All activities and events across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No activity logs found
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className={getLogTypeColor(log.type)}>
                        {log.type.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(log.createdAt), 'PPpp')}
                      </span>
                    </div>
                    <p className="font-medium">{log.action}</p>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{formatDetails(log.details)}</p>
                      <p>Tenant ID: {log.tenantId}</p>
                      <p>User ID: {log.userId}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className="mt-6 flex justify-center">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 