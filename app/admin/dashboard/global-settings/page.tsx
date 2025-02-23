"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getActiveGlobalSettings,
  updateSmtpSettings,
  updateNotificationSettings,
  updatePaymentSettings,
  updateSystemSettings,
  type GlobalSettings,
  type SmtpSettings,
  type NotificationSettings,
  type PaymentSettings,
  type SystemSettings
} from "@/app/api/global-settings";

const defaultSettings: GlobalSettings = {
  id: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
  smtpSettings: {
    from: '',
    host: '',
    port: 587,
    user: '',
    secure: false,
    fromName: '',
    password: '',
  },
  notificationSettings: {
    notificationTypes: {
      passwordReset: true,
      systemUpdates: true,
      paymentReminders: true,
      userRegistration: true,
      subscriptionChanges: true,
    },
    defaultEmailTemplate: 'default',
    enablePushNotifications: false,
    enableEmailNotifications: true,
    enableInAppNotifications: true,
  },
  paymentSettings: {
    currency: 'USD',
    paypalEnabled: false,
    stripeEnabled: false,
    paypalClientId: '',
    stripePublicKey: '',
    stripeSecretKey: '',
    paypalEnvironment: 'sandbox',
    paypalClientSecret: '',
    stripeWebhookSecret: '',
  },
  systemSettings: {
    passwordPolicy: {
      minLength: 8,
      requireNumbers: true,
      requireLowercase: true,
      requireUppercase: true,
      requireSpecialChars: true,
    },
    sessionTimeout: 3600,
    defaultUserRole: 'user',
    maintenanceMode: false,
    maintenanceMessage: '',
    allowUserRegistration: true,
    requireEmailVerification: true,
  },
  isActive: true,
  metadata: null,
};

