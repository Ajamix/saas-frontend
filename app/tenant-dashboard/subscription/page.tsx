"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
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
import { getActiveSubscription, cancelSubscription, type Subscription, getTenantSubscriptions } from "@/app/api/subscriptions";

interface ApiResponse<T> {
  data: T[];
}

export default function TenantSubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [activeResponse, historyResponse] = await Promise.all([
        getActiveSubscription(),
        getTenantSubscriptions()
      ]);
      
      // Handle active subscription
      setSubscription(activeResponse.data || null);
      
      // Handle subscription history
      setSubscriptionHistory(historyResponse.data || []);
    } catch (error) {
      console.error('Failed to fetch subscription data:', error);
      toast.error("Failed to load subscription data");
      setSubscription(null);
      setSubscriptionHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;

    try {
      await cancelSubscription(subscription.id);
      toast.success("Subscription canceled successfully");
      fetchData();
      setCancelDialogOpen(false);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      toast.error("Failed to cancel subscription");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'canceled':
        return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
      case 'expired':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
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

  if (!subscription) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscription</h2>
          <p className="text-muted-foreground">Manage your subscription</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-6">
              <div className="text-muted-foreground">No active subscription found</div>
              <Button className="mt-4">
                View Plans
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Show subscription history even when no active subscription */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription History</CardTitle>
            <CardDescription>View your past subscriptions and billing history</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptionHistory.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                No subscription history found
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptionHistory.map((sub) => (
                  <div
                    key={sub.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{sub.plan?.name || 'Unknown Plan'}</div>
                      <div className="text-sm text-muted-foreground">
                        ${sub.plan?.price || 0}/{sub.plan?.interval || 'month'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sub.currentPeriodStart ? new Date(sub.currentPeriodStart).toLocaleDateString() : 'N/A'} - 
                        {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={getStatusColor(sub.status || 'expired')}>
                        {(sub.status?.charAt(0).toUpperCase() + sub.status?.slice(1)) || 'Unknown'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription</h2>
        <p className="text-muted-foreground">Manage your subscription</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription>Your subscription plan details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{subscription.plan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    ${subscription.plan.price}/{subscription.plan.interval}
                  </p>
                </div>
                <Badge className={getStatusColor(subscription.status)}>
                  {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="text-sm font-medium">Features</div>
                <ul className="space-y-2">
                  {subscription.plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">Current period ends</div>
                  <div className="font-medium">
                    {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
            <CardDescription>Manage your billing and subscription status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {subscription.status === 'active' && (
                <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">
                      Cancel Subscription
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Cancel Subscription</DialogTitle>
                      <DialogDescription>
                        Are you sure you want to cancel your subscription? You'll continue to have access until the end of your current billing period.
                      </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCancelDialogOpen(false)}>
                        Keep Subscription
                      </Button>
                      <Button variant="destructive" onClick={handleCancel}>
                        Yes, Cancel
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              {subscription.status === 'canceled' && (
                <div className="rounded-lg border-2 border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    <div>
                      <h4 className="font-medium text-yellow-800">Subscription Canceled</h4>
                      <p className="text-sm text-yellow-700">
                        Your subscription will end on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {subscription.status === 'expired' && (
                <div className="rounded-lg border-2 border-red-200 bg-red-50 p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-600" />
                    <div>
                      <h4 className="font-medium text-red-800">Subscription Expired</h4>
                      <p className="text-sm text-red-700">
                        Your subscription has expired. Please renew to continue accessing premium features.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="text-sm font-medium">Payment Method</div>
                {subscription.stripeCustomerId && (
                  <Button variant="outline" className="w-full">
                    Manage Payment Method
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="text-sm font-medium">Billing History</div>
                <Button variant="outline" className="w-full">
                  View Invoices
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscription History */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription History</CardTitle>
          <CardDescription>View your past subscriptions and billing history</CardDescription>
        </CardHeader>
        <CardContent>
          {subscriptionHistory.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No subscription history found
            </div>
          ) : (
            <div className="space-y-4">
              {subscriptionHistory.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{sub.plan?.name || 'Unknown Plan'}</div>
                    <div className="text-sm text-muted-foreground">
                      ${sub.plan?.price || 0}/{sub.plan?.interval || 'month'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {sub.currentPeriodStart ? new Date(sub.currentPeriodStart).toLocaleDateString() : 'N/A'} - 
                      {sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge className={getStatusColor(sub.status || 'expired')}>
                      {(sub.status?.charAt(0).toUpperCase() + sub.status?.slice(1)) || 'Unknown'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 