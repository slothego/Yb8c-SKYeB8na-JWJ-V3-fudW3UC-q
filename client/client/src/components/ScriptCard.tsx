import { Script } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, ShieldCheck, Check, Edit2, Trash2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { format } from "date-fns";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { ScriptDialog } from "./ScriptDialog";

interface ScriptCardProps {
  script: Script;
}

export function ScriptCard({ script }: ScriptCardProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("DELETE", `/api/scripts/${script.id}`);
      if (!res.ok) throw new Error("Failed to delete script");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/scripts"] });
      toast({ title: "Script Deleted", description: "The script was successfully removed." });
    },
    onError: (err: any) => {
      toast({ title: "Delete Failed", description: err.message, variant: "destructive" });
    }
  });

  const handleCopy = () => {
    const loaderScript = `loadstring(game:HttpGet('${window.location.origin}/raw/${script.id}'))()`;
    navigator.clipboard.writeText(loaderScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: "Copied", description: "Loader script copied to clipboard." });
  };

  return (
    <Card className="group relative overflow-hidden bg-black border border-zinc-900 hover:border-emerald-500/30 transition-all duration-300">
      <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
        <ShieldCheck className="w-24 h-24 rotate-12" />
      </div>
      
      <div className="p-6 relative z-10">
        <div className="flex justify-between items-start mb-4">
          <div className="cursor-pointer flex-1" onClick={() => setIsEditDialogOpen(true)}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[9px] font-mono border border-emerald-500/20 text-emerald-500/60 px-1.5 py-0.5 rounded uppercase">
                ID_{script.id}
              </span>
              <span className="text-[9px] font-mono text-zinc-700 uppercase">
                {script.createdAt ? format(new Date(script.createdAt), "MMM d, HH:mm") : "Just now"}
              </span>
            </div>
            <h3 className="text-base font-bold font-mono tracking-tight text-zinc-100">
              {script.name}
            </h3>
          </div>
          <div className="flex gap-2 relative z-[100]">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-zinc-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors cursor-pointer relative z-[110]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsEditDialogOpen(true);
              }}
              data-testid="button-edit-script"
            >
              <Edit2 className="w-5 h-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer relative z-[110]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm("Are you sure you want to delete this script?")) {
                  deleteMutation.mutate();
                }
              }}
              disabled={deleteMutation.isPending}
              data-testid="button-delete-script"
            >
              {deleteMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        <div className="mt-8">
          <Button 
            variant="outline" 
            className="w-full font-mono text-[10px] tracking-widest h-9 border-zinc-900 bg-transparent hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all duration-300"
            onClick={handleCopy}
          >
            {copied ? "Success" : "Copy Script"}
            {copied ? <Check className="w-3 h-3 ml-2" /> : <Copy className="w-3 h-3 ml-2" />}
          </Button>
        </div>
      </div>

      <ScriptDialog 
        script={script} 
        open={isEditDialogOpen} 
        onOpenChange={setIsEditDialogOpen} 
      />
    </Card>
  );
}
