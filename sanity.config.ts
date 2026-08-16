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
  plugins: [structureTool()],
  schema: { types: schemaTypes },
});
