import { useForm } from "react-hook-form";
import { Navigate, useLocation } from "react-router-dom";
import { AuthScreen } from "../components/AuthScreen";
import { AUTH_BACKGROUND_TYPE } from "../components/constants";
import { Loading, PasswordField, TextField } from "../components/ui";
import { text } from "../i18n";
import { PATHNAMES, REGEX_PATTERN } from "../lib/constants";
import { notifyFailure } from "../lib/toast";
import { getProfile, login } from "../redux/actions/auth";
import { useAppDispatch, useAppSelector } from "../redux/store";

interface LocationState {
  from?: string;
}

interface LoginForm {
  email: string;
  password: string;
}

export function LoginPage() {
  const dispatch = useAppDispatch();
  const claims = useAppSelector((state) => state.authReducer.claims);
  const isRestoring = useAppSelector((state) => state.authReducer.isRestoring);
  const loginLoading = useAppSelector(
    (state) => state.authReducer.loginLoading,
  );
  const location = useLocation();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async ({ email, password }: LoginForm) => {
    try {
      await dispatch(login({ email, password })).unwrap();
      await dispatch(getProfile()).unwrap();
    } catch (error) {
      notifyFailure(error, text.login.failed);
    }
  };

  if (isRestoring) return <Loading label={text.common.restoringSession} />;

  if (claims) {
    const from = (location.state as LocationState | null)?.from;
    return <Navigate to={from ?? PATHNAMES.ROOT} replace />;
  }

  return (
    <AuthScreen
      title={text.login.title}
      submitText={loginLoading ? text.login.submitting : text.login.submit}
      isSubmitting={loginLoading}
      isValid={isValid}
      onSubmit={handleSubmit(onSubmit)}
      linkText={text.login.forgotPassword}
      linkTo={PATHNAMES.FORGOT_PASSWORD}
      background={AUTH_BACKGROUND_TYPE.VIDEO}
    >
      <TextField
        id="email"
        label={text.login.email}
        error={errors.email?.message}
        type="email"
        autoComplete="username"
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
        autoComplete="current-password"
        {...register("password", { required: text.validation.required })}
      />
    </AuthScreen>
  );
}
