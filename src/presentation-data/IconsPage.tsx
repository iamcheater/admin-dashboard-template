import * as icons from "../components/icons";
import { PageHeader } from "../components/PageHeader";
import { format } from "../i18n";
import { notifyError, notifySuccess } from "../lib/toast";
import { ShowcaseSection } from "./Showcase";
import { presentationText } from "./text";

const copy = presentationText.icons;
const code = presentationText.code;

const ICONS = Object.entries(icons).sort(([first], [second]) =>
  first.localeCompare(second),
);

const copyTag = async (tag: string) => {
  try {
    await navigator.clipboard.writeText(tag);
    notifySuccess(format(copy.copied, { tag }));
  } catch {
    notifyError(copy.copyFailed);
  }
};

export function IconsPage() {
  return (
    <div className="page-stack">
      <PageHeader title={copy.title} subtitle={copy.description} />

      <ShowcaseSection
        title={format(copy.count, { count: ICONS.length })}
        code={copy.source}
        description={copy.usage}
      >
        <ul className="showcase-icons">
          {ICONS.map(([name, Icon]) => {
            const tag = format(code.tag, { name });

            return (
              <li key={name}>
                <button
                  type="button"
                  className="showcase-icons__tile"
                  aria-label={format(copy.copyLabel, { tag })}
                  title={format(copy.copyLabel, { tag })}
                  onClick={() => void copyTag(tag)}
                >
                  <Icon className="showcase-icons__glyph" />
                  <span className="showcase-icons__name">{name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </ShowcaseSection>
    </div>
  );
}
