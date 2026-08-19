type ItemListEntry = {
  type: "Product" | "Article" | "CollectionPage";
  name: string;
  url: string;
  description?: string;
  image?: string;
};

type ItemListOptions = {
  id: string;
  name: string;
  url: string;
  items: ItemListEntry[];
};

export function createItemListStructuredData({ id, name, url, items }: ItemListOptions) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": id,
    name,
    url,
    numberOfItems: items.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": item.type,
        name: item.name,
        url: item.url,
        ...(item.description ? { description: item.description } : {}),
        ...(item.image ? { image: item.image } : {}),
      },
    })),
  };
}

export function serializeStructuredData(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
