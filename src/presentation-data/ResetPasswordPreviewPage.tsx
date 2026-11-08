import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FIELD_LIMITS } from "../api/constants";
import { AuthScreen } from "../components/AuthScreen";
import { PageHeader } from "../components/PageHeader";
import { Button, PasswordField } from "../components/ui";
import { text } from "../i18n";
import {
  describeConfirmationProblem,
  describeNewPasswordProblem,
  passwordComplexityHint,
} from "../lib/password";
import { notifySuccess } from "../lib/toast";
import { PRESENTATION_PATHNAMES } from "./constants";
import { presentationText } from "./text";

interface ResetPasswordForm {
  password: string;
  confirmation: string;
}

const copy = presentationText.authScreens;

export function ResetPasswordPreviewPage() {
  const navigate = useNavigate();
  const [isLinkExpired, setIsLinkExpired] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
  } = useForm<ResetPasswordForm>({
    mode: "onTouched",
    defaultValues: { password: "", confirmation: "" },
  });

  const onSubmit = () => {
    notifySuccess(text.resetPassword.done);
    navigate(PRESENTATION_PATHNAMES.LOGIN);
  };

  return (
    <div className="page-stack">
      <PageHeader
        title={copy.resetPassword.title}
        subtitle={copy.resetPassword.description}
        actions={
          <Button
            variant="outline"
            onClick={() => setIsLinkExpired((expired) => !expired)}
          >
            {isLinkExpired
              ? copy.resetPassword.showForm
              : copy.resetPassword.showInvalid}
          </Button>
        }
      />

      <div className="showcase-auth">
        {isLinkExpired ? (
          <AuthScreen
            title={text.resetPassword.title}
            subtitle={text.resetPassword.invalidToken}
            submitText={text.resetPassword.requestNewLink}
            onSubmit={(event) => {
              event.preventDefault();
              navigate(PRESENTATION_PATHNAMES.FORGOT_PASSWORD);
            }}
            hasLogo={false}
          >
            {null}
          </AuthScreen>
        ) : (
          <AuthScreen
            title={text.resetPassword.title}
            submitText={text.resetPassword.submit}
            isValid={isValid}
            onSubmit={handleSubmit(onSubmit)}
            hasLogo={false}
          >
            <PasswordField
              id="password"
              required
              label={text.resetPassword.newPassword}
              hint={passwordComplexityHint()}
              error={
                touchedFields.password ? errors.password?.message : undefined
              }
              autoComplete="off"
              maxLength={FIELD_LIMITS.passwordMax}
              {...register("password", {
                required: text.validation.required,
                deps: ["confirmation"],
                validate: (value) => describeNewPasswordProblem(value) ?? true,
              })}
            />

            <PasswordField
              id="confirmation"
              required
              label={text.resetPassword.confirmPassword}
              error={
                touchedFields.confirmation
                  ? errors.confirmation?.message
                  : undefined
              }
              autoComplete="off"
              maxLength={FIELD_LIMITS.passwordMax}
              {...register("confirmation", {
                required: text.validation.required,
                validate: (value, { password }) =>
                  describeConfirmationProblem(password, value) ?? true,
              })}
            />
          </AuthScreen>
        )}
      </div>
    </div>
  );
}
