import { LoginErrorType } from "@shopify/shopify-app-react-router/server";

interface LoginErrors {
  shop?: LoginErrorType;
}

interface LoginErrorMessages {
  shop?: string;
}

export function loginErrorMessage(loginErrors: LoginErrors | null): LoginErrorMessages {
  if (loginErrors?.shop === LoginErrorType.MissingShop) {
    return { shop: "Please enter your shop domain to log in" };
  } else if (loginErrors?.shop === LoginErrorType.InvalidShop) {
    return { shop: "Please enter a valid shop domain to log in" };
  }

  return {};
}
