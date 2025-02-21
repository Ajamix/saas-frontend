"use client";

import { useEffect, useState } from "react";
import { getTenants, updateTenant, deleteTenant, type Tenant, type TenantsResponse } from "@/app/api/tenants";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Edit2, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export default function TenantsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TenantsResponse | null>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [deletingTenant, setDeletingTenant] = useState<Tenant | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [viewingTenant, setViewingTenant] = useState<Tenant | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchTenants();
  }, [page, limit, debouncedSearch]);

  const fetchTenants = async () => {
    try {
      setLoading(true);
      const response = await getTenants({
        page,
        limit,
        search: debouncedSearch,
      });
      setData(response);
    } catch (error) {
      toast.error("Failed to fetch tenants");
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleEdit = (tenant: Tenant) => {
    setEditingTenant(tenant);
    setEditDialogOpen(true);
  };

  const handleDelete = (tenant: Tenant) => {
    setDeletingTenant(tenant);
    setDeleteDialogOpen(true);
  };

  const handleViewTenant = (tenant: Tenant) => {
    setViewingTenant(tenant);
    setViewDialogOpen(true);
  };

  const handleUpdateTenant = async () => {
    if (!editingTenant) return;

    try {
      await updateTenant(editingTenant.id, {
        name: editingTenant.name,
        subdomain: editingTenant.subdomain,
        isActive: editingTenant.isActive,
      });
      toast.success("Tenant updated successfully");
      fetchTenants();
      setEditDialogOpen(false);
      setEditingTenant(null);
    } catch (error) {
      toast.error("Failed to update tenant");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTenant) return;

    try {
      await deleteTenant(deletingTenant.id);
      toast.success("Tenant deleted successfully");
      fetchTenants();
      setDeleteDialogOpen(false);
      setDeletingTenant(null);
    } catch (error) {
      toast.error("Failed to delete tenant");
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tenants</h2>
          <p className="text-muted-foreground">Manage your platform tenants</p>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tenants..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select
            value={limit.toString()}
            onValueChange={(value) => setLimit(Number(value))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rows per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 rows</SelectItem>
              <SelectItem value="10">10 rows</SelectItem>
              <SelectItem value="20">20 rows</SelectItem>
              <SelectItem value="50">50 rows</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subdomain</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Users</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    <div className="text-muted-foreground">Loading tenants...</div>
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    <div className="text-muted-foreground">No tenants found</div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <button
                        onClick={() => handleViewTenant(tenant)}
                        className="font-medium hover:underline text-left"
                      >
                        {tenant.name}
                      </button>
                    </TableCell>
                    <TableCell>{tenant.subdomain}</TableCell>
                    <TableCell>
                      <Badge
                        variant={tenant.isActive ? "default" : "secondary"}
                        className={cn(
                          tenant.isActive && "bg-green-500/10 text-green-600 hover:bg-green-500/20",
                          !tenant.isActive && "bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20"
                        )}
                      >
                        {tenant.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {tenant.users.map((user) => (
                          <div
                            key={user.id}
                            className="text-sm flex items-center gap-1.5"
                          >
                            <Badge
                              variant="outline"
                              className={cn(
                                "h-2 w-2 p-0 rounded-full",
                                user.isActive ? "bg-green-500" : "bg-zinc-500"
                              )}
                            />
                            {user.firstName} {user.lastName}
                            <span className="text-muted-foreground">
                              ({user.email})
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(tenant.createdAt), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(tenant)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(tenant)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {(page - 1) * limit + 1} to{" "}
              {Math.min(page * limit, data.total)} of {data.total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === 1}
                onClick={() => handlePageChange(page - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(
                (pageNumber) => (
                  <Button
                    key={pageNumber}
                    variant={pageNumber === page ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handlePageChange(pageNumber)}
                  >
                    {pageNumber}
                  </Button>
                )
              )}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={page === data.totalPages}
                onClick={() => handlePageChange(page + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tenant</DialogTitle>
            <DialogDescription>
              Update tenant details. These changes will affect the tenant's access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={editingTenant?.name ?? ""}
                onChange={(e) =>
                  setEditingTenant(
                    editingTenant
                      ? { ...editingTenant, name: e.target.value }
                      : null
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subdomain">Subdomain</Label>
              <Input
                id="subdomain"
                value={editingTenant?.subdomain ?? ""}
                onChange={(e) =>
                  setEditingTenant(
                    editingTenant
                      ? { ...editingTenant, subdomain: e.target.value }
                      : null
                  )
                }
              />
              <p className="text-sm text-muted-foreground">
                The subdomain will be used as {editingTenant?.subdomain}.yourdomain.com
              </p>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="tenant-status">Active Status</Label>
              <Switch
                id="tenant-status"
                checked={editingTenant?.isActive}
                onCheckedChange={(checked) =>
                  setEditingTenant(
                    editingTenant ? { ...editingTenant, isActive: checked } : null
                  )
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTenant}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Tenant Details</DialogTitle>
            <DialogDescription>
              Detailed information about the tenant and its users.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">Tenant Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Name</Label>
                    <p className="text-sm font-medium">{viewingTenant?.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Subdomain</Label>
                    <p className="text-sm font-medium">{viewingTenant?.subdomain}</p>
                  </div>
                  <div>
                    <Label className="text-xs">Status</Label>
                    <div className="mt-1">
                      <Badge
                        variant={viewingTenant?.isActive ? "default" : "secondary"}
                        className={cn(
                          viewingTenant?.isActive && "bg-green-500/10 text-green-600",
                          !viewingTenant?.isActive && "bg-zinc-500/10 text-zinc-500"
                        )}
                      >
                        {viewingTenant?.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Created</Label>
                    <p className="text-sm font-medium">
                      {viewingTenant?.createdAt && format(new Date(viewingTenant.createdAt), "PPP")}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-3">Users</h4>
                <div className="space-y-3">
                  {viewingTenant?.users.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            "h-2 w-2 p-0 rounded-full",
                            user.isActive ? "bg-green-500" : "bg-zinc-500"
                          )}
                        />
                        <div>
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              setViewDialogOpen(false);
              handleEdit(viewingTenant!);
            }}>
              Edit Tenant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the tenant
              and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 