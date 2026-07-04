"use client";
import { toast } from "sonner";
import { Palette, Bell, Shield, UserCog, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { useUserStore } from "@/app/store/useUserStore";
import { useEffect, useState } from "react";


function Row({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  const { user, updateUser } = useUserStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setName(user.name);
    setEmail(user.email);
    setTitle(user.title);
    setLocation(user.location);
    setSkills(user.skills.join(", "));
    setResumeName(user.resumeName);
  }, [user]);

  const handleSave = () => {
    updateUser({
      name,
      email,
      title,
      location,
      skills: skills.split(",").map(s => s.trim()).filter(Boolean),
      resumeName,
    });
    toast.success("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your preferences and account." />

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Palette className="h-4 w-4 text-primary" /> Appearance</CardTitle>
          <CardDescription>Customize how MockMind looks.</CardDescription>
        </CardHeader>
        <CardContent>
          <Row title="Theme" desc="Switch between light and dark mode."><ThemeToggle /></Row>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Bell className="h-4 w-4 text-primary" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60">
          <Row title="Email reminders" desc="Get reminded about scheduled interviews."><Switch defaultChecked /></Row>
          <Row title="Weekly summary" desc="Receive a weekly progress report."><Switch defaultChecked /></Row>
          <Row title="Product updates" desc="News about new features."><Switch /></Row>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Shield className="h-4 w-4 text-primary" /> Privacy</CardTitle>
        </CardHeader>
        <CardContent className="divide-y divide-border/60">
          <Row title="Save recordings" desc="Store webcam and audio for review."><Switch defaultChecked /></Row>
          <Row title="Anonymous analytics" desc="Help us improve with usage data."><Switch defaultChecked /></Row>
        </CardContent>
      </Card>

      <Card className="border-border/60 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><UserCog className="h-4 w-4 text-primary" /> Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={isMounted ? name : ""}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
                placeholder="Full Name"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                value={isMounted ? email : ""}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl"
                placeholder="Email Address"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="title">Professional Title</Label>
              <Input
                id="title"
                value={isMounted ? title : ""}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-xl"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={isMounted ? location : ""}
                onChange={(e) => setLocation(e.target.value)}
                className="rounded-xl"
                placeholder="e.g. San Francisco, CA"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="skills">Skills (comma-separated)</Label>
              <Input
                id="skills"
                value={isMounted ? skills : ""}
                onChange={(e) => setSkills(e.target.value)}
                className="rounded-xl"
                placeholder="React, TypeScript, Next.js"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="resume">Resume Filename</Label>
              <Input
                id="resume"
                value={isMounted ? resumeName : ""}
                onChange={(e) => setResumeName(e.target.value)}
                className="rounded-xl"
                placeholder="resume.pdf"
              />
            </div>
          </div>
          <Button className="rounded-xl" onClick={handleSave}>Save changes</Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/30 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive"><Trash2 className="h-4 w-4" /> Danger Zone</CardTitle>
          <CardDescription>Irreversible account actions.</CardDescription>
        </CardHeader>
        <CardContent>
          <Separator className="mb-4" />
          <Row title="Delete account" desc="Permanently remove your account and data.">
            <Button variant="destructive" className="rounded-xl" onClick={() => toast.error("Account deletion is disabled in demo")}>
              Delete
            </Button>
          </Row>
        </CardContent>
      </Card>
    </div>
  );
}
