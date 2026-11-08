import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { MODAL_SIZE } from "../components/constants";
import { Dropdown } from "../components/Dropdown";
import {
  CheckCircleIcon,
  InfoIcon,
  TrashIcon,
  WarningIcon,
} from "../components/icons";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { PopUp } from "../components/PopUp";
import { SidePanel } from "../components/SidePanel";
import { Button, Field, TextField } from "../components/ui";
import { format, text } from "../i18n";
import { anchorRectOf, type AnchorRect } from "../lib/anchor";
import { REGEX_PATTERN } from "../lib/constants";
import { formatDateTime } from "../lib/format";
import { notifySuccess } from "../lib/toast";
import { MODAL_DEMO, SAMPLE_OPTION_VALUES, type ModalDemo } from "./constants";
import { SAMPLE_OPTIONS, SAMPLE_RECORDS } from "./sample-data";
import { ShowcaseGrid, ShowcaseSample, ShowcaseSection } from "./Showcase";
import { presentationText } from "./text";

interface AdminForm {
  email: string;
  fullName: string;
  role: string;
}

const copy = presentationText.modals;
const code = presentationText.code;
const columns = presentationText.tables.columns;
const panelRecord = SAMPLE_RECORDS[0];

const prop = (name: string, value: string) =>
  format(code.prop, { name, value });

