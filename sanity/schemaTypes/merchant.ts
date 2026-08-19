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
  ],
  preview: {
    select: { title: "name", subtitle: "slug.current", media: "logo" },
  },
});
