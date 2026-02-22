import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  /* ---------------------- */
  /*         CASES          */
  /* ---------------------- */
  cases: defineTable({
    title: v.string(),
    caseNumber: v.optional(v.string()),
    court: v.optional(v.string()),
    conclusionDate: v.optional(v.string()),
    originalLink: v.optional(v.string()),
    summary: v.string(),
comments: v.optional(v.string()),
    keywords: v.array(v.string()),

    relatedCases: v.array(
      v.object({
        name: v.string(),
        link: v.optional(v.string())
      })
    ),

    timeline: v.optional(
      v.array(
        v.object({
          date: v.string(),
          title: v.string(),
          description: v.string(),
        })
      )
    ),

    publishedAt: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
  .index("by_conclusionDate", ["conclusionDate"])
  .searchIndex("search_content", {
    searchField: "summary",
    filterFields: ["conclusionDate", "court"],
  })
  ,


  /* ---------------------- */
  /*       ARTICLES         */
  /* ---------------------- */
  articles: defineTable({
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
  
    publishedAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_published", ["publishedAt"])
    .searchIndex("search_articles", {
      searchField: "content",
      filterFields: [],
    }),
  
  
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
