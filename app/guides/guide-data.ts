export type Guide = {
  title: string;
  category: string;
  description: string;
  symbol: string;
  color: string;
};

export const guides: Guide[] = [
  {
    title: "What to Pack in a Newborn Diaper Bag",
    category: "Getting started",
    description: "A calm, practical checklist for everyday outings without packing the whole nursery.",
    symbol: "✓",
    color: "bg-[#c7eff8]",
  },
  {
    title: "Choosing a Baby Monitor",
    category: "Buying guide",
    description: "The useful features to consider before deciding what fits your home and routine.",
    symbol: "◉",
    color: "bg-[#dbe9fb]",
  },
  {
    title: "Starting Solids Essentials",
    category: "Feeding",
    description: "A simple overview of the everyday tools that can make first meals feel more manageable.",
    symbol: "◌",
    color: "bg-[#d9f4ee]",
  },
  {
    title: "Creating a Calmer Bedtime Routine",
    category: "Sleep & nursery",
    description: "Gentle ideas for building a familiar wind-down rhythm that works for your family.",
    symbol: "☾",
    color: "bg-[#e4e8fb]",
  },
  {
    title: "Baby-Proofing Room by Room",
    category: "Safety",
    description: "A practical starting point for noticing common hazards as your little one becomes mobile.",
    symbol: "⌂",
    color: "bg-[#d8eee5]",
  },
  {
    title: "Finding the Right Stroller",
    category: "Buying guide",
    description: "Questions to ask about space, travel, storage, and daily life before comparing models.",
    symbol: "↗",
    color: "bg-[#dff4f8]",
  },
];
