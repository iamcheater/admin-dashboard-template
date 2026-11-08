import { PageHeader } from "../components/PageHeader";
import {
  ArrowRightIcon,
  CloseIcon,
  EditIcon,
  PlusIcon,
} from "../components/icons";
import { Button } from "../components/ui";
import { format } from "../i18n";
import { BUTTON_VARIANTS } from "./constants";
import { ShowcaseGrid, ShowcaseSample, ShowcaseSection } from "./Showcase";
import { presentationText } from "./text";

const copy = presentationText.buttons;
const code = presentationText.code;

const variantCode = (variant: string) =>
  format(code.prop, { name: "variant", value: variant });

export function ButtonsPage() {
  return (
    <div className="page-stack">
      <PageHeader title={copy.title} subtitle={copy.description} />

      <ShowcaseSection
        title={copy.variants.title}
        code={format(code.component, { name: "Button" })}
        description={copy.variants.description}
      >
        <ShowcaseGrid>
          {BUTTON_VARIANTS.map((variant) => (
            <ShowcaseSample
              key={variant}
              code={variantCode(variant)}
              note={copy.variants.items[variant].note}
            >
              <Button variant={variant}>
                {copy.variants.items[variant].label}
              </Button>
            </ShowcaseSample>
          ))}
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.states.title}
        description={copy.states.description}
      >
        <div className="showcase-matrix">
          <table className="showcase-matrix__table">
            <thead>
              <tr>
                <th scope="col">{copy.states.variant}</th>
                <th scope="col">{copy.states.default}</th>
                <th scope="col">
                  {copy.states.small}{" "}
                  <code>
                    {format(code.prop, { name: "size", value: "small" })}
                  </code>
                </th>
                <th scope="col">
                  {copy.states.disabled}{" "}
                  <code>{format(code.flag, { name: "disabled" })}</code>
                </th>
                <th scope="col">{copy.states.busy}</th>
              </tr>
            </thead>
            <tbody>
              {BUTTON_VARIANTS.map((variant) => {
                const label = copy.variants.items[variant].label;

                return (
                  <tr key={variant}>
                    <th scope="row">
                      <code>{variant}</code>
                    </th>
                    <td>
                      <Button variant={variant}>{label}</Button>
                    </td>
                    <td>
                      <Button variant={variant} size="small">
                        {label}
                      </Button>
                    </td>
                    <td>
                      <Button variant={variant} disabled>
                        {label}
                      </Button>
                    </td>
                    <td>
                      <Button variant={variant} disabled>
                        {copy.states.busyLabel}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.composition.title}
        description={copy.composition.description}
      >
        <ShowcaseGrid>
          <ShowcaseSample note={copy.composition.leadingIconNote}>
            <Button variant="primary">
              <PlusIcon />
              {copy.composition.leadingIcon}
            </Button>
          </ShowcaseSample>
          <ShowcaseSample note={copy.composition.trailingIconNote}>
            <Button variant="outline">
              {copy.composition.trailingIcon}
              <ArrowRightIcon />
            </Button>
          </ShowcaseSample>
          <ShowcaseSample
            code={format(code.flag, { name: "fullWidth" })}
            note={copy.composition.fullWidthNote}
          >
            <Button variant="primary" fullWidth>
              {copy.composition.fullWidth}
            </Button>
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.iconButtons.title}
        code={format(code.className, { value: "icon-button" })}
        description={copy.iconButtons.description}
      >
        <ShowcaseGrid>
          <ShowcaseSample note={copy.iconButtons.closeNote}>
            <button
              type="button"
              className="icon-button"
              aria-label={copy.iconButtons.close}
            >
              <CloseIcon />
            </button>
          </ShowcaseSample>
          <ShowcaseSample note={copy.iconButtons.editNote}>
            <button
              type="button"
              className="icon-button"
              aria-label={copy.iconButtons.edit}
            >
              <EditIcon />
            </button>
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>
    </div>
  );
}
