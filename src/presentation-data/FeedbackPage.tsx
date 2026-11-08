import { CustomSkeleton } from "../components/CustomSkeleton";
import { InfoIcon } from "../components/icons";
import { PageHeader } from "../components/PageHeader";
import { TruncatedText } from "../components/TruncatedText";
import { Alert, Button, EmptyState, Loading, Tooltip } from "../components/ui";
import { format } from "../i18n";
import {
  notifyError,
  notifyFailure,
  notifyInfo,
  notifySuccess,
  notifyWarning,
} from "../lib/toast";
import { SKELETON_ANIMATIONS, SKELETON_VARIANTS } from "./constants";
import { ShowcaseGrid, ShowcaseSample, ShowcaseSection } from "./Showcase";
import { presentationText } from "./text";

const copy = presentationText.feedback;
const code = presentationText.code;

const prop = (name: string, value: string) =>
  format(code.prop, { name, value });

const TOASTS = [
  {
    tone: "success",
    helper: "notifySuccess",
    label: copy.toasts.success,
    show: () => notifySuccess(copy.toasts.successMessage),
  },
  {
    tone: "info",
    helper: "notifyInfo",
    label: copy.toasts.info,
    show: () => notifyInfo(copy.toasts.infoMessage),
  },
  {
    tone: "warning",
    helper: "notifyWarning",
    label: copy.toasts.warning,
    show: () => notifyWarning(copy.toasts.warningMessage),
  },
  {
    tone: "error",
    helper: "notifyError",
    label: copy.toasts.error,
    show: () => notifyError(copy.toasts.errorMessage),
  },
];

export function FeedbackPage() {
  return (
    <div className="page-stack">
      <PageHeader title={copy.title} subtitle={copy.description} />

      <ShowcaseSection
        title={copy.alerts.title}
        code={format(code.component, { name: "Alert" })}
        description={copy.alerts.description}
      >
        <ShowcaseGrid isWide>
          <ShowcaseSample
            code={prop("tone", "error")}
            note={copy.alerts.errorNote}
          >
            <Alert tone="error">{copy.alerts.error}</Alert>
          </ShowcaseSample>
          <ShowcaseSample
            code={prop("tone", "success")}
            note={copy.alerts.successNote}
          >
            <Alert tone="success">{copy.alerts.success}</Alert>
          </ShowcaseSample>
          <ShowcaseSample
            code={prop("tone", "warning")}
            note={copy.alerts.warningNote}
          >
            <Alert tone="warning">{copy.alerts.warning}</Alert>
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.toasts.title}
        code={copy.toasts.source}
        description={copy.toasts.description}
      >
        <ShowcaseGrid>
          {TOASTS.map(({ tone, helper, label, show }) => (
            <ShowcaseSample
              key={tone}
              code={format(code.call, { name: helper })}
              note={label}
            >
              <Button variant="outline" onClick={show}>
                {label}
              </Button>
            </ShowcaseSample>
          ))}
          <ShowcaseSample
            code={format(code.call, { name: "notifyFailure" })}
            note={copy.toasts.failureNote}
          >
            <Button
              variant="outline"
              onClick={() => notifyFailure(null, copy.toasts.failureFallback)}
            >
              {copy.toasts.failure}
            </Button>
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.loading.title}
        description={copy.loading.description}
      >
        <ShowcaseGrid isWide>
          <ShowcaseSample
            code={format(code.component, { name: "Loading" })}
            note={copy.loading.spinner}
          >
            <Loading />
          </ShowcaseSample>
          <ShowcaseSample
            code={format(code.flag, { name: "label" })}
            note={copy.loading.customNote}
          >
            <Loading label={copy.loading.customLabel} />
          </ShowcaseSample>
          <ShowcaseSample
            code={format(code.component, { name: "EmptyState" })}
            note={copy.loading.emptyNote}
          >
            <EmptyState>{copy.loading.empty}</EmptyState>
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.skeletons.title}
        code={format(code.component, { name: "CustomSkeleton" })}
        description={copy.skeletons.description}
      >
        <ShowcaseGrid>
          {SKELETON_VARIANTS.map((variant) => (
            <ShowcaseSample
              key={variant}
              code={prop("variant", variant)}
              note={copy.skeletons.animations}
            >
              <div className="showcase-skeletons">
                {SKELETON_ANIMATIONS.map((animation) => (
                  <CustomSkeleton
                    key={String(animation)}
                    variant={variant}
                    animation={animation}
                    className={`showcase-skeletons__item showcase-skeletons__item--${variant}`}
                  />
                ))}
              </div>
            </ShowcaseSample>
          ))}
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.hints.title}
        description={copy.hints.description}
      >
        <ShowcaseGrid>
          <ShowcaseSample
            code={format(code.component, { name: "Tooltip" })}
            note={copy.hints.tooltipNote}
          >
            <Tooltip
              label={copy.hints.tooltipLabel}
              content={copy.hints.tooltipContent}
              className="showcase-tooltip"
            >
              <InfoIcon />
            </Tooltip>
          </ShowcaseSample>
          <ShowcaseSample
            code={format(code.component, { name: "TruncatedText" })}
            note={copy.hints.truncatedNote}
          >
            <div className="showcase-narrow">
              <TruncatedText value={copy.hints.truncated} />
            </div>
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>
    </div>
  );
}
