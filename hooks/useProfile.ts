"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

export interface Profile {
  id: string;
  name: string;
  email: string;
  headline: string | null;
  bio: string | null;
  phone: string | null;
  location: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  websiteUrl: string | null;
  experienceLevel: string | null;
  jobRole: string | null;
  yearsExperience: number | null;
  avatarUrl: string | null;
  profileCompleted: boolean;
  createdAt?: string;
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const response = await api<{
        success: boolean;
        data: Profile;
      }>("/api/user/profile");

      setProfile(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();

    const handleUpdate = () => {
      load();
    };

    window.addEventListener("profile-updated", handleUpdate);
    return () => {
      window.removeEventListener("profile-updated", handleUpdate);
    };
  }, []);

  return {
    profile,
    loading,
    setProfile,
    refresh: load,
  };
}