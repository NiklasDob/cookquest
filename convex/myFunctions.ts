import { v } from "convex/values";
import { query, mutation, action, internalMutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";

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
      badge: v.optional(v.string()),
      xp: v.optional(v.number()),
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
      badge: v.optional(v.string()),
      xp: v.optional(v.number()),
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
      steps: v.array(
        v.object({
          text: v.string(),
          imageId: v.optional(v.id("_storage")), 
        }),
      ),
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
      correctMatches: v.optional(
        v.array(
          v.object({
            leftIndex: v.number(),
            rightIndex: v.number(),
          }),
        ),
      ),
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
    await ctx.db.patch(args.questId, {
      status: "completed",
      ...(args.stars !== undefined ? { stars: args.stars } : {}),
    });

    // Load all quests to compute dependents
    const all = await ctx.db.query("quests").collect();
    const isCompleted = (id: Id<"quests">): boolean => {
      const q = all.find((qq) => qq._id === id);
      return q?.status === "completed";
    };

    for (const q of all) {
      if (q.status !== "locked") continue;
      const prereqsDone = q.prerequisites.every(
        (pid) => isCompleted(pid) || pid === args.questId,
      );
      if (prereqsDone) {
        await ctx.db.patch(q._id, { status: "available" });
      }
    }
    return null;
  },
});

export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const updateSeeds = mutation({
  args: {uploadedImages: v.object({"knife_cuts": v.array(v.id("_storage"))}) },
  handler: async (ctx, args) : Promise<{inserted: number}> => {
    return await ctx.runMutation(internal.myFunctions.seedLessons, args);
  },
});

