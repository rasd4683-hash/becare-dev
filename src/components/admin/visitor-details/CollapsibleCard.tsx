import React, { useState } from "react";
import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface CollapsibleCardProps {
  title: string;
  icon: React.ReactNode;
  borderColor: string;
  bgColor: string;
  headerBg: string;
  headerBorder: string;
  textColor: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isActive?: boolean;
}

const CollapsibleCard = React.forwardRef<HTMLDivElement, CollapsibleCardProps>(
  ({ title, icon, borderColor, bgColor, headerBg, headerBorder, textColor, children, defaultOpen = false, isActive = false }, ref) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className={`rounded-xl border-2 ${isActive ? "border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse" : borderColor} ${bgColor} overflow-hidden transition-shadow duration-500 ${isActive ? "ring-2 ring-amber-400/30" : ""}`}>
          <CollapsibleTrigger asChild>
            <button className={`w-full px-3 py-2 ${isActive ? "bg-amber-500/15 border-amber-500/30" : headerBg + " " + headerBorder} border-b flex items-center justify-between cursor-pointer hover:opacity-80 transition-opacity`}>
              <p className={`text-[10px] font-bold ${isActive ? "text-amber-600" : textColor} flex items-center gap-1.5`}>
                {isActive && <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping inline-block" />}
                {icon} {title}
              </p>
              <ChevronRight className={`w-3 h-3 ${isActive ? "text-amber-600" : textColor} transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>{children}</CollapsibleContent>
        </div>
      </Collapsible>
    );
  }
);
CollapsibleCard.displayName = "CollapsibleCard";

export default CollapsibleCard;
