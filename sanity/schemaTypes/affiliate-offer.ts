import { defineField, defineType } from "sanity";
import { offerFields } from "./product-offer";

// Kept registered temporarily so the previous offer documents remain readable
// as a migration backup. New offers are managed inside Product documents.
export const affiliateOfferType = defineType({
  name: "affiliateOffer",
  title: "Legacy Affiliate Offer",
  type: "document",
  fields: [
    defineField({
      name: "product",
      title: "Product",
      type: "reference",
      to: [{ type: "product" }],
      validation: (rule) => rule.required(),
    }),
    ...offerFields,
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
