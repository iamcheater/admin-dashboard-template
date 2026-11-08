import { useForm } from "react-hook-form";
import { AuthScreen } from "../components/AuthScreen";
import { AUTH_BACKGROUND_TYPE } from "../components/constants";
import { PageHeader } from "../components/PageHeader";
import { PasswordField, TextField } from "../components/ui";
import { text } from "../i18n";
import { REGEX_PATTERN } from "../lib/constants";
import { notifyInfo } from "../lib/toast";
import { PRESENTATION_PATHNAMES } from "./constants";
import { presentationText } from "./text";

interface LoginForm {
  email: string;
  password: string;
}

const copy = presentationText.authScreens;

export function LoginPreviewPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  return (
    <div className="page-stack">
      <PageHeader title={copy.login.title} subtitle={copy.login.description} />

      <div className="showcase-auth">
        <AuthScreen
          title={text.login.title}
          submitText={text.login.submit}
          isValid={isValid}
          onSubmit={handleSubmit(() => notifyInfo(copy.previewNote))}
          linkText={text.login.forgotPassword}
          linkTo={PRESENTATION_PATHNAMES.FORGOT_PASSWORD}
          background={AUTH_BACKGROUND_TYPE.VIDEO}
        >
          <TextField
            id="email"
            label={text.login.email}
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

          <PasswordField
            id="password"
            label={text.login.password}
            autoComplete="off"
            {...register("password", { required: text.validation.required })}
          />
        </AuthScreen>
      </div>
    </div>
  );
}
