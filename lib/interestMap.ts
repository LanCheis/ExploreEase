export const INTEREST_TO_CATEGORIES: Record<string, string[]> = {
  food: ['cuisine'],
  culture: ['attraction'],
  shopping: ['activity'],
  nature: ['attraction', 'activity'],
  adventure: ['activity'],
};

const ALL_CATEGORIES = ['cuisine', 'activity', 'attraction'];

export function getCategoriesForInterests(interests: string[]): string[] {
  const cats = new Set<string>();
  for (const interest of interests) {
    const mapped = INTEREST_TO_CATEGORIES[interest] ?? ALL_CATEGORIES;
    for (const c of mapped) cats.add(c);
  }
  return Array.from(cats);
}
