import { PageHeader } from "../components/PageHeader";
import { THEME } from "../lib/constants";
import { COLOR_TOKEN_GROUPS, SCALE_TOKENS } from "./constants";
import { ShowcaseSection } from "./Showcase";
import { presentationText } from "./text";

const copy = presentationText.tokens;

type ColorGroup = keyof typeof COLOR_TOKEN_GROUPS;
type Scale = keyof typeof SCALE_TOKENS;

const COLOR_GROUPS = Object.keys(COLOR_TOKEN_GROUPS) as ColorGroup[];
const THEMES = [
  { theme: THEME.LIGHT, label: copy.colors.light },
  { theme: THEME.DARK, label: copy.colors.dark },
];

function ScaleSection({ scale }: { scale: Scale }) {
  const scaleCopy = copy.scales[scale];

  return (
    <ShowcaseSection
      title={scaleCopy.title}
      description={scaleCopy.description}
    >
      <ul className={`showcase-scale showcase-scale--${scale}`}>
        {SCALE_TOKENS[scale].map((name) => (
          <li key={name} className="showcase-scale__item">
            <span
              className={`showcase-scale__sample showcase-token--${name}`}
              aria-hidden
            >
              {scale === "fontSizes" && copy.scales.fontSizes.sample}
            </span>
            <code>{name}</code>
            {scale !== "shadows" && (
              <span
                className={`showcase-scale__value showcase-token--${name}`}
              />
            )}
          </li>
        ))}
      </ul>
    </ShowcaseSection>
  );
}

export function TokensPage() {
  return (
    <div className="page-stack">
      <PageHeader title={copy.title} subtitle={copy.description} />

      <ShowcaseSection
        title={copy.colors.title}
        description={copy.colors.description}
      >
        <div className="showcase-themes">
          {THEMES.map(({ theme, label }) => (
            <div
              key={theme}
              className={`showcase-themes__column showcase-themes__column--${theme}`}
            >
              <h3 className="showcase-themes__title">{label}</h3>
              {COLOR_GROUPS.map((group) => (
                <div key={group} className="showcase-themes__group">
                  <p className="showcase-themes__group-title">
                    {copy.colors.groups[group]}
                  </p>
                  <ul className="showcase-swatches">
                    {COLOR_TOKEN_GROUPS[group].map((name) => (
                      <li key={name} className="showcase-swatches__item">
                        <span
                          className={`showcase-swatches__chip showcase-color--${name}`}
                          aria-hidden
                        />
                        <span className="showcase-swatches__name">{name}</span>
                        <span
                          className={`showcase-swatches__value showcase-color--${name}`}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      </ShowcaseSection>

      {(Object.keys(SCALE_TOKENS) as Scale[]).map((scale) => (
        <ScaleSection key={scale} scale={scale} />
      ))}
    </div>
  );
}
