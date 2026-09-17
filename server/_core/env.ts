const cognitoRegion = process.env.COGNITO_REGION ?? "";
const cognitoUserPoolId = process.env.COGNITO_USER_POOL_ID ?? "";

export const ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  cognitoRegion,
  cognitoUserPoolId,
  cognitoClientId: process.env.COGNITO_CLIENT_ID ?? "",
  cognitoClientSecret: process.env.COGNITO_CLIENT_SECRET ?? "",
  cognitoDomain: process.env.COGNITO_DOMAIN ?? "",
  cognitoIssuer: cognitoRegion && cognitoUserPoolId
    ? `https://cognito-idp.${cognitoRegion}.amazonaws.com/${cognitoUserPoolId}`
    : "",
};