export const seedLessons = internalMutation({
  args: {uploadedImages: v.object({"knife_cuts": v.array(v.id("_storage"))}) },
  returns: v.object({ inserted: v.number() }),
  handler: async (ctx, args) => {
    const {uploadedImages} = args
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
      badge?: string,
      xp?: number,
      cuisineType?: "french" | "asian" | "italian",
    ) => {
      const id = await ctx.db.insert("quests", {
        title,
        type,
        category,
        status,
        stars,
        maxStars,
        prerequisites: [],
        badge: badge ?? "",
        xp: xp ?? 0,
        ...(cuisineType ? { cuisineType } : {}),
      });
      questIdByTitle[title] = id;
      return id;
    };

    // FOUNDATION Quests
    const knifeSafety = await insertQuest(
      "Knife Safety",
      "lesson",
      "foundation",
      "completed",
      3,
      3,
    );
    const kitchenHygiene = await insertQuest(
      "Kitchen Hygiene",
      "lesson",
      "foundation",
      "available",
      0,
      3,
    );
    const basicCuts = await insertQuest(
      "Basic Cuts",
      "lesson",
      "foundation",
      "locked",
      0,
      3,
      "Basic Cuts",
      100,
    );
    const measuring = await insertQuest(
      "Measuring 101",
      "lesson",
      "foundation",
      "locked",
      0,
      3,
    );
    const understandingRecipes = await insertQuest(
      "Reading a Recipe",
      "concept",
      "foundation",
      "locked",
      0,
      3,
    );

    // TECHNIQUE Quests
    const heatControl = await insertQuest(
      "Mastering Heat",
      "lesson",
      "technique",
      "locked",
      0,
      3,
      "Mastering Heat",
      100,
    );
    const panSearing = await insertQuest(
      "The Perfect Sear",
      "lesson",
      "technique",
      "locked",
      0,
      3,
    );
    const sautéAndStirFry = await insertQuest(
      "Sauté & Stir-fry",
      "challenge",
      "technique",
      "locked",
      0,
      3,
    );
    const roastingAndBaking = await insertQuest(
      "Roasting & Baking",
      "lesson",
      "technique",
      "locked",
      0,
      3,
    );
    const boilingAndSimmering = await insertQuest(
      "Boiling & Simmering",
      "lesson",
      "technique",
      "locked",
      0,
      3,
    );
    const braisingAndStewing = await insertQuest(
      "Braising & Stewing",
      "lesson",
      "technique",
      "locked",
      0,
      3,
    );

    // FLAVOR Quests
    const saltAndPepper = await insertQuest(
      "Salt, Fat, Acid, Heat",
      "concept",
      "flavor",
      "locked",
      0,
      3,
    );
    const buildingAromatics = await insertQuest(
      "Building Aromatics",
      "lesson",
      "flavor",
      "locked",
      0,
      3,
    );
    const perfectScrambledEggs = await insertQuest(
      "Challenge: Perfect Eggs",
      "challenge",
      "flavor",
      "locked",
      0,
      3,
      "Now your cooking",
      250,
    );

    // CUISINE Quests
    const motherSauces = await insertQuest(
      "French: Mother Sauces",
      "lesson",
      "cuisine",
      "locked",
      0,
      3,
      "Oui",
      250,
      "french",
    );
    const perfectPasta = await insertQuest(
      "Italian: Perfect Pasta",
      "lesson",
      "cuisine",
      "locked",
      0,
      3,
      "Italy",
      100,
      "italian",
    );
    const asianFlavor = await insertQuest(
      "Asian: Balancing Flavors",
      "concept",
      "cuisine",
      "locked",
      0,
      3,
      "Asia",
      100,
      "asian",
    );

    // ADVANCED Quests
    const plating = await insertQuest(
      "Advanced: Plating",
      "concept",
      "advanced",
      "locked",
      0,
      3,
    );

    // BOSS BATTLES
    const simpleSoup = await insertQuest(
      "Boss: Simple Soup",
      "boss",
      "technique",
      "locked",
      0,
      5,
    );
    const roastedChicken = await insertQuest(
      "Boss: Roasted Chicken",
      "boss",
      "cuisine",
      "locked",
      0,
      5,
    );
    const pastaCarbonara = await insertQuest(
      "Boss: Pasta Carbonara",
      "boss",
      "cuisine",
      "locked",
      0,
      5,
      "italian",
    );
    const finalChallenge = await insertQuest(
      "Final Dish: Greatness",
      "boss",
      "advanced",
      "locked",
      0,
      5,
    );

    // Wire prerequisites
    await ctx.db.patch(kitchenHygiene, { prerequisites: [knifeSafety] });
    await ctx.db.patch(basicCuts, { prerequisites: [knifeSafety] });
    await ctx.db.patch(measuring, { prerequisites: [kitchenHygiene] });
    await ctx.db.patch(understandingRecipes, { prerequisites: [measuring] });
    await ctx.db.patch(heatControl, {
      prerequisites: [understandingRecipes, basicCuts],
    });
    await ctx.db.patch(panSearing, { prerequisites: [heatControl] });
    await ctx.db.patch(boilingAndSimmering, { prerequisites: [heatControl] });
    await ctx.db.patch(braisingAndStewing, { prerequisites: [heatControl] });
    await ctx.db.patch(saltAndPepper, { prerequisites: [heatControl] });
    await ctx.db.patch(buildingAromatics, {
      prerequisites: [saltAndPepper, basicCuts],
    });
    await ctx.db.patch(perfectScrambledEggs, {
      prerequisites: [panSearing, saltAndPepper],
    });
    await ctx.db.patch(sautéAndStirFry, { prerequisites: [panSearing] });
    await ctx.db.patch(roastingAndBaking, { prerequisites: [heatControl] });
    await ctx.db.patch(simpleSoup, {
      prerequisites: [
        boilingAndSimmering,
        buildingAromatics,
        braisingAndStewing,
      ],
    });
    await ctx.db.patch(roastedChicken, {
      prerequisites: [roastingAndBaking, saltAndPepper],
    });
    await ctx.db.patch(motherSauces, {
      prerequisites: [buildingAromatics, heatControl],
    });
    await ctx.db.patch(perfectPasta, { prerequisites: [boilingAndSimmering] });
    await ctx.db.patch(asianFlavor, {
      prerequisites: [sautéAndStirFry, saltAndPepper],
    });
    await ctx.db.patch(pastaCarbonara, {
      prerequisites: [perfectPasta, panSearing],
    });
    await ctx.db.patch(plating, {
      prerequisites: [simpleSoup, roastedChicken],
    });
    await ctx.db.patch(finalChallenge, {
      prerequisites: [pastaCarbonara, plating],
    });

    // Insert lesson contents
    const insertContent = async (
      title: string,
      emoji: string,
      heading: string,
      description: string,
      // steps: Array<Record<string, Id<"_storage">>>,
      // steps: Array<{text: string, imageId? : Id<"_storage">}>,
      steps: Array<string>,
      hints: Array<string>,
      stepImages? : Array<Id<"_storage">>
    ) => {
      const qid = questIdByTitle[title];
      const newSteps :  Array<{text: string, imageId? : Id<"_storage">}> = steps.map((s : string, i : number) => {
        if(stepImages && stepImages.length === steps.length){
          return {text: s, imageId: stepImages[i]}
        }else{
          return {text: s}
        }
      })
      await ctx.db.insert("lessonContents", {
        questId: qid,
        emoji,
        heading,
        description,
        steps: newSteps,
        hints,
      });
    };

    await insertContent(
      "Knife Safety",
      "🔪",
      "Safety First, Always",
      "A sharp knife is your best tool. Respect it and you'll be safe and efficient.",
      [
        "Always use a cutting board on a flat, stable surface.",
        "Curl your fingertips under to form a 'claw' with your non-knife hand.",
        "A sharp knife is safer than a dull one because it requires less pressure.",
        "Never try to catch a falling knife.",
        "Wash and dry knives by hand, immediately after use.",
      ],
      [
        "Place a damp paper towel under your cutting board to prevent slipping.",
        "The 'pinch grip' on the blade gives you the most control.",
      ],
    );
    await insertContent(
      "Kitchen Hygiene",
      "🧼",
      "A Clean Kitchen is a Safe Kitchen",
      "Prevent foodborne illness with these simple, crucial habits.",
      [
        "Wash your hands with soap and water before, during, and after handling food.",
        "Use separate cutting boards for raw meat and produce to avoid cross-contamination.",
        "Cook foods to their proper internal temperature.",
        "Refrigerate leftovers promptly (within 2 hours).",
        "Clean and sanitize surfaces and equipment after use.",
      ],
      ["When in doubt, throw it out.", "Hot, soapy water is your best friend."],
    );


    await insertContent(
      "Basic Cuts",
      "🥕",
      "Uniformity is Key",
      "Consistent cuts mean food cooks evenly and looks professional. Master these, and you're on your way.",
      [
        "The Dice: Create cubes of a uniform size (small, medium, large).",
        "The Julienne: Cut vegetables into long, thin matchsticks.",
        "The Mince: Finely chop ingredients like garlic or herbs.",
        "The Slice: Create round or cross-section cuts.",
        "The Chiffonade: For leafy greens and herbs, stack, roll tightly, and slice into thin ribbons.",
      ],
      [
        "Create a flat, stable surface by slicing a small piece off one side of round vegetables.",
        "Let the weight of the knife do the work; don't force it.",
      ],
      uploadedImages["knife_cuts"]
    );
    await insertContent(
      "Measuring 101",
      "⚖️",
      "Precision for Predictable Results",
      "Baking is a science, and cooking is an art built on science. Accuracy matters.",
      [
        "Use liquid measuring cups for wet ingredients. Read them at eye level.",
        "Use dry measuring cups for dry ingredients.",
        "To measure flour, spoon it into the cup and level it off with a straight edge. Don't pack it down!",
        "For brown sugar, pack it into the measuring cup.",
        "A kitchen scale is the most accurate way to measure, especially for baking.",
      ],
      [
        "'Tsp' stands for teaspoon; 'Tbsp' stands for tablespoon. There are 3 teaspoons in 1 tablespoon.",
        "Mise en place: Measure and prepare all your ingredients before you start cooking.",
      ],
    );
    await insertContent(
      "Reading a Recipe",
      "📜",
      "Decode the Chef's Language",
      "Understand the structure and terminology to follow any recipe with confidence.",
      [
        "Read the entire recipe from start to finish before you begin.",
        "Identify the ingredients list and the step-by-step instructions.",
        "Pay attention to action words like 'sauté,' 'simmer,' 'mince,' and 'fold.'",
        "Note the specified temperatures and cooking times.",
        "Understand that times are often estimates; use visual cues (e.g., 'golden brown') as your primary guide.",
      ],
      [
        "'To taste' means you should add a little, taste it, and decide if it needs more.",
        "Prepping your ingredients ('mise en place') before starting will make the process much smoother.",
      ],
    );
    await insertContent(
      "Mastering Heat",
      "🔥",
      "The Cook's Loudest Tool",
      "Learning to control the heat of your pan is one of the most important cooking skills.",
      [
        "Preheat your pan before adding oil or food. A hot pan prevents sticking and ensures a good sear.",
        "Low Heat: For gentle cooking, simmering sauces, or sweating vegetables without browning.",
        "Medium Heat: Your all-purpose setting for sautéing, and general cooking.",
        "High Heat: For boiling water, searing meat, and stir-frying.",
        "Listen to your food. A gentle sizzle is good; a loud, angry crackle might mean the heat is too high.",
      ],
      [
        "If the oil starts to smoke, your pan is too hot. Remove it from the heat to cool down.",
        "Don't overcrowd the pan. It lowers the temperature and causes food to steam instead of sear.",
      ],
    );
    await insertContent(
      "The Perfect Sear",
      "🥩",
      "Caramelization is Flavor",
      "Achieve that beautiful, brown crust on meats and vegetables, known as the Maillard reaction.",
      [
        "Get your pan hot. Use cast iron or stainless steel for best results.",
        "Pat your food completely dry with paper towels. Moisture is the enemy of a good sear.",
        "Use a neutral oil with a high smoke point, like canola or grapeseed oil.",
        "Place the food in the hot pan and do not move it. Let it form a crust.",
        "You'll know it's ready to flip when it releases easily from the pan.",
      ],
      [
        "A heavy-bottomed pan will retain heat better, leading to a more even sear.",
        "Season your food generously right before it goes into the pan.",
      ],
    );
    await insertContent(
      "Boiling & Simmering",
      "💧",
      "Gentle Bubbles, Great Results",
      "Understand the difference between a rolling boil and a gentle simmer.",
      [
        "Boil: Large bubbles breaking the surface vigorously. Used for cooking pasta and blanching vegetables.",
        "Simmer: Small bubbles gently rising to the surface. Used for soups, stews, and braises.",
        "To boil water faster, use a lid to trap heat.",
        "Salt your pasta water generously. It should taste like the sea.",
        "Poaching is even gentler than simmering, with no visible bubbles.",
      ],
      [
        "A simmer extracts flavor slowly and keeps meats tender.",
        "If a simmer turns into a boil, simply lower the heat.",
      ],
    );
    await insertContent(
      "Braising & Stewing",
      "🥘",
      "Low and Slow, Big Flavor",
      "Master the art of cooking tough cuts of meat and hearty vegetables into tender, flavorful dishes.",
      [
        "Start by searing your main ingredient (like beef or chicken) to develop a flavorful crust.",
        "Sauté aromatics (mirepoix) in the same pot to build a flavor base.",
        "Deglaze the pot with a liquid like wine, stock, or water to lift up the browned bits (fond).",
        "Add enough liquid to partially submerge the main ingredient (braising) or fully cover it (stewing).",
        "Cover and cook at a low temperature for a long time, either on the stove or in the oven, until everything is fork-tender.",
      ],
      [
        "This technique is perfect for less expensive, tougher cuts of meat.",
        "The cooking liquid becomes a delicious, built-in sauce.",
      ],
    );
    await insertContent(
      "Salt, Fat, Acid, Heat",
      "🍋",
      "The Four Elements of Flavor",
      "Every good dish has a balance of these four elements. Learn to recognize and adjust them.",
      [
        "Salt: Enhances all other flavors. If a dish tastes flat, it probably needs salt.",
        "Fat: Carries flavor and provides richness and texture (e.g., oil, butter, cream).",
        "Acid: Brightens flavors and cuts through richness (e.g., lemon juice, vinegar).",
        "Heat: Transforms ingredients and creates new flavors and textures (e.g., chili flakes, raw heat from a stove).",
      ],
      [
        "If your dish tastes dull, add salt. If it's too rich, add acid.",
        "Taste your food at every stage of cooking and adjust these elements as you go.",
      ],
    );
    await insertContent(
      "Building Aromatics",
      "🧅",
      "The Foundation of Flavor",
      "Start most savory dishes by building a base of aromatic vegetables.",
      [
        "'Mirepoix' is a classic French base of diced onion, carrot, and celery (usually a 2:1:1 ratio).",
        "Sweat your aromatics: Cook them gently in fat over low-to-medium heat until softened and translucent, but not browned.",
        "Add garlic and spices near the end of the sweating process, as they can burn easily.",
        "Blooming spices in fat before adding liquids intensifies their flavor.",
        "Other aromatic bases include the 'Holy Trinity' (onion, celery, bell pepper) in Cajun cooking.",
      ],
      [
        "A pinch of salt while sweating helps draw out moisture and prevent browning.",
        "This simple step adds incredible depth of flavor to soups, sauces, and stews.",
      ],
    );
    await insertContent(
      "Challenge: Perfect Eggs",
      "🍳",
      "Master the Humble Egg",
      "Eggs are versatile but can be tricky. This challenge tests your heat control and technique.",
      [
        "For Scrambled: Cook low and slow, stirring constantly with a rubber spatula for a creamy, soft scramble.",
        "For Fried: Use medium heat. For a runny yolk ('sunny-side up'), cover the pan for a minute to steam the top.",
        "For an Omelette: Cook quickly over medium-high heat. Tilt the pan and pull the cooked edges to the center, letting the raw egg fill the space.",
        "Season your eggs just before they finish cooking.",
        "Don't overcook them! Remember they will continue to cook from residual heat after you plate them.",
      ],
      [
        "Adding a little butter or cream makes scrambled eggs richer.",
        "A non-stick pan is your best friend for cooking eggs.",
      ],
    );
    await insertContent(
      "French: Mother Sauces",
      "🇫🇷",
      "The Pillars of French Cuisine",
      "Learn the five foundational sauces from which hundreds of other sauces are made.",
      [
        "Béchamel: A creamy, milk-based sauce thickened with a white roux (butter and flour).",
        "Velouté: A light, stock-based sauce, thickened with a blond roux. The stock is white (chicken, fish, or veal).",
        "Espagnole: A rich, dark brown sauce made from a brown stock, mirepoix, and a brown roux.",
        "Hollandaise: An emulsion of egg yolk, melted butter, and an acidic element like lemon juice or vinegar.",
        "Tomate: A classic tomato-based sauce, often enriched with stock and aromatics.",
      ],
      [
        "A 'roux' is a cooked mixture of equal parts fat and flour used as a thickener.",
        "Mastering these sauces will elevate your cooking to a new level.",
      ],
    );
    await insertContent(
      "Italian: Perfect Pasta",
      "🇮🇹",
      "The Heart of Italian Cooking",
      "It seems simple, but cooking pasta perfectly is a fundamental skill.",
      [
        "Use a large pot with plenty of water. At least 4-6 quarts per pound of pasta.",
        "Salt the water generously. It should taste like the sea. This seasons the pasta from the inside out.",
        "Bring the water to a full, rolling boil before adding the pasta.",
        "Stir the pasta immediately after adding it and occasionally during cooking to prevent sticking.",
        "Cook until 'al dente'—tender but still with a firm bite. Start tasting a minute or two before the package instructions say it's done.",
        "Save a cup of the starchy pasta water before draining. It's liquid gold for finishing your sauce.",
      ],
      [
        "Never add oil to your pasta water; it prevents the sauce from clinging to the pasta.",
        "Finish cooking the pasta in the pan with your sauce for the last minute to meld the flavors.",
      ],
    );
    await insertContent(
      "Asian: Balancing Flavors",
      "🍜",
      "The Art of Harmony",
      "Asian cuisines often focus on the interplay of sweet, sour, salty, savory (umami), and spicy.",
      [
        "Salty: The foundation. Comes from soy sauce, fish sauce, miso paste, etc.",
        "Sweet: Balances saltiness and sourness. Comes from sugar, honey, mirin, or fruit.",
        "Sour: Adds brightness and cuts through fat. Comes from rice vinegar, citrus (lime), or tamarind.",
        "Savory (Umami): Adds depth and a 'meaty' flavor. Found in mushrooms, seaweed, fermented products, and MSG.",
        "Spicy: Adds heat and complexity. Comes from chilies, ginger, wasabi, or peppercorns.",
      ],
      [
        "A good dish is a balancing act. If your stir-fry is too salty, a little sugar or vinegar can fix it.",
        "Taste and adjust constantly to achieve the perfect harmony.",
      ],
    );
    await insertContent(
      "Advanced: Plating",
      "🎨",
      "The First Bite is With the Eye",
      "Elevate your finished dish from simple food to a culinary experience.",
      [
        "Rule of Odds: An odd number of items on a plate (e.g., 3 scallops instead of 4) is more visually appealing.",
        "Use the Clock: Think of the plate as a clock face. Place your carb at 10, protein at 2, and vegetables at 6.",
        "Create Height: Stack ingredients to create dimension and visual interest.",
        "Use Color and Texture: A monochromatic plate is boring. Add a sprinkle of green herbs, a dash of red spice, or a crunchy element to create contrast.",
        "Keep it Clean: Wipe the rim of the plate before serving for a professional look.",
      ],
      [
        "Negative space is important. Don't overcrowd the plate.",
        "Use sauces to add flow and movement to the dish.",
      ],
    );

    // Insert minigames
    const insertMinigame = async (
      questTitle: string,
      title: string,
      type:
        | "matching"
        | "fill-in-blank"
        | "multiple-choice"
        | "image-association",
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
      questionType:
        | "matching"
        | "fill-in-blank"
        | "multiple-choice"
        | "image-association",
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
      "Match the safety tips with their descriptions.",
      "easy",
      60,
      100,
    );
    await insertMinigameQuestion(
      knifeSafetyMinigame,
      "Match each safety tip with its correct description:",
      "matching",
      {
        leftItems: [
          "Sharp knife",
          "Cutting board",
          "Claw grip",
          "Falling knife",
        ],
        rightItems: [
          "Safer than dull",
          "Flat stable surface",
          "Curl fingertips",
          "Never catch",
        ],
        correctMatches: [
          { leftIndex: 0, rightIndex: 0 },
          { leftIndex: 1, rightIndex: 1 },
          { leftIndex: 2, rightIndex: 2 },
          { leftIndex: 3, rightIndex: 3 },
        ],
      },
      "A sharp knife is safer because it requires less pressure and cuts more predictably.",
      25,
    );

    // Basic Cuts Minigame - Fill in the blank
    const basicCutsMinigame = await insertMinigame(
      "Basic Cuts",
      "Cut Knowledge",
      "fill-in-blank",
      "Complete the cutting technique descriptions.",
      "medium",
      90,
      100,
    );
    await insertMinigameQuestion(
      basicCutsMinigame,
      "Complete: The _____ cut creates cubes of uniform size.",
      "fill-in-blank",
      {
        blankText: "The _____ cut creates cubes of uniform size.",
        correctAnswers: ["dice"],
      },
      "The dice cut is fundamental for even cooking and professional presentation.",
      10,
    );
    await insertMinigameQuestion(
      basicCutsMinigame,
      "Complete: _____ involves cutting vegetables into long, thin matchsticks.",
      "fill-in-blank",
      {
        blankText:
          "_____ involves cutting vegetables into long, thin matchsticks.",
        correctAnswers: ["julienne"],
      },
      "Julienne cuts are perfect for stir-fries and salads.",
      10,
    );
    await insertMinigameQuestion(
      basicCutsMinigame,
      "Complete: To _____ means to cut ingredients very finely, like garlic or herbs.",
      "fill-in-blank",
      {
        blankText:
          "To _____ means to cut ingredients very finely, like garlic or herbs.",
        correctAnswers: ["mince"],
      },
      "Mincing creates very small, uniform pieces that distribute flavor evenly.",
      10,
    );

    // Reading a Recipe Minigame - Multiple-Choice
    const readingRecipeMinigame = await insertMinigame(
      "Reading a Recipe",
      "Recipe Lingo",
      "multiple-choice",
      "Test your knowledge of recipe terminology.",
      "easy",
      90,
      100,
    );
    await insertMinigameQuestion(
      readingRecipeMinigame,
      "What does the term 'mise en place' mean?",
      "multiple-choice",
      {
        options: [
          "A type of sauce",
          "To cook on high heat",
          "Everything in its place",
          "To serve the dish",
        ],
        correctOptionIndex: 2,
      },
      "'Mise en place' is the French term for preparing all your ingredients and equipment before you start cooking.",
      15,
    );
    await insertMinigameQuestion(
      readingRecipeMinigame,
      "If a recipe says to 'fold' in an ingredient, what should you do?",
      "multiple-choice",
      {
        options: [
          "Stir it vigorously",
          "Use a gentle over-and-under motion",
          "Chop it finely",
          "Mix it with a machine",
        ],
        correctOptionIndex: 1,
      },
      "Folding is a gentle technique used to combine a light, airy mixture with a heavier one without deflating it.",
      15,
    );

    // Heat Control Minigame - Multiple Choice
    const heatControlMinigame = await insertMinigame(
      "Mastering Heat",
      "Heat Master Quiz",
      "multiple-choice",
      "Test your knowledge of heat control.",
      "medium",
      120,
      100,
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
      "Smoking oil means it's too hot and can burn your food or even catch fire. Always remove it from the heat to cool down.",
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
      "Flavor Elements Quiz",
      "multiple-choice",
      "Select the element that best fits the description.",
      "hard",
      120,
      100,
    );

    await insertMinigameQuestion(
      flavorMinigame,
      "A dish tastes flat and one-dimensional. Which element is it most likely missing?",
      "multiple-choice",
      {
        options: ["Fat", "Acid", "Salt", "Heat"],
        correctOptionIndex: 2,
      },
      "Salt is a fundamental flavor enhancer. If a dish tastes dull or like it's missing something, it almost always needs more salt.",
      20,
    );

    await insertMinigameQuestion(
      flavorMinigame,
      "You've made a rich, creamy sauce, but it feels too heavy. Which element would best balance it?",
      "multiple-choice",
      {
        options: ["Acid", "Fat", "Salt", "Sweetness"],
        correctOptionIndex: 0,
      },
      "Acid, like a squeeze of lemon juice or a dash of vinegar, cuts through richness and brightens up heavy or fatty dishes.",
      20,
    );

    await insertMinigameQuestion(
      flavorMinigame,
      "Which element is primarily responsible for carrying flavors and creating a satisfying mouthfeel?",
      "multiple-choice",
      {
        options: ["Salt", "Heat", "Acid", "Fat"],
        correctOptionIndex: 3,
      },
      "Fat, such as oil or butter, is a vehicle for flavor and provides richness and a pleasant texture in food.",
      20,
    );
    // French: Mother Sauces Minigame - Matching
    const motherSaucesMinigame = await insertMinigame(
      "French: Mother Sauces",
      "Sauce School",
      "matching",
      "Match the mother sauce to its primary liquid base.",
      "hard",
      120,
      100,
    );
    await insertMinigameQuestion(
      motherSaucesMinigame,
      "Match the sauce to its base:",
      "matching",
      {
        leftItems: ["Béchamel", "Velouté", "Espagnole", "Hollandaise"],
        rightItems: ["Milk", "White Stock", "Brown Stock", "Butter & Egg Yolk"],
        correctMatches: [
          { leftIndex: 0, rightIndex: 0 },
          { leftIndex: 1, rightIndex: 1 },
          { leftIndex: 2, rightIndex: 2 },
          { leftIndex: 3, rightIndex: 3 },
        ],
      },
      "Knowing the bases of the five mother sauces is a key part of classical French technique.",
      25,
    );

    // Italian: Perfect Pasta Minigame - Multiple-Choice
    const perfectPastaMinigame = await insertMinigame(
      "Italian: Perfect Pasta",
      "Pasta Perfection",
      "multiple-choice",
      "Test your pasta cooking knowledge.",
      "medium",
      90,
      100,
    );
    await insertMinigameQuestion(
      perfectPastaMinigame,
      "What does 'al dente' mean?",
      "multiple-choice",
      {
        options: ["To the sauce", "To the tooth", "Cooked soft", "With cheese"],
        correctOptionIndex: 1,
      },
      "'Al dente' is Italian for 'to the tooth,' meaning the pasta should be cooked through but still have a firm bite.",
      20,
    );
    await insertMinigameQuestion(
      perfectPastaMinigame,
      "Why should you save a cup of pasta water before draining?",
      "multiple-choice",
      {
        options: [
          "To drink it",
          "To clean the pot",
          "To help the sauce cling to the pasta",
          "To cool the pasta down",
        ],
        correctOptionIndex: 2,
      },
      "The starchy pasta water helps emulsify the fat in your sauce, creating a smoother texture that clings beautifully to the pasta.",
      20,
    );

    const totalQuests = Object.keys(questIdByTitle).length;
    return { inserted: totalQuests };
  },
});
