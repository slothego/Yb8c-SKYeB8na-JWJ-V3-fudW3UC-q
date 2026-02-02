import { db } from "./db";
import { scripts, logs, type Script, type InsertScript, type Log, type InsertLog } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  createScript(script: InsertScript): Promise<Script>;
  getScripts(): Promise<Script[]>;
  getScript(id: number): Promise<Script | undefined>;
  updateScript(id: number, script: UpdateScriptRequest): Promise<Script | undefined>;
  deleteScript(id: number): Promise<boolean>;
  createLog(log: InsertLog): Promise<Log>;
  getLogs(): Promise<Log[]>;
}

export class DatabaseStorage implements IStorage {
  async createScript(insertScript: InsertScript): Promise<Script> {
    const [script] = await db.insert(scripts).values(insertScript).returning();
    return script;
  }

  async getScripts(): Promise<Script[]> {
    return await db.select().from(scripts).orderBy(desc(scripts.createdAt));
  }

  async getScript(id: number): Promise<Script | undefined> {
    const [script] = await db.select().from(scripts).where(eq(scripts.id, id));
    return script;
  }

  async updateScript(id: number, script: UpdateScriptRequest): Promise<Script | undefined> {
    const [updated] = await db.update(scripts).set(script).where(eq(scripts.id, id)).returning();
    return updated;
  }

  async deleteScript(id: number): Promise<boolean> {
    // Delete associated logs first to avoid foreign key constraint error
    await db.delete(logs).where(eq(logs.scriptId, id));
    const [deleted] = await db.delete(scripts).where(eq(scripts.id, id)).returning();
    return !!deleted;
  }

  async createLog(insertLog: InsertLog): Promise<Log> {
    const [log] = await db.insert(logs).values(insertLog).returning();
    return log;
  }

  async getLogs(): Promise<Log[]> {
    return await db.select().from(logs).orderBy(desc(logs.timestamp));
  }
}

export const storage = new DatabaseStorage();
