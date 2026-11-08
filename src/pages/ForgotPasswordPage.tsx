import { useForm } from "react-hook-form";
import { AuthScreen } from "../components/AuthScreen";
import { TextField } from "../components/ui";
import { text } from "../i18n";
import { REGEX_PATTERN } from "../lib/constants";
import { notifyFailure, notifySuccess } from "../lib/toast";
import { requestPasswordReset } from "../redux/actions/auth";
import { useAppDispatch, useAppSelector } from "../redux/store";

interface ForgotPasswordForm {
  email: string;
}

export function ForgotPasswordPage() {
  const dispatch = useAppDispatch();
  const forgotPasswordLoading = useAppSelector(
    (state) => state.authReducer.forgotPasswordLoading,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordForm>({
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    try {
      await dispatch(requestPasswordReset(email)).unwrap();
      notifySuccess(
        <p>
          {text.forgotPassword.sentLead} <strong>{email}</strong>
          <br />
          {text.forgotPassword.checkSpam}
        </p>,
      );
    } catch (error) {
      notifyFailure(error, text.forgotPassword.failed);
    }
  };

  return (
    <AuthScreen
      title={text.forgotPassword.title}
      subtitle={text.forgotPassword.subtitle}
      submitText={
        forgotPasswordLoading
          ? text.forgotPassword.submitting
          : text.forgotPassword.submit
      }
      isSubmitting={forgotPasswordLoading}
      isValid={isValid}
      onSubmit={handleSubmit(onSubmit)}
      hasLogo={false}
    >
      <TextField
        id="email"
        label={text.forgotPassword.email}
        error={errors.email?.message}
        type="email"
        autoComplete="username"
        autoFocus
        {...register("email", {
          required: text.validation.required,
          setValueAs: (value: string) => value.trim(),
          pattern: {
            value: REGEX_PATTERN.EMAIL,
            message: text.validation.email,
          },
        })}
      />
    </AuthScreen>
  );
}
