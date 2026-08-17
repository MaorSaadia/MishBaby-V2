import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
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
            structure.documentTypeListItem("merchant").title("Merchants"),
          ]),
    }),
  ],
  schema: { types: schemaTypes },
});
