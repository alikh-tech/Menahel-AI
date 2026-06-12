import {
  FileText,
  Star,
  Award,
  Home,
  Receipt,
  IdCard,
  FileQuestion,
  type LucideIcon,
} from "lucide-react";

export interface DocumentCategoryMeta {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export const DOCUMENT_CATEGORY_META: Record<string, DocumentCategoryMeta> = {
  "תעודת זהות": { icon: IdCard, iconBg: "#EFF6FF", iconColor: "#3B82F6" },
  "אישור לימודים": { icon: FileText, iconBg: "#EEF2FF", iconColor: "#4F46E5" },
  "גיליון ציונים": { icon: Star, iconBg: "#ECFDF5", iconColor: "#10B981" },
  "טופס מלגה": { icon: Award, iconBg: "#F5F3FF", iconColor: "#7C3AED" },
  "חוזה שכר דירה": { icon: Home, iconBg: "#FFFBEB", iconColor: "#D97706" },
  "אישור הכנסה": { icon: Receipt, iconBg: "#FFF1F2", iconColor: "#E11D48" },
  "אחר": { icon: FileQuestion, iconBg: "#F1F5F9", iconColor: "#64748B" },
};

export const DEFAULT_DOCUMENT_META: DocumentCategoryMeta = {
  icon: FileText,
  iconBg: "#F1F5F9",
  iconColor: "#64748B",
};

export function getDocumentMeta(category: string): DocumentCategoryMeta {
  return DOCUMENT_CATEGORY_META[category] ?? DEFAULT_DOCUMENT_META;
}
