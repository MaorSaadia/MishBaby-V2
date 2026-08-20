import { defineArrayMember, defineField, defineType } from "sanity";

export const collectionType = defineType({
  name: "collection",
  title: "Collection",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Collection name",
      type: "string",
      validation: (rule) => rule.required().min(3).max(100),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used in the collection page URL. Generate it from the collection name.",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
      description: "A short, parent-friendly introduction shown on collection cards and pages.",
      validation: (rule) => rule.required().min(30).max(280),
    }),
    defineField({
      name: "badge",
      title: "Badge",
      type: "string",
      description: "Optional short label such as New parent favorite.",
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: "products",
      title: "Products",
      type: "array",
      description: "Choose 2 to 12 published products and drag them into the order shown on the collection page.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "product" }],
          options: { filter: '!(_id in path("drafts.**"))' },
        }),
      ],
      validation: (rule) => rule.required().min(2).max(12).unique(),
    }),
  ],
  preview: {
    select: {
      title: "name",
      products: "products",
    },
    prepare({ title, products }) {
      const count = Array.isArray(products) ? products.length : 0;
      return { title, subtitle: `${count} product${count === 1 ? "" : "s"}` };
    },
  },
});