export function ModalsPage() {
  const [dialog, setDialog] = useState<ModalDemo | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [popUpAnchor, setPopUpAnchor] = useState<AnchorRect | null>(null);

  const form = useForm<AdminForm>({
    mode: "onTouched",
    defaultValues: { email: "", fullName: "", role: SAMPLE_OPTION_VALUES[0] },
  });
  const { errors, touchedFields, isValid } = form.formState;
  const role = useWatch({
    control: form.control,
    name: "role",
    defaultValue: SAMPLE_OPTION_VALUES[0],
  });

  const closeDialog = () => setDialog(null);

  const confirmAndClose = (message: string) => {
    notifySuccess(message);
    closeDialog();
  };

  const openForm = () => {
    form.reset();
    setDialog(MODAL_DEMO.FORM);
  };

  const onCreate = ({ email }: AdminForm) =>
    confirmAndClose(format(copy.form.done, { email }));

  const openButton = (demo: ModalDemo) => (
    <Button variant="outline" onClick={() => setDialog(demo)}>
      {copy.open}
    </Button>
  );

  return (
    <div className="page-stack">
      <PageHeader title={copy.title} subtitle={copy.description} />

      <ShowcaseSection
        title={copy.dialogs.title}
        code={format(code.component, { name: "Modal" })}
        description={copy.dialogs.description}
      >
        <ShowcaseGrid>
          <ShowcaseSample
            code={prop("tone", "default")}
            note={copy.dialogs.confirmNote}
          >
            {openButton(MODAL_DEMO.CONFIRM)}
          </ShowcaseSample>
          <ShowcaseSample
            code={prop("tone", "danger")}
            note={copy.dialogs.dangerNote}
          >
            {openButton(MODAL_DEMO.DANGER)}
          </ShowcaseSample>
          <ShowcaseSample
            code={prop("tone", "success")}
            note={copy.dialogs.successNote}
          >
            {openButton(MODAL_DEMO.SUCCESS)}
          </ShowcaseSample>
          <ShowcaseSample
            code={prop("tone", "warning")}
            note={copy.dialogs.warningNote}
          >
            {openButton(MODAL_DEMO.WARNING)}
          </ShowcaseSample>
          <ShowcaseSample
            code={format(code.flag, { name: "isDismissible" })}
            note={copy.dialogs.infoNote}
          >
            {openButton(MODAL_DEMO.INFO)}
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.forms.title}
        code={prop("size", MODAL_SIZE.WIDE)}
        description={copy.forms.description}
      >
        <ShowcaseGrid>
          <ShowcaseSample note={copy.forms.note}>
            <Button variant="primary" onClick={openForm}>
              {copy.form.title}
            </Button>
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>

      <ShowcaseSection
        title={copy.panels.title}
        description={copy.panels.description}
      >
        <ShowcaseGrid>
          <ShowcaseSample
            code={format(code.component, { name: "SidePanel" })}
            note={copy.panels.panelNote}
          >
            <Button variant="outline" onClick={() => setIsPanelOpen(true)}>
              {copy.open}
            </Button>
          </ShowcaseSample>
          <ShowcaseSample
            code={format(code.component, { name: "PopUp" })}
            note={copy.panels.popUpNote}
          >
            <Button
              variant="outline"
              onClick={(event) =>
                setPopUpAnchor(anchorRectOf(event.currentTarget))
              }
            >
              {copy.popUp.title}
            </Button>
          </ShowcaseSample>
        </ShowcaseGrid>
      </ShowcaseSection>

      {dialog === MODAL_DEMO.CONFIRM && (
        <Modal
          title={copy.confirm.title}
          description={copy.confirm.description}
          onClose={closeDialog}
        >
          <div className="modal-actions">
            <Button variant="outline" onClick={closeDialog}>
              {text.common.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={() => confirmAndClose(copy.confirm.done)}
            >
              {copy.confirm.submit}
            </Button>
          </div>
        </Modal>
      )}

      {dialog === MODAL_DEMO.DANGER && (
        <Modal
          icon={<TrashIcon />}
          tone="danger"
          title={copy.danger.title}
          description={copy.danger.description}
          onClose={closeDialog}
        >
          <div className="modal-actions">
            <Button variant="outline" onClick={closeDialog}>
              {text.common.cancel}
            </Button>
            <Button
              variant="danger-solid"
              onClick={() => confirmAndClose(copy.danger.done)}
            >
              {copy.danger.submit}
            </Button>
          </div>
        </Modal>
      )}

      {dialog === MODAL_DEMO.SUCCESS && (
        <Modal
          icon={<CheckCircleIcon />}
          tone="success"
          title={copy.success.title}
          description={copy.success.description}
          onClose={closeDialog}
        >
          <div className="modal-actions">
            <Button variant="primary" fullWidth onClick={closeDialog}>
              {copy.success.submit}
            </Button>
          </div>
        </Modal>
      )}

      {dialog === MODAL_DEMO.WARNING && (
        <Modal
          icon={<WarningIcon />}
          tone="warning"
          title={copy.warning.title}
          description={copy.warning.description}
          onClose={closeDialog}
        >
          <div className="modal-actions">
            <Button variant="outline" onClick={closeDialog}>
              {text.common.cancel}
            </Button>
            <Button
              variant="warning-solid"
              onClick={() => confirmAndClose(copy.warning.done)}
            >
              {copy.warning.submit}
            </Button>
          </div>
        </Modal>
      )}

      {dialog === MODAL_DEMO.INFO && (
        <Modal
          icon={<InfoIcon />}
          title={copy.info.title}
          description={copy.info.description}
          isDismissible
          onClose={closeDialog}
        />
      )}

      {dialog === MODAL_DEMO.FORM && (
        <Modal
          size={MODAL_SIZE.WIDE}
          title={copy.form.title}
          onClose={closeDialog}
        >
          <form
            className="modal-form"
            onSubmit={form.handleSubmit(onCreate)}
            noValidate
          >
            <div className="modal-form__body">
              <div className="modal-form__grid">
                <TextField
                  id="showcase-email"
                  required
                  label={copy.form.email}
                  type="email"
                  autoComplete="off"
                  autoFocus
                  error={
                    touchedFields.email ? errors.email?.message : undefined
                  }
                  {...form.register("email", {
                    required: text.validation.required,
                    pattern: {
                      value: REGEX_PATTERN.EMAIL,
                      message: text.validation.email,
                    },
                    setValueAs: (value: string) => value.trim(),
                  })}
                />

                <TextField
                  id="showcase-full-name"
                  label={copy.form.fullName}
                  autoComplete="off"
                  {...form.register("fullName")}
                />

                <Field label={copy.form.role} hint={copy.form.roleHint}>
                  <Dropdown
                    label={copy.form.role}
                    options={SAMPLE_OPTIONS}
                    value={role}
                    onChange={(next) =>
                      form.setValue("role", next, { shouldDirty: true })
                    }
                  />
                </Field>
              </div>
            </div>

            <div className="modal-form__footer">
              <Button variant="outline" onClick={closeDialog}>
                {text.common.cancel}
              </Button>
              <Button type="submit" variant="primary" disabled={!isValid}>
                {copy.form.submit}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {isPanelOpen && (
        <SidePanel
          title={copy.panel.title}
          subtitle={copy.panel.subtitle}
          onClose={() => setIsPanelOpen(false)}
        >
          <dl className="showcase-facts">
            <dt>{columns.email}</dt>
            <dd>{panelRecord.email}</dd>
            <dt>{columns.role}</dt>
            <dd>
              {SAMPLE_OPTIONS.find(
                (option) => option.value === panelRecord.role,
              )?.label ?? text.common.empty}
            </dd>
            <dt>{columns.note}</dt>
            <dd>{panelRecord.note}</dd>
            <dt>{columns.created}</dt>
            <dd>{formatDateTime(panelRecord.createdAt)}</dd>
          </dl>
          <Button
            variant="danger-outline"
            onClick={() => setDialog(MODAL_DEMO.DANGER)}
          >
            <TrashIcon />
            {copy.panel.delete}
          </Button>
        </SidePanel>
      )}

      {popUpAnchor && (
        <PopUp
          anchor={popUpAnchor}
          label={copy.popUp.label}
          onClose={() => setPopUpAnchor(null)}
        >
          <p className="popup__title">{copy.popUp.title}</p>
          <p className="popup__description">{copy.popUp.description}</p>
          <textarea
            className="textarea popup__input"
            aria-label={copy.popUp.label}
            placeholder={copy.popUp.placeholder}
          />
          <div className="popup__actions">
            <Button variant="outline" onClick={() => setPopUpAnchor(null)}>
              {text.common.cancel}
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                notifySuccess(copy.popUp.done);
                setPopUpAnchor(null);
              }}
            >
              {copy.popUp.save}
            </Button>
          </div>
        </PopUp>
      )}
    </div>
  );
}
