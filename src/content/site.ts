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
  /** Display range for multi-year work, e.g. "2024 to now". Falls back to year. */
  period?: string;
  /** Release status shown on the poster, e.g. "In private testing". */
  status?: string;
  /** Poster artwork under /public. */
  art?: { src: string; alt: string }[];
  summary?: string;
  href?: string;
  /** Public store or site links. */
  links?: { label: string; href: string }[];
  /** Headline numbers for the poster. Public-safe only. */
  stats?: { value: string; label: string }[];
  /** Case-study highlights, in display order. Public-safe only. */
  highlights?: { title: string; body: string }[];
};

export type Site = {
  /** Full name, used in the title, metadata and footer. */
  name: string;
  /** What people call him, used for the poster name, the greeting and the wordmark. */
  shortName: string;
  role: string;
  tagline: string;
  bio: string;
  availability: string;
  location: string;
  education: { school: string; degree: string; year: number };
  experience: { company: string; role: string; type: "Full-time" | "Internship"; start: string; end?: string }[];
  email: string;
  links: { label: string; href: string }[];
  stack: string[];
  layers: Layer[];
  projects: Project[];
  statement: string;
};

export const site = {
  name: "Asadullah Kashif",
  shortName: "Kashif",
  role: "Software engineer at Curie Money",
  tagline: "I build mobile apps and the systems underneath them.",
  // Bio option B, chosen 2026-09-30.
  bio: "I build apps layer by layer. The interface in Flutter, a BFF that shapes the data, payments over UPI. At Curie Money I work across all of it, and I care most about the layer you feel: the details. IIT Roorkee CSE graduate, based in Bengaluru, India.",
  availability: "Open to full-time roles and freelance projects.",
  location: "Bengaluru, India",
  education: { school: "IIT Roorkee", degree: "B.Tech, Computer Science and Engineering", year: 2025 },
  // Dates from Kashif, 2026-09-30. Not yet cross-checked against LinkedIn (LinkedIn blocks automated reads).
  experience: [
    { company: "Curie Money", role: "Software Engineer", type: "Full-time", start: "2025-06-15" },
    { company: "Curie Money", role: "Software Engineering Intern", type: "Internship", start: "2024-10", end: "2025-06" },
  ],
  email: "asadullahkashif108@gmail.com",
  links: [
    { label: "GitHub", href: "https://github.com/A-Kashif108" },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/asadullah-kashif-9a3301208/" },  ],
  stack: ["Flutter", "Dart", "Go", "C++", "Python", "JavaScript"],
  layers: [
    { name: "Glass", detail: "Design and motion" },
    { name: "Interface", detail: "Flutter and Dart" },
    { name: "Logic", detail: "Go services" },
    { name: "Network", detail: "C++ sockets" },
    { name: "Power", detail: "Python tooling" },
  ],
  // Featured projects chosen 2026-09-30. Summaries, roles, stacks and years for Curie Money and Twine are TODO.
  projects: [
    {
      slug: "curie-money",
      name: "Curie Money",
      stack: ["Flutter", "Dart", "TypeScript", "Node", "Kotlin", "Swift"],
      year: 2026,
      period: "2024 to now",
      // One-liner option B, chosen 2026-09-30.
      summary: "Intern to project lead in under two years. 400+ merged PRs across a live UPI and savings app and the BFF behind it.",
      links: [
        { label: "App Store", href: "https://apps.apple.com/in/app/curie-money/id6446487532" },
        // TODO: confirm this Play Store link resolves before launch.
        { label: "Play Store", href: "https://play.google.com/store/apps/details?id=com.yield.curie_money" },
      ],
      stats: [
        { value: "400+", label: "merged PRs" },
        { value: "−28% / −19%", label: "app size on Android / iOS" },
        // Worst-affected call types only (getUser, fetchAccountNumber, submitBankDetails), ~46 to 10 per run.
        // Not a whole-flow total; never present it as one.
        { value: "~80%", label: "fewer repeated onboarding API calls" },
        // Android live; iOS 2.14.49 was in App Store review on 2026-09-30. TODO: confirm iOS is live before launch.
        { value: "0", label: "re-logins moving users to device-bound sign-in" },
      ],
      // Order chosen by Kashif: 1, 2, 5, 3, 4.
      highlights: [
        {
          title: "Server-driven UI",
          body: "Built the BFF that sends screen layouts to the app, so home, payment and savings screens change without an app release. Layouts are versioned by app build, so older clients never break.",
        },
        {
          title: "App size",
          body: "Led the size project: Android download 70 MB to 50 MB, iOS install 169 MB to 138 MB, and 7,500 lines of retired code removed. Wrote a native contacts plugin that streams large address books in chunks.",
        },
        {
          title: "UPI reliability",
          body: "Owned the app side of UPI payments: one account picker, server-driven failure screens, and the concurrency fixes that money flows demand.",
        },
        {
          title: "New sign-in",
          body: "Replaced third-party login with an in-house phone OTP sign-in. Moved existing users over with no re-login, and tied each session to the user's phone and its screen lock.",
        },
        {
          title: "Onboarding rebuild",
          body: "Rewrote KYC onboarding as a typed step flow on a component library generated from the Figma design. Fixed a duplicate-navigation bug that fired steps repeatedly, so the worst-affected API calls dropped from about 46 to 10 per run, and scrubbed personal data from device logs.",
        },
      ],
    },
    {
      slug: "twine",
      name: "Twine",
      stack: ["Flutter", "Dart", "Riverpod", "Firebase", "Cloud Functions"],
      year: 2026,
      status: "In private testing",
      summary:
        "A private space for two, built first for my partner and me. A daily question that only reveals once you've both answered, plus moods, plans, money and memories shared between two phones.",
      art: [
        { src: "/projects/twine/icon.png", alt: "Twine logo: a red rope tied into a heart-shaped knot" },
        { src: "/projects/twine/feature-graphic.png", alt: "Twine: a private space for two" },
      ],
      stats: [
        { value: "15+", label: "features across 5 phases" },
        { value: "1", label: "Flutter codebase for Android, iOS and web" },
        { value: "2", label: "keys to reveal each day's answers" },
      ],
      highlights: [
        {
          title: "The two-key reveal",
          body: "Each day brings one shared question. Neither answer shows until both of you have answered, then you react to each other's.",
        },
        {
          title: "Live location, no push required",
          body: "Location sharing and real-time updates ride on Firestore streams, so the app stays live even where push notifications aren't available.",
        },
        {
          title: "Home-screen widget",
          body: "An Android widget shows your partner's mood and whether today's question is waiting, without opening the app.",
        },
        {
          title: "Serverless push",
          body: "Cloud Functions and Firebase Cloud Messaging send nudges when a partner answers, reacts or changes mood, plus a daily question reminder.",
        },
        {
          title: "React Native to Flutter",
          body: "Started in React Native with Expo, then migrated the whole app to Flutter with Riverpod and go_router, shipping Android and web from one codebase.",
        },
      ],
    },
    {
      slug: "filecosmos",
      name: "FileCosmos",
      stack: ["Flutter", "Mapbox", "Go", "Firebase", "Docker"],
      year: 2023,
      // Kashif plans to rework it; the 2023 build no longer runs.
      status: "Being rebuilt",
      summary:
        "Drop a file at a place, and anyone nearby can pick it up. In a five-person team, I built the Flutter app: the Mapbox map, GPS-pinned uploads and the app flow, wired to our Go backend.",
      href: "https://github.com/A-Kashif108/FileCosmos",
      stats: [
        { value: "5", label: "person team" },
        { value: "3", label: "weeks from first commit to working app" },
      ],
      highlights: [
        {
          title: "Files on a map",
          body: "A Mapbox map shows files dropped around you. Upload one and it's pinned to your GPS location for others to find.",
        },
        {
          title: "The Flutter app, end to end",
          body: "Set up the project and built the map, the upload screen and the app flow, then connected it to the backend.",
        },
        {
          title: "Go backend on Docker",
          body: "Go handlers for users, uploads and file retrieval over Firebase, containerised with Docker Compose.",
        },
      ],
    },
  ],
  statement: "I design and build apps people actually open.",
} satisfies Site;
