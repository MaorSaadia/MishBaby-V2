type GuideBase = {
  slug: string;
  title: string;
  category: string;
  description: string;
  symbol: string;
  color: string;
};

export type GuideSection = {
  heading: string;
  paragraphs: string[];
  items?: string[];
};

export type PublishedGuide = GuideBase & {
  status: "published";
  readingTime: string;
  introduction: string;
  sections: GuideSection[];
  relatedCategory: {
    slug: string;
    label: string;
  };
};

export type PlannedGuide = GuideBase & {
  status: "planned";
};

export type Guide = PublishedGuide | PlannedGuide;

export const guides: Guide[] = [
  {
    slug: "newborn-diaper-bag-checklist",
    title: "What to Pack in a Newborn Diaper Bag",
    category: "Getting started",
    description: "A calm, practical checklist for everyday outings without packing the whole nursery.",
    symbol: "✓",
    color: "bg-[#c7eff8]",
    status: "published",
    readingTime: "6 min read",
    introduction: "A well-packed diaper bag is less about carrying everything and more about having the right basics for the outing ahead. Start with this simple list, then adjust it as you learn what your baby and your routine actually need.",
    relatedCategory: {
      slug: "baby-essentials",
      label: "Baby Essentials",
    },
    sections: [
      {
        heading: "Start with the outing, not the bag",
        paragraphs: [
          "A quick walk and a full afternoon away from home need very different amounts of gear. Before packing, think about how long you expect to be out, where you are going, the weather, and whether you can easily restock anything.",
          "Keeping a small group of permanent bag essentials can make leaving home easier. Add feeding items, extra clothing, and weather-specific pieces just before you go.",
        ],
      },
      {
        heading: "The everyday changing setup",
        paragraphs: [
          "Changing supplies are the heart of a newborn diaper bag. Keep them together in one pouch or section so you can reach everything with one hand.",
        ],
        items: [
          "Diapers, with a couple more than you expect to use",
          "Baby wipes in a travel pack or refillable case",
          "A portable changing mat",
          "Small bags for used diapers or soiled clothing",
          "Diaper cream if it is already part of your routine",
          "One complete change of baby clothes",
        ],
      },
      {
        heading: "Pack feeding items around your routine",
        paragraphs: [
          "What belongs in this section depends entirely on how your baby feeds. Bring only the supplies that match your normal routine and the expected length of the outing.",
          "This might include prepared feeding supplies, a clean bottle, a bib, or a burp cloth. Follow the preparation and storage guidance you already use for your baby, especially when you will be away from home for longer.",
        ],
      },
      {
        heading: "Comfort and cleanup helpers",
        paragraphs: [
          "A few flexible items can solve several small problems without taking over the bag. A muslin cloth can work as a burp cloth, light cover, or clean surface, while an extra pacifier can help if your baby already uses one.",
        ],
        items: [
          "One or two burp cloths or muslin squares",
          "A pacifier in a clean case, if used",
          "A small familiar comfort item",
          "Hand sanitizer for the parent or caregiver",
          "A spare top for the adult on longer outings",
        ],
      },
      {
        heading: "Keep one pocket for the parent",
        paragraphs: [
          "Reserve one easy-to-reach pocket for your phone, keys, wallet, water, and anything you need regularly. Separating these items from changing supplies saves time and keeps the bag easier to navigate.",
          "Once you return home, remove rubbish and used clothing, replace anything you finished, and leave the core kit ready for next time. A two-minute reset can make the next departure feel much calmer.",
        ],
      },
    ],
  },
  {
    slug: "choosing-a-baby-monitor",
    title: "Choosing a Baby Monitor",
    category: "Buying guide",
    description: "The useful features to consider before deciding what fits your home and routine.",
    symbol: "◉",
    color: "bg-[#dbe9fb]",
    status: "planned",
  },
  {
    slug: "starting-solids-essentials",
    title: "Starting Solids Essentials",
    category: "Feeding",
    description: "A simple overview of the everyday tools that can make first meals feel more manageable.",
    symbol: "◌",
    color: "bg-[#d9f4ee]",
    status: "planned",
  },
  {
    slug: "calmer-bedtime-routine",
    title: "Creating a Calmer Bedtime Routine",
    category: "Sleep & nursery",
    description: "Gentle ideas for building a familiar wind-down rhythm that works for your family.",
    symbol: "☾",
    color: "bg-[#e4e8fb]",
    status: "planned",
  },
  {
    slug: "baby-proofing-room-by-room",
    title: "Baby-Proofing Room by Room",
    category: "Safety",
    description: "A practical starting point for noticing common hazards as your little one becomes mobile.",
    symbol: "⌂",
    color: "bg-[#d8eee5]",
    status: "planned",
  },
  {
    slug: "finding-the-right-stroller",
    title: "Finding the Right Stroller",
    category: "Buying guide",
    description: "Questions to ask about space, travel, storage, and daily life before comparing models.",
    symbol: "↗",
    color: "bg-[#dff4f8]",
    status: "planned",
  },
];

export const publishedGuides = guides.filter((guide): guide is PublishedGuide => guide.status === "published");

export function getPublishedGuide(slug: string) {
  return publishedGuides.find((guide) => guide.slug === slug);
}
