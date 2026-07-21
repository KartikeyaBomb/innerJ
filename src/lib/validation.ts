import { z } from "zod";

export const loginSchema = z.object({
  email: z.email().max(254),
  name: z.string().trim().min(2).max(60).optional()
});

export const createPromptSchema = z.object({
  title: z.string().trim().min(5).max(120),
  description: z.string().trim().min(10).max(320),
  content: z.string().trim().min(20).max(20_000),
  community: z.string().trim().min(2).max(48),
  model: z.string().trim().min(2).max(60).default("Model agnostic"),
  tags: z.array(z.string().trim().min(1).max(32)).max(8).default([])
});

export const commentSchema = z.object({
  body: z.string().trim().min(2).max(2_000)
});

export const collectionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(240).default(""),
  isPublic: z.boolean().default(false)
});
