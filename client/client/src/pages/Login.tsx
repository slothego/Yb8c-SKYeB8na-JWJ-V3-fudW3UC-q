import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Loader2 } from "lucide-react";

export default function Login() {
  const [password, setPassword] = useState("");
  const { login, isPending, error } = useAuth();

  const ACCESS_KEY = "f8jvB=3t6pWsHD*5TXWr22stHwak9T";

  useEffect(() => {
    if (password === ACCESS_KEY && !isPending) {
      login(password);
    }
  }, [password, login, isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(password);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black relative overflow-hidden">
      <div className="w-full max-w-md p-8 bg-black border border-zinc-800 shadow-2xl rounded-2xl relative z-10">
        <div className="flex flex-col items-center mb-8 space-y-2 opacity-0 hover:opacity-100 transition-opacity duration-500">
          <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg mb-4 border border-zinc-800">
            <Lock className="w-8 h-8 text-zinc-500" />
          </div>
          <h1 className="text-2xl font-bold font-mono tracking-tighter text-zinc-400">AUTHENTICATION REQUIRED</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Input 
              type="password"
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 font-mono text-center tracking-widest bg-black border-zinc-900 focus:border-zinc-800 focus:ring-0 transition-all text-zinc-500 placeholder:text-zinc-900"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-center py-2 text-red-900/50 text-[10px] font-mono uppercase tracking-widest">
              Access Denied
            </div>
          )}

          <div className="opacity-0">
             <Button type="submit" disabled={isPending}>
               {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "AUTHENTICATE"}
             </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
