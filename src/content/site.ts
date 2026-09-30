// Placeholder content. Replace with the real bio, projects and links as they arrive.

export type Layer = {
  name: string;
  detail: string;
};

export type Project = {
  slug: string;
  name: string;
  stack: string[];
  year: number;
  summary?: string;
  href?: string;
};

export type Site = {
  name: string;
  role: string;
  tagline: string;
  email: string;
  links: { label: string; href: string }[];
  stack: string[];
  layers: Layer[];
  projects: Project[];
  statement: string;
};

export const site = {
  name: "Kashif Asadullah",
  role: "Software engineer at Curie Money",
  tagline: "I build mobile apps and the systems underneath them.",
  email: "hello@kashif.dev",
  links: [
    { label: "GitHub", href: "https://github.com/A-Kashif108" },
    { label: "LinkedIn", href: "#" },
    { label: "Resume", href: "#" },
  ],
  stack: ["Flutter", "Dart", "Go", "C++", "Python", "JavaScript"],
  layers: [
    { name: "Glass", detail: "Design and motion" },
    { name: "Interface", detail: "Flutter and Dart" },
    { name: "Logic", detail: "Go services" },
    { name: "Network", detail: "C++ sockets" },
    { name: "Power", detail: "Python tooling" },
  ],
  projects: [
    { slug: "filecosmos", name: "FileCosmos", stack: ["Flutter"], year: 2023, href: "https://github.com/A-Kashif108/FileCosmos" },
    { slug: "game-space", name: "game_space", stack: ["Flutter"], year: 2023, href: "https://github.com/A-Kashif108/game_space" },
    { slug: "zoi", name: "Zoi", stack: ["JavaScript"], year: 2023, href: "https://github.com/A-Kashif108/Zoi" },
    { slug: "network-project", name: "Network_Project", stack: ["C++"], year: 2023, href: "https://github.com/A-Kashif108/Network_Project" },
    { slug: "codelog", name: "Codelog", stack: ["JavaScript", "Python"], year: 2022, href: "https://github.com/A-Kashif108/Codelog" },
  ],
  statement: "I design and build apps people actually open.",
} satisfies Site;
