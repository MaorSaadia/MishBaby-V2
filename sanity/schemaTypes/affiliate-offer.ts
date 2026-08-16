import { defineField, defineType } from "sanity";

function activeOfferRequired(value: unknown, context: unknown, message: string) {
  const document = (context as { document?: Record<string, unknown> }).document;
  return document?.status !== "active" || Boolean(value) || message;
}

export const affiliateOfferType = defineType({
  name: "affiliateOffer",
  title: "Affiliate Offer",
  type: "document",
  fields: [
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "merchant",
      title: "Merchant",
      type: "reference",
      to: [{ type: "merchant" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      initialValue: "active",
      options: {
        list: [
          { title: "Active", value: "active" },
          { title: "Paused", value: "paused" },
        ],
        layout: "radio",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url",
      title: "Affiliate URL",
      type: "url",
      description: "The complete HTTPS destination used by the public View offer button.",
      validation: (rule) =>
        rule
          .uri({ scheme: ["https"] })
          .custom((value, context) => activeOfferRequired(value, context, "An active offer requires an affiliate URL.")),
    }),
    defineField({
      name: "affiliate",
      title: "Affiliate link",
      type: "boolean",
      description: "Keep enabled when MishBaby may earn a commission from this link.",
      initialValue: true,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "lastVerifiedAt",
      title: "Last verified",
      type: "date",
      description: "The date you last confirmed that the affiliate link works.",
      options: { dateFormat: "YYYY-MM-DD" },
      validation: (rule) =>
        rule.custom((value, context) => activeOfferRequired(value, context, "An active offer requires a verification date.")),
    }),
  ],
  preview: {
    select: {
      productName: "product.name",
      merchantName: "merchant.name",
      status: "status",
    },
    prepare({ productName, merchantName, status }) {
      return {
        title: `${productName ?? "Product"} → ${merchantName ?? "Merchant"}`,
        subtitle: status === "paused" ? "Paused" : "Active",
      };
    },
  },
});
