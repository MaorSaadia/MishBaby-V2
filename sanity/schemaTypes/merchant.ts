import { defineField, defineType } from "sanity";

export const merchantType = defineType({
  name: "merchant",
  title: "Merchant",
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
      description: "A stable identifier such as amazon or aliexpress.",
      options: { source: "name", maxLength: 80 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description: "Optional merchant logo shown beside offers. A transparent PNG or WebP works best.",
    }),
    defineField({
      name: "displayOrder",
      title: "Display order",
      type: "number",
      description: "Lower numbers appear first in offer comparisons and merchant selectors.",
      initialValue: 100,
      validation: (rule) => rule.required().integer().min(0),
    }),
  ],
  orderings: [
    {
      title: "Display order",
      name: "displayOrderAsc",
      by: [
        { field: "displayOrder", direction: "asc" },
        { field: "name", direction: "asc" },
      ],
    },
  ],
  preview: {
    select: { title: "name", slug: "slug.current", displayOrder: "displayOrder", media: "logo" },
    prepare({ title, slug, displayOrder, media }) {
      return {
        title,
        media,
        subtitle: `Order ${displayOrder ?? 100} · ${slug ?? "No slug"}`,
      };
    },
  },
});
