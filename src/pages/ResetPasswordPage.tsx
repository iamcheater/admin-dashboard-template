import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthScreen } from "../components/AuthScreen";
import { Loading, PasswordField } from "../components/ui";
import { FIELD_LIMITS } from "../api/constants";
import { text } from "../i18n";
import { PATHNAMES, RESET_TOKEN_SEARCH_PARAM } from "../lib/constants";
import {
  describeConfirmationProblem,
  describeNewPasswordProblem,
  passwordComplexityHint,
} from "../lib/password";
import { notifyFailure, notifySuccess } from "../lib/toast";
import { checkResetToken, resetPassword } from "../redux/actions/auth";
import { useAppDispatch, useAppSelector } from "../redux/store";

interface ResetPasswordForm {
  password: string;
  confirmation: string;
}

export function ResetPasswordPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const resetPasswordLoading = useAppSelector(
    (state) => state.authReducer.resetPasswordLoading,
  );
  const checkedResetToken = useAppSelector(
    (state) => state.authReducer.checkedResetToken,
  );
  const resetTokenStatus = useAppSelector(
    (state) => state.authReducer.resetTokenStatus,
  );
  const resetTokenError = useAppSelector(
    (state) => state.authReducer.resetTokenError,
  );
  const [searchParams] = useSearchParams();
  const token = searchParams.get(RESET_TOKEN_SEARCH_PARAM) ?? "";

  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields, isValid },
  } = useForm<ResetPasswordForm>({
    mode: "onTouched",
    defaultValues: { password: "", confirmation: "" },
  });

  useEffect(() => {
    if (!token) return;
    const promise = dispatch(checkResetToken({ token }));
    return () => promise.abort();
  }, [dispatch, token]);

  const isCurrentCheck = Boolean(token) && checkedResetToken === token;
  const isVerified = isCurrentCheck && resetTokenStatus === "valid";
  const isChecking =
    Boolean(token) && (!isCurrentCheck || resetTokenStatus === "checking");
  const failureMessage = !token
    ? text.resetPassword.missingToken
    : isCurrentCheck && resetTokenStatus === "invalid"
      ? (resetTokenError ?? text.resetPassword.invalidToken)
      : null;

  const onSubmit = async ({ password }: ResetPasswordForm) => {
    if (!isVerified) return;

    try {
      await dispatch(resetPassword({ token, password })).unwrap();
      notifySuccess(text.resetPassword.done);
      navigate(PATHNAMES.LOGIN, { replace: true });
    } catch (error) {
      notifyFailure(error, text.resetPassword.failed);
    }
  };

  if (isChecking)
    return <Loading label={text.resetPassword.verifying} isFullPage />;

  if (failureMessage) {
    return (
      <AuthScreen
        title={text.resetPassword.title}
        subtitle={failureMessage}
        submitText={text.resetPassword.requestNewLink}
        onSubmit={(event) => {
          event.preventDefault();
          navigate(PATHNAMES.FORGOT_PASSWORD);
        }}
        hasLogo={false}
      >
        {null}
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title={text.resetPassword.title}
      submitText={
        resetPasswordLoading ? text.common.saving : text.resetPassword.submit
      }
      isSubmitting={resetPasswordLoading}
      isValid={isValid}
      onSubmit={handleSubmit(onSubmit)}
      hasLogo={false}
    >
      <PasswordField
        id="password"
        required
        label={text.resetPassword.newPassword}
        hint={passwordComplexityHint()}
        error={touchedFields.password ? errors.password?.message : undefined}
        autoComplete="new-password"
        autoFocus
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
          touchedFields.confirmation ? errors.confirmation?.message : undefined
        }
        autoComplete="new-password"
        maxLength={FIELD_LIMITS.passwordMax}
        {...register("confirmation", {
          required: text.validation.required,
          validate: (value, { password }) =>
            describeConfirmationProblem(password, value) ?? true,
        })}
      />
    </AuthScreen>
  );
}
