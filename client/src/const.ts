export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Start the Cognito authorization-code flow. This must only run from an event
// handler because it immediately navigates the browser to the server route.
export const startLogin = (mode: "signIn" | "signUp" = "signIn") => {
  const url = new URL("/api/auth/login", window.location.origin);
  url.searchParams.set("mode", mode);
  // Cognito managed login sends X-Frame-Options headers and must open at the
  // top-level browser context, not inside the Manus preview iframe.
  const targetWindow = window.top ?? window;
  targetWindow.location.assign(url.toString());
};
