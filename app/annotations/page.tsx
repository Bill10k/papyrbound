"use client";

import React from "react";
import AnnotationsView from "../components/AnnotationsView";
import { useApp } from "../context/AppContext";
import { deleteHighlight, deleteBookmark } from "../lib/api";

export default function AnnotationsPage() {
  const { highlights, bookmarks, books, openBook, refreshData } = useApp();

  const handleDeleteHighlight = async (id: string) => {
    await deleteHighlight(id);
    await refreshData();
  };

  const handleDeleteBookmark = async (id: string) => {
    await deleteBookmark(id);
    await refreshData();
  };

  return (
    <AnnotationsView
      highlights={highlights}
      bookmarks={bookmarks}
      books={books}
      onOpenBookToChapter={(bookId, chIdx) => openBook(bookId, chIdx)}
      onDeleteHighlight={handleDeleteHighlight}
      onDeleteBookmark={handleDeleteBookmark}
    />
  );
}