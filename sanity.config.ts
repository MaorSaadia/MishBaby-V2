import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
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
            structure.documentTypeListItem("product").title("Products"),
            structure.documentTypeListItem("category").title("Categories"),
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
  ],
  schema: { types: schemaTypes },
});
