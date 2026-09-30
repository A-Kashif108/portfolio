import { Fragment } from "react";
import { site } from "@/content/site";

// Light. Pinned statement whose words fill from outline to solid as you scroll; the last word takes the accent.
export default function Statement() {
  const words = site.statement.split(" ");
  return (
    <section className="fu-stmt" aria-label="Statement">
      <h2 className="fu-say cond">
        {words.map((word, i) => (
          <Fragment key={i}>
            <span className={i === words.length - 1 ? "w acc" : "w"}>{word}</span>{" "}
          </Fragment>
        ))}
      </h2>
    </section>
  );
}
