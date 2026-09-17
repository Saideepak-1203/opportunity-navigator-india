export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start the Cognito authorization-code flow. This must only run from an event
// handler because it immediately navigates the browser to the server route.
export const startLogin = (mode: "signIn" | "signUp" = "signIn") => {
  const url = new URL("/api/auth/login", window.location.origin);
  url.searchParams.set("mode", mode);
  window.location.assign(url.toString());
};
