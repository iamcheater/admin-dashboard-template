import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { FIELD_LIMITS } from "../api/constants";
import type { TranslatedText, TranslatedTextPatch } from "../api/types";
import { DatePicker } from "../components/DatePicker";
import { Dropdown } from "../components/Dropdown";
import { MultiDropdown } from "../components/MultiDropdown";
import { PageActions } from "../components/PageActions";
import { PageHeader } from "../components/PageHeader";
import { TranslatedTextField } from "../components/TranslatedTextField";
import { Button, Field, PasswordField, TextField } from "../components/ui";
import { format, text } from "../i18n";
import { DEFAULT_CONTENT_LANGUAGE } from "../lib/content-languages";
import { passwordComplexityHint } from "../lib/password";
import {
  buildTranslatedTextPatch,
  toTranslatedTextFormValue,
  validateTranslatedText,
} from "../lib/translated-text";
import {
  SAMPLE_OPTION_VALUES,
  SAMPLE_RANGE_PARAMS,
  SHOWCASE_JSON_INDENT,
} from "./constants";
import { SAMPLE_OPTIONS } from "./sample-data";
import { ShowcaseGrid, ShowcaseSample, ShowcaseSection } from "./Showcase";
import { presentationText } from "./text";

const copy = presentationText.inputs;
const code = presentationText.code;

const component = (name: string) => format(code.component, { name });
const flag = (name: string) => format(code.flag, { name });
const prop = (name: string, value: string) =>
  format(code.prop, { name, value });
const className = (value: string) => format(code.className, { value });

const translated = copy.translatedText;
const TRANSLATED_RULES = {
  required: true,
  maxLength: FIELD_LIMITS.contentTitleMax,
};

interface TranslatedTextDemoForm {
  title: TranslatedText;
}

function TranslatedTextFormDemo() {
  const [saved, setSaved] = useState(() =>
    toTranslatedTextFormValue(translated.sample),
  );
  const [patch, setPatch] = useState<TranslatedTextPatch | null>(null);
  const [hasSaved, setHasSaved] = useState(false);

  const form = useForm<TranslatedTextDemoForm>({
    mode: "onTouched",
    defaultValues: { title: saved },
  });
  const { isValid, isDirty, isSubmitted } = form.formState;

  const onSubmit = form.handleSubmit(({ title }) => {
    setPatch(buildTranslatedTextPatch(saved, title) ?? null);
    setHasSaved(true);
    setSaved(title);
    form.reset({ title });
  });

  return (
    <form className="stack showcase-form" onSubmit={onSubmit} noValidate>
      <Controller
        name="title"
        control={form.control}
        rules={{ validate: validateTranslatedText(TRANSLATED_RULES) }}
        render={({ field, fieldState }) => (
          <TranslatedTextField
            id="translated-form"
            label={translated.formTitle}
            required={TRANSLATED_RULES.required}
            maxLength={TRANSLATED_RULES.maxLength}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            showErrors={fieldState.isTouched || isSubmitted}
          />
        )}
      />
      <div className="row">
        <Button type="submit" variant="primary" disabled={!isValid || !isDirty}>
          {translated.save}
        </Button>
      </div>
      {hasSaved &&
        (patch ? (
          <Field label={translated.patch}>
            <pre className="showcase-code">
              {JSON.stringify(patch, null, SHOWCASE_JSON_INDENT)}
            </pre>
          </Field>
        ) : (
          <p className="muted text-sm">{translated.noChanges}</p>
        ))}
    </form>
  );
}

export function InputsPage() {
  const [title, setTitle] = useState<TranslatedText>(translated.sample);
  const [body, setBody] = useState<TranslatedText>(translated.sampleBody);
  const [touchedTitle, setTouchedTitle] = useState<TranslatedText>(
    translated.sampleMissing,
  );
  const [singleTitle, setSingleTitle] = useState<TranslatedText>(
    translated.sample,
  );
  const [role, setRole] = useState<string>(SAMPLE_OPTION_VALUES[0]);
  const [chipRole, setChipRole] = useState<string>(SAMPLE_OPTION_VALUES[0]);
  const [fieldRole, setFieldRole] = useState<string>(SAMPLE_OPTION_VALUES[0]);
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
        title={translated.title}
        code={component("TranslatedTextField")}
        description={translated.description}
      >
        <ShowcaseGrid isWide>
          <ShowcaseSample note={translated.default}>
            <TranslatedTextField
              id="translated-default"
              label={translated.label}
              value={title}
              onChange={setTitle}
            />
          </ShowcaseSample>
          <ShowcaseSample code={flag("multiline")} note={translated.multiline}>
            <TranslatedTextField
              id="translated-multiline"
              label={translated.bodyLabel}
              value={body}
              onChange={setBody}
              multiline
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={format(code.flags, {
              first: "required",
              second: "showErrors",
            })}
            note={translated.errors}
          >
            <TranslatedTextField
              id="translated-errors"
              label={translated.label}
              value={touchedTitle}
              onChange={setTouchedTitle}
              required
              showErrors
            />
          </ShowcaseSample>
          <ShowcaseSample
            code={prop("languages", "[…]")}
            note={translated.single}
          >
            <TranslatedTextField
              id="translated-single"
              label={translated.label}
              value={singleTitle}
              onChange={setSingleTitle}
              languages={[DEFAULT_CONTENT_LANGUAGE]}
            />
          </ShowcaseSample>
          <ShowcaseSample code={flag("disabled")} note={translated.disabled}>
            <TranslatedTextField
              id="translated-disabled"
              label={translated.label}
              value={translated.sample}
              onChange={() => {}}
              disabled
            />
          </ShowcaseSample>
          <ShowcaseSample code={component("Controller")} note={translated.form}>
            <TranslatedTextFormDemo />
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
