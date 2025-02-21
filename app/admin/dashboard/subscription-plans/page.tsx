"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Check, X, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SubscriptionPlan, getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan } from "@/app/api/subscription-plans";

interface FormData {
  name: string;
  description: string;
  price: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    interval: 'monthly',
    features: [''],
    isActive: true
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const data = await getSubscriptionPlans();
      setPlans(data);
    } catch (error) {
      toast.error("Failed to fetch subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handleAddFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({
      ...prev,
      features: newFeatures
    }));
  };

  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      const planData = {
        ...formData,
        price: Number(formData.price),
        features: formData.features.filter(f => f.trim() !== ''),
        interval: formData.interval
      };

      if (editingPlan) {
        await updateSubscriptionPlan(editingPlan.id, planData);
        toast.success("Plan updated successfully");
      } else {
        await createSubscriptionPlan(planData);
        toast.success("Plan created successfully");
      }

      setOpenDialog(false);
      fetchPlans();
      resetForm();
    } catch (error) {
      toast.error(editingPlan ? "Failed to update plan" : "Failed to create plan");
    }
  };

  const handleEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price.toString(),
      interval: plan.interval,
      features: plan.features,
      isActive: plan.isActive
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscriptionPlan(id);
      toast.success("Plan deleted successfully");
      fetchPlans();
    } catch (error) {
      toast.error("Failed to delete plan");
    }
  };

  const resetForm = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      description: '',
      price: '',
      interval: 'monthly',
      features: [''],
      isActive: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-muted-foreground">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Subscription Plans</h2>
          <p className="text-muted-foreground">Manage your subscription plans</p>
        </div>
        <Dialog open={openDialog} onOpenChange={(open: boolean) => {
          if (!open) resetForm();
          setOpenDialog(open);
        }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
              <DialogDescription>
                {editingPlan ? 'Edit your subscription plan details below.' : 'Add a new subscription plan to your platform.'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Professional Plan"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the plan's benefits"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                      className="pl-8"
                      placeholder="29.99"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Billing Interval</Label>
                  <Select
                    value={formData.interval}
                    onValueChange={(value: 'monthly' | 'yearly') => setFormData(prev => ({ ...prev, interval: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Features</Label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={feature}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => handleFeatureChange(index, e.target.value)}
                      placeholder="e.g., Unlimited storage"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveFeature(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddFeature}
                  className="mt-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feature
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked: boolean) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.id} className={`hover:shadow-lg transition-shadow ${!plan.isActive && 'opacity-60'}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {plan.name}
                    {!plan.isActive && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Inactive
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(plan)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(plan.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.interval}</span>
              </div>
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 