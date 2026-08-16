import { defineCliConfig } from "sanity/cli";
import { sanityDataset, studioProjectId } from "./sanity/env";

export default defineCliConfig({
  api: {
    projectId: studioProjectId,
    dataset: sanityDataset,
  },
});
