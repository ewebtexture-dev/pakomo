export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}

export const CATEGORIES = [
//   { key: "all", label: "All Products" },
  { key: "paper&packaging", label: "Packaging Testing Instruments" },
  { key: "plastic&polymer", label: "Plastic & Polymer Testing" },
  { key: "polyFilms", label: "Poly Films & Laminates" },
  { key: "paint&plastic", label: "Paint & Plating Testing" },
];