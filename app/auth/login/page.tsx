"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { login } from "@/app/api/auth";
import type { LoginCredentials } from "@/app/api/types";
import Link from "next/link";
import { ArrowRight, Building2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
    subdomain: "",
  });

  const justRegistered = searchParams.get("registered") === "true";

  // Show success toast if just registered
  if (justRegistered) {
    toast.success("Registration successful! Please sign in with your credentials.");
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const response = await login(formData);
    
    if (response.error) {
      toast.error(response.error.message || "Login failed", {
        description: response.error.error,
      });
    } else {
      toast.success("Login successful!", {
        description: "Redirecting to dashboard...",
      });
      router.push("/dashboard");
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center">
            Sign in to your workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    className="pl-9"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    className="pl-9"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subdomain">Workspace URL</Label>
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="subdomain"
                      name="subdomain"
                      className="pl-9"
                      value={formData.subdomain}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <span className="text-sm text-gray-500">.yourdomain.com</span>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full font-semibold" 
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <p className="text-center text-sm text-gray-500">
              Don't have an account?{" "}
              <Link href="/auth/register" className="text-primary font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 