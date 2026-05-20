import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const posts = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/posts" }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    pubDate: z.coerce.date(),
    category: z.enum(["国内旅行記", "旅のノウハウ", "グルメ・宿レビュー"]),
    tags: z.array(z.string()).default([]),
    heroEmoji: z.string().default("🗾"),
    aiGenerated: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
