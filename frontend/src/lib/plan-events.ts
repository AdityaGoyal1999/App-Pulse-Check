export const PLAN_UPDATED_EVENT = "apc:plan-updated";

export function notifyPlanUpdated(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(PLAN_UPDATED_EVENT));
}
