"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { updateProfile, uploadAvatar, type Profile } from "@/app/api/profiles";
import { UserCircle, Upload } from "lucide-react";

const phoneRegex = /^\+?[1-9]\d{1,14}$/;

const formSchema = z.object({
  phoneNumber: z.string()
    .regex(phoneRegex, "Please enter a valid phone number (e.g., +1234567890)")
    .optional()
    .or(z.literal("")),
  dateOfBirth: z.string().optional().or(z.literal("")),
  title: z.string().min(2, "Title must be at least 2 characters").optional().or(z.literal("")),
  department: z.string().min(2, "Department must be at least 2 characters").optional().or(z.literal("")),
  bio: z.string().max(500, "Bio must not exceed 500 characters").optional().or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

interface ProfileFormProps {
  profile: Profile;
  onSuccess: (data: Partial<Profile>) => void;
  isWizard?: boolean;
}

export function ProfileForm({ profile, onSuccess, isWizard = false }: ProfileFormProps) {
  const [uploading, setUploading] = useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: profile.phoneNumber || "",
      dateOfBirth: profile.dateOfBirth || "",
      title: profile.title || "",
      department: profile.department || "",
      bio: profile.bio || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (!isWizard) {
        await updateProfile(data);
        toast.success("Profile updated successfully");
      }
      onSuccess(data);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const { avatarUrl } = await uploadAvatar(file);
      toast.success("Avatar uploaded successfully");
      onSuccess({ avatar: avatarUrl });
    } catch (error) {
      toast.error("Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.avatar} />
          <AvatarFallback>
            <UserCircle className="h-12 w-12" />
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium mb-2">Profile Picture</h3>
          <div className="flex items-center gap-4">
            <Button variant="outline" disabled={uploading} asChild>
              <label className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Upload New Picture
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                />
              </label>
            </Button>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+1234567890" {...field} />
                  </FormControl>
                  <FormDescription>
                    International format: +[country code][number] (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your date of birth (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Senior Developer" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your role in the organization (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="department"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl>
                    <Input placeholder="Engineering" {...field} />
                  </FormControl>
                  <FormDescription>
                    Your department (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A brief description about yourself (optional, max 500 characters)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}