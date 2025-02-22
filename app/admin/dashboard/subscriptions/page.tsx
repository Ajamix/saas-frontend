"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit2, Calendar } from "lucide-react";
import { toast } from "sonner";
import { getAllSubscriptions, createSubscription, updateSubscription, type Subscription, type CreateSubscriptionDto } from "@/app/api/subscriptions";
import { getSubscriptionPlans, type SubscriptionPlan } from "@/app/api/subscription-plans";
import { getTenants, type Tenant } from "@/app/api/tenants";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [formData, setFormData] = useState<Partial<CreateSubscriptionDto>>({
    status: 'active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsData, plansData, tenantsData] = await Promise.all([
        getAllSubscriptions(),
        getSubscriptionPlans(),
        getTenants()
      ]);
      setSubscriptions(subsData.data);
      setPlans(plansData);
      setTenants(tenantsData.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error("Failed to load subscriptions data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingSubscription) {
        if (!formData.planId) {
          toast.error("Please select a plan");
          return;
        }
      } else {
        if (!formData.tenantId || !formData.planId) {
          toast.error("Please select both tenant and plan");
          return;
        }
      }

      const selectedPlan = plans.find(p => p.id === formData.planId);
      if (!selectedPlan) return;

      // Set period dates based on plan interval
      const now = new Date();
      const periodEnd = new Date(now);
      if (selectedPlan.interval === 'monthly') {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      } else {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      }

      const data = {
        ...formData,
        currentPeriodStart: now,
        currentPeriodEnd: periodEnd,
      } as CreateSubscriptionDto;

      if (editingSubscription) {
        await updateSubscription(editingSubscription.id, data);
        toast.success("Subscription updated successfully");
      } else {
        await createSubscription(data);
        toast.success("Subscription created successfully");
      }

      setOpenDialog(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Failed to submit subscription:', error);
      toast.error("Failed to save subscription");
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setFormData({
      planId: subscription.planId,
      status: subscription.status,
      currentPeriodStart: new Date(subscription.currentPeriodStart),
      currentPeriodEnd: new Date(subscription.currentPeriodEnd),
      stripeCustomerId: subscription.stripeCustomerId || '',
      stripeSubscriptionId: subscription.stripeSubscriptionId || '',
      paypalSubscriptionId: subscription.paypalSubscriptionId || '',
      metadata: subscription.metadata || {}
    });
    setEditingSubscription(subscription);
    setOpenDialog(true);
  };

  const resetForm = () => {
    setEditingSubscription(null);
    setFormData({
      status: 'active'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'canceled':
        return 'bg-yellow-100 text-yellow-700';
      case 'expired':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscriptions</h2>
          <p className="text-muted-foreground">Manage tenant subscriptions</p>
        </div>
        <Dialog open={openDialog} onOpenChange={(open) => {
          setOpenDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Subscription
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingSubscription ? 'Edit' : 'Create'} Subscription</DialogTitle>
              <DialogDescription>
                {editingSubscription 
                  ? "Update the subscription details" 
                  : "Create a new subscription for a tenant"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {editingSubscription ? (
                <div className="space-y-2">
                  <Label>Tenant</Label>
                  <div className="p-2 border rounded-md bg-muted">
                    {tenants.find(t => t.id === editingSubscription.tenantId)?.name || 'Unknown Tenant'}
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="tenantId">Tenant</Label>
                  <Select
                    value={formData.tenantId}
                    onValueChange={(value) => setFormData({ ...formData, tenantId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select tenant" />
                    </SelectTrigger>
                    <SelectContent>
                      {tenants.map((tenant) => (
                        <SelectItem key={tenant.id} value={tenant.id}>
                          {tenant.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="planId">Subscription Plan</Label>
                <Select
                  value={formData.planId}
                  onValueChange={(value) => setFormData({ ...formData, planId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - ${plan.price}/{plan.interval}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: 'active' | 'canceled' | 'expired') => 
                    setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="canceled">Canceled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingSubscription ? 'Save Changes' : 'Create Subscription'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {subscriptions.map((subscription) => {
              const tenant = tenants.find(t => t.id === subscription.tenantId);
              return (
                <div
                  key={subscription.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{tenant?.name || 'Unknown Tenant'}</div>
                    <div className="text-sm text-muted-foreground">
                      {subscription.plan.name} - ${subscription.plan.price}/{subscription.plan.interval}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Expires: {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                    <Badge className={getStatusColor(subscription.status)}>
                      {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(subscription)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}

            {subscriptions.length === 0 && (
              <div className="text-center py-6">
                <div className="text-muted-foreground">No subscriptions found</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 