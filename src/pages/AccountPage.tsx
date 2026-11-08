import { useState } from "react";
import { useForm } from "react-hook-form";
import { FIELD_LIMITS } from "../api/constants";
import { CustomSkeleton } from "../components/CustomSkeleton";
import { Modal } from "../components/Modal";
import { PageHeader } from "../components/PageHeader";
import { EditIcon, LockIcon, LogoutIcon } from "../components/icons";
import { Alert, Button, PasswordField, TextField } from "../components/ui";
import { text } from "../i18n";
import { formatAdminRole, formatDate } from "../lib/format";
import {
  describeConfirmationProblem,
  describeNewPasswordProblem,
  passwordComplexityHint,
} from "../lib/password";
import { notifyFailure, notifySuccess } from "../lib/toast";
import {
  changePassword,
  getProfile,
  signOut,
  updateAccount,
} from "../redux/actions/auth";
import { useAppDispatch, useAppSelector } from "../redux/store";
import {
  ACCOUNT_DIALOG,
  ACCOUNT_FACT_SKELETON_COUNT,
  type AccountDialog,
} from "./constants";

interface NameForm {
  fullName: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmation: string;
}

export function AccountPage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.authReducer.user);
  const claims = useAppSelector((state) => state.authReducer.claims);
  const isChangingPassword = useAppSelector(
    (state) => state.authReducer.changePasswordLoading,
  );
  const isSavingName = useAppSelector(
    (state) => state.authReducer.updateAccountLoading,
  );
  const isLoadingProfile = useAppSelector(
    (state) => state.authReducer.profileLoading,
  );

  const [dialog, setDialog] = useState<AccountDialog | null>(null);

  const nameForm = useForm<NameForm>({
    mode: "onTouched",
    defaultValues: { fullName: "" },
  });

  const passwordForm = useForm<PasswordForm>({
    mode: "onTouched",
    defaultValues: { currentPassword: "", newPassword: "", confirmation: "" },
  });

  const {
    errors: nameErrors,
    touchedFields: nameTouched,
    isValid: isNameValid,
    isDirty: isNameDirty,
  } = nameForm.formState;
  const {
    errors: passwordErrors,
    touchedFields: passwordTouched,
    isValid: isPasswordValid,
    isDirty: isPasswordDirty,
  } = passwordForm.formState;

  const closeDialog = () => setDialog(null);

  const openNameDialog = () => {
    nameForm.reset({ fullName: user?.fullName ?? "" });
    setDialog(ACCOUNT_DIALOG.NAME);
  };

  const openPasswordDialog = () => {
    passwordForm.reset();
    setDialog(ACCOUNT_DIALOG.PASSWORD);
  };

  const onSaveName = async ({ fullName }: NameForm) => {
    try {
      await dispatch(updateAccount(fullName)).unwrap();
      notifySuccess(text.account.nameChanged);
      closeDialog();
    } catch (error) {
      notifyFailure(error, text.account.nameFailed);
    }
  };

  const onChangePassword = async ({
    currentPassword,
    newPassword,
  }: PasswordForm) => {
    try {
      await dispatch(changePassword({ currentPassword, newPassword })).unwrap();
      notifySuccess(text.account.changed);
      closeDialog();
    } catch (error) {
      notifyFailure(error, text.account.failed);
    }
  };


  if (!user) {
    return (
      <>
        <PageHeader title={text.account.title} />
        {isLoadingProfile ? (
          <section className="panel">
            <div className="panel__header">
              <h2 className="panel__title">
                {text.account.personalInformation}
              </h2>
            </div>

            <div className="panel__body account__facts">
              {Array.from(
                { length: ACCOUNT_FACT_SKELETON_COUNT },
                (_, index) => (
                  <CustomSkeleton
                    key={index}
                    variant="rounded"
                    className="account__fact--skeleton"
                  />
                ),
              )}
            </div>
          </section>
        ) : (
          <>
            <Alert>{text.account.loadFailed}</Alert>
            <Button onClick={() => void dispatch(getProfile())}>
              {text.common.retry}
            </Button>
          </>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader title={text.account.title} />

      <div className="account">
        <section className="panel">
          <div className="panel__header">
            <h2 className="panel__title">{text.account.personalInformation}</h2>
          </div>

          <div className="panel__body account__facts">
            <div className="account__fact">
              <div className="account__fact-label">{text.account.fullName}</div>
              <div className="account__fact-value">
                <span>{user.fullName ?? text.common.empty}</span>
                <button
                  type="button"
                  className="icon-button"
                  onClick={openNameDialog}
                  aria-label={text.account.editName}
                  title={text.account.editName}
                >
                  <EditIcon />
                </button>
              </div>
            </div>

            <div className="account__fact">
              <div className="account__fact-label">{text.account.email}</div>
              <div className="account__fact-value">{user.email}</div>
            </div>

            <div className="account__fact">
              <div className="account__fact-label">{text.account.role}</div>
              <div className="account__fact-value">
                <span className="account__role">
                  {formatAdminRole(user, Boolean(claims?.isSuperAdmin))}
                </span>
              </div>
            </div>

            <div className="account__fact">
              <div className="account__fact-label">
                {text.account.memberSince}
              </div>
              <div className="account__fact-value">
                {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel__header panel__header--split">
            <h2 className="panel__title">{text.account.accountSecurity}</h2>
            <div className="account__security-actions">
              <Button variant="outline" onClick={openPasswordDialog}>
                <LockIcon /> {text.account.changePassword}
              </Button>
              <Button
                variant="danger-outline"
                onClick={() => setDialog(ACCOUNT_DIALOG.LOGOUT)}
              >
                <LogoutIcon /> {text.account.logOut}
              </Button>
            </div>
          </div>
        </section>
      </div>

      {dialog === ACCOUNT_DIALOG.NAME && (
        <Modal
          title={text.account.updatePersonalInformation}
          onClose={closeDialog}
        >
          <form
            className="stack"
            onSubmit={nameForm.handleSubmit(onSaveName)}
            noValidate
          >
            <TextField
              id="fullName"
              required
              label={text.account.fullName}
              error={
                nameTouched.fullName ? nameErrors.fullName?.message : undefined
              }
              autoFocus
              maxLength={FIELD_LIMITS.fullNameMax}
              {...nameForm.register("fullName", {
                required: text.validation.required,
                setValueAs: (value: string) => value.trim(),
              })}
            />

            <div className="modal-actions">
              <Button
                variant="outline"
                onClick={closeDialog}
                disabled={isSavingName}
              >
                {text.common.cancel}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  isSavingName ||
                  !isNameValid ||
                  !isNameDirty
                }
              >
                {isSavingName ? text.common.saving : text.common.save}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {dialog === ACCOUNT_DIALOG.PASSWORD && (
        <Modal title={text.account.changePasswordTitle} onClose={closeDialog}>
          <form
            className="stack"
            onSubmit={passwordForm.handleSubmit(onChangePassword)}
            noValidate
          >
            <PasswordField
              id="currentPassword"
              required
              label={text.account.currentPassword}
              error={
                passwordTouched.currentPassword
                  ? passwordErrors.currentPassword?.message
                  : undefined
              }
              autoComplete="current-password"
              autoFocus
              {...passwordForm.register("currentPassword", {
                required: text.validation.required,
              })}
            />

            <PasswordField
              id="newPassword"
              required
              label={text.account.newPassword}
              hint={passwordComplexityHint()}
              error={
                passwordTouched.newPassword
                  ? passwordErrors.newPassword?.message
                  : undefined
              }
              autoComplete="new-password"
              maxLength={FIELD_LIMITS.passwordMax}
              {...passwordForm.register("newPassword", {
                required: text.validation.required,
                deps: ["confirmation"],
                validate: (value) => describeNewPasswordProblem(value) ?? true,
              })}
            />

            <PasswordField
              id="confirmation"
              required
              label={text.account.confirmPassword}
              error={
                passwordTouched.confirmation
                  ? passwordErrors.confirmation?.message
                  : undefined
              }
              autoComplete="new-password"
              maxLength={FIELD_LIMITS.passwordMax}
              {...passwordForm.register("confirmation", {
                required: text.validation.required,
                validate: (value, { newPassword }) =>
                  describeConfirmationProblem(newPassword, value) ?? true,
              })}
            />

            <div className="modal-actions">
              <Button
                variant="outline"
                onClick={closeDialog}
                disabled={isChangingPassword}
              >
                {text.common.cancel}
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={
                  isChangingPassword ||
                  !isPasswordValid ||
                  !isPasswordDirty
                }
              >
                {isChangingPassword
                  ? text.common.saving
                  : text.account.savePassword}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {dialog === ACCOUNT_DIALOG.LOGOUT && (
        <Modal
          icon={<LogoutIcon />}
          tone="danger"
          title={text.account.logOutTitle}
          description={text.account.logOutDescription}
          onClose={closeDialog}
        >
          <div className="modal-actions">
            <Button variant="outline" onClick={closeDialog}>
              {text.common.cancel}
            </Button>
            <Button
              variant="danger-solid"
              onClick={() => void dispatch(signOut())}
            >
              {text.account.logOut}
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
}
