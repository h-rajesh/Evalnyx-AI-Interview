import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { FieldError } from "react-hook-form";

interface Props
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: FieldError;
}

export default function FormTextarea({
  label,
  error,
  id,
  ...props
}: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      <Textarea id={id} {...props} />

      {error && (
        <p className="text-xs text-destructive">
          {error.message}
        </p>
      )}
    </div>
  );
}