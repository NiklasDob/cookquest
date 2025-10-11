// "use node"
// import { v } from "convex/values";
// import { query, mutation, action, internalMutation } from "./_generated/server";
// import { Id } from "./_generated/dataModel";
// import { internal } from "./_generated/api";
// import { readFileSync } from "node:fs";

// export const seedFilesAction = action({
//     args: { prompt: v.string() },
//     handler: async (ctx, args) => {
      
//       const cutImageNames = [
//         "./images/dice.png",
//         "images/julienne.png",
//         "images/mince.png",
//         "images/slice.png",
//         "images/chiffonade.png",
//       ];
  
//       const allPromises = []
//       for(const fname of cutImageNames){
//         const imageFile = await fetch(fname)
        
//         const imageBlob = await imageFile.blob()
//         const p = ctx.storage.store(imageBlob);
//         allPromises.push(p)
//       }
//       console.log(allPromises)
//       const cutsImages : Array<Id<"_storage"> > = await Promise.all(
//         allPromises
//       );
      
//       const uploadedImages = {
//         "knife_cuts" : cutsImages 
//       }
  
//       await ctx.runMutation(internal.myFunctions.seedLessons, {
//         uploadedImages,
//       });
//     },
//   });
  