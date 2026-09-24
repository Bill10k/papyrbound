import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookCopy, Clock3 } from "lucide-react";
import BookCover from "@/app/components/book-cover";
import { getCollection, initialCollections } from "../data";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return initialCollections.map((collection) => ({ slug: collection.id }));
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollection(slug);

  if (!collection) notFound();

  return (
    <main className="min-h-dvh bg-mono-100 px-7 pb-12 pt-16 text-mono-800 xl:px-8" aria-label={collection.name}>
      <div className="h-16" />
      <header className="border-b border-[#d3c9b5] pb-6">
        <Link
          href="/collections"
          className="inline-flex items-center gap-2 text-sm text-mono-600 transition-colors hover:text-mono-800"
        >
          <ArrowLeft aria-hidden="true" className="size-4" strokeWidth={1.5} />
          Collections
        </Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-mono-600">Collection</p>
            <h1 className="mt-2 text-3xl tracking-[-0.05em]">{collection.name}</h1>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-mono-600">{collection.description}</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-mono-600">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-3 py-1.5">
              <BookCopy aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
              {collection.books.length} books
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground px-3 py-1.5">
              <Clock3 aria-hidden="true" className="size-3.5" strokeWidth={1.5} />
              {collection.updated.replace("Updated ", "")}
            </span>
          </div>
        </div>
      </header>

      <section className="pt-8" aria-labelledby="collection-books-heading">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="collection-books-heading" className="text-sm text-mono-700">Books in this collection</h2>
          <Link href="/library" className="text-sm text-mono-600 transition-colors hover:text-mono-800">
            Browse library
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
          {collection.books.map((book) => (
            <Link key={book.title} href="/library" className="group block min-w-0">
              <BookCover
                src={book.cover}
                title={book.title}
                sizes="(max-width: 640px) 42vw, (max-width: 1280px) 18vw, 160px"
              />
              <h3 className="mt-3 truncate text-sm tracking-[-0.02em]">{book.title}</h3>
              {book.author && <p className="mt-1 truncate text-xs text-mono-600">{book.author}</p>}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
