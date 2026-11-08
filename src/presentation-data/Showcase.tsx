import type { ReactNode } from "react";

export function ShowcaseSection({
  title,
  code,
  description,
  children,
}: {
  title: string;
  code?: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="showcase-section">
      <header className="showcase-section__header">
        <h2 className="showcase-section__title">
          {title}
          {code && <code>{code}</code>}
        </h2>
        {description && (
          <p className="showcase-section__description">{description}</p>
        )}
      </header>
      <div className="showcase-section__body">{children}</div>
    </section>
  );
}

export function ShowcaseGrid({
  isWide = false,
  children,
}: {
  isWide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`showcase-grid${isWide ? " showcase-grid--wide" : ""}`}>
      {children}
    </div>
  );
}

export function ShowcaseSample({
  code,
  note,
  children,
}: {
  code?: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <figure className="showcase-sample">
      <div className="showcase-sample__preview">{children}</div>
      <figcaption className="showcase-sample__caption">
        {code && <code>{code}</code>}
        <span>{note}</span>
      </figcaption>
    </figure>
  );
}
