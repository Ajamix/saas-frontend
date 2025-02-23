"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Check, CreditCard, AlertCircle } from "lucide-react";
import { getSubscriptionPlansForTenant, type SubscriptionPlan } from "@/app/api/subscription-plans";
import { getActiveGlobalSettings, type GlobalSettings } from "@/app/api/global-settings";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [payment, setPaymentSettings] = useState<GlobalSettings['paymentSettings'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansData] = await Promise.all([
        getSubscriptionPlansForTenant(),
      ]);
      
      // Only show active plans to tenants
      setPlans(plansData.filter(plan => plan.isActive));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (!payment?.currency) return `$${price}`;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: payment.currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPaymentMethods = () => {
    const methods = [];
    if (payment?.stripeEnabled) methods.push('Credit Card');
    if (payment?.paypalEnabled) methods.push('PayPal');
    return methods;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const paymentMethods = getPaymentMethods();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
        <p className="text-muted-foreground">Choose the perfect plan for your business</p>
      </div>

      {paymentMethods.length === 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Plans are currently unavailable. Please contact support for assistance.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className="flex flex-col relative overflow-hidden">
            {plan.interval === 'yearly' && (
              <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg text-sm">
                Best Value
              </div>
            )}
            <CardHeader>
              <div>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-6">
              <div className="flex items-baseline">
                <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
                <span className="text-muted-foreground ml-2">/{plan.interval}</span>
              </div>

              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-6">
              <div className="w-full space-y-3">
                <Button 
                  className="w-full" 
                  variant={plan.interval === 'yearly' ? "default" : "outline"}
                  disabled={paymentMethods.length === 0}
                >
                  <CreditCard className="mr-2 h-4 w-4" />
                  {paymentMethods.length > 0 ? 'Subscribe Now' : 'Currently Unavailable'}
                </Button>
                {paymentMethods.length > 0 && (
                  <p className="text-xs text-center text-muted-foreground">
                    Supports: {paymentMethods.join(' / ')}
                  </p>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
} 