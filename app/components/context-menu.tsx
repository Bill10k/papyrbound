"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Ellipsis } from "lucide-react";
import {
  dropdownItemVariants,
  dropdownVariants,
} from "@/app/components/sidebar/animations";

export type ContextMenuItem = {
  label: string;
  icon: ReactNode;
  onSelect: () => void;
  destructive?: boolean;
  dividerBefore?: boolean;
};

type ContextMenuProps = {
  ariaLabel: string;
  menuId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: ContextMenuItem[];
  alignmentClassName?: string;
};

/** A collision-aware, animated action menu for compact overflow controls. */
export default function ContextMenu({
  ariaLabel,
  menuId,
  open,
  onOpenChange,
  items,
  alignmentClassName = "right-0",
}: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const [placement, setPlacement] = useState<"above" | "below">("below");

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !menuRef.current?.contains(event.target)) {
        onOpenChange(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [onOpenChange, open]);

  const toggleMenu = (trigger: HTMLButtonElement) => {
    if (open) {
      onOpenChange(false);
      return;
    }

    const triggerBounds = trigger.getBoundingClientRect();
    const menuHeight = 228;
    const opensAbove =
      window.innerHeight - triggerBounds.bottom < menuHeight &&
      triggerBounds.top > menuHeight;

    setPlacement(opensAbove ? "above" : "below");
    onOpenChange(true);
  };

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        aria-controls={menuId}
        onClick={(event) => toggleMenu(event.currentTarget)}
        className="grid size-7 place-items-center rounded-full text-sidebar-muted transition-colors hover:bg-sidebar-foreground/10 hover:text-sidebar-foreground"
      >
        <Ellipsis aria-hidden="true" size={20} />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            initial={reduceMotion ? false : { y: placement === "above" ? -12 : 12, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { y: placement === "above" ? -8 : 8, opacity: 0, scale: 0.96 }}
            transition={{ duration: reduceMotion ? 0 : 0.18, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: placement === "above" ? "center bottom" : "center top" }}
            className={`absolute z-20 w-42 rounded-xl border border-sidebar-border bg-background p-1 text-sm text-sidebar-foreground shadow-[0_18px_44px_rgba(42,37,26,0.16)] ${
              placement === "above" ? "bottom-full mb-2" : "top-full mt-1"
            } ${alignmentClassName}`}
          >
            <motion.div
              className="space-y-1"
              initial={reduceMotion ? false : "close"}
              animate="open"
              exit={reduceMotion ? undefined : "close"}
              variants={dropdownVariants}
            >
              {items.map((item) => {
                const itemButton = (
                  <motion.button
                    type="button"
                    role="menuitem"
                    whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                    onClick={() => {
                      item.onSelect();
                      onOpenChange(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-md text-xs px-3 py-2.5 text-left transition-colors ${
                      item.destructive
                        ? "text-destructive hover:bg-destructive/10"
                        : "hover:bg-sidebar-accent"
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </motion.button>
                );

                return item.dividerBefore ? (
                  <motion.div key={item.label} variants={dropdownItemVariants}>
                    <hr className="my-1 border-sidebar-border" />
                    {itemButton}
                  </motion.div>
                ) : (
                  <motion.div key={item.label} variants={dropdownItemVariants}>
                    {itemButton}
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
