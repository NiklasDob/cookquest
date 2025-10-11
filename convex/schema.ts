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

  minigames: defineTable({
    questId: v.id("quests"),
    title: v.string(),
    type: v.union(
      v.literal("matching"),
      v.literal("fill-in-blank"),
      v.literal("multiple-choice"),
      v.literal("image-association"),
    ),
    description: v.string(),
    enabled: v.boolean(),
    difficulty: v.union(
      v.literal("easy"),
      v.literal("medium"),
      v.literal("hard"),
    ),
    timeLimit: v.optional(v.number()), // seconds
    requiredScore: v.number(), // percentage needed to pass
  }).index("by_quest", ["questId"]),

  minigameQuestions: defineTable({
    minigameId: v.id("minigames"),
    questionText: v.string(),
    questionType: v.union(
      v.literal("matching"),
      v.literal("fill-in-blank"),
      v.literal("multiple-choice"),
      v.literal("image-association"),
    ),
    // For matching games
    leftItems: v.optional(v.array(v.string())),
    rightItems: v.optional(v.array(v.string())),
    correctMatches: v.optional(v.array(v.object({
      leftIndex: v.number(),
      rightIndex: v.number(),
    }))),
    // For fill-in-blank
    blankText: v.optional(v.string()),
    correctAnswers: v.optional(v.array(v.string())),
    // For multiple choice
    options: v.optional(v.array(v.string())),
    correctOptionIndex: v.optional(v.number()),
    // For image association
    imageUrl: v.optional(v.string()),
    associatedTerms: v.optional(v.array(v.string())),
    // General
    explanation: v.optional(v.string()),
    points: v.number(),
  }).index("by_minigame", ["minigameId"]),

  minigameAttempts: defineTable({
    minigameId: v.id("minigames"),
    questId: v.id("quests"),
    userId: v.string(), // For now using string, can be enhanced with auth later
    score: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    timeSpent: v.number(), // seconds
    completedAt: v.number(),
    passed: v.boolean(),
  }).index("by_minigame", ["minigameId"])
    .index("by_quest", ["questId"])
    .index("by_user", ["userId"]),
});
