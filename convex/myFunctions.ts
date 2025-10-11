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

export const getQuestById = query({
  args: { questId: v.id("quests") },
  returns: v.union(
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
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.questId);
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

// Minigame queries
export const getMinigameByQuest = query({
  args: { questId: v.id("quests") },
  returns: v.union(
    v.object({
      _id: v.id("minigames"),
      _creationTime: v.number(),
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
      timeLimit: v.optional(v.number()),
      requiredScore: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("minigames")
      .withIndex("by_quest", (q) => q.eq("questId", args.questId))
      .unique();
  },
});

export const getMinigameQuestions = query({
  args: { minigameId: v.id("minigames") },
  returns: v.array(
    v.object({
      _id: v.id("minigameQuestions"),
      _creationTime: v.number(),
      minigameId: v.id("minigames"),
      questionText: v.string(),
      questionType: v.union(
        v.literal("matching"),
        v.literal("fill-in-blank"),
        v.literal("multiple-choice"),
        v.literal("image-association"),
      ),
      leftItems: v.optional(v.array(v.string())),
      rightItems: v.optional(v.array(v.string())),
      correctMatches: v.optional(v.array(v.object({
        leftIndex: v.number(),
        rightIndex: v.number(),
      }))),
      blankText: v.optional(v.string()),
      correctAnswers: v.optional(v.array(v.string())),
      options: v.optional(v.array(v.string())),
      correctOptionIndex: v.optional(v.number()),
      imageUrl: v.optional(v.string()),
      associatedTerms: v.optional(v.array(v.string())),
      explanation: v.optional(v.string()),
      points: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("minigameQuestions")
      .withIndex("by_minigame", (q) => q.eq("minigameId", args.minigameId))
      .collect();
  },
});

export const getUserMinigameAttempts = query({
  args: { 
    questId: v.id("quests"),
    userId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("minigameAttempts"),
      _creationTime: v.number(),
      minigameId: v.id("minigames"),
      questId: v.id("quests"),
      userId: v.string(),
      score: v.number(),
      totalQuestions: v.number(),
      correctAnswers: v.number(),
      timeSpent: v.number(),
      completedAt: v.number(),
      passed: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("minigameAttempts")
      .withIndex("by_quest", (q) => q.eq("questId", args.questId))
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

// Minigame mutations
export const submitMinigameAttempt = mutation({
  args: {
    minigameId: v.id("minigames"),
    questId: v.id("quests"),
    userId: v.string(),
    score: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    timeSpent: v.number(),
    passed: v.boolean(),
  },
  returns: v.id("minigameAttempts"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("minigameAttempts", {
      minigameId: args.minigameId,
      questId: args.questId,
      userId: args.userId,
      score: args.score,
      totalQuestions: args.totalQuestions,
      correctAnswers: args.correctAnswers,
      timeSpent: args.timeSpent,
      completedAt: Date.now(),
      passed: args.passed,
    });
  },
});

export const toggleMinigameEnabled = mutation({
  args: {
    minigameId: v.id("minigames"),
    enabled: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.minigameId, { enabled: args.enabled });
    return null;
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

    // FOUNDATION Quests
    const knifeSafety = await insertQuest("Knife Safety", "lesson", "foundation", "completed", 3, 3);
    const kitchenHygiene = await insertQuest("Kitchen Hygiene", "lesson", "foundation", "available", 0, 3);
    const basicCuts = await insertQuest("Basic Cuts", "lesson", "foundation", "locked", 0, 3);
    const measuring = await insertQuest("Measuring 101", "lesson", "foundation", "locked", 0, 3);
    const understandingRecipes = await insertQuest("Reading a Recipe", "concept", "foundation", "locked", 0, 3);

    // TECHNIQUE Quests
    const heatControl = await insertQuest("Mastering Heat", "lesson", "technique", "locked", 0, 3);
    const panSearing = await insertQuest("The Perfect Sear", "lesson", "technique", "locked", 0, 3);
    const sautéAndStirFry = await insertQuest("Sauté & Stir-fry", "challenge", "technique", "locked", 0, 3);
    const roastingAndBaking = await insertQuest("Roasting & Baking", "lesson", "technique", "locked", 0, 3);
    const boilingAndSimmering = await insertQuest("Boiling & Simmering", "lesson", "technique", "locked", 0, 3);

    // FLAVOR Quests
    const saltAndPepper = await insertQuest("Salt, Fat, Acid, Heat", "concept", "flavor", "locked", 0, 3);
    const buildingAromatics = await insertQuest("Building Aromatics", "lesson", "flavor", "locked", 0, 3);
    const perfectScrambledEggs = await insertQuest("Challenge: Perfect Eggs", "challenge", "flavor", "locked", 0, 3);

    // BOSS BATTLES
    const simpleSoup = await insertQuest("Boss: Simple Soup", "boss", "technique", "locked", 0, 5);
    const roastedChicken = await insertQuest("Boss: Roasted Chicken", "boss", "cuisine", "locked", 0, 5);
    const finalChallenge = await insertQuest("Final Dish: Greatness", "boss", "advanced", "locked", 0, 5);

    // Wire prerequisites
    await ctx.db.patch(kitchenHygiene, { prerequisites: [knifeSafety] });
    await ctx.db.patch(basicCuts, { prerequisites: [knifeSafety] });
    await ctx.db.patch(measuring, { prerequisites: [kitchenHygiene] });
    await ctx.db.patch(understandingRecipes, { prerequisites: [measuring] });
    await ctx.db.patch(heatControl, { prerequisites: [understandingRecipes, basicCuts] });
    await ctx.db.patch(panSearing, { prerequisites: [heatControl] });
    await ctx.db.patch(boilingAndSimmering, { prerequisites: [heatControl] });
    await ctx.db.patch(saltAndPepper, { prerequisites: [heatControl] });
    await ctx.db.patch(buildingAromatics, { prerequisites: [saltAndPepper, basicCuts] });
    await ctx.db.patch(perfectScrambledEggs, { prerequisites: [panSearing, saltAndPepper] });
    await ctx.db.patch(sautéAndStirFry, { prerequisites: [panSearing] });
    await ctx.db.patch(roastingAndBaking, { prerequisites: [heatControl] });
    await ctx.db.patch(simpleSoup, { prerequisites: [boilingAndSimmering, buildingAromatics] });
    await ctx.db.patch(roastedChicken, { prerequisites: [roastingAndBaking, saltAndPepper] });
    await ctx.db.patch(finalChallenge, { prerequisites: [simpleSoup, roastedChicken] });


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
      await ctx.db.insert("lessonContents", { questId: qid, emoji, heading, description, steps, hints });
    };

    await insertContent("Knife Safety", "🔪", "Safety First, Always", "A sharp knife is your best tool. Respect it and you'll be safe and efficient.", ["Always use a cutting board on a flat, stable surface.", "Curl your fingertips under to form a 'claw' with your non-knife hand.", "A sharp knife is safer than a dull one because it requires less pressure.", "Never try to catch a falling knife.", "Wash and dry knives by hand, immediately after use."], ["Place a damp paper towel under your cutting board to prevent slipping.", "The 'pinch grip' on the blade gives you the most control."]);
    await insertContent("Kitchen Hygiene", "🧼", "A Clean Kitchen is a Safe Kitchen", "Prevent foodborne illness with these simple, crucial habits.", ["Wash your hands with soap and water before, during, and after handling food.", "Use separate cutting boards for raw meat and produce to avoid cross-contamination.", "Cook foods to their proper internal temperature.", "Refrigerate leftovers promptly (within 2 hours).", "Clean and sanitize surfaces and equipment after use."], ["When in doubt, throw it out.", "Hot, soapy water is your best friend."]);
    await insertContent("Basic Cuts", "🥕", "Uniformity is Key", "Consistent cuts mean food cooks evenly and looks professional. Master these, and you're on your way.", ["The Dice: Create cubes of a uniform size (small, medium, large).", "The Julienne: Cut vegetables into long, thin matchsticks.", "The Mince: Finely chop ingredients like garlic or herbs.", "The Slice: Create round or cross-section cuts.", "The Chiffonade: For leafy greens and herbs, stack, roll tightly, and slice into thin ribbons."], ["Create a flat, stable surface by slicing a small piece off one side of round vegetables.", "Let the weight of the knife do the work; don't force it."]);
    await insertContent("Measuring 101", "⚖️", "Precision for Predictable Results", "Baking is a science, and cooking is an art built on science. Accuracy matters.", ["Use liquid measuring cups for wet ingredients. Read them at eye level.", "Use dry measuring cups for dry ingredients.", "To measure flour, spoon it into the cup and level it off with a straight edge. Don't pack it down!", "For brown sugar, pack it into the measuring cup.", "A kitchen scale is the most accurate way to measure, especially for baking."], ["'Tsp' stands for teaspoon; 'Tbsp' stands for tablespoon. There are 3 teaspoons in 1 tablespoon.", "Mise en place: Measure and prepare all your ingredients before you start cooking."]);
    await insertContent("Reading a Recipe", "📜", "Decode the Chef's Language", "Understand the structure and terminology to follow any recipe with confidence.", ["Read the entire recipe from start to finish before you begin.", "Identify the ingredients list and the step-by-step instructions.", "Pay attention to action words like 'sauté,' 'simmer,' 'mince,' and 'fold.'", "Note the specified temperatures and cooking times.", "Understand that times are often estimates; use visual cues (e.g., 'golden brown') as your primary guide."], ["'To taste' means you should add a little, taste it, and decide if it needs more.", "Prepping your ingredients ('mise en place') before starting will make the process much smoother."]);
    await insertContent("Mastering Heat", "🔥", "The Cook's Loudest Tool", "Learning to control the heat of your pan is one of the most important cooking skills.", ["Preheat your pan before adding oil or food. A hot pan prevents sticking and ensures a good sear.", "Low Heat: For gentle cooking, simmering sauces, or sweating vegetables without browning.", "Medium Heat: Your all-purpose setting for sautéing, and general cooking.", "High Heat: For boiling water, searing meat, and stir-frying.", "Listen to your food. A gentle sizzle is good; a loud, angry crackle might mean the heat is too high."], ["If the oil starts to smoke, your pan is too hot. Remove it from the heat to cool down.", "Don't overcrowd the pan. It lowers the temperature and causes food to steam instead of sear."]);
    await insertContent("The Perfect Sear", "🥩", "Caramelization is Flavor", "Achieve that beautiful, brown crust on meats and vegetables, known as the Maillard reaction.", ["Get your pan hot. Use cast iron or stainless steel for best results.", "Pat your food completely dry with paper towels. Moisture is the enemy of a good sear.", "Use a neutral oil with a high smoke point, like canola or grapeseed oil.", "Place the food in the hot pan and do not move it. Let it form a crust.", "You'll know it's ready to flip when it releases easily from the pan."], ["A heavy-bottomed pan will retain heat better, leading to a more even sear.", "Season your food generously right before it goes into the pan."]);
    await insertContent("Boiling & Simmering", "💧", "Gentle Bubbles, Great Results", "Understand the difference between a rolling boil and a gentle simmer.", ["Boil: Large bubbles breaking the surface vigorously. Used for cooking pasta and blanching vegetables.", "Simmer: Small bubbles gently rising to the surface. Used for soups, stews, and braises.", "To boil water faster, use a lid to trap heat.", "Salt your pasta water generously. It should taste like the sea.", "Poaching is even gentler than simmering, with no visible bubbles."], ["A simmer extracts flavor slowly and keeps meats tender.", "If a simmer turns into a boil, simply lower the heat."]);
    await insertContent("Salt, Fat, Acid, Heat", "🍋", "The Four Elements of Flavor", "Every good dish has a balance of these four elements. Learn to recognize and adjust them.", ["Salt: Enhances all other flavors. If a dish tastes flat, it probably needs salt.", "Fat: Carries flavor and provides richness and texture (e.g., oil, butter, cream).", "Acid: Brightens flavors and cuts through richness (e.g., lemon juice, vinegar).", "Heat: Transforms ingredients and creates new flavors and textures (e.g., chili flakes, raw heat from a stove)."], ["If your dish tastes dull, add salt. If it's too rich, add acid.", "Taste your food at every stage of cooking and adjust these elements as you go."]);
    await insertContent("Building Aromatics", "🧅", "The Foundation of Flavor", "Start most savory dishes by building a base of aromatic vegetables.", ["'Mirepoix' is a classic French base of diced onion, carrot, and celery (usually a 2:1:1 ratio).", "Sweat your aromatics: Cook them gently in fat over low-to-medium heat until softened and translucent, but not browned.", "Add garlic and spices near the end of the sweating process, as they can burn easily.", "Blooming spices in fat before adding liquids intensifies their flavor.", "Other aromatic bases include the 'Holy Trinity' (onion, celery, bell pepper) in Cajun cooking."], ["A pinch of salt while sweating helps draw out moisture and prevent browning.", "This simple step adds incredible depth of flavor to soups, sauces, and stews."]);
    await insertContent("Challenge: Perfect Eggs", "🍳", "Master the Humble Egg", "Eggs are versatile but can be tricky. This challenge tests your heat control and technique.", ["For Scrambled: Cook low and slow, stirring constantly with a rubber spatula for a creamy, soft scramble.", "For Fried: Use medium heat. For a runny yolk ('sunny-side up'), cover the pan for a minute to steam the top.", "For an Omelette: Cook quickly over medium-high heat. Tilt the pan and pull the cooked edges to the center, letting the raw egg fill the space.", "Season your eggs just before they finish cooking.", "Don't overcook them! Remember they will continue to cook from residual heat after you plate them."], ["Adding a little butter or cream makes scrambled eggs richer.", "A non-stick pan is your best friend for cooking eggs."]);

    // Insert minigames
    const insertMinigame = async (
      questTitle: string,
      title: string,
      type: "matching" | "fill-in-blank" | "multiple-choice" | "image-association",
      description: string,
      difficulty: "easy" | "medium" | "hard",
      timeLimit: number | undefined,
      requiredScore: number,
    ) => {
      const questId = questIdByTitle[questTitle];
      return await ctx.db.insert("minigames", {
        questId,
        title,
        type,
        description,
        enabled: true,
        difficulty,
        timeLimit,
        requiredScore,
      });
    };

    const insertMinigameQuestion = async (
      minigameId: Id<"minigames">,
      questionText: string,
      questionType: "matching" | "fill-in-blank" | "multiple-choice" | "image-association",
      data: any,
      explanation: string | undefined,
      points: number,
    ) => {
      await ctx.db.insert("minigameQuestions", {
        minigameId,
        questionText,
        questionType,
        ...data,
        explanation,
        points,
      });
    };

    // Knife Safety Minigame - Matching
    const knifeSafetyMinigame = await insertMinigame(
      "Knife Safety",
      "Safety Match-Up",
      "matching",
      "Match the safety tips with their descriptions",
      "easy",
      60,
      70,
    );

    await insertMinigameQuestion(
      knifeSafetyMinigame,
      "Match each safety tip with its correct description:",
      "matching",
      {
        leftItems: ["Sharp knife", "Cutting board", "Claw grip", "Falling knife"],
        rightItems: ["Safer than dull", "Flat stable surface", "Curl fingertips", "Never catch"],
        correctMatches: [
          { leftIndex: 0, rightIndex: 0 },
          { leftIndex: 1, rightIndex: 1 },
          { leftIndex: 2, rightIndex: 2 },
          { leftIndex: 3, rightIndex: 3 },
        ],
      },
      "Remember: A sharp knife is safer because it requires less pressure and cuts more predictably.",
      10,
    );

    // Basic Cuts Minigame - Fill in the blank
    const basicCutsMinigame = await insertMinigame(
      "Basic Cuts",
      "Cut Knowledge",
      "fill-in-blank",
      "Complete the cutting technique descriptions",
      "medium",
      90,
      75,
    );

    await insertMinigameQuestion(
      basicCutsMinigame,
      "Complete: The _____ cut creates cubes of uniform size.",
      "fill-in-blank",
      {
        blankText: "The _____ cut creates cubes of uniform size.",
        correctAnswers: ["dice", "dicing"],
      },
      "The dice cut is fundamental for even cooking and professional presentation.",
      10,
    );

    await insertMinigameQuestion(
      basicCutsMinigame,
      "Complete: _____ involves cutting vegetables into long, thin matchsticks.",
      "fill-in-blank",
      {
        blankText: "_____ involves cutting vegetables into long, thin matchsticks.",
        correctAnswers: ["julienne", "julienning"],
      },
      "Julienne cuts are perfect for stir-fries and salads.",
      10,
    );

    // Heat Control Minigame - Multiple Choice
    const heatControlMinigame = await insertMinigame(
      "Mastering Heat",
      "Heat Master Quiz",
      "multiple-choice",
      "Test your knowledge of heat control",
      "medium",
      120,
      80,
    );

    await insertMinigameQuestion(
      heatControlMinigame,
      "What should you do if your oil starts to smoke?",
      "multiple-choice",
      {
        options: [
          "Add more oil",
          "Remove the pan from heat",
          "Turn up the heat",
          "Add food immediately",
        ],
        correctOptionIndex: 1,
      },
      "Smoking oil means it's too hot and can catch fire. Always remove from heat to cool down.",
      15,
    );

    await insertMinigameQuestion(
      heatControlMinigame,
      "Which heat setting is best for sautéing vegetables?",
      "multiple-choice",
      {
        options: ["Low heat", "Medium heat", "High heat", "Any heat"],
        correctOptionIndex: 1,
      },
      "Medium heat allows vegetables to cook through without burning on the outside.",
      15,
    );

    // Salt, Fat, Acid, Heat Minigame - Image Association
    const flavorMinigame = await insertMinigame(
      "Salt, Fat, Acid, Heat",
      "Flavor Elements",
      "image-association",
      "Associate cooking elements with their effects",
      "hard",
      150,
      85,
    );

    await insertMinigameQuestion(
      flavorMinigame,
      "Which element brightens flavors and cuts through richness?",
      "image-association",
      {
        imageUrl: "/images/lemon.jpg", // Placeholder
        associatedTerms: ["acid", "lemon", "vinegar", "brightness"],
      },
      "Acid elements like lemon juice or vinegar brighten flavors and balance richness.",
      20,
    );

    return { inserted: 16 };
  },
});
