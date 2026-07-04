"use client";

import {
  MapPin,
  Calendar,
  FileText,
  Pencil,
  Award,
  Briefcase,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";

import { stats, currentUser } from "@/lib/mock-data";
import { useUserStore } from "@/app/store/useUserStore";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const experience = [
  {
    role: "Senior Frontend Engineer",
    company: "Vercel",
    period: "2023 — Present",
  },
  {
    role: "Frontend Engineer",
    company: "Linear",
    period: "2021 — 2023",
  },
  {
    role: "Software Engineer",
    company: "Stripe",
    period: "2019 — 2021",
  },
];

export default function ProfilePage() {
  const { user, updateUser } = useUserStore();
  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [skills, setSkills] = useState("");
  const [resumeName, setResumeName] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setName(user.name);
    setTitle(user.title);
    setLocation(user.location);
    setSkills(user.skills.join(", "));
    setResumeName(user.resumeName);
  }, [user]);

  useEffect(() => {
    if (open) {
      setName(user.name);
      setTitle(user.title);
      setLocation(user.location);
      setSkills(user.skills.join(", "));
      setResumeName(user.resumeName);
    }
  }, [open, user]);

  const handleSave = () => {
    updateUser({
      name,
      title,
      location,
      skills: skills.split(",").map((s) => s.trim()).filter(Boolean),
      resumeName,
    });
    setOpen(false);
    toast.success("Profile updated successfully!");
  };

  const userDisplayName = isMounted ? user.name : currentUser.name;
  const initials = userDisplayName
    ? userDisplayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AM";

  return (
    <div className="space-y-6">
      <PageHeader
        title="Profile"
        description="Manage your professional information."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="rounded-xl"
              >
                <Pencil className="mr-1.5 h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl max-w-lg">
              <DialogHeader>
                <DialogTitle>Edit Profile Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-name">Full name</Label>
                  <Input
                    id="edit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-title">Professional Title</Label>
                  <Input
                    id="edit-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-location">Location</Label>
                  <Input
                    id="edit-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-skills">Skills (comma-separated)</Label>
                  <Input
                    id="edit-skills"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-resume">Resume Filename</Label>
                  <Input
                    id="edit-resume"
                    value={resumeName}
                    onChange={(e) => setResumeName(e.target.value)}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button className="rounded-xl" onClick={handleSave}>
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="overflow-hidden border-border/60 shadow-soft">
        <div className="h-24 gradient-primary" />

        <CardContent className="-mt-10 space-y-4 p-6">
          <Avatar className="h-20 w-20 border-4 border-card shadow-soft">
            <AvatarFallback className="bg-accent text-xl font-bold text-accent-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div>
            <h2 className="text-xl font-bold">
              {isMounted ? user.name : currentUser.name}
            </h2>

            <p className="text-sm text-muted-foreground">
              {isMounted ? user.title : currentUser.title}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {isMounted ? user.location : currentUser.location}
            </span>

            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Joined {isMounted ? user.joined : currentUser.joined}
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            {...stat}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-border/60 shadow-soft lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Briefcase className="h-4 w-4 text-primary" />
              Experience
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {experience.map((item) => (
              <div
                key={item.role}
                className="flex items-start gap-3 rounded-xl border border-border/60 p-4"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <Award className="h-5 w-5" />
                </div>

                <div className="min-w-0">
                  <p className="font-semibold">
                    {item.role}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {item.company} · {item.period}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">
                Skills
              </CardTitle>
            </CardHeader>

            <CardContent className="flex flex-wrap gap-2">
              {(isMounted ? user.skills : currentUser.skills).map((skill) => (
                <Badge
                  key={skill}
                  variant="secondary"
                  className="rounded-full"
                >
                  {skill}
                </Badge>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">
                Resume
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <FileText className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {isMounted ? user.resumeName : currentUser.resumeName}
                  </p>

                  <p className="text-xs text-muted-foreground">
                    248 KB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}