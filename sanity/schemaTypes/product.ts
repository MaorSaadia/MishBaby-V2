import { defineField, defineType } from "sanity";
import { productOfferArrayMember } from "./product-offer";

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
      name: "category",
      title: "Category",
      type: "reference",
      to: [{ type: "category" }],
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
      name: "bestFor",
      title: "Best for",
      type: "string",
      description: "A concise, practical sentence explaining who or what situation this product may suit.",
      validation: (rule) => rule.min(20).max(160),
    }),
    defineField({
      name: "keyFacts",
      title: "Key facts",
      type: "array",
      description: "Flexible, source-supported details such as material, size, design, care, or intended use.",
      of: [
        defineField({
          name: "keyFact",
          title: "Key fact",
          type: "object",
          fields: [
            defineField({
              name: "label",
              title: "Label",
              type: "string",
              validation: (rule) => rule.required().min(2).max(40),
            }),
            defineField({
              name: "value",
              title: "Value",
              type: "string",
              validation: (rule) => rule.required().min(3).max(140),
            }),
          ],
          preview: {
            select: { title: "label", subtitle: "value" },
          },
        }),
      ],
      validation: (rule) =>
        rule.max(6).custom((value) => {
          if (!Array.isArray(value)) return true;

          const labels = value
            .map((fact) => (fact as { label?: string }).label?.trim().toLocaleLowerCase())
            .filter((label): label is string => Boolean(label));

          return new Set(labels).size === labels.length || "Each key fact must use a different label.";
        }),
    }),
    defineField({
      name: "considerations",
      title: "Before you choose",
      type: "array",
      description: "Add up to four balanced checks or limitations that may help a parent decide.",
      of: [
        defineField({
          name: "consideration",
          type: "string",
          validation: (rule) => rule.required().min(10).max(180),
        }),
      ],
      validation: (rule) => rule.max(4),
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
      subtitle: "category.name",
      media: "image",
    },
  },
});
