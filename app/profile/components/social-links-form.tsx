"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { updateSocialLinks, type SocialLinks } from "@/app/api/profiles";
import { Github, Linkedin, Twitter } from "lucide-react";

const formSchema = z.object({
  linkedin: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  twitter: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  github: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

interface SocialLinksFormProps {
  socialLinks: SocialLinks;
  onSuccess: () => void;
}

export function SocialLinksForm({ socialLinks, onSuccess }: SocialLinksFormProps) {
  const form = useForm<SocialLinks>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      linkedin: socialLinks.linkedin || "",
      twitter: socialLinks.twitter || "",
      github: socialLinks.github || "",
    },
  });

  const onSubmit = async (data: SocialLinks) => {
    try {
      await updateSocialLinks(data);
      toast.success("Social links updated successfully");
      onSuccess();
    } catch (error) {
      toast.error("Failed to update social links");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="linkedin"
          render={({ field }) => (
            <FormItem>
              <FormLabel>LinkedIn Profile</FormLabel>
              <FormControl>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://linkedin.com/in/username"
                    className="pl-9"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="twitter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Twitter Profile</FormLabel>
              <FormControl>
                <div className="relative">
                  <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://twitter.com/username"
                    className="pl-9"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="github"
          render={({ field }) => (
            <FormItem>
              <FormLabel>GitHub Profile</FormLabel>
              <FormControl>
                <div className="relative">
                  <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="https://github.com/username"
                    className="pl-9"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={!form.formState.isDirty}>
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
} 