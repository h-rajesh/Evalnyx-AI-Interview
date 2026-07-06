"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { api } from "@/lib/api/client";

import FormInput from "./FormInput";
import FormTextarea from "./FormTextArea";

import { Button } from "@/components/ui/button";

import {
  UpdateProfileSchema,
} from "@/lib/validations/profile";

import { z } from "zod";
import AvatarUpload from "../profile/AvatarUpload";

type ProfileFormValues = z.infer<typeof UpdateProfileSchema>;

interface ProfileFormProps {
  defaultValues: ProfileFormValues;
}

export default function ProfileForm({
  defaultValues,
}: ProfileFormProps) {
  const { update } = useSession();

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: {
      errors,
      isSubmitting,
    },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(UpdateProfileSchema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (
    values: ProfileFormValues
  ) => {
    try {
      await api("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      await update();

      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
    >
    <AvatarUpload
    avatar={defaultValues.avatarUrl}
    onUploaded={(url) => {
      reset({
        ...getValues(),
        avatarUrl: url,
      });
    }}/>
      {/* Personal */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Personal Information
        </h2>

        <FormInput
          id="name"
          label="Name"
          {...register("name")}
          error={errors.name}
        />

        <FormInput
          id="headline"
          label="Headline"
          placeholder="Full Stack Developer"
          {...register("headline")}
          error={errors.headline}
        />

        <FormTextarea
          id="bio"
          label="Bio"
          rows={4}
          placeholder="Tell us about yourself..."
          {...register("bio")}
          error={errors.bio}
        />
      </div>

      {/* Contact */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Contact
        </h2>

        <FormInput
          id="phone"
          label="Phone"
          {...register("phone")}
          error={errors.phone}
        />

        <FormInput
          id="location"
          label="Location"
          placeholder="Bangalore, India"
          {...register("location")}
          error={errors.location}
        />
      </div>

      {/* Career */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Career
        </h2>

        <FormInput
          id="jobRole"
          label="Job Role"
          placeholder="Software Engineer"
          {...register("jobRole")}
          error={errors.jobRole}
        />

        <FormInput
          id="experienceLevel"
          label="Experience Level"
          placeholder="Beginner / Intermediate / Senior"
          {...register("experienceLevel")}
          error={errors.experienceLevel}
        />

        <FormInput
          id="yearsExperience"
          type="number"
          label="Years of Experience"
          {...register("yearsExperience", {
            valueAsNumber: true,
          })}
          error={errors.yearsExperience}
        />
      </div>

      {/* Links */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">
          Social Links
        </h2>

        <FormInput
          id="linkedinUrl"
          label="LinkedIn"
          placeholder="https://linkedin.com/in/username"
          {...register("linkedinUrl")}
          error={errors.linkedinUrl}
        />

        <FormInput
          id="githubUrl"
          label="GitHub"
          placeholder="https://github.com/username"
          {...register("githubUrl")}
          error={errors.githubUrl}
        />

        <FormInput
          id="websiteUrl"
          label="Website"
          placeholder="https://yourwebsite.com"
          {...register("websiteUrl")}
          error={errors.websiteUrl}
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full"
      >
        {isSubmitting
          ? "Saving..."
          : "Save Profile"}
      </Button>
    </form>
  );
}