export default function GlobalSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<GlobalSettings | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getActiveGlobalSettings();
      console.log('Fetched settings:', data);
      if (data && data.length > 0) {
        const activeSettings = data[0];
        console.log('Using active settings:', activeSettings);
        setSettings(activeSettings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error("Failed to fetch settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSmtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const smtpData: SmtpSettings = {
        host: formData.get('host') as string,
        port: parseInt(formData.get('port') as string),
        user: formData.get('user') as string,
        password: formData.get('password') as string,
        from: formData.get('from') as string,
        fromName: formData.get('fromName') as string,
        secure: formData.get('secure') === 'on'
      };

      await updateSmtpSettings(settings.id, smtpData);
      toast.success("SMTP settings updated successfully");
      fetchSettings();
    } catch (error) {
      toast.error("Failed to update SMTP settings");
    } finally {
      setSaving(false);
    }
  };

  const handleNotificationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const notificationData: NotificationSettings = {
        enableEmailNotifications: formData.get('enableEmailNotifications') === 'on',
        enablePushNotifications: formData.get('enablePushNotifications') === 'on',
        enableInAppNotifications: formData.get('enableInAppNotifications') === 'on',
        defaultEmailTemplate: formData.get('defaultEmailTemplate') as string,
        notificationTypes: {
          passwordReset: formData.get('passwordReset') === 'on',
          systemUpdates: formData.get('systemUpdates') === 'on',
          paymentReminders: formData.get('paymentReminders') === 'on',
          userRegistration: formData.get('userRegistration') === 'on',
          subscriptionChanges: formData.get('subscriptionChanges') === 'on'
        }
      };

      await updateNotificationSettings(settings.id, notificationData);
      toast.success("Notification settings updated successfully");
      fetchSettings();
    } catch (error) {
      toast.error("Failed to update notification settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePaymentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!settings) {
      console.error('No settings object available');
      toast.error("Settings not loaded");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      
      // Log the raw form data
      console.log('Raw form data:', Object.fromEntries(formData.entries()));

      const paymentData: PaymentSettings = {
        stripeEnabled: formData.get('stripeEnabled') === 'on',
        stripePublicKey: (formData.get('stripePublicKey') as string)?.trim() || '',
        stripeSecretKey: (formData.get('stripeSecretKey') as string)?.trim() || '',
        stripeWebhookSecret: (formData.get('stripeWebhookSecret') as string)?.trim() || '',
        paypalEnabled: formData.get('paypalEnabled') === 'on',
        paypalClientId: (formData.get('paypalClientId') as string)?.trim() || '',
        paypalClientSecret: (formData.get('paypalClientSecret') as string)?.trim() || '',
        paypalEnvironment: (formData.get('paypalEnvironment') as 'sandbox' | 'production') || 'sandbox',
        currency: (formData.get('currency') as string)?.trim() || 'USD'
      };

      // Log the constructed payment data and the settings ID
      console.log('Settings ID:', settings.id);
      console.log('Payment data being sent:', { ...paymentData, stripeSecretKey: '***', paypalClientSecret: '***' });

      // Make the API call
      const updatedSettings = await updatePaymentSettings(settings.id, paymentData);
      console.log('Payment settings updated successfully');
      console.log('Updated settings:', {
        payment: updatedSettings.paymentSettings,
        paymentSettings: updatedSettings.paymentSettings
      });

      // Verify that both payment and paymentSettings were updated
      if (!updatedSettings.paymentSettings || !updatedSettings.paymentSettings) {
        console.warn('Payment settings might not be fully updated');
      }

      toast.success("Payment settings updated successfully");
      await fetchSettings();
    } catch (error) {
      console.error('Failed to update payment settings:', error);
      toast.error("Failed to update payment settings");
    } finally {
      setSaving(false);
    }
  };

  const handleSystemSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const formData = new FormData(e.currentTarget);
      const systemData: SystemSettings = {
        sessionTimeout: parseInt(formData.get('sessionTimeout') as string),
        defaultUserRole: formData.get('defaultUserRole') as string,
        maintenanceMode: formData.get('maintenanceMode') === 'on',
        maintenanceMessage: formData.get('maintenanceMessage') as string,
        allowUserRegistration: formData.get('allowUserRegistration') === 'on',
        requireEmailVerification: formData.get('requireEmailVerification') === 'on',
        passwordPolicy: {
          minLength: parseInt(formData.get('minLength') as string),
          requireNumbers: formData.get('requireNumbers') === 'on',
          requireLowercase: formData.get('requireLowercase') === 'on',
          requireUppercase: formData.get('requireUppercase') === 'on',
          requireSpecialChars: formData.get('requireSpecialChars') === 'on'
        }
      };

      await updateSystemSettings(settings.id, systemData);
      toast.success("System settings updated successfully");
      fetchSettings();
    } catch (error) {
      toast.error("Failed to update system settings");
    } finally {
      setSaving(false);
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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Global Settings</h2>
        <p className="text-muted-foreground">
          Manage your application's global settings and configurations
        </p>
      </div>

      <Tabs defaultValue="smtp" className="space-y-6">
        <TabsList>
          <TabsTrigger value="smtp">SMTP</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="smtp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
              <CardDescription>Configure your email server settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSmtpSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="host">SMTP Host</Label>
                    <Input
                      id="host"
                      name="host"
                      defaultValue={settings?.smtpSettings.host}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="port">SMTP Port</Label>
                    <Input
                      id="port"
                      name="port"
                      type="number"
                      defaultValue={settings?.smtpSettings.port}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user">SMTP User</Label>
                    <Input
                      id="user"
                      name="user"
                      defaultValue={settings?.smtpSettings.user}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">SMTP Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      defaultValue={settings?.smtpSettings.password}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="from">From Email</Label>
                    <Input
                      id="from"
                      name="from"
                      type="email"
                      defaultValue={settings?.smtpSettings.from}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fromName">From Name</Label>
                    <Input
                      id="fromName"
                      name="fromName"
                      defaultValue={settings?.smtpSettings.fromName}
                      required
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="secure"
                    name="secure"
                    defaultChecked={settings?.smtpSettings.secure}
                  />
                  <Label htmlFor="secure">Use SSL/TLS</Label>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure notification preferences and templates</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="defaultEmailTemplate">Default Email Template</Label>
                      <Input
                        id="defaultEmailTemplate"
                        name="defaultEmailTemplate"
                        defaultValue={settings?.notificationSettings.defaultEmailTemplate}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Channels</h4>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="enableEmailNotifications">Email Notifications</Label>
                        <Switch
                          id="enableEmailNotifications"
                          name="enableEmailNotifications"
                          defaultChecked={settings?.notificationSettings.enableEmailNotifications}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="enablePushNotifications">Push Notifications</Label>
                        <Switch
                          id="enablePushNotifications"
                          name="enablePushNotifications"
                          defaultChecked={settings?.notificationSettings.enablePushNotifications}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="enableInAppNotifications">In-App Notifications</Label>
                        <Switch
                          id="enableInAppNotifications"
                          name="enableInAppNotifications"
                          defaultChecked={settings?.notificationSettings.enableInAppNotifications}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Notification Types</h4>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="passwordReset">Password Reset</Label>
                        <Switch
                          id="passwordReset"
                          name="passwordReset"
                          defaultChecked={settings?.notificationSettings.notificationTypes.passwordReset}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="systemUpdates">System Updates</Label>
                        <Switch
                          id="systemUpdates"
                          name="systemUpdates"
                          defaultChecked={settings?.notificationSettings.notificationTypes.systemUpdates}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="paymentReminders">Payment Reminders</Label>
                        <Switch
                          id="paymentReminders"
                          name="paymentReminders"
                          defaultChecked={settings?.notificationSettings.notificationTypes.paymentReminders}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="userRegistration">User Registration</Label>
                        <Switch
                          id="userRegistration"
                          name="userRegistration"
                          defaultChecked={settings?.notificationSettings.notificationTypes.userRegistration}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="subscriptionChanges">Subscription Changes</Label>
                        <Switch
                          id="subscriptionChanges"
                          name="subscriptionChanges"
                          defaultChecked={settings?.notificationSettings.notificationTypes.subscriptionChanges}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Settings</CardTitle>
              <CardDescription>Configure payment gateway settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePaymentSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Stripe Configuration</h4>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="stripeEnabled">Enable Stripe</Label>
                        <input 
                          type="hidden" 
                          name="stripeEnabled" 
                          value={settings?.paymentSettings.stripeEnabled ? 'on' : 'off'} 
                        />
                        <Switch
                          id="stripeEnabled"
                          defaultChecked={settings?.paymentSettings.stripeEnabled}
                          onCheckedChange={(checked) => {
                            const input = document.querySelector('input[name="stripeEnabled"]') as HTMLInputElement;
                            if (input) input.value = checked ? 'on' : 'off';
                            console.log('Stripe enabled:', checked);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stripePublicKey">Stripe Public Key</Label>
                        <Input
                          id="stripePublicKey"
                          name="stripePublicKey"
                          defaultValue={settings?.paymentSettings.stripePublicKey}
                          onChange={(e) => console.log('Stripe public key changed:', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stripeSecretKey">Stripe Secret Key</Label>
                        <Input
                          id="stripeSecretKey"
                          name="stripeSecretKey"
                          type="password"
                          defaultValue={settings?.paymentSettings.stripeSecretKey}
                          onChange={(e) => console.log('Stripe secret key changed')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stripeWebhookSecret">Stripe Webhook Secret</Label>
                        <Input
                          id="stripeWebhookSecret"
                          name="stripeWebhookSecret"
                          type="password"
                          defaultValue={settings?.paymentSettings.stripeWebhookSecret}
                          onChange={(e) => console.log('Stripe webhook secret changed')}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">PayPal Configuration</h4>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="paypalEnabled">Enable PayPal</Label>
                        <input 
                          type="hidden" 
                          name="paypalEnabled" 
                          value={settings?.paymentSettings.paypalEnabled ? 'on' : 'off'} 
                        />
                        <Switch
                          id="paypalEnabled"
                          defaultChecked={settings?.paymentSettings.paypalEnabled}
                          onCheckedChange={(checked) => {
                            const input = document.querySelector('input[name="paypalEnabled"]') as HTMLInputElement;
                            if (input) input.value = checked ? 'on' : 'off';
                            console.log('PayPal enabled:', checked);
                          }}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paypalClientId">PayPal Client ID</Label>
                        <Input
                          id="paypalClientId"
                          name="paypalClientId"
                          defaultValue={settings?.paymentSettings.paypalClientId}
                          onChange={(e) => console.log('PayPal client ID changed:', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paypalClientSecret">PayPal Client Secret</Label>
                        <Input
                          id="paypalClientSecret"
                          name="paypalClientSecret"
                          type="password"
                          defaultValue={settings?.paymentSettings.paypalClientSecret}
                          onChange={(e) => console.log('PayPal client secret changed')}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="paypalEnvironment">PayPal Environment</Label>
                        <select
                          id="paypalEnvironment"
                          name="paypalEnvironment"
                          className="w-full rounded-md border border-input bg-background px-3 py-2"
                          defaultValue={settings?.paymentSettings.paypalEnvironment}
                          onChange={(e) => console.log('PayPal environment changed:', e.target.value)}
                        >
                          <option value="sandbox">Sandbox</option>
                          <option value="production">Production</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Input
                      id="currency"
                      name="currency"
                      defaultValue={settings?.paymentSettings.currency}
                      placeholder="USD"
                      onChange={(e) => console.log('Currency changed:', e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Configure system-wide settings</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSystemSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        name="sessionTimeout"
                        type="number"
                        defaultValue={settings?.systemSettings.sessionTimeout}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="defaultUserRole">Default User Role</Label>
                      <Input
                        id="defaultUserRole"
                        name="defaultUserRole"
                        defaultValue={settings?.systemSettings.defaultUserRole}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">System Access</h4>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                        <Switch
                          id="maintenanceMode"
                          name="maintenanceMode"
                          defaultChecked={settings?.systemSettings.maintenanceMode}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                        <Input
                          id="maintenanceMessage"
                          name="maintenanceMessage"
                          defaultValue={settings?.systemSettings.maintenanceMessage}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="allowUserRegistration">Allow User Registration</Label>
                        <Switch
                          id="allowUserRegistration"
                          name="allowUserRegistration"
                          defaultChecked={settings?.systemSettings.allowUserRegistration}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
                        <Switch
                          id="requireEmailVerification"
                          name="requireEmailVerification"
                          defaultChecked={settings?.systemSettings.requireEmailVerification}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-sm font-medium">Password Policy</h4>
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="minLength">Minimum Password Length</Label>
                        <Input
                          id="minLength"
                          name="minLength"
                          type="number"
                          defaultValue={settings?.systemSettings.passwordPolicy.minLength}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="requireNumbers">Require Numbers</Label>
                        <Switch
                          id="requireNumbers"
                          name="requireNumbers"
                          defaultChecked={settings?.systemSettings.passwordPolicy.requireNumbers}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="requireLowercase">Require Lowercase</Label>
                        <Switch
                          id="requireLowercase"
                          name="requireLowercase"
                          defaultChecked={settings?.systemSettings.passwordPolicy.requireLowercase}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="requireUppercase">Require Uppercase</Label>
                        <Switch
                          id="requireUppercase"
                          name="requireUppercase"
                          defaultChecked={settings?.systemSettings.passwordPolicy.requireUppercase}
                        />
                      </div>
                      <div className="flex items-center justify-between space-x-2">
                        <Label htmlFor="requireSpecialChars">Require Special Characters</Label>
                        <Switch
                          id="requireSpecialChars"
                          name="requireSpecialChars"
                          defaultChecked={settings?.systemSettings.passwordPolicy.requireSpecialChars}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}