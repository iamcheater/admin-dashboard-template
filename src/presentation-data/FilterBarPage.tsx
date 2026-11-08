import { useSearchParams } from "react-router-dom";
import { PageActions } from "../components/PageActions";
import { PageHeader } from "../components/PageHeader";
import { PageViewToggle } from "../components/PageViewToggle";
import { useSelectionParam } from "../hooks/useSelectionParam";
import { format } from "../i18n";
import { VIEW_SEARCH_PARAM } from "../lib/constants";
import {
  FILTER_PARAMS,
  SAMPLE_RANGE_PARAMS,
  SAMPLE_STATUS_VALUES,
  VIEW_OPTION_VALUES,
} from "./constants";
import { SAMPLE_OPTIONS } from "./sample-data";
import { ShowcaseSection } from "./Showcase";
import { presentationText } from "./text";

const copy = presentationText.filters;
const code = presentationText.code;

const ROLE_FILTER_OPTIONS = [
  { value: "", label: copy.bar.allRoles, pinned: true },
  ...SAMPLE_OPTIONS,
];

const STATUS_OPTIONS = SAMPLE_STATUS_VALUES.map((value) => ({
  value,
  label: presentationText.sampleStatuses[value],
}));

const VIEW_OPTIONS = VIEW_OPTION_VALUES.map((value) => ({
  value,
  label: copy.view.options[value],
}));

export function FilterBarPage() {
  const [searchParams] = useSearchParams();
  const { selected: selectedView } = useSelectionParam(VIEW_SEARCH_PARAM);

  const params = [...searchParams.entries()];
  const activeView =
    VIEW_OPTIONS.find((option) => option.value === selectedView) ??
    VIEW_OPTIONS[0];

  return (
    <div className="page-stack">
      <PageHeader title={copy.title} subtitle={copy.description} />

      <ShowcaseSection
        title={copy.bar.title}
        code={format(code.component, { name: "PageActions" })}
        description={copy.bar.description}
      >
        <PageActions
          search={{ criteria: copy.bar.searchCriteria }}
          filters={[
            {
              param: FILTER_PARAMS.ROLE,
              label: copy.bar.role,
              options: ROLE_FILTER_OPTIONS,
            },
          ]}
          multiFilters={[
            {
              param: FILTER_PARAMS.STATUSES,
              label: copy.bar.statuses,
              options: STATUS_OPTIONS,
            },
          ]}
          dateFilter={{
            label: copy.bar.created,
            fromParam: SAMPLE_RANGE_PARAMS.FROM,
            toParam: SAMPLE_RANGE_PARAMS.TO,
            disableFuture: true,
          }}
          toggles={[
            { param: FILTER_PARAMS.ARCHIVED, label: copy.bar.archived },
            { param: FILTER_PARAMS.MINE, label: copy.bar.mine },
          ]}
        />
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.url.title}
        description={copy.url.description}
      >
        {params.length === 0 ? (
          <p className="muted text-sm">{copy.url.empty}</p>
        ) : (
          <div className="showcase-matrix">
            <table className="showcase-matrix__table">
              <thead>
                <tr>
                  <th scope="col">{copy.url.param}</th>
                  <th scope="col">{copy.url.value}</th>
                </tr>
              </thead>
              <tbody>
                {params.map(([name, value], index) => (
                  <tr key={`${name}-${index}`}>
                    <th scope="row">
                      <code>{name}</code>
                    </th>
                    <td>
                      <code>{value}</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.view.title}
        code={format(code.component, { name: "PageViewToggle" })}
        description={copy.view.description}
      >
        <div className="stack">
          <PageViewToggle label={copy.view.label} options={VIEW_OPTIONS} />
          <p className="muted text-sm">
            {format(copy.view.current, { view: activeView.label })}
          </p>
        </div>
      </ShowcaseSection>
    </div>
  );
}
