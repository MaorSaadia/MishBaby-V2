import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { GuideAssistant } from "./sanity/guide-assistant/guide-assistant";
import { ProductAssistant } from "./sanity/product-assistant/product-assistant";
import { sanityDataset, studioProjectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemaTypes";

export default defineConfig({
  name: "mishbaby",
  title: "MishBaby Content Studio",
  projectId: studioProjectId,
  dataset: sanityDataset,
  basePath: "/studio",
  plugins: [
    structureTool({
      structure: (structure) =>
        structure
          .list()
          .title("Content")
          .items([
            structure
              .listItem()
              .title("Homepage")
              .child(
                structure
                  .document()
                  .schemaType("homepageSettings")
                  .documentId("homepageSettings")
                  .title("Homepage Settings"),
              ),
            structure.divider(),
            structure.documentTypeListItem("product").title("Products"),
            structure.documentTypeListItem("category").title("Categories"),
            structure.documentTypeListItem("guide").title("Guides"),
            structure.documentTypeListItem("merchant").title("Merchants"),
          ]),
    }),
  ],
  tools: [
    {
      name: "product-assistant",
      title: "Product Assistant",
      component: ProductAssistant,
    },
    {
      name: "guide-assistant",
      title: "Guide Assistant",
      component: GuideAssistant,
    },
  ],
  document: {
    newDocumentOptions: (previous) => previous.filter((item) => item.templateId !== "homepageSettings"),
    actions: (previous, context) =>
      context.schemaType === "homepageSettings"
        ? previous.filter((action) => action.action !== "duplicate" && action.action !== "delete")
        : previous,
  },
  schema: { types: schemaTypes },
});
