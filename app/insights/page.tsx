"use client";

import React from "react";
import InsightsView from "../components/InsightsView";
import { useApp } from "../context/AppContext";

export default function InsightsPage() {
  const { openBook } = useApp();

  return <InsightsView onOpenBook={(book) => openBook(book)} />;
}
