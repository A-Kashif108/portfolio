import { site } from "@/content/site";

// Dark. Moto-style steel business card (WebGL) next to the email, a copy button and links.
export default function Contact() {
  return (
    <section className="fu-contact" id="contact" aria-label="Contact">
      <div className="fu-view fu-card-view" data-view="card" />
      <div className="fu-contact-copy fu-z">
        <h2>Let&apos;s build the next layer.</h2>
        <p>Email is the quickest way to reach me. Tilt the card while you&apos;re here.</p>
        <div className="fu-mailrow">
          <span className="fu-mail" id="fu-mail">
            {site.email}
          </span>
          <button className="fu-btn frost fu-copy" type="button" data-email={site.email}>
            <span>Copy email</span>
          </button>
        </div>
        <div className="fu-links">
          {site.links.map((link) => (
            <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
