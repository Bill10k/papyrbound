export type SidebarLinkName = "Home" | "Library" | "Collection" | "Settings";

interface LinkProps {
  name: SidebarLinkName;
  path: string;
}

export const links: LinkProps[] = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Library",
    path: "/library",
  },
  {
    name: "Collection",
    path: "/collection",
  },
  {
    name: "Settings",
    path: "/settings",
  },
];
