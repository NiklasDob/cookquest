import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Queries
export const listQuests = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("quests"),
      _creationTime: v.number(),
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
    }),
  ),
  handler: async (ctx) => {
    const quests = await ctx.db.query("quests").order("asc").collect();
    return quests;
  },
});

export const getLessonContentByQuest = query({
  args: { questId: v.id("quests") },
  returns: v.union(
    v.object({
      _id: v.id("lessonContents"),
      _creationTime: v.number(),
      questId: v.id("quests"),
      emoji: v.string(),
      heading: v.string(),
      description: v.string(),
      steps: v.array(v.string()),
      hints: v.array(v.string()),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("lessonContents")
      .withIndex("by_quest", (q) => q.eq("questId", args.questId))
      .unique();
  },
});

// Mutations
export const updateQuestStatus = mutation({
  args: {
    questId: v.id("quests"),
    status: v.union(
      v.literal("locked"),
      v.literal("available"),
      v.literal("completed"),
    ),
    stars: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const quest = await ctx.db.get(args.questId);
    if (!quest) throw new Error("Quest not found");
    await ctx.db.patch(args.questId, {
      status: args.status,
      ...(typeof args.stars === "number" ? { stars: args.stars } : {}),
    });
    return null;
  },
});

// Complete a quest and unlock dependents whose prerequisites are now satisfied
export const completeQuestAndUnlockDependents = mutation({
  args: { questId: v.id("quests"), stars: v.optional(v.number()) },
  returns: v.null(),
  handler: async (ctx, args) => {
    const target = await ctx.db.get(args.questId);
    if (!target) throw new Error("Quest not found");

    // Mark the quest as completed
    await ctx.db.patch(args.questId, { status: "completed", ...(args.stars !== undefined ? { stars: args.stars } : {}) });

    // Load all quests to compute dependents
    const all = await ctx.db.query("quests").collect();
    const isCompleted = (id: Id<"quests">): boolean => {
      const q = all.find((qq) => qq._id === id);
      return q?.status === "completed";
    };

    for (const q of all) {
      if (q.status !== "locked") continue;
      const prereqsDone = q.prerequisites.every((pid) => isCompleted(pid) || pid === args.questId);
      if (prereqsDone) {
        await ctx.db.patch(q._id, { status: "available" });
      }
    }
    return null;
  },
});

// Seed mutation
export const seedLessons = mutation({
  args: {},
  returns: v.object({ inserted: v.number() }),
  handler: async (ctx) => {
    // Avoid duplicate seeding
    const existing = await ctx.db.query("quests").take(1);
    if (existing.length > 0) return { inserted: 0 };

    // Insert quests (ids captured to wire prerequisites)
    const questIdByTitle: Record<string, Id<"quests">> = {};

    const insertQuest = async (
      title: string,
      type: "lesson" | "challenge" | "boss" | "concept",
      category: "foundation" | "technique" | "flavor" | "cuisine" | "advanced",
      status: "locked" | "available" | "completed",
      stars: number,
      maxStars: number,
    ) => {
      const id = await ctx.db.insert("quests", {
        title,
        type,
        category,
        status,
        stars,
        maxStars,
        prerequisites: [],
      });
      questIdByTitle[title] = id;
      return id;
    };

    // Create base quests
    const knifeSafety = await insertQuest("Knife Safety", "lesson", "foundation", "completed", 3, 3);
    const basicCuts = await insertQuest("Basic Cuts", "lesson", "foundation", "available", 0, 3);
    const measuring = await insertQuest("Measuring", "lesson", "foundation", "locked", 0, 3);
    const saltSeasoning = await insertQuest("Salt & Seasoning", "concept", "flavor", "locked", 0, 3);
    const heatControl = await insertQuest("Heat Control", "lesson", "technique", "locked", 0, 3);
    const simpleSoup = await insertQuest("Simple Soup", "challenge", "technique", "locked", 0, 3);
    const greatness = await insertQuest("GREATNESS", "lesson", "technique", "locked", 0, 3);

    // Patch prerequisites now that ids exist
    await ctx.db.patch(basicCuts, { prerequisites: [knifeSafety] });
    await ctx.db.patch(measuring, { prerequisites: [knifeSafety] });
    await ctx.db.patch(saltSeasoning, { prerequisites: [basicCuts, measuring] });
    await ctx.db.patch(heatControl, { prerequisites: [basicCuts, measuring] });
    await ctx.db.patch(simpleSoup, { prerequisites: [basicCuts, measuring] });
    await ctx.db.patch(greatness, { prerequisites: [simpleSoup, measuring] });

    // Insert lesson contents
    const insertContent = async (
      title: string,
      emoji: string,
      heading: string,
      description: string,
      steps: Array<string>,
      hints: Array<string>,
    ) => {
      const qid = questIdByTitle[title];
      await ctx.db.insert("lessonContents", {
        questId: qid,
        emoji,
        heading,
        description,
        steps,
        hints,
      });
    };

    await insertContent(
      "Knife Safety",
      "🔪",
      "Knife Safety First",
      "Keep blades sharp, use a stable board, and practice claw grip.",
      [
        "Choose the right knife for the task (chef's, paring, serrated).",
        "Stabilize your board with a damp towel underneath.",
        "Use the claw grip: tuck fingertips, guide with knuckles.",
        "Always slice away from your body and keep the tip anchored for mincing.",
        "Store knives safely and wash immediately after use.",
      ],
      [
        "A sharp knife is safer than a dull one.",
        "Dry your hands and handle before cutting.",
        "Stand square to the board for control.",
      ],
    );

    await insertContent(
      "Basic Cuts",
      "🥕",
      "Master Basic Cuts",
      "Uniform cuts ensure even cooking and professional presentation.",
      [
        "Learn batonnet and julienne: long even matchsticks.",
        "Practice small/medium/large dice from planks and sticks.",
        "Chiffonade leafy herbs by rolling into a tight cigar.",
        "Mince garlic by rocking the knife with the tip anchored.",
        "Measure consistency by lining pieces side-by-side.",
      ],
      [
        "Square off vegetables first to create flat, stable sides.",
        "Use your non-dominant hand as a guide fence.",
        "Let the knife do the work—avoid pressing down.",
      ],
    );

    await insertContent(
      "Measuring",
      "⚖️",
      "Measure for Success",
      "Accurate measurement improves consistency, especially in baking.",
      [
        "Use a digital scale for dry ingredients when possible.",
        "Level off flour; don't pack unless specified.",
        "Use liquid cups at eye level for wet ingredients.",
        "Mind teaspoon vs tablespoon and metric vs imperial.",
      ],
      ["Zero your scale with the bowl on it.", "Keep conversion chart handy."],
    );

    await insertContent(
      "Salt & Seasoning",
      "🧂",
      "Season with Confidence",
      "Salt enhances flavor, balances bitterness, and draws out moisture.",
      [
        "Season in layers: during prep, cooking, and finishing.",
        "Taste as you go—adjust gradually.",
        "Use kosher salt for control; finish with flaky salt.",
        "Balance with acid, fat, and sweetness.",
      ],
      ["If it's flat, add acid before more salt.", "Bloom spices in fat for depth."],
    );

    await insertContent(
      "Heat Control",
      "🔥",
      "Master Heat",
      "Control heat to build texture and flavor without burning.",
      [
        "Preheat pans; add oil just before ingredients.",
        "Use medium-high for searing, medium for sautéing, low for simmering.",
        "Crowding lowers temperature—cook in batches.",
        "Rest proteins to redistribute juices.",
      ],
      ["If smoking, reduce heat and deglaze.", "Listen: sizzling guides your heat level."],
    );

    await insertContent(
      "Simple Soup",
      "🥣",
      "Build a Simple Soup",
      "Use aromatics, stock, and seasonal vegetables for a satisfying bowl.",
      [
        "Sweat onions, carrots, celery with salt.",
        "Add garlic and spices; bloom briefly.",
        "Pour in stock; simmer until tender.",
        "Adjust seasoning; add acid and herbs to finish.",
      ],
      ["For body, puree a portion and return.", "Finish with olive oil or yogurt."],
    );

    await insertContent(
      "GREATNESS",
      "✨",
      "Path to Greatness",
      "Combine fundamentals into composed dishes with precision.",
      [
        "Plan mise en place and timing across components.",
        "Execute techniques: sear, sauce, season, and garnish.",
        "Plate with color, height, and negative space.",
      ],
      ["Keep notes; iterate on balance and texture.", "Seek feedback and refine."],
    );

    return { inserted: 7 };
  },
});
