import { defineField, defineType } from "sanity";
import { categories } from "../../app/categories/category-data";
import { productOfferArrayMember } from "./product-offer";

const categoryOptions = categories.map((category) => ({
  title: category.name,
  value: category.slug,
}));

export const productType = defineType({
  name: "product",
  title: "Product",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Product name",
      type: "string",
      validation: (rule) => rule.required().min(3).max(120),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      description: "Used in the product page URL. Generate it from the product name.",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "categorySlug",
      title: "Category",
      type: "string",
      options: { list: categoryOptions, layout: "dropdown" },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 4,
      description: "A concise, parent-friendly description shown on product cards and pages.",
      validation: (rule) => rule.required().min(20).max(320),
    }),
    defineField({
      name: "highlights",
      title: "Highlights",
      type: "array",
      description: "Add one to five short product benefits or notable features.",
      of: [
        defineField({
          name: "highlight",
          type: "string",
          validation: (rule) => rule.required().max(140),
        }),
      ],
      validation: (rule) => rule.required().min(1).max(5),
    }),
    defineField({
      name: "badge",
      title: "Badge",
      type: "string",
      description: "Optional short label such as Featured pick.",
      validation: (rule) => rule.max(40),
    }),
    defineField({
      name: "image",
      title: "Product image",
      type: "image",
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
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "offers",
      title: "Merchant offers",
      type: "array",
      description: "Add Amazon, AliExpress, and future merchant links for this product in one place.",
      of: [productOfferArrayMember],
      validation: (rule) =>
        rule.custom((value) => {
          if (!Array.isArray(value)) return true;

          const merchantIds = value
            .map((offer) => (offer as { merchant?: { _ref?: string } }).merchant?._ref)
            .filter((merchantId): merchantId is string => Boolean(merchantId));

          return new Set(merchantIds).size === merchantIds.length || "Each merchant can only appear once per product.";
        }),
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "categorySlug",
      media: "image",
    },
  },
});
