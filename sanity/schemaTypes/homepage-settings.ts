import { defineArrayMember, defineField, defineType } from "sanity";

export const homepageSettingsType = defineType({
  name: "homepageSettings",
  title: "Homepage Settings",
  type: "document",
  fields: [
    defineField({
      name: "featuredProducts",
      title: "Featured products",
      type: "array",
      description: "Choose up to 12 published products and drag them into the order shown on the homepage.",
      of: [
        defineArrayMember({
          type: "reference",
          to: [{ type: "product" }],
        }),
      ],
      validation: (rule) => rule.max(12).unique(),
    }),
  ],
  preview: {
    prepare() {
      return { title: "Homepage featured products" };
    },
  },
});
