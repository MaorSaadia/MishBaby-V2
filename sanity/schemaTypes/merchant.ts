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
  ],
  preview: {
    select: { title: "name", subtitle: "slug.current" },
  },
});
