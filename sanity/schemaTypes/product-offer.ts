import { defineArrayMember, defineField, defineType } from "sanity";

function activeOfferRequired(value: unknown, context: unknown, message: string) {
  const validationContext = context as {
    document?: Record<string, unknown>;
    parent?: Record<string, unknown>;
  };
  const offer = validationContext.parent ?? validationContext.document;
  return offer?.status !== "active" || Boolean(value) || message;
}

export const offerFields = [
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
    initialValue: () => new Date().toISOString().slice(0, 10),
    validation: (rule) =>
      rule.custom((value, context) => activeOfferRequired(value, context, "An active offer requires a verification date.")),
  }),
];

export const productOfferType = defineType({
  name: "productOffer",
  title: "Merchant offer",
  type: "object",
  fields: offerFields,
  validation: (rule) =>
    rule.custom((value) => {
      const offer = value as { status?: string; url?: string; lastVerifiedAt?: string } | undefined;

      if (offer?.status !== "active") return true;
      if (!offer.url) return "An active offer requires an affiliate URL.";
      if (!offer.lastVerifiedAt) return "An active offer requires a verification date.";
      return true;
    }),
  preview: {
    select: {
      merchantName: "merchant.name",
      status: "status",
    },
    prepare({ merchantName, status }) {
      return {
        title: merchantName ?? "Choose a merchant",
        subtitle: status === "paused" ? "Paused" : "Active",
      };
    },
  },
});

export const productOfferArrayMember = defineArrayMember({
  type: "productOffer",
});
