"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  getLibrary,
  importBook,
  openBookFileDialog,
  deleteBook,
  getBookDetails,
  getAllHighlights,
  getAllBookmarks,
} from "../lib/api";
import {
  UserProfile,
  RegisterPayload,
  LoginPayload,
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  getStoredToken,
  getStoredUser,
  saveAuthSession,
} from "../lib/auth-api";
import type { BookDetails, Bookmark, BookSummary, Highlight } from "../types/epub";

interface AppContextType {
  books: BookSummary[];
  highlights: Highlight[];
  bookmarks: Bookmark[];
  favorites: string[];
  user: UserProfile | null;
  token: string | null;
  hydrated: boolean;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  isLoading: boolean;
  isImporting: boolean;
  errorMessage: string | null;
  activeReadingBook: BookDetails | null;
  initialChapterIndex?: number;
  openBook: (bookOrId: BookDetails | string, chapterIdx?: number) => Promise<void>;
  closeReader: () => void;
  importNewBook: () => Promise<void>;
  refreshData: () => Promise<void>;
  deleteBookById: (bookId: string) => Promise<void>;
  toggleFavorite: (bookId: string) => void;
  isFavorite: (bookId: string) => boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  setAuthSession: (userProfile: UserProfile, authToken: string) => void;
  setErrorMessage: (msg: string | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [books, setBooks] = useState<BookSummary[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [activeReadingBook, setActiveReadingBook] = useState<BookDetails | null>(null);
  const [initialChapterIndex, setInitialChapterIndex] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Validate stored session on startup
  useEffect(() => {
  const validateStoredSession = async () => {
    const savedToken = getStoredToken();

    if (savedToken) {
      try {
        const userData = await getCurrentUser(savedToken);
        setUser(userData);
        setToken(savedToken);
      } catch {
        // Token expired or server unreachable
        setUser(null);
        setToken(null);
      }
    }

    setHydrated(true);
  };

  validateStoredSession();
}, []);

  // Load favorites from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("papyrbound_favorites");
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  }, []);

  // Listen for OAuth messages (from popup window) and storage events
  useEffect(() => {
    const handleAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === "PAPYRBOUND_AUTH_SUCCESS") {
        const { token: receivedToken, user: receivedUser } = event.data;
        if (receivedToken && receivedUser) {
          setUser(receivedUser);
          setToken(receivedToken);
          saveAuthSession({
            access_token: receivedToken,
            token_type: "bearer",
            expires_in: 86400,
            user: receivedUser,
          });
          setAuthModalOpen(false);
        }
      }
    };

    const handleStorage = (event: StorageEvent) => {
      if (
        event.key === "papyrbound_access_token" ||
        event.key === "papyrbound_user_profile" ||
        event.key === "papyrbound_token" ||
        event.key === "papyrbound_user"
      ) {
        const storedToken = getStoredToken();
        const storedUser = getStoredUser();
        if (storedToken && storedUser) {
          setUser(storedUser);
          setToken(storedToken);
          setAuthModalOpen(false);
        }
      }
    };

    window.addEventListener("message", handleAuthMessage);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("message", handleAuthMessage);
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  const setAuthSession = (userProfile: UserProfile, authToken: string) => {
    setUser(userProfile);
    setToken(authToken);
    saveAuthSession({
      access_token: authToken,
      token_type: "bearer",
      expires_in: 86400,
      user: userProfile,
    });
    setAuthModalOpen(false);
  };

  const login = async (payload: LoginPayload) => {
    try {
      const res = await loginUser(payload);
      setUser(res.user);
      setToken(res.access_token);
      setAuthModalOpen(false);
    } catch (err: any) {
      throw new Error(err?.message || "Failed to log in");
    }
  };

  const register = async (payload: RegisterPayload) => {
    try {
      const res = await registerUser(payload);
      setUser(res.user);
      setToken(res.access_token);
      setAuthModalOpen(false);
    } catch (err: any) {
      throw new Error(err?.message || "Failed to register account");
    }
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
    setToken(null);
  };

  const toggleFavorite = (bookId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId];
      try {
        localStorage.setItem("papyrbound_favorites", JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const isFavorite = (bookId: string) => favorites.includes(bookId);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [libData, hls, bms] = await Promise.all([
        getLibrary().catch(() => []),
        getAllHighlights().catch(() => []),
        getAllBookmarks().catch(() => []),
      ]);
      setBooks(libData);
      setHighlights(hls);
      setBookmarks(bms);
    } catch (err) {
      console.warn("Failed to load data from SQLite:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const openBook = async (bookOrId: BookDetails | string, chapterIdx?: number) => {
    try {
      setInitialChapterIndex(chapterIdx);
      if (typeof bookOrId === "string") {
        const details = await getBookDetails(bookOrId);
        setActiveReadingBook(details);
      } else {
        setActiveReadingBook(bookOrId);
      }
    } catch (err) {
      console.error("Failed to open book:", err);
      setErrorMessage("Could not load book content");
    }
  };

  const closeReader = () => {
    setActiveReadingBook(null);
    setInitialChapterIndex(undefined);
    refreshData();
  };

  const importNewBook = async () => {
    setIsImporting(true);
    setErrorMessage(null);
    try {
      const filePath = await openBookFileDialog();
      if (!filePath) {
        setIsImporting(false);
        return;
      }
      const newBook = await importBook(filePath);
      await refreshData();
      await openBook(newBook);
    } catch (err) {
      console.error("Import failed:", err);
      setErrorMessage(typeof err === "string" ? err : "Failed to import book");
    } finally {
      setIsImporting(false);
    }
  };

  const deleteBookById = async (bookId: string) => {
    try {
      await deleteBook(bookId);
      await refreshData();
    } catch (err) {
      console.error("Delete failed:", err);
      setErrorMessage("Failed to delete book");
    }
  };

  return (
    <AppContext.Provider
      value={{
        books,
        highlights,
        bookmarks,
        favorites,
        user,
        token,
        hydrated,
        authModalOpen,
        setAuthModalOpen,
        isLoading,
        isImporting,
        errorMessage,
        activeReadingBook,
        initialChapterIndex,
        openBook,
        closeReader,
        importNewBook,
        refreshData,
        deleteBookById,
        toggleFavorite,
        isFavorite,
        login,
        register,
        logout,
        setAuthSession,
        setErrorMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return ctx;
}
