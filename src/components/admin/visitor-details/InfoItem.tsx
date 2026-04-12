import React, { forwardRef } from "react";

export const InfoItem = forwardRef<HTMLDivElement, { label: string; value: string | null }>(({ label, value }, ref) => (
  <div ref={ref} className="bg-muted/20 rounded-lg p-2">
    <p className="text-[9px] text-muted-foreground mb-0.5">{label}</p>
    <p className="text-xs font-semibold text-foreground break-all">{value || "-"}</p>
  </div>
));
InfoItem.displayName = "InfoItem";
