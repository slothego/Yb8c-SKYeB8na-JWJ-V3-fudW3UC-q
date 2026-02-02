import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  status?: "success" | "warning" | "danger" | "neutral";
}

export function StatsCard({ label, value, icon: Icon, status = "neutral" }: StatsCardProps) {
  return (
    <div className="bg-zinc-950 rounded-xl border border-zinc-900 p-6 shadow-sm hover:border-emerald-500/20 transition-all duration-300">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium text-zinc-600 tracking-[0.2em] uppercase font-mono mb-2">
            {label}
          </p>
          <h3 className={cn("text-xl font-bold font-mono tracking-tight", {
            "text-emerald-500": status === "success",
            "text-amber-500": status === "warning",
            "text-rose-500": status === "danger",
            "text-zinc-100": status === "neutral",
          })}>
            {value}
          </h3>
        </div>
        <div className={cn("p-2.5 rounded-lg border", {
          "bg-emerald-500/5 border-emerald-500/20 text-emerald-500": status === "success",
          "bg-amber-500/5 border-amber-500/20 text-amber-600": status === "warning",
          "bg-rose-500/5 border-rose-500/20 text-rose-600": status === "danger",
          "bg-zinc-900 border-zinc-800 text-zinc-600": status === "neutral",
        })}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
