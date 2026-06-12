import type { AdminRequest, RequestStatus } from "@/types";

// Requests in these statuses are considered "active" - still being handled.
export const ACTIVE_REQUEST_STATUSES: RequestStatus[] = ["received", "in_progress", "document_required"];

export function getActiveRequests(requests: AdminRequest[]): AdminRequest[] {
  return requests.filter((r) => ACTIVE_REQUEST_STATUSES.includes(r.status));
}

export function sortRequests(requests: AdminRequest[]): AdminRequest[] {
  return [...requests].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
