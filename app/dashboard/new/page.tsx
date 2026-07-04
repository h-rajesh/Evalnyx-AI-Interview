"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";

import {
  Briefcase,
  GraduationCap,
  ListChecks,
  Gauge,
  Code2,
  Clock,
  Upload,
  FileText,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  Check,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useInterviewStore } from "@/app/store/useInterviewStore";

import {
  jobRoles,
  experienceLevels,
  interviewTypes,
  difficulties,
  languages,
  durations,
} from "@/lib/mock-data";

function OptionGrid({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-all",
            value === opt
              ? "border-primary bg-accent text-accent-foreground shadow-soft"
              : "border-border/60 hover:border-primary/40 hover:bg-muted/40"
          )}
        >
          <span className="truncate">{opt}</span>

          {value === opt && (
            <Check className="ml-2 h-4 w-4 shrink-0 text-primary" />
          )}
        </button>
      ))}
    </div>
  );
}

const steps = [
  {
    title: "Role & Level",
    icon: Briefcase,
  },
  {
    title: "Interview Type",
    icon: ListChecks,
  },
  {
    title: "Setup & Resume",
    icon: Upload,
  },
];

export default function NewInterviewPage() {
  const router = useRouter();

  const { config, setConfig } = useInterviewStore();

  const [step, setStep] = useState(0);
  const [fileName, setFileName] = useState(config.resumeName);

  const progress = ((step + 1) / steps.length) * 100;

  const next = () =>
    setStep((s) => Math.min(s + 1, steps.length - 1));

  const prev = () =>
    setStep((s) => Math.max(s - 1, 0));

  const generate = () => {
    toast.success("Interview generated", {
      description: "Your AI interviewer is ready.",
    });

    if (typeof window !== "undefined") {
      localStorage.removeItem("completed_interview_new");
    }

    router.push("/interview/new");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Create Interview"
        description="Configure your personalized mock interview session."
      />

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div
              key={s.title}
              className="flex items-center gap-2"
            >
              <div
                className={cn(
                  "grid h-8 w-8 place-items-center rounded-lg text-xs font-semibold transition-colors",
                  i <= step
                    ? "gradient-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {i < step ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <s.icon className="h-4 w-4" />
                )}
              </div>

              <span
                className={cn(
                  "hidden text-sm font-medium sm:inline",
                  i === step
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>

        <Progress value={progress} className="h-1.5" />
      </div>

      <Card className="border-border/60 shadow-soft">
        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {step === 0 && (
                <>
                  <Field
                    icon={Briefcase}
                    label="Job Role"
                  >
                    <OptionGrid
                      options={jobRoles}
                      value={config.role}
                      onChange={(v) =>
                        setConfig({ role: v })
                      }
                    />
                  </Field>

                  <Field
                    icon={GraduationCap}
                    label="Experience Level"
                  >
                    <OptionGrid
                      options={experienceLevels}
                      value={config.level}
                      onChange={(v) =>
                        setConfig({ level: v })
                      }
                    />
                  </Field>
                </>
              )}
                            {step === 1 && (
                <>
                  <Field
                    icon={ListChecks}
                    label="Interview Type"
                  >
                    <OptionGrid
                      options={interviewTypes}
                      value={config.type}
                      onChange={(v) =>
                        setConfig({ type: v })
                      }
                    />
                  </Field>

                  <Field
                    icon={Gauge}
                    label="Difficulty"
                  >
                    <OptionGrid
                      options={difficulties}
                      value={config.difficulty}
                      onChange={(v) =>
                        setConfig({ difficulty: v })
                      }
                    />
                  </Field>

                  <Field
                    icon={Code2}
                    label="Programming Language"
                  >
                    <OptionGrid
                      options={languages}
                      value={config.language}
                      onChange={(v) =>
                        setConfig({ language: v })
                      }
                    />
                  </Field>
                </>
              )}

              {step === 2 && (
                <>
                  <Field
                    icon={Clock}
                    label="Interview Duration"
                  >
                    <OptionGrid
                      options={durations}
                      value={config.duration}
                      onChange={(v) =>
                        setConfig({ duration: v })
                      }
                    />
                  </Field>

                  <Field
                    icon={Upload}
                    label="Resume Upload"
                  >
                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center transition-colors hover:bg-muted/40">
                      {fileName ? (
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <FileText className="h-5 w-5 text-primary" />
                          {fileName}
                        </span>
                      ) : (
                        <>
                          <Upload className="h-6 w-6 text-muted-foreground" />

                          <span className="mt-2 text-sm font-medium">
                            Drag & drop or click to upload
                          </span>

                          <span className="text-xs text-muted-foreground">
                            PDF or DOCX, up to 5MB
                          </span>
                        </>
                      )}

                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const name =
                            e.target.files?.[0]?.name ?? "";

                          setFileName(name);

                          setConfig({
                            resumeName: name,
                          });
                        }}
                      />
                    </label>
                  </Field>

                  <Field
                    icon={FileText}
                    label="Job Description (optional)"
                  >
                    <Textarea
                      placeholder="Paste the job description to tailor your questions..."
                      className="min-h-28 rounded-xl"
                      value={config.jobDescription}
                      onChange={(e) =>
                        setConfig({
                          jobDescription: e.target.value,
                        })
                      }
                    />
                  </Field>
                </>
              )}
                          </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between border-t border-border/60 pt-5">
            <Button
              variant="ghost"
              className="rounded-xl"
              onClick={prev}
              disabled={step === 0}
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>

            {step < steps.length - 1 ? (
              <Button
                onClick={next}
                className="rounded-xl gradient-primary text-primary-foreground"
              >
                Continue
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={generate}
                className="rounded-xl gradient-primary text-primary-foreground"
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                Generate Interview
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

type FieldProps = {
  icon: typeof Briefcase;
  label: string;
  children: React.ReactNode;
};

function Field({
  icon: Icon,
  label,
  children,
}: FieldProps) {
  return (
    <div className="space-y-3">
      <Label className="flex items-center gap-2 text-sm font-semibold">
        <Icon className="h-4 w-4 text-primary" />
        {label}
      </Label>

      {children}
    </div>
  );
}