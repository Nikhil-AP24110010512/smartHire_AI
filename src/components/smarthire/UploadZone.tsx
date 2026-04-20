import { useCallback, useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  files: File[];
  onChange: (files: File[]) => void;
}

export function UploadZone({ files, onChange }: UploadZoneProps) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (incoming: FileList | null) => {
      if (!incoming) return;
      const arr = Array.from(incoming).filter(f =>
        /\.(pdf|docx|txt)$/i.test(f.name),
      );
      onChange([...files, ...arr]);
    },
    [files, onChange],
  );

  return (
    <div>
      <div
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "group relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all",
          drag ? "border-accent bg-accent/10" : "border-border bg-card hover:border-accent/60 hover:bg-accent/5",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={e => handleFiles(e.target.files)}
        />
        <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-gradient-accent text-primary shadow-card">
          <Upload className="size-6" />
        </div>
        <h3 className="mt-4 font-display text-lg font-semibold">Drop resumes here</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          PDF, DOCX, or TXT — drop multiple at once
        </p>
      </div>

      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center justify-between rounded-lg border border-border bg-card px-3 py-2 shadow-card"
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate text-sm">{f.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(f.size / 1024).toFixed(0)} KB
                </span>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={e => {
                  e.stopPropagation();
                  onChange(files.filter((_, idx) => idx !== i));
                }}
                aria-label={`Remove ${f.name}`}
              >
                <X className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
