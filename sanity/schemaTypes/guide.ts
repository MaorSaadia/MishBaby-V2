import { defineArrayMember, defineField, defineType } from "sanity";
import { categoryThemeOptions } from "../../lib/category-themes";

function requiredForPublished(value: unknown, context: { document?: Record<string, unknown> }, message: string) {
  return context.document?.status !== "published" || Boolean(value) || message;
}

export const guideType = defineType({
  name: "guide",
  title: "Guide",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (rule) => rule.required().min(5).max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used in the guide page URL. Generate it from the title.",
      options: { source: "title", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Content status",
      type: "string",
      initialValue: "planned",
      options: {
        list: [
          { title: "Planned", value: "planned" },
          { title: "Published article", value: "published" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categoryLabel",
      title: "Guide category label",
      type: "string",
      description: "Examples: Buying guide, Feeding, or Getting started.",
      validation: (rule) => rule.required().min(2).max(60),
    }),
    defineField({
      name: "description",
      title: "Card description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().min(20).max(240),
    }),
    defineField({
      name: "symbol",
      title: "Symbol",
      type: "string",
      description: "A short symbol shown on the guide card.",
      validation: (rule) => rule.required().max(8),
    }),
    defineField({
      name: "colorTheme",
      title: "Color theme",
      type: "string",
      initialValue: "cyan",
      options: {
        list: categoryThemeOptions.map(({ title, value }) => ({ title, value })),
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "image",
      description: "Optional image used on guide cards, the article page, and social previews.",
      options: { hotspot: true },
      fields: [
        defineField({
          name: "alt",
          title: "Alternative text",
          type: "string",
          description: "Describe the image for visitors using screen readers.",
          validation: (rule) => rule.required().min(5).max(180),
        }),
      ],
    }),
    defineField({
      name: "coverImagePrompt",
      title: "Cover-image prompt",
      type: "text",
      rows: 8,
      description: "Copy this prompt into ChatGPT image generation, then upload the approved result above.",
      validation: (rule) => rule.max(1500),
    }),
    defineField({
      name: "featured",
      title: "Featured guide",
      type: "boolean",
      description: "Featured guides appear first and use the large card on the guides page.",
      initialValue: false,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      description: "Lower numbers appear first within featured or regular guides.",
      initialValue: 100,
      validation: (rule) => rule.required().integer().min(0),
    }),
    defineField({
      name: "readingMinutes",
      title: "Reading time in minutes",
      type: "number",
      hidden: ({ document }) => document?.status !== "published",
      validation: (rule) =>
        rule.integer().min(1).max(120).custom((value, context) => requiredForPublished(value, context, "A published article requires a reading time.")),
    }),
    defineField({
      name: "introduction",
      title: "Introduction",
      type: "text",
      rows: 5,
      hidden: ({ document }) => document?.status !== "published",
      validation: (rule) =>
        rule.max(700).custom((value, context) => requiredForPublished(value, context, "A published article requires an introduction.")),
    }),
    defineField({
      name: "sections",
      title: "Article sections",
      type: "array",
      hidden: ({ document }) => document?.status !== "published",
      of: [
        defineArrayMember({
          name: "guideSection",
          title: "Guide section",
          type: "object",
          fields: [
            defineField({
              name: "heading",
              title: "Heading",
              type: "string",
              validation: (rule) => rule.required().min(3).max(120),
            }),
            defineField({
              name: "paragraphs",
              title: "Paragraphs",
              type: "array",
              of: [defineArrayMember({ type: "text", rows: 4 })],
              validation: (rule) => rule.required().min(1),
            }),
            defineField({
              name: "items",
              title: "Optional checklist items",
              type: "array",
              of: [defineArrayMember({ type: "string" })],
            }),
          ],
          preview: {
            select: { title: "heading" },
          },
        }),
      ],
      validation: (rule) =>
        rule.custom((value, context) =>
          context.document?.status !== "published" || (Array.isArray(value) && value.length > 0) || "A published article requires at least one section.",
        ),
    }),
    defineField({
      name: "relatedProducts",
      title: "Recommended products",
      type: "array",
      description: "Choose up to six published products and drag them into the order shown near the end of the guide.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "product" }],
        }),
      ],
      validation: (rule) => rule.max(6).unique(),
    }),
    defineField({
      name: "relatedCategory",
      title: "Related product category",
      type: "reference",
      to: [{ type: "category" }],
      hidden: ({ document }) => document?.status !== "published",
      validation: (rule) =>
        rule.custom((value, context) => requiredForPublished(value, context, "A published article requires a related category.")),
    }),
  ],
  orderings: [
    {
      title: "Guide display order",
      name: "displayOrderAsc",
      by: [
        { field: "featured", direction: "desc" },
        { field: "displayOrder", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "title", status: "status", featured: "featured", media: "coverImage" },
    prepare({ title, status, featured, media }) {
      return {
        title,
        media,
        subtitle: `${featured ? "Featured · " : ""}${status === "published" ? "Published article" : "Planned"}`,
      };
    },
  },
});
