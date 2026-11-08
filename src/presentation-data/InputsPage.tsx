import { useState } from "react";
import { DatePicker } from "../components/DatePicker";
import { Dropdown } from "../components/Dropdown";
import { MultiDropdown } from "../components/MultiDropdown";
import { PageActions } from "../components/PageActions";
import { PageHeader } from "../components/PageHeader";
import { Field, PasswordField, TextField } from "../components/ui";
import { format, text } from "../i18n";
import { passwordComplexityHint } from "../lib/password";
import { SAMPLE_OPTION_VALUES, SAMPLE_RANGE_PARAMS } from "./constants";
import { ShowcaseGrid, ShowcaseSample, ShowcaseSection } from "./Showcase";
import { presentationText } from "./text";

const copy = presentationText.inputs;
const code = presentationText.code;

const SAMPLE_OPTIONS = SAMPLE_OPTION_VALUES.map((value) => ({
  value,
  label:
    presentationText.sampleOptions[
      value as keyof typeof presentationText.sampleOptions
    ],
}));

const component = (name: string) => format(code.component, { name });
const flag = (name: string) => format(code.flag, { name });
const prop = (name: string, value: string) =>
  format(code.prop, { name, value });
const className = (value: string) => format(code.className, { value });

export function InputsPage() {
  const [role, setRole] = useState(SAMPLE_OPTION_VALUES[0]);
  const [chipRole, setChipRole] = useState(SAMPLE_OPTION_VALUES[0]);
  const [fieldRole, setFieldRole] = useState(SAMPLE_OPTION_VALUES[0]);
  const [roles, setRoles] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [birthDate, setBirthDate] = useState("");

  return (
    <div className="page-stack">
      <PageHeader title={copy.title} subtitle={copy.description} />

      <ShowcaseSection
        title={copy.textField.title}
        code={component("TextField")}
        description={copy.textField.description}
      >
        <ShowcaseGrid>
          <ShowcaseSample note={copy.textField.default}>
            <TextField id="text-default" label={copy.textField.label} />
          </ShowcaseSample>
          <ShowcaseSample
            code={flag("placeholder")}
            note={copy.textField.withPlaceholder}
          >
            <TextField
              id="text-placeholder"
              label={copy.textField.label}
              placeholder={copy.textField.placeholder}
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={flag("required")}
            note={copy.textField.required}
          >
            <TextField
              id="text-required"
              label={copy.textField.label}
              required
            />
          </ShowcaseSample>
          <ShowcaseSample code={flag("hint")} note={copy.textField.withHint}>
            <TextField
              id="text-hint"
              label={copy.textField.label}
              hint={copy.textField.hint}
            />
          </ShowcaseSample>
          <ShowcaseSample code={flag("error")} note={copy.textField.withError}>
            <TextField
              id="text-error"
              label={copy.textField.label}
              required
              error={copy.textField.error}
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={flag("disabled")}
            note={copy.textField.disabled}
          >
            <TextField
              id="text-disabled"
              label={copy.textField.label}
              defaultValue={copy.textField.placeholder}
              disabled
            />
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.passwordField.title}
        code={component("PasswordField")}
        description={copy.passwordField.description}
      >
        <ShowcaseGrid>
          <ShowcaseSample note={copy.passwordField.default}>
            <PasswordField
              id="password-default"
              label={copy.passwordField.label}
              autoComplete="off"
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={flag("hint")}
            note={copy.passwordField.withHint}
          >
            <PasswordField
              id="password-hint"
              label={copy.passwordField.label}
              hint={passwordComplexityHint()}
              autoComplete="off"
            />
          </ShowcaseSample>
          <ShowcaseSample note={copy.passwordField.hintAndError}>
            <PasswordField
              id="password-hint-error"
              label={copy.passwordField.label}
              hint={passwordComplexityHint()}
              error={copy.passwordField.error}
              autoComplete="off"
            />
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.textarea.title}
        code={className("textarea")}
        description={copy.textarea.description}
      >
        <ShowcaseGrid isWide>
          <ShowcaseSample note={copy.textarea.default}>
            <Field label={copy.textarea.label} htmlFor="textarea-default">
              <textarea
                id="textarea-default"
                className="textarea"
                placeholder={copy.textarea.placeholder}
              />
            </Field>
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.checkbox.title}
        code={className("checkbox")}
        description={copy.checkbox.description}
      >
        <ShowcaseGrid isWide>
          <ShowcaseSample note={copy.checkbox.singleNote}>
            <label className="checkbox">
              <input type="checkbox" defaultChecked />
              {copy.checkbox.single}
            </label>
          </ShowcaseSample>
          <ShowcaseSample
            code={className("checkbox-grid")}
            note={copy.checkbox.gridNote}
          >
            <div className="checkbox-grid">
              {SAMPLE_OPTIONS.map((option) => (
                <label key={option.value} className="checkbox">
                  <input type="checkbox" />
                  {option.label}
                </label>
              ))}
            </div>
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.dropdown.title}
        code={component("Dropdown")}
        description={copy.dropdown.description}
      >
        <ShowcaseGrid>
          <ShowcaseSample note={copy.dropdown.default}>
            <Dropdown
              label={copy.dropdown.label}
              options={SAMPLE_OPTIONS}
              value={role}
              onChange={setRole}
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={prop("variant", "chip")}
            note={copy.dropdown.chip}
          >
            <Dropdown
              label={copy.dropdown.label}
              options={SAMPLE_OPTIONS}
              value={chipRole}
              onChange={setChipRole}
              variant="chip"
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={component("Field")}
            note={copy.dropdown.inField}
          >
            <Field label={copy.dropdown.label} hint={copy.dropdown.hint}>
              <Dropdown
                label={copy.dropdown.label}
                options={SAMPLE_OPTIONS}
                value={fieldRole}
                onChange={setFieldRole}
              />
            </Field>
          </ShowcaseSample>
          <ShowcaseSample code={flag("disabled")} note={copy.dropdown.disabled}>
            <Dropdown
              label={copy.dropdown.label}
              options={SAMPLE_OPTIONS}
              value={SAMPLE_OPTION_VALUES[0]}
              onChange={() => {}}
              disabled
            />
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.multiDropdown.title}
        code={component("MultiDropdown")}
        description={copy.multiDropdown.description}
      >
        <ShowcaseGrid>
          <ShowcaseSample note={copy.multiDropdown.default}>
            <MultiDropdown
              label={copy.multiDropdown.label}
              countTemplate={text.pageActions.selectedCount}
              options={SAMPLE_OPTIONS}
              values={roles}
              onChange={setRoles}
            />
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.datePicker.title}
        code={component("DatePicker")}
        description={copy.datePicker.description}
      >
        <ShowcaseGrid>
          <ShowcaseSample note={copy.datePicker.singleNote}>
            <DatePicker
              label={copy.datePicker.single}
              value={date}
              onChange={setDate}
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={flag("selectTime")}
            note={copy.datePicker.withTimeNote}
          >
            <DatePicker
              label={copy.datePicker.withTime}
              value={dateTime}
              onChange={setDateTime}
              selectTime
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={format(code.flags, { first: "fromParam", second: "toParam" })}
            note={copy.datePicker.rangeNote}
          >
            <DatePicker
              label={copy.datePicker.range}
              fromParam={SAMPLE_RANGE_PARAMS.FROM}
              toParam={SAMPLE_RANGE_PARAMS.TO}
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={flag("disableFuture")}
            note={copy.datePicker.noFutureNote}
          >
            <DatePicker
              label={copy.datePicker.noFuture}
              value={birthDate}
              onChange={setBirthDate}
              disableFuture
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={flag("disabled")}
            note={copy.datePicker.disabledNote}
          >
            <DatePicker label={copy.datePicker.disabled} disabled />
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.search.title}
        code={component("PageActions search")}
        description={copy.search.description}
      >
        <ShowcaseGrid isWide>
          <ShowcaseSample note={copy.search.default}>
            <PageActions search={{ criteria: copy.search.criteria }} />
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>
    </div>
  );
}
