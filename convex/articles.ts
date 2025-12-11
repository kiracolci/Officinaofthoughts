import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

/* ---------------------------------------------
   LIST ALL ARTICLES
--------------------------------------------- */
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;
    return await ctx.db
      .query("articles")
      .order("desc")
      .take(limit);
  },
});

/* ---------------------------------------------
   SEARCH USING THE SEARCH INDEX
--------------------------------------------- */
/* ---------------------------------------------
   PERFECT MULTI-FIELD SEARCH (no index noise)
--------------------------------------------- */
export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const term = args.searchTerm.toLowerCase().trim();

    // Pull ALL articles
    const articles = await ctx.db.query("articles").collect();

    // Filter manually across every meaningful field
    const filtered = articles.filter((a) => {
      const titleMatch = a.title?.toLowerCase().includes(term);
      const excerptMatch = a.excerpt?.toLowerCase().includes(term);
      const introMatch = a.intro?.toLowerCase().includes(term);
      const contentMatch = a.content?.toLowerCase().includes(term);

      const keywordMatch =
        Array.isArray(a.keywords) &&
        a.keywords.some((k) => k.toLowerCase().includes(term));

      const dateMatch =
        a.publishedAt &&
        new Date(a.publishedAt).toISOString().slice(0, 10).includes(term);

      return (
        titleMatch ||
        excerptMatch ||
        introMatch ||
        contentMatch ||
        keywordMatch ||
        dateMatch
      );
    });

    return filtered;
  },
});


/* ---------------------------------------------
   CREATE ARTICLE
--------------------------------------------- */
export const create = mutation({
  args: {
    title: v.string(),
    excerpt: v.string(),
    intro: v.string(),
    content: v.string(),
    keywords: v.array(v.string()),
    relatedCases: v.array(
      v.object({
        name: v.string(),
        link: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("articles", {
      ...args,
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/* ---------------------------------------------
   UPDATE ARTICLE
--------------------------------------------- */
export const update = mutation({
  args: {
    id: v.id("articles"),
    title: v.string(),
    excerpt: v.string(),
    intro: v.string(),
    content: v.string(),
    keywords: v.array(v.string()),
    relatedCases: v.array(
      v.object({
        name: v.string(),
        link: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;

    return await ctx.db.patch(id, {
      ...rest,
      updatedAt: Date.now(),
    });
  },
});

/* ---------------------------------------------
   DELETE ARTICLE
--------------------------------------------- */
export const remove = mutation({
  args: { id: v.id("articles") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

/* ---------------------------------------------
   ADVANCED SEARCH (FOR FILTER BAR)
--------------------------------------------- */
export const searchArticles = query({
  args: {
    term: v.string(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const term = args.term.toLowerCase();

    // fetch all articles
    let articles = await ctx.db.query("articles").collect();

    // ⭐ TEXT MATCHING (matching real fields)
    articles = articles.filter((a) =>
      a.title.toLowerCase().includes(term) ||
      a.excerpt.toLowerCase().includes(term) ||
      a.intro.toLowerCase().includes(term) ||
      a.content.toLowerCase().includes(term) ||
      a.keywords.some((kw) => kw.toLowerCase().includes(term))
    );

    // ⭐ DATE FILTERING (use publishedAt)
    if (args.startDate) {
      const start = new Date(args.startDate).getTime();
      articles = articles.filter((a) => a.publishedAt >= start);
    }

    if (args.endDate) {
      const end = new Date(args.endDate).getTime();
      articles = articles.filter((a) => a.publishedAt <= end);
    }

    return articles;
  },
});
