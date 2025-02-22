"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit2, Trash2, Shield, Users, UserCircle, Bell, Settings, ScrollText, LayoutDashboard } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { getRoles, createRole, updateRole, deleteRole, type Role, type Permission } from "@/app/api/roles";
import { getPermissions } from "@/app/api/permissions";
import TokenService from "@/app/lib/auth/tokens";
import { Checkbox } from "@/components/ui/checkbox";
import { hasPermission } from "@/app/lib/utils";

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    permissionIds: [] as string[]
  });
  const [openCombobox, setOpenCombobox] = useState(false);

  const canCreateRole = hasPermission('roles', 'create');
  const canUpdateRole = hasPermission('roles', 'update');
  const canDeleteRole = hasPermission('roles', 'delete');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [rolesData, permissionsData] = await Promise.all([
        getRoles(),
        getPermissions()
      ]);
      setRoles(rolesData || []);
      setPermissions(permissionsData || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error("Failed to fetch data");
      setRoles([]);
      setPermissions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name) {
        toast.error("Role name is required");
        return;
      }

      const data = {
        name: formData.name,
        description: formData.description,
        permissionIds: formData.permissionIds || []
      };

      if (editingRole) {
        await updateRole(editingRole.id, data);
        toast.success("Role updated successfully");
      } else {
        await createRole(data);
        toast.success("Role created successfully");
      }

      setOpenDialog(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(editingRole ? "Failed to update role" : "Failed to create role");
    }
  };

  const handleEdit = (role: Role) => {
    if (role.isDefault) {
      toast.error("Default roles cannot be edited");
      return;
    }
    if (!canUpdateRole) {
      toast.error("You don't have permission to edit roles");
      return;
    }
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || "",
      permissionIds: role.permissions?.map(p => p.id) || []
    });
    setOpenDialog(true);
  };

  const handleDelete = async (role: Role) => {
    if (role.isDefault) {
      toast.error("Default roles cannot be deleted");
      return;
    }
    if (!canDeleteRole) {
      toast.error("You don't have permission to delete roles");
      return;
    }
    try {
      await deleteRole(role.id);
      toast.success("Role deleted successfully");
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete role");
    }
  };

  const resetForm = () => {
    setEditingRole(null);
    setFormData({
      name: "",
      description: "",
      permissionIds: []
    });
  };

  const groupPermissionsByResource = () => {
    if (!Array.isArray(permissions) || permissions.length === 0) {
      return {};
    }
    
    return permissions.reduce((acc, permission) => {
      const resource = permission?.resource || 'other';
      if (!acc[resource]) {
        acc[resource] = [];
      }
      acc[resource].push(permission);
      return acc;
    }, {} as Record<string, Permission[]>);
  };

  const getPermissionById = (id: string) => {
    return permissions.find(p => p.id === id);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const groupedPermissions = groupPermissionsByResource();
  console.log("groupedPermissions:", groupedPermissions);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Roles & Permissions</h2>
          <p className="text-muted-foreground">Manage roles and their permissions</p>
        </div>
        {canCreateRole && (
          <Dialog open={openDialog} onOpenChange={(open) => {
            if (!open) resetForm();
            setOpenDialog(open);
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Role
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRole ? 'Edit Role' : 'Create New Role'}</DialogTitle>
                <DialogDescription>
                  {editingRole ? 'Edit role details and permissions below.' : 'Add a new role with specific permissions.'}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-5 gap-6 py-4">
                {/* Left Column - Role Details */}
                <div className="col-span-2 space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-base font-semibold">Role Details</Label>
                      <p className="text-sm text-muted-foreground">Basic information about the role</p>
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Role Name</Label>
                        <Input
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Team Manager"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe the role's responsibilities"
                          className="min-h-[120px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Permissions */}
                <div className="col-span-3 space-y-4">
                  <div>
                    <Label className="text-base font-semibold">Permissions</Label>
                    <p className="text-sm text-muted-foreground">Select the permissions for this role</p>
                  </div>
                  <div className="border rounded-lg shadow-sm">
                    <div className="p-3 bg-muted/50 border-b">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Available Permissions</span>
                        <Badge variant="secondary">
                          {formData.permissionIds.length} selected
                        </Badge>
                      </div>
                    </div>
                    <div className="divide-y">
                      {Object.entries(groupPermissionsByResource()).map(([resource, perms]) => (
                        <div key={resource} className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium text-sm flex items-center gap-2">
                              {resource === 'users' && <Users className="h-4 w-4 text-blue-500" />}
                              {resource === 'roles' && <Shield className="h-4 w-4 text-orange-500" />}
                              {resource === 'profiles' && <UserCircle className="h-4 w-4 text-purple-500" />}
                              {resource === 'notifications' && <Bell className="h-4 w-4 text-yellow-500" />}
                              {resource === 'tenant_settings' && <Settings className="h-4 w-4 text-green-500" />}
                              {resource === 'activity_logs' && <ScrollText className="h-4 w-4 text-red-500" />}
                              {resource === 'dashboard' && <LayoutDashboard className="h-4 w-4 text-cyan-500" />}
                              {resource.replace(/_/g, ' ').toUpperCase()}
                            </h4>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 text-xs"
                              onClick={() => {
                                const resourcePermissionIds = perms.map(p => p.id);
                                const allSelected = resourcePermissionIds.every(id => 
                                  formData.permissionIds.includes(id)
                                );
                                
                                setFormData(prev => ({
                                  ...prev,
                                  permissionIds: allSelected
                                    ? prev.permissionIds.filter(id => !resourcePermissionIds.includes(id))
                                    : [...new Set([...prev.permissionIds, ...resourcePermissionIds])]
                                }));
                              }}
                            >
                              {perms.every(p => formData.permissionIds.includes(p.id))
                                ? "Deselect All"
                                : "Select All"}
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 gap-2">
                            {perms.map((permission) => (
                              <label
                                key={permission.id}
                                className={cn(
                                  "flex items-center space-x-3 cursor-pointer p-2 rounded-md transition-colors",
                                  "hover:bg-accent hover:text-accent-foreground",
                                  formData.permissionIds.includes(permission.id) && "bg-accent/50"
                                )}
                              >
                                <Checkbox
                                  checked={formData.permissionIds.includes(permission.id)}
                                  onCheckedChange={(checked: boolean) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      permissionIds: checked
                                        ? [...prev.permissionIds, permission.id]
                                        : prev.permissionIds.filter(id => id !== permission.id)
                                    }));
                                  }}
                                />
                                <div className="grid gap-1.5 leading-none">
                                  <span className="text-sm font-medium">
                                    {permission.description}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {permission.name}
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                      {Object.keys(groupPermissionsByResource()).length === 0 && (
                        <div className="p-8 text-center">
                          <Shield className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-sm font-medium">No Permissions Available</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            There are no permissions configured for this tenant.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter className="mt-6">
                <Button variant="outline" onClick={() => setOpenDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!formData.name}>
                  {editingRole ? 'Update Role' : 'Create Role'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid gap-6">
        {roles.map((role) => (
          <Card key={role.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {role.name}
                    <Shield className="h-4 w-4 text-orange-500" />
                    {role.isDefault && (
                      <Badge variant="secondary" className="ml-2">
                        Default Role
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {canUpdateRole && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEdit(role)}
                      disabled={role.isDefault}
                      title={role.isDefault ? "Default roles cannot be edited" : "Edit role"}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  )}
                  {canDeleteRole && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(role)}
                      disabled={role.isDefault}
                      title={role.isDefault ? "Default roles cannot be deleted" : "Delete role"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium mb-2">Permissions</h4>
                  <div className="flex flex-wrap gap-2">
                    {role.permissions?.map((permission) => (
                      <Badge key={permission.id} variant="secondary">
                        {permission.description}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 