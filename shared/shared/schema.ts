import { pgTable, text, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const scripts = pgTable("scripts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(), // The original or protected Lua code
  createdAt: timestamp("created_at").defaultNow(),
});

export const logs = pgTable("logs", {
  id: serial("id").primaryKey(),
  scriptId: serial("script_id").references(() => scripts.id),
  ip: text("ip"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertScriptSchema = createInsertSchema(scripts).omit({ id: true, createdAt: true });
export const updateScriptSchema = insertScriptSchema.partial();
export const insertLogSchema = createInsertSchema(logs).omit({ id: true, timestamp: true });

export type Script = typeof scripts.$inferSelect;
export type InsertScript = z.infer<typeof insertScriptSchema>;
export type UpdateScriptRequest = z.infer<typeof updateScriptSchema>;
export type Log = typeof logs.$inferSelect;
export type InsertLog = z.infer<typeof insertLogSchema>;

// Password verification schema
export const authSchema = z.object({
  password: z.string(),
});
