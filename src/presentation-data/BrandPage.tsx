import { useState } from "react";
import { Dropdown } from "../components/Dropdown";
import { PlusIcon, TrashIcon } from "../components/icons";
import { PageHeader } from "../components/PageHeader";
import { PageViewToggle } from "../components/PageViewToggle";
import { Pagination } from "../components/Pagination";
import { Alert, Button, Field, Loading, TextField } from "../components/ui";
import { format } from "../i18n";
import { notifyError, notifySuccess, notifyWarning } from "../lib/toast";
import {
  applyBrand,
  defaultBrand,
  loadBrand,
  saveBrand,
  scssLines,
  type Brand,
} from "./brand";
import {
  BRAND_KEYS,
  PREVIEW_TOTAL_PAGES,
  PRESENTATION_PATHNAMES,
  SAMPLE_OPTION_VALUES,
  VIEW_OPTION_VALUES,
  type BrandKey,
} from "./constants";
import { SAMPLE_OPTIONS } from "./sample-data";
import { ShowcaseSection } from "./Showcase";
import { presentationText } from "./text";

const copy = presentationText.brand;

const VIEW_OPTIONS = VIEW_OPTION_VALUES.map((value) => ({
  value,
  label: presentationText.filters.view.options[value],
}));

const HINTS: Record<BrandKey, string> = {
  accent: copy.colors.accentHint,
  success: copy.colors.successHint,
  warning: copy.colors.warningHint,
  danger: copy.colors.dangerHint,
};

const EXPORTS = [
  { isDark: false, label: copy.export.light },
  { isDark: true, label: copy.export.dark },
];

const copyLines = async (lines: string, theme: string) => {
  try {
    await navigator.clipboard.writeText(lines);
    notifySuccess(format(copy.export.copied, { theme }));
  } catch {
    notifyError(copy.export.copyFailed);
  }
};

export function BrandPage() {
  const [brand, setBrand] = useState<Brand>(
    () => loadBrand() ?? defaultBrand(),
  );
  const [isCustom, setIsCustom] = useState(() => loadBrand() !== null);
  const [role, setRole] = useState<string>(SAMPLE_OPTION_VALUES[0]);

  const pick = (key: BrandKey, value: string) => {
    const next = { ...brand, [key]: value };
    setBrand(next);
    setIsCustom(true);
    applyBrand(next);
    saveBrand(next);
  };

  const reset = () => {
    applyBrand(null);
    saveBrand(null);
    setBrand(defaultBrand());
    setIsCustom(false);
    notifySuccess(copy.colors.resetDone);
  };

  return (
    <div className="page-stack">
      <PageHeader
        title={copy.title}
        subtitle={copy.description}
        actions={
          <Button variant="outline" onClick={reset} disabled={!isCustom}>
            {copy.colors.reset}
          </Button>
        }
      />

      <ShowcaseSection
        title={copy.colors.title}
        description={copy.colors.description}
      >
        <div className="showcase-brand">
          {BRAND_KEYS.map((key) => (
            <Field
              key={key}
              label={copy.colors[key]}
              htmlFor={`brand-${key}`}
              hint={HINTS[key]}
            >
              <span className="showcase-brand__picker">
                <input
                  id={`brand-${key}`}
                  type="color"
                  className="showcase-brand__input"
                  value={brand[key]}
                  onChange={(event) => pick(key, event.target.value)}
                />
                <code>{brand[key]}</code>
              </span>
            </Field>
          ))}
        </div>
        {isCustom && <p className="muted text-sm">{copy.colors.saved}</p>}
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.preview.title}
        description={copy.preview.description}
      >
        <div className="showcase-brand-preview">
          <div className="row">
            <Button variant="primary">
              <PlusIcon />
              {copy.preview.save}
            </Button>
            <Button>{copy.preview.export}</Button>
            <Button variant="outline">{copy.preview.cancel}</Button>
            <Button variant="danger-solid">
              <TrashIcon />
              {copy.preview.delete}
            </Button>
            <Button variant="warning-solid">{copy.preview.disable}</Button>
            <Button variant="danger-soft">{copy.preview.remove}</Button>
          </div>

          <div className="showcase-brand-preview__alerts">
            <Alert tone="success">{copy.preview.success}</Alert>
            <Alert tone="warning">{copy.preview.warning}</Alert>
            <Alert tone="error">{copy.preview.error}</Alert>
          </div>

          <div className="form-row">
            <TextField
              id="brand-preview-name"
              label={copy.preview.nameLabel}
              autoComplete="off"
            />
            <TextField
              id="brand-preview-email"
              label={copy.preview.emailLabel}
              defaultValue={copy.preview.emailValue}
              error={copy.preview.emailError}
              autoComplete="off"
            />
            <Field label={copy.preview.roleLabel}>
              <Dropdown
                label={copy.preview.roleLabel}
                options={SAMPLE_OPTIONS}
                value={role}
                onChange={setRole}
              />
            </Field>
          </div>

          <div className="row">
            <label className="checkbox">
              <input type="checkbox" defaultChecked />
              {copy.preview.remember}
            </label>
            <PageViewToggle
              label={copy.preview.viewLabel}
              options={VIEW_OPTIONS}
            />
            <a href={PRESENTATION_PATHNAMES.BRAND}>{copy.preview.link}</a>
            <Loading />
          </div>

          <div className="row">
            <Button
              variant="ghost"
              onClick={() => notifySuccess(copy.preview.toastSuccessMessage)}
            >
              {copy.preview.toastSuccess}
            </Button>
            <Button
              variant="ghost"
              onClick={() => notifyWarning(copy.preview.toastWarningMessage)}
            >
              {copy.preview.toastWarning}
            </Button>
            <Button
              variant="ghost"
              onClick={() => notifyError(copy.preview.toastErrorMessage)}
            >
              {copy.preview.toastError}
            </Button>
          </div>

          <Pagination totalPages={PREVIEW_TOTAL_PAGES} />
        </div>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.export.title}
        description={copy.export.description}
      >
        <div className="showcase-themes">
          {EXPORTS.map(({ isDark, label }) => {
            const lines = scssLines(brand, isDark);

            return (
              <div key={label} className="showcase-brand__export">
                <div className="showcase-brand__export-header">
                  <code>{label}</code>
                  <Button
                    variant="outline"
                    size="small"
                    onClick={() => void copyLines(lines, label)}
                  >
                    {copy.export.copy}
                  </Button>
                </div>
                <pre className="showcase-code">{lines}</pre>
              </div>
            );
          })}
        </div>
      </ShowcaseSection>
    </div>
  );
}
