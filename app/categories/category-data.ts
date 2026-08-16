export type Category = {
  slug: string;
  name: string;
  description: string;
  introduction: string;
  symbol: string;
  color: string;
  topics: string[];
};

export const categories: Category[] = [
  {
    slug: "baby-essentials",
    name: "Baby Essentials",
    description: "The everyday building blocks for those early days.",
    introduction: "A calm starting point for the practical little things that help everyday life with your baby feel easier.",
    symbol: "✦",
    color: "bg-[#c7eff8]",
    topics: ["Everyday care", "On-the-go basics", "Newborn must-haves"],
  },
  {
    slug: "feeding-mealtime",
    name: "Feeding & Mealtime",
    description: "Little rituals, growing appetites, and less mess.",
    introduction: "Helpful feeding finds for every stage, from first bottles to independent little eaters.",
    symbol: "◌",
    color: "bg-[#d9f4ee]",
    topics: ["Bottle feeding", "Starting solids", "Mealtime helpers"],
  },
  {
    slug: "nursery-sleep",
    name: "Nursery & Sleep",
    description: "Gentle comforts for rest, routine, and sweet dreams.",
    introduction: "Thoughtful nursery and sleep essentials designed to make quiet moments feel a little more settled.",
    symbol: "☾",
    color: "bg-[#dbe9fb]",
    topics: ["Sleep essentials", "Nursery comfort", "Bedtime routines"],
  },
  {
    slug: "bath-care",
    name: "Bath & Care",
    description: "Soft, simple moments of care from head to tiny toes.",
    introduction: "Gentle everyday care ideas for bath time, changing time, and all the small moments in between.",
    symbol: "≈",
    color: "bg-[#dff4f8]",
    topics: ["Bath time", "Grooming basics", "Changing essentials"],
  },
  {
    slug: "safety-comfort",
    name: "Safety & Comfort",
    description: "A little more peace of mind for every room and ride.",
    introduction: "Practical ways to create a more comfortable, parent-ready space at home and while you are out together.",
    symbol: "♡",
    color: "bg-[#d8eee5]",
    topics: ["Home safety", "Travel comfort", "Soothing helpers"],
  },
  {
    slug: "toys-play",
    name: "Toys & Play",
    description: "Joyful discoveries made for curious little hands.",
    introduction: "Playful finds that encourage curiosity, connection, and age-appropriate discovery.",
    symbol: "☀",
    color: "bg-[#e2f2e8]",
    topics: ["Sensory play", "Learning toys", "Playtime favorites"],
  },
];

export function getCategory(slug: string) {
  return categories.find((category) => category.slug === slug);
}
