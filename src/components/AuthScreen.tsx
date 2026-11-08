import type { FormEvent, ReactNode } from "react";
import { Link } from "react-router-dom";
import { prefersReducedMotion } from "../lib/motion";
import {
  AUTH_BACKGROUND_TYPE,
  AUTH_BACKGROUND_VIDEO_SRC,
  type AuthBackground,
} from "./constants";
import { Logo } from "./Logo";
import { Button } from "./ui";

export function AuthScreen({
  title,
  subtitle,
  submitText,
  isSubmitting = false,
  onSubmit,
  linkText,
  linkTo,
  background = AUTH_BACKGROUND_TYPE.PLAIN,
  hasLogo = true,
  isValid = true,
  children,
}: {
  title: string;
  subtitle?: string;
  submitText: string;
  isSubmitting?: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  linkText?: string;
  linkTo?: string;
  background?: AuthBackground;
  hasLogo?: boolean;
  isValid?: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`auth-screen auth-screen--${background}`}>
      {background === AUTH_BACKGROUND_TYPE.VIDEO && (
        <video
          className="auth-screen-video"
          src={AUTH_BACKGROUND_VIDEO_SRC}
          autoPlay={!prefersReducedMotion()}
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
        />
      )}

      <div className="auth-screen-content">
        {hasLogo && <Logo className="auth-screen-logo" />}
        <div className="auth-screen-header">
          <h1 className="auth-screen-title">{title}</h1>
          {subtitle && <p className="auth-screen-subtitle">{subtitle}</p>}
        </div>

        <form className="auth-screen-form" onSubmit={onSubmit} noValidate>
          {children}
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting || !isValid}
          >
            {submitText}
          </Button>
        </form>
        {linkTo && linkText && (
          <p className="auth-screen-link">
            <Link to={linkTo} className="auth-screen-link-anchor">
              {linkText}
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
