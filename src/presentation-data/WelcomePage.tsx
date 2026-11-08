import { Link } from "react-router-dom";
import { ArrowRightIcon } from "../components/icons";
import { PageHeader } from "../components/PageHeader";
import { Alert } from "../components/ui";
import { EXPLORE_TARGETS, PRESENTATION_PATHNAMES } from "./constants";
import { ShowcaseSection } from "./Showcase";
import { presentationText } from "./text";

const copy = presentationText.welcome;

type ExploreCard = keyof typeof EXPLORE_TARGETS;

const EXPLORE_CARDS = Object.keys(EXPLORE_TARGETS) as ExploreCard[];

function CodeBlock({ lines }: { lines: string[] }) {
  return <pre className="showcase-code">{lines.join("\n")}</pre>;
}

function TwoColumnTable({
  headers,
  rows,
}: {
  headers: [string, string];
  rows: string[][];
}) {
  return (
    <div className="showcase-matrix">
      <table className="showcase-matrix__table showcase-matrix__table--wrap">
        <thead>
          <tr>
            <th scope="col">{headers[0]}</th>
            <th scope="col">{headers[1]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([first, second]) => (
            <tr key={first}>
              <th scope="row">{first}</th>
              <td>
                <code>{second}</code>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function WelcomePage() {
  const { newProject, firstScreen, commands } = copy;

  return (
    <div className="page-stack showcase-welcome">
      <PageHeader title={copy.title} subtitle={copy.description} />

      <div className="stack">
        <code className="showcase-welcome__stack">{copy.stack}</code>
        <Alert tone="success">{copy.devOnly}</Alert>
      </div>

      <ShowcaseSection title={copy.includes.title}>
        <ul className="showcase-welcome__list">
          {copy.includes.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.explore.title}
        description={copy.explore.description}
      >
        <div className="showcase-welcome__cards">
          {EXPLORE_CARDS.map((card) => (
            <Link
              key={card}
              to={PRESENTATION_PATHNAMES[EXPLORE_TARGETS[card]]}
              className="showcase-welcome__card"
            >
              <span className="showcase-welcome__card-title">
                {copy.explore.cards[card].title}
              </span>
              <span className="showcase-welcome__card-body">
                {copy.explore.cards[card].body}
              </span>
              <span className="showcase-welcome__card-open">
                {copy.explore.open}
                <ArrowRightIcon />
              </span>
            </Link>
          ))}
        </div>
      </ShowcaseSection>

      <ShowcaseSection title={newProject.title}>
        <div className="showcase-welcome__steps">
          <div className="stack">
            <h3>{newProject.copy.title}</h3>
            <CodeBlock lines={newProject.copy.commands} />
          </div>

          <div className="stack">
            <h3>{newProject.rename.title}</h3>
            <p className="muted text-sm">{newProject.rename.description}</p>
            <TwoColumnTable
              headers={[newProject.rename.what, newProject.rename.where]}
              rows={newProject.rename.rows}
            />
          </div>

          <div className="stack">
            <h3>{newProject.backend.title}</h3>
            <p className="muted text-sm">{newProject.backend.description}</p>
            <CodeBlock lines={newProject.backend.commands} />
            <ul className="showcase-welcome__list">
              {newProject.backend.needs.map((need) => (
                <li key={need}>{need}</li>
              ))}
            </ul>
          </div>

          <div className="stack">
            <h3>{newProject.showcase.title}</h3>
            <p className="muted text-sm">{newProject.showcase.description}</p>
          </div>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title={firstScreen.title}
        description={firstScreen.description}
      >
        <ol className="showcase-welcome__list">
          {firstScreen.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="muted text-sm spaced-above">{firstScreen.tip}</p>
      </ShowcaseSection>

      <ShowcaseSection title={commands.title}>
        <TwoColumnTable
          headers={[commands.does, commands.command]}
          rows={commands.rows.map(([command, does]) => [does, command])}
        />
      </ShowcaseSection>

      <ShowcaseSection title={copy.more.title}>
        <ul className="showcase-welcome__list">
          <li>{copy.more.readme}</li>
          <li>{copy.more.claude}</li>
        </ul>
      </ShowcaseSection>
    </div>
  );
}
