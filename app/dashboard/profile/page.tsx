"use client";

import {
  MapPin,
  Calendar,
  FileText,
  Pencil,
  Award,
  Briefcase,
  User,
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
import { Textarea } from "@/components/ui/textarea";
import { useProfile } from "@/hooks/useProfile";
import { useResume } from "@/hooks/useResume";

export default function ProfilePage() {
  const { updateUser } = useUserStore();
  const { profile, loading: profileLoading, setProfile } = useProfile();
  const { resume, loading: resumeLoading, refresh: refreshResume } = useResume();

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("");
  const [yearsExperience, setYearsExperience] = useState<string>("0");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setHeadline(profile.headline || "");
      setBio(profile.bio || "");
      setJobRole(profile.jobRole || "");
      setExperienceLevel(profile.experienceLevel || "");
      setYearsExperience(String(profile.yearsExperience ?? 0));
      setLocation(profile.location || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  useEffect(() => {
    if (open && profile) {
      setName(profile.name || "");
      setHeadline(profile.headline || "");
      setBio(profile.bio || "");
      setJobRole(profile.jobRole || "");
      setExperienceLevel(profile.experienceLevel || "");
      setYearsExperience(String(profile.yearsExperience ?? 0));
      setLocation(profile.location || "");
      setPhone(profile.phone || "");
      setResumeFile(null);
    }
  }, [open, profile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 1. If there's a new resume file, upload it
      if (resumeFile) {
        const formData = new FormData();
        formData.append("file", resumeFile);
        const uploadRes = await fetch("/api/resume", {
          method: "POST",
          body: formData,
        });
        const uploadJson = await uploadRes.json();
        if (!uploadJson.success) {
          throw new Error(uploadJson.message || "Failed to upload resume.");
        }
        await refreshResume();
      }

      // 2. Save profile fields to backend
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          headline,
          bio,
          jobRole,
          experienceLevel,
          yearsExperience: parseInt(yearsExperience, 10) || 0,
          location,
          phone,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setProfile(json.data);
        // Sync with the Zustand store for any legacy frontend components
        updateUser({
          name,
          title: headline,
          location,
          resumeName: resumeFile ? resumeFile.name : (resume?.fileName || ""),
        });
        
        // Dispatch custom events to sync layout and other hooks immediately
        window.dispatchEvent(new Event("profile-updated"));
        if (resumeFile) {
          window.dispatchEvent(new Event("resume-updated"));
        }

        toast.success("Profile updated successfully!");
        setOpen(false);
      } else {
        toast.error(json.message || "Failed to update profile.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (profileLoading || resumeLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  const userDisplayName = profile?.name || currentUser.name;
  const initials = userDisplayName
    ? userDisplayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AM";

  const parsedSkills: string[] = resume?.parsedResume && Array.isArray((resume.parsedResume as any).skills)
    ? ((resume.parsedResume as any).skills as string[])
    : [];

  const parsedExperience: any[] = resume?.parsedResume && Array.isArray((resume.parsedResume as any).experience)
    ? ((resume.parsedResume as any).experience as any[])
    : [];

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
            <DialogContent className="rounded-2xl max-w-lg md:max-w-2xl overflow-y-auto max-h-[90vh]">
              <DialogHeader>
                <DialogTitle>Edit Profile Details</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="edit-headline">Professional Title</Label>
                    <Input
                      id="edit-headline"
                      value={headline}
                      placeholder="e.g. Senior Software Engineer"
                      onChange={(e) => setHeadline(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-bio">Bio</Label>
                  <Textarea
                    id="edit-bio"
                    value={bio}
                    placeholder="Brief bio about your professional career..."
                    onChange={(e) => setBio(e.target.value)}
                    className="rounded-xl min-h-[80px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-jobrole">Job Role</Label>
                    <Input
                      id="edit-jobrole"
                      value={jobRole}
                      placeholder="e.g. Full Stack Developer"
                      onChange={(e) => setJobRole(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-explevel">Experience Level</Label>
                    <Input
                      id="edit-explevel"
                      value={experienceLevel}
                      placeholder="e.g. Mid-Level / Senior"
                      onChange={(e) => setExperienceLevel(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-years">Years of Experience</Label>
                    <Input
                      id="edit-years"
                      type="number"
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-location">Location</Label>
                    <Input
                      id="edit-location"
                      value={location}
                      placeholder="e.g. Remote / Bangalore"
                      onChange={(e) => setLocation(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={phone}
                      placeholder="e.g. +91 9999999999"
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-resume">Upload Resume (PDF only)</Label>
                    <Input
                      id="edit-resume"
                      type="file"
                      accept=".pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setResumeFile(file);
                      }}
                      className="rounded-xl cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" className="rounded-xl" onClick={() => setOpen(false)} disabled={saving}>
                  Cancel
                </Button>
                <Button className="rounded-xl" onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save changes"}
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
              {profile?.name || currentUser.name}
            </h2>

            <p className="text-sm text-muted-foreground">
              {profile?.headline || profile?.jobRole || "No professional title"}
            </p>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {profile?.location || "No location details"}
            </span>

            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : currentUser.joined}
            </span>

            {profile?.profileCompleted ? (
              <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/25">
                Profile Setup Complete
              </Badge>
            ) : (
              <Badge variant="destructive" className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/25">
                Profile Setup Incomplete
              </Badge>
            )}
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
            {parsedExperience.length > 0 ? (
              parsedExperience.map((item, idx) => {
                const role = item.role || item.position || item.title || "Software Engineer";
                const company = item.company || item.organization || "Company";
                const period = item.period || `${item.startDate || ""} — ${item.endDate || "Present"}`;
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-xl border border-border/60 p-4"
                  >
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                      <Award className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="font-semibold">
                        {role}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        {company} · {period}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center text-sm text-muted-foreground gap-2">
                <span>No experience details parsed.</span>
                <span className="text-xs">Upload your resume to automatically extract your experience.</span>
              </div>
            )}
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
              {parsedSkills.length > 0 ? (
                parsedSkills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="rounded-full"
                  >
                    {skill}
                  </Badge>
                ))
              ) : (
                <div className="text-sm text-muted-foreground">
                  No skills parsed yet. Upload your resume to extract skills.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-soft">
            <CardHeader>
              <CardTitle className="text-base">
                Resume
              </CardTitle>
            </CardHeader>

            <CardContent>
              {resume ? (
                <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-muted/40 p-3">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <FileText className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {resume.fileName}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {(resume.fileSize / 1024).toFixed(0)} KB
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 border border-dashed border-border/70 rounded-xl bg-muted/20 text-sm text-muted-foreground">
                  No resume uploaded. Click Edit to upload.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}