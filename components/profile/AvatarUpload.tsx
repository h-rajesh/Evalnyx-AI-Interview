"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Props {
  avatar?: string | null;
  onUploaded(url: string): void;
}

export default function AvatarUpload({
  avatar,
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    const form = new FormData();

    form.append("file", file);

    const res = await fetch("/api/user/avatar", {
      method: "POST",
      body: form,
    });

    const json = await res.json();

    if (!json.success) {
      toast.error(json.message);
      return;
    }

    toast.success("Avatar updated");

    onUploaded(json.data.avatarUrl);
  }

  return (
    <div className="space-y-4">
      {avatar && (
        <img
          src={avatar}
          className="h-24 w-24 rounded-full object-cover border"
          alt="Avatar"
        />
      )}

      <input
        hidden
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => {
          const file = e.target.files?.[0];

          if (file) upload(file);
        }}
      />

      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
      >
        Change Avatar
      </Button>
    </div>
  );
}