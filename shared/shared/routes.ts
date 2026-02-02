import { z } from "zod";
import { insertScriptSchema, scripts, logs } from "./schema";

export const api = {
  auth: {
    verify: {
      method: "POST" as const,
      path: "/api/auth/verify",
      input: z.object({ password: z.string() }),
      responses: {
        200: z.object({ success: z.boolean() }),
        401: z.object({ message: z.string() }),
      },
    },
  },
  scripts: {
    create: {
      method: "POST" as const,
      path: "/api/scripts",
      input: insertScriptSchema,
      responses: {
        201: z.custom<typeof scripts.$inferSelect>(),
        400: z.object({ message: z.string() }),
      },
    },
    update: {
      method: "PATCH" as const,
      path: "/api/scripts/:id",
      input: z.object({ name: z.string().optional(), content: z.string().optional() }),
      responses: {
        200: z.custom<typeof scripts.$inferSelect>(),
        400: z.object({ message: z.string() }),
        404: z.object({ message: z.string() }),
      },
    },
    delete: {
      method: "DELETE" as const,
      path: "/api/scripts/:id",
      responses: {
        200: z.object({ success: z.boolean() }),
        404: z.object({ message: z.string() }),
      },
    },
    list: {
      method: "GET" as const,
      path: "/api/scripts",
      responses: {
        200: z.array(z.custom<typeof scripts.$inferSelect>()),
      },
    },
    getRaw: {
      method: "GET" as const,
      path: "/raw/:id", // Public endpoint for the loader
      responses: {
        200: z.string(), // Returns raw text/lua
        404: z.string(),
      },
    },
  },
  logs: {
    list: {
      method: "GET" as const,
      path: "/api/logs",
      responses: {
        200: z.array(z.custom<typeof logs.$inferSelect>()),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
