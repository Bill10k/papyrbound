import { favourites, recentReads } from "../(Home)/data";

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

export const initialCollections: Collection[] = [
  {
    id: "reading-now",
    name: "Reading now",
    description: "A small stack for this season.",
    updated: "Updated today",
    books: [recentReads[0], recentReads[1], favourites[1]],
  },
  {
    id: "quiet-worlds",
    name: "Quiet worlds",
    description: "Places to disappear into after dark.",
    updated: "Updated yesterday",
    books: [favourites[0], recentReads[3], recentReads[4]],
  },
  {
    id: "to-revisit",
    name: "To revisit",
    description: "Books worth another slow reading.",
    updated: "Updated 4 days ago",
    books: [recentReads[2], favourites[2], recentReads[1]],
  },
  {
    id: "short-forms",
    name: "Short forms",
    description: "Essays, stories, and one-sitting reads.",
    updated: "Updated last week",
    books: [recentReads[4], favourites[1], recentReads[3]],
  },
];

export function getCollection(slug: string) {
  return initialCollections.find((collection) => collection.id === slug);
}
