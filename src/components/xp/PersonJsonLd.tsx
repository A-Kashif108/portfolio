import { site } from "@/content/site";
import { siteUrl } from "@/lib/siteUrl";

// schema.org Person, so search engines can connect the site to the name, role and profiles.
export default function PersonJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    alternateName: site.shortName,
    url: siteUrl,
    email: `mailto:${site.email}`,
    jobTitle: "Software Engineer",
    worksFor: { "@type": "Organization", name: "Curie Money" },
    alumniOf: { "@type": "CollegeOrUniversity", name: site.education.school },
    address: { "@type": "PostalAddress", addressLocality: "Bengaluru", addressCountry: "IN" },
    knowsAbout: site.stack,
    sameAs: site.links.map((l) => l.href),
  };
  return (
    <script
      type="application/ld+json"
      // Escape "<" so the JSON can never close the script tag early.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
