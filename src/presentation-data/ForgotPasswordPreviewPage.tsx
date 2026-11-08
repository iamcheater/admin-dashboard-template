import { useForm } from "react-hook-form";
import { AuthScreen } from "../components/AuthScreen";
import { PageHeader } from "../components/PageHeader";
import { TextField } from "../components/ui";
import { text } from "../i18n";
import { REGEX_PATTERN } from "../lib/constants";
import { notifySuccess } from "../lib/toast";
import { presentationText } from "./text";

interface ForgotPasswordForm {
  email: string;
}

const copy = presentationText.authScreens;

export function ForgotPasswordPreviewPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ForgotPasswordForm>({
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const onSubmit = ({ email }: ForgotPasswordForm) =>
    notifySuccess(
      <p>
        {text.forgotPassword.sentLead} <strong>{email}</strong>
        <br />
        {text.forgotPassword.checkSpam}
      </p>,
    );

  return (
    <div className="page-stack">
      <PageHeader
        title={copy.forgotPassword.title}
        subtitle={copy.forgotPassword.description}
      />

      <div className="showcase-auth">
        <AuthScreen
          title={text.forgotPassword.title}
          subtitle={text.forgotPassword.subtitle}
          submitText={text.forgotPassword.submit}
          isValid={isValid}
          onSubmit={handleSubmit(onSubmit)}
          hasLogo={false}
        >
          <TextField
            id="email"
            label={text.forgotPassword.email}
            error={errors.email?.message}
            type="email"
            autoComplete="off"
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
      </div>
    </div>
  );
}
