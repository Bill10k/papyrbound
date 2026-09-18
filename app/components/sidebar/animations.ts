import { stagger, type Transition, type Variants } from "framer-motion";

export const sidebarSpring = {
  type: "spring",
  stiffness: 420,
  damping: 34,
  mass: 0.7,
} satisfies Transition;

// Layout reflow uses a non-overshooting ease so neighboring links settle
// directly into place instead of dipping past their final position.
export const sidebarLayoutTransition = {
  duration: 0.32,
  ease: [0.22, 1, 0.36, 1],
} satisfies Transition;

export const addButtonVariants: Variants = {
  hover: { rotate: 45, scale: 1.04 },
  tap: { scale: 0.92 },
};

export const navigationItemVariants: Variants = {
  hover: { x: 2 },
  tap: { scale: 0.985 },
};

// Matches the nav dropdown choreography from the placeholder project.
export const dropdownVariants: Variants = {
  open: {
    transition: {
      delayChildren: stagger(0.05),
    },
  },
  close: {
    transition: {
      delayChildren: stagger(0.02, { from: "last" }),
    },
  },
};

export const dropdownItemVariants: Variants = {
  open: {
    // y: 10,
    opacity: 1,
    transition: {
      duration: 1.3,
      type: "spring",
      bounce: 0.35,
    },
  },
  close: {
    // y: -10,
    opacity: 0,
    transition: {
      duration: 0.06,
    },
  },
};
