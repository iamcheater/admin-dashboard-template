import { Navigate } from "react-router-dom";
import { LandingRedirect } from "../components/guards";
import { useAppSelector } from "../redux/store";
import { PRESENTATION_PATHNAMES } from "./constants";

export function PresentationLanding() {
  const claims = useAppSelector((state) => state.authReducer.claims);

  if (claims) return <LandingRedirect />;

  return <Navigate to={PRESENTATION_PATHNAMES.WELCOME} replace />;
}
