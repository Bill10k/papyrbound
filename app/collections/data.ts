export type CollectionBook = {
  title: string;
  cover: string;
  author?: string;
  progress?: number;
};

export type Collection = {
  id: string;
  name: string;
  description: string;
  updated: string;
  books: CollectionBook[];
};

export const initialCollections: Collection[] = [];

export function getCollection(slug: string) {
  return initialCollections.find((collection) => collection.id === slug);
}
