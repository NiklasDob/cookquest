import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Domain schema for CookQuest
export default defineSchema({
  quests: defineTable({
    title: v.string(),
    type: v.union(
      v.literal("lesson"),
      v.literal("challenge"),
      v.literal("boss"),
      v.literal("concept"),
    ),
    category: v.union(
      v.literal("foundation"),
      v.literal("technique"),
      v.literal("flavor"),
      v.literal("cuisine"),
      v.literal("advanced"),
    ),
    cuisineType: v.optional(
      v.union(v.literal("french"), v.literal("asian"), v.literal("italian")),
    ),
    status: v.union(
      v.literal("locked"),
      v.literal("available"),
      v.literal("completed"),
    ),
    stars: v.number(),
    maxStars: v.number(),
    prerequisites: v.array(v.id("quests")),
  })
    .index("by_status", ["status"]) // convenience
    .index("by_title", ["title"]),

  lessonContents: defineTable({
    questId: v.id("quests"),
    emoji: v.string(),
    heading: v.string(),
    description: v.string(),
    steps: v.array(v.string()),
    hints: v.array(v.string()),
  }).index("by_quest", ["questId"]),
});
