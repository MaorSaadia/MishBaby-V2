import { defineField, defineType } from "sanity";
import { categoryThemeOptions } from "../../lib/category-themes";

export const categoryType = defineType({
  name: "category",
  title: "Category",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (rule) => rule.required().min(2).max(80),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used in the category page URL. Avoid changing it after publishing.",
      options: { source: "name", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Card description",
      type: "text",
      rows: 3,
      validation: (rule) => rule.required().min(15).max(180),
    }),
    defineField({
      name: "introduction",
      title: "Page introduction",
      type: "text",
      rows: 4,
      validation: (rule) => rule.required().min(20).max(320),
    }),
    defineField({
      name: "symbol",
      title: "Symbol",
      type: "string",
      description: "A short emoji or symbol displayed on category cards.",
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
      name: "topics",
      title: "Topics",
      type: "array",
      description: "One to five areas highlighted on the category page.",
      of: [
        defineField({
          name: "topic",
          type: "string",
          validation: (rule) => rule.required().max(80),
        }),
      ],
      validation: (rule) => rule.required().min(1).max(5),
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      description: "Lower numbers appear first. The first three categories appear on the homepage.",
      initialValue: 100,
      validation: (rule) => rule.required().integer().min(0),
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrderAsc",
      by: [{ field: "displayOrder", direction: "asc" }],
    },
  ],
  preview: {
    select: { title: "name", subtitle: "slug.current" },
  },
});
