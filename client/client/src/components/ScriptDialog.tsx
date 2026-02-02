import { useState, useEffect } from "react";
import { useCreateScript, useUpdateScript } from "@/hooks/use-scripts";
import { useObfuscate } from "@/hooks/use-obfuscate";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Script } from "@shared/schema";

interface ScriptDialogProps {
  script?: Script;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ScriptDialog({ script, trigger, open: controlledOpen, onOpenChange: setControlledOpen }: ScriptDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = setControlledOpen ?? setInternalOpen;

  const [name, setName] = useState(script?.name ?? "");
  const [content, setContent] = useState(script?.content ?? "");
  const { mutate: createScript, isPending: isCreating } = useCreateScript();
  const { mutate: updateScript, isPending: isUpdating } = useUpdateScript();
  const { mutate: obfuscate, isPending: isObfuscating } = useObfuscate();
  const { toast } = useToast();

  useEffect(() => {
    if (open && script) {
      setName(script.name);
      setContent(script.content);
    }
  }, [open, script]);

  const handleObfuscate = () => {
    if (!content) return;
    obfuscate(content, {
      onSuccess: (data) => {
        setContent(data.code);
        toast({ title: "Obfuscated", description: "Script has been protected." });
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !content) return;

    const options = {
      onSuccess: () => {
        setOpen(false);
        if (!script) {
          setName("");
          setContent("");
        }
        toast({
          title: script ? "Script Updated" : "Script Protected",
          description: script ? "Your changes have been saved." : "Your script has been successfully encrypted and stored.",
        });
      },
      onError: (err: any) => {
        toast({
          title: "Operation Failed",
          description: err.message,
          variant: "destructive",
        });
      }
    };

    if (script) {
      updateScript({ id: script.id, name, content }, options);
    } else {
      createScript({ name, content }, options);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-xl bg-black border border-zinc-900 text-zinc-100">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-mono text-xl text-zinc-100">
            <Lock className="w-5 h-5 text-emerald-500" />
            {script ? "Edit Script" : "Protect Script"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="font-mono text-[10px] uppercase text-zinc-600 tracking-widest">Script Name</Label>
            <Input 
              id="name" 
              placeholder="e.g. AimBot V2" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="font-mono bg-zinc-950 border-zinc-900 focus:border-emerald-500/50 text-zinc-100"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="content" className="font-mono text-[10px] uppercase text-zinc-600 tracking-widest">Lua Source Code</Label>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="h-6 text-[10px] font-mono text-emerald-500 hover:bg-emerald-500/10"
                onClick={handleObfuscate}
                disabled={isObfuscating || !content}
              >
                {isObfuscating ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Sparkles className="w-3 h-3 mr-1" />}
                Obfuscate
              </Button>
            </div>
            <Textarea 
              id="content" 
              placeholder="-- Paste your Lua script here..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="font-mono text-xs min-h-[300px] bg-black text-emerald-500 border-zinc-900 focus:border-emerald-500/50 p-4"
              spellCheck={false}
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold tracking-widest"
            disabled={isCreating || isUpdating}
          >
            {isCreating || isUpdating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              script ? "Save Changes" : "Apply Protection"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

