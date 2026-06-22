import { useCallback, useRef, type ChangeEvent, type DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, ArrowUpDown } from "lucide-react";
import { toast } from "sonner";

type Props = {
  photos: string[];
  required: number | null; // null = no specific count yet (e.g. options not picked)
  max?: number;
  onChange: (photos: string[]) => void;
  label?: string;
};

/** Drag-and-drop multi-photo uploader with strict count enforcement, reorder & remove. */
export function MultiPhotoUpload({ photos, required, max, onChange, label }: Props) {
  const cap = max ?? required ?? 24;
  const inputRef = useRef<HTMLInputElement>(null);
  const dragId = useRef<number | null>(null);

  const handleFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      const remaining = cap - photos.length;
      if (remaining <= 0) {
        toast.error(`You've already added ${cap}/${cap} photos.`);
        return;
      }
      const accepted = list.slice(0, remaining);
      if (list.length > remaining) {
        toast.message(`Only ${remaining} more photo${remaining === 1 ? "" : "s"} allowed`, {
          description: `Limit is ${cap}.`,
        });
      }
      Promise.all(
        accepted.map(
          (f) =>
            new Promise<string | null>((resolve) => {
              if (!f.type.startsWith("image/")) {
                toast.error(`${f.name} is not an image.`);
                return resolve(null);
              }
              if (f.size > 8 * 1024 * 1024) {
                toast.error(`${f.name} is over 8 MB.`);
                return resolve(null);
              }
              const r = new FileReader();
              r.onload = () => resolve(String(r.result));
              r.readAsDataURL(f);
            }),
        ),
      ).then((urls) => {
        const next = [...photos, ...(urls.filter(Boolean) as string[])];
        onChange(next);
        if (required && next.length === required) {
          toast.success(`All set — ${required}/${required} photos uploaded.`);
        }
      });
    },
    [cap, onChange, photos, required],
  );

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) handleFiles(e.target.files);
    e.target.value = "";
  };

  const remove = (idx: number) => onChange(photos.filter((_, i) => i !== idx));

  const onSlotDragStart = (i: number) => (dragId.current = i);
  const onSlotDrop = (target: number) => {
    const src = dragId.current;
    dragId.current = null;
    if (src == null || src === target) return;
    const next = [...photos];
    const [m] = next.splice(src, 1);
    next.splice(target, 0, m);
    onChange(next);
  };

  const complete = required != null && photos.length === required;
  const need = required != null && photos.length < required;
  const over = required != null && photos.length > required;

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium">{label ?? "Your photos"}</p>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            complete
              ? "bg-accent/15 text-accent"
              : over
                ? "bg-destructive/15 text-destructive"
                : "bg-secondary text-muted-foreground"
          }`}
          aria-live="polite"
        >
          {photos.length}/{required ?? "?"} Photos {complete ? "Selected ✓" : over ? "(too many)" : "Selected"}
        </span>
      </div>

      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="mt-3 flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border bg-secondary/40 px-4 py-6 text-center transition hover:border-accent hover:bg-accent/5"
      >
        <input ref={inputRef} type="file" accept="image/*" multiple hidden onChange={onPick} />
        <Upload className="h-5 w-5 text-accent" aria-hidden="true" />
        <span className="text-sm font-medium">Drag &amp; drop or tap to upload</span>
        <span className="text-xs text-muted-foreground">
          JPG or PNG · up to 8 MB each · {required ? `need ${required}` : `up to ${cap}`}
        </span>
      </label>

      {photos.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          <AnimatePresence initial={false}>
            {photos.map((src, i) => (
              <motion.li
                key={src.slice(-32) + i}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-secondary"
                draggable
                onDragStart={() => onSlotDragStart(i)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => onSlotDrop(i)}
              >
                <img src={src} alt={`Uploaded ${i + 1}`} className="h-full w-full object-cover" />
                <span className="absolute left-1.5 top-1.5 rounded-full bg-charcoal/70 px-1.5 text-[10px] font-semibold text-ivory">
                  {i + 1}
                </span>
                <button
                  type="button"
                  aria-label={`Remove photo ${i + 1}`}
                  onClick={() => remove(i)}
                  className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-charcoal/80 text-ivory opacity-0 transition group-hover:opacity-100 focus:opacity-100"
                >
                  <X className="h-3 w-3" />
                </button>
                <span className="absolute bottom-1.5 right-1.5 grid h-6 w-6 place-items-center rounded-full bg-charcoal/60 text-ivory opacity-0 transition group-hover:opacity-100" aria-hidden>
                  <ArrowUpDown className="h-3 w-3" />
                </span>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {need && (
        <p className="mt-3 text-xs text-destructive">
          ✕ {required! - photos.length} more photo{required! - photos.length === 1 ? "" : "s"} required to continue.
        </p>
      )}
      {complete && <p className="mt-3 text-xs text-accent">✓ Upload complete — ready to preview.</p>}
    </div>
  );
}
