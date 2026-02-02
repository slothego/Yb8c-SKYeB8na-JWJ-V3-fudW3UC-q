import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { insertScriptSchema } from "@shared/schema";
import { api } from "@shared/routes";
import { z } from "zod";

const PASSWORD = "f8jvB=3t6pWsHD*5TXWr22stHwak9T";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // Auth verification
  app.post(api.auth.verify.path, (req, res) => {
    const { password } = req.body;
    if (password === PASSWORD) {
      res.json({ success: true });
    } else {
      res.status(401).json({ message: "Invalid password" });
    }
  });

  // Create script
  app.post(api.scripts.create.path, async (req, res) => {
    try {
      const data = insertScriptSchema.parse(req.body);
      const script = await storage.createScript(data);
      res.status(201).json(script);
    } catch (error) {
      res.status(400).json({ message: "Invalid script data" });
    }
  });

  // List scripts
  app.get(api.scripts.list.path, async (req, res) => {
    const scripts = await storage.getScripts();
    res.json(scripts);
  });

  // Update script
  app.patch(api.scripts.update.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const updated = await storage.updateScript(id, req.body);
    if (!updated) return res.status(404).json({ message: "Script not found" });
    res.json(updated);
  });

  // Delete script
  app.delete(api.scripts.delete.path, async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ message: "Invalid ID" });
    const success = await storage.deleteScript(id);
    if (!success) return res.status(404).json({ message: "Script not found" });
    res.json({ success: true });
  });

  // Get Raw Script (The Loader Endpoint)
  app.get("/raw/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(404).send("Not found");
    }

    const script = await storage.getScript(id);
    if (!script) {
      return res.status(404).send("Not found");
    }

    const userAgent = req.headers["user-agent"] || "";
    const ip = req.ip || req.connection.remoteAddress;

    // Log the access
    await storage.createLog({
      scriptId: id,
      ip: String(ip),
      userAgent: userAgent,
    });

    // Protection Logic:
    // User requested "show nothing in the raw file link... but I want the functions to work"
    // Usually this means detecting if the request comes from a browser or the actual game client.
    // Roblox User-Agent usually starts with "Roblox" or contains it.
    // Browsers have "Mozilla/5.0..."
    
    const isBrowser = userAgent.includes("Mozilla") || userAgent.includes("Chrome") || userAgent.includes("Safari");
    
    // If it's a browser, show nothing (empty string)
    // Relaxed for mobile: if it looks like a mobile game client or curl, let it through
    const isRoblox = userAgent.includes("Roblox") || userAgent.includes("RobloxApp");
    
    if (isBrowser && !isRoblox) {
       return res.send(""); 
    }

    res.setHeader("Content-Type", "text/plain");
    res.send(script.content);
  });

  // Obfuscator
  app.post("/api/obfuscate", (req, res) => {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: "No code provided" });
    
    // XOR key
    const key = 235;
    
    // Simple Base64 implementation for the obfuscator logic
    const b64e = (s: string) => Buffer.from(s).toString('base64');
    
    // XOR helper for the server-side to prepare the payload
    const xor = (s: string, k: number) => {
      let r = '';
      for (let i = 0; i < s.length; i++) {
        r += String.fromCharCode(s.charCodeAt(i) ^ k);
      }
      return r;
    };

    const payload = b64e(xor(code, key));
    
    const obfuscated = `--[[This File was protects with LuaCrypt Pro]]
return(function(...)
    local __b='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
    local function __b64d(d)
        local b,o='',{}
        d=d:gsub('[^'..__b..'=]','')
        for i=1,#d do
            local c=d:sub(i,i)
            if c=='='then break end
            local v=__b:find(c)-1
            for j=6,1,-1 do b=b..((v>>(j-1))&1)end
        end
        for i=1,#b,8 do
            local byte = b:sub(i,i+7)
            if #byte == 8 then
                o[#o+1]=string.char(tonumber(byte,2))
            end
        end
        return table.concat(o):gsub('%z+$', '')
    end
    local function __xor(s,k)
        local r=''
        for i=1,#s do r=r..string.char(string.byte(s,i)~k)end
        return r
    end
    local function UXqHCrTc() if debug and debug.getinfo then while true do end end end
    local function main()
        local _src = __xor(__b64d("${payload}"), ${key})
        local _f, _e = loadstring(_src)
        if _f then return _f(...) else error(_e) end
    end
    local s,r = pcall(main)
    if not s then return end
    return r
end)(...)`;
    
    res.json({ code: obfuscated });
  });

  // Logs
  app.get(api.logs.list.path, async (req, res) => {
    const logs = await storage.getLogs();
    res.json(logs);
  });

  // SEED DATA
  const existingScripts = await storage.getScripts();
  if (existingScripts.length === 0) {
    await storage.createScript({
      name: "Welcome Script",
      content: 'print("Welcome to LuaCrypt!")\nwarn("This script is protected.")'
    });
  }

  return httpServer;
}
