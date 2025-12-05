export interface NavSection {
  id: string;
  label: string;
  path: string;
}

export const navSections: NavSection[] = [
  { id: "today", label: "Today", path: "today" },
  { id: "packages", label: "Content", path: "packages" },
  { id: "patterns", label: "Patterns", path: "patterns" },
  { id: "strategy", label: "Strategy", path: "strategy" },
];

export function getSectionFromPath(pathname: string): string {
  for (const section of navSections) {
    if (pathname.includes(`/${section.path}`)) {
      return section.id;
    }
  }
  return "today";
}

export function getSectionLabel(sectionId: string): string {
  const section = navSections.find((s) => s.id === sectionId);
  return section?.label ?? "Today";
}
