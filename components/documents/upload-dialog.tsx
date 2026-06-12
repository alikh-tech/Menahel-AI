"use client";

import { useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createClient } from "@/lib/supabase/client";
import { DOCUMENT_CATEGORIES } from "@/lib/constants";
import type { DocumentRow } from "@/types";

interface UploadDialogProps {
  onUploaded: (doc: DocumentRow) => void;
}

export function UploadDialog({ onUploaded }: UploadDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<string>(DOCUMENT_CATEGORIES[0]);
  const [loading, setLoading] = useState(false);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (!name) setName(selected.name);
    }
  }

  async function handleUpload() {
    if (!file) {
      toast.error("בחרו קובץ להעלאה");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("יש להתחבר מחדש");
      setLoading(false);
      return;
    }

    const filePath = `${user.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage
      .from("documents")
      .upload(filePath, file);

    if (uploadError) {
      toast.error("שגיאה בהעלאת הקובץ: " + uploadError.message);
      setLoading(false);
      return;
    }

    const { data: inserted, error: insertError } = await supabase
      .from("documents")
      .insert({
        user_id: user.id,
        name: name || file.name,
        category,
        file_path: filePath,
        file_size: file.size,
        mime_type: file.type || "application/octet-stream",
        status: "received",
      })
      .select()
      .single();

    setLoading(false);

    if (insertError || !inserted) {
      toast.error("שגיאה בשמירת המסמך: " + insertError?.message);
      return;
    }

    toast.success("המסמך הועלה בהצלחה");
    onUploaded(inserted);
    setOpen(false);
    setFile(null);
    setName("");
    setCategory(DOCUMENT_CATEGORIES[0]);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="h-4 w-4" />
          העלאת מסמך
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>העלאת מסמך חדש</DialogTitle>
          <DialogDescription>
            העלו מסמך אקדמי, פיננסי או אישי לאחסון מאובטח
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">קובץ</Label>
            <Input id="file" type="file" onChange={handleFileChange} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="docName">שם המסמך</Label>
            <Input
              id="docName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="לדוגמה: אישור לימודים סמסטר א'"
            />
          </div>

          <div className="space-y-2">
            <Label>קטגוריה</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleUpload} disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            העלאה
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
