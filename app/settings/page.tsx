"use client";

import React from "react";
import SettingsView from "../components/SettingsView";
import { useApp } from "../context/AppContext";

export default function SettingsPage() {
  const { books, highlights, bookmarks } = useApp();

  return (
    <SettingsView
      booksCount={books.length}
      highlightsCount={highlights.length}
      bookmarksCount={bookmarks.length}
    />
  );
}