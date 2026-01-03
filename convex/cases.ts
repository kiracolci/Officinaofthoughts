import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/* ------------------------ LIST CASES ------------------------ */

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const items = await ctx.db.query("cases").collect();

    return items.map(c => ({
      ...c,
      id: c._id,
    }));
  },
});

/* ------------------------ SEARCH CASES ------------------------ */

export const search = query({
  args: {
    searchTerm: v.optional(v.string()),
    year: v.optional(v.number()),
    court: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    const term = args.searchTerm?.toLowerCase() ?? "";

    // ⭐ STEP 1 — Load ALL cases once
    let allCases = await ctx.db.query("cases").take(500);

    // ⭐ STEP 2 — Apply filters BEFORE any searching
    allCases = allCases.filter((c) => {
      if (args.year) {
        const caseYear =
          c.conclusionDate ? new Date(c.conclusionDate).getFullYear() : null;
      
        if (caseYear === null || caseYear !== args.year) return false;
      }
          
      return true;
    });

    // ⭐ STEP 3 — If no search term, just return filtered cases sorted
    if (!term) {
      return allCases.sort((a, b) => b.publishedAt - a.publishedAt);
    }

    // ⭐ STEP 4 — Manual multi-field search using YOUR matching logic
    const matches = allCases.filter((c) => {
      const matchTitle = c.title.toLowerCase().includes(term);
      const matchSummary = c.summary.toLowerCase().includes(term);
      const matchComments = c.comments.toLowerCase().includes(term);
      const matchKeywords = c.keywords.some((k) =>
        k.toLowerCase().includes(term)
      );
      const matchCaseNumber =
        c.caseNumber?.toLowerCase().includes(term) ?? false;
      const matchCourt =
        c.court?.toLowerCase().includes(term) ?? false;

      return (
        matchTitle ||
        matchSummary ||
        matchComments ||
        matchKeywords ||
        matchCaseNumber ||
        matchCourt
      );
    });

    // ⭐ STEP 5 — Sort results (newest first)
    return matches.sort((a, b) => b.publishedAt - a.publishedAt);
  },
});

/* ------------------------ GET CASE ------------------------ */

export const getById = query({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    const c = await ctx.db.get(args.id);
    if (!c) return null;

    return {
      ...c,
      id: c._id,
    };
  },
});


/* ------------------------ CREATE CASE ------------------------ */

export const create = mutation({
  args: {
    title: v.string(),
    caseNumber: v.optional(v.string()),
    court: v.optional(v.string()),
    conclusionDate: v.optional(v.string()),
    originalLink: v.optional(v.string()),
    summary: v.optional(v.string()),
    comments: v.optional(v.string()),
    
    keywords: v.array(v.string()),

    relatedCases: v.array(
      v.object({
        name: v.string(),
        link: v.optional(v.string()),
      })
    ),

    // ⭐ NEW TIMELINE FIELD
    timeline: v.array(
      v.object({
        date: v.string(),
        title: v.string(),
        description: v.string(),
      })
    ),
  },

  handler: async (ctx, args) => {
    const now = Date.now();

    return await ctx.db.insert("cases", {
      title: args.title,
      caseNumber: args.caseNumber,
      court: args.court,
      conclusionDate: args.conclusionDate,
      originalLink: args.originalLink,
    
      summary: args.summary ?? "",
      comments: args.comments ?? "",
    
      keywords: args.keywords,
      relatedCases: args.relatedCases,
      timeline: args.timeline,
    
      publishedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    
  },
});

/* ------------------------ UPDATE CASE ------------------------ */

export const update = mutation({
  args: {
    id: v.id("cases"),

    title: v.string(),
    caseNumber: v.optional(v.string()),
    court: v.optional(v.string()),
    conclusionDate: v.optional(v.string()),
    originalLink: v.optional(v.string()),
    summary: v.optional(v.string()),
comments: v.optional(v.string()),


    keywords: v.array(v.string()),

    relatedCases: v.array(
      v.object({
        name: v.string(),
        link: v.optional(v.string()),
      })
    ),

    // ⭐ NEW TIMELINE FIELD (same structure as create)
    timeline: v.array(
      v.object({
        date: v.string(),
        title: v.string(),
        description: v.string(),
      })
    ),
  },

  handler: async (ctx, args) => {
    const { id, ...updates } = args;

    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

/* ------------------------ DELETE CASE ------------------------ */

export const remove = mutation({
  args: { id: v.id("cases") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

/* ------------------------ FILTERING HELPERS ------------------------ */

export const getYears = query({
  args: {},
  handler: async (ctx) => {
    const cases = await ctx.db.query("cases").collect();

    const years: number[] = cases
  .map((c) => c.conclusionDate ? new Date(c.conclusionDate).getFullYear() : NaN)
  .filter((y) => !isNaN(y)); // keep only real numbers

return Array.from(new Set(years)).sort((a, b) => b - a);


  },
});



export const getCourts = query({
  args: {},
  handler: async (ctx) => {
    const cases = await ctx.db.query("cases").collect();
    return [...new Set(cases.map((c) => c.court).filter(Boolean))].sort();
  },
});

/* ------------------------ UPDATE TIMELINE ONLY ------------------------ */

export const updateTimeline = mutation({
  args: {
    id: v.id("cases"),
    timeline: v.array(
      v.object({
        date: v.string(),
        title: v.string(),
        description: v.string(),
      })
    ),
  },

  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      timeline: args.timeline,
      updatedAt: Date.now(),
    });
  },
});
