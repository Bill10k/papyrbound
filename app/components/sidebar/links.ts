export type SidebarLinkName = "Home" | "Library" | "Collections" | "Annotations" | "Insights" | "Settings";

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
    name: "Collections",
    path: "/collections",
  },
  {
    name: "Annotations",
    path: "/annotations",
  },
  {
    name: "Insights",
    path: "/insights",
  },
  {
    name: "Settings",
    path: "/settings",
  },
];
