import { useScripts } from "@/hooks/use-scripts";
import { useLogs } from "@/hooks/use-logs";
import { ScriptDialog } from "@/components/ScriptDialog";
import { ScriptCard } from "@/components/ScriptCard";
import { StatsCard } from "@/components/StatsCard";
import { Shield, Activity, Lock, Search, List, Terminal, LogOut } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { format } from "date-fns";

export default function Dashboard() {
  const { data: scripts, isLoading: scriptsLoading } = useScripts();
  const { data: logs, isLoading: logsLoading } = useLogs();
  const [search, setSearch] = useState("");

  const filteredScripts = scripts?.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-black text-zinc-400">
      <header className="bg-black border-b border-zinc-900 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800">
              <Shield className="w-4 h-4 text-emerald-500" />
            </div>
            <h1 className="font-bold font-mono tracking-tight text-lg text-zinc-100">LuaCrypt System</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20 text-[10px] font-mono uppercase tracking-widest">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              System Secure
            </div>
            <Button variant="ghost" size="icon" onClick={() => window.location.reload()} className="hover:bg-zinc-900">
              <LogOut className="w-5 h-5 text-zinc-600 hover:text-zinc-100 transition-colors" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard 
            label="System Status" 
            value="System Online" 
            icon={Activity} 
            status="success" 
          />
          <StatsCard 
            label="Protection Level" 
            value="Maximum" 
            icon={Shield} 
            status="success" 
          />
          <StatsCard 
            label="Obfuscation" 
            value="Enabled" 
            icon={Lock} 
            status="success" 
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold font-mono tracking-tight text-zinc-100">Your Scripts</h2>
            <p className="text-zinc-600 text-[10px] font-mono uppercase tracking-[0.2em] mt-1">Enterprise-grade protection active</p>
          </div>
          <ScriptDialog trigger={
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-black font-mono font-bold shadow-lg transition-all uppercase tracking-widest">
              <Shield className="w-4 h-4 mr-2" />
              + Protect New Script
            </Button>
          } />
        </div>

        <Tabs defaultValue="scripts" className="space-y-6">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 rounded-lg">
            <TabsTrigger value="scripts" className="font-mono text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
              <List className="w-3 h-3 mr-2" />
              Active Scripts
            </TabsTrigger>
            <TabsTrigger value="logs" className="font-mono text-[10px] tracking-widest data-[state=active]:bg-emerald-500 data-[state=active]:text-black">
              <Terminal className="w-3 h-3 mr-2" />
              System Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scripts" className="space-y-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
              <Input 
                placeholder="Search Files..." 
                className="pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-300 font-mono text-xs placeholder:text-zinc-800 focus:border-emerald-500/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {scriptsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-48 rounded-xl bg-zinc-900 border border-zinc-800 p-6 space-y-4">
                    <Skeleton className="h-4 w-3/4 bg-zinc-800" />
                    <Skeleton className="h-3 w-1/2 bg-zinc-800" />
                  </div>
                ))}
              </div>
            ) : filteredScripts?.length === 0 ? (
              <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                <Shield className="w-12 h-12 text-zinc-800 mx-auto mb-4 opacity-20" />
                <h3 className="font-mono font-bold text-zinc-700 uppercase tracking-widest text-xs">No active scripts</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredScripts?.map((script) => (
                  <ScriptCard key={script.id} script={script} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="logs" className="bg-black rounded-xl border border-zinc-900 shadow-2xl overflow-hidden min-h-[500px] flex flex-col">
            <div className="p-4 font-mono text-[10px] overflow-y-auto flex-1 space-y-1 opacity-0">
              {logsLoading ? (
                <div className="text-zinc-900 animate-pulse">Booting Log Stream...</div>
              ) : (
                logs?.map((log) => (
                  <div key={log.id} className="grid grid-cols-12 gap-2 p-1 group">
                    <span className="col-span-2 text-zinc-900 group-hover:text-zinc-800 transition-colors">
                      {log.timestamp ? format(new Date(log.timestamp), "HH:mm:ss") : "00:00:00"}
                    </span>
                    <span className="col-span-2 text-zinc-900 group-hover:text-emerald-900/50 transition-colors">
                      [{log.ip || "0.0.0.0"}]
                    </span>
                    <span className="col-span-8 text-black group-hover:text-zinc-900 transition-colors truncate">
                      Access Granted Id {log.scriptId}
                    </span>
                  </div>
                ))
              )}
              <div className="h-3 w-1.5 bg-zinc-900 animate-pulse mt-2" />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
