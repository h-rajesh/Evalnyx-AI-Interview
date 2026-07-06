"use client";

import ProfileForm from "@/components/forms/ProfileForm";
import { useProfile } from "@/hooks/useProfile";

export default function ProfilePage() {
  const { profile, loading } = useProfile();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!profile) {
    return <div>Profile not found.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">
        My Profile
      </h1>

      <ProfileForm defaultValues={profile as any} />
    </div>
  );
}