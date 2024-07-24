/// <reference types="vite/client" />
/// <reference types="@shopify/remix-oxygen" />
/// <reference types="@shopify/oxygen-workers-types" />

import type { HydrogenCart, HydrogenSessionData } from "@shopify/hydrogen";
import type { WeaverseClient } from "@weaverse/hydrogen";
import type { AppSession } from "~/lib/session";
import type { CustomerAccount, Storefront } from "~/lib/type";

declare global {
  /**
   * A global `process` object is only available during build to access NODE_ENV.
   */
  const process: { env: { NODE_ENV: "production" | "development" } };

  /**
   * Declare expected Env parameter in fetch handler.
   */
  interface Env {
    SESSION_SECRET: string;
    PUBLIC_STOREFRONT_API_TOKEN: string;
    PRIVATE_STOREFRONT_API_TOKEN: string;
    PUBLIC_STORE_DOMAIN: string;
    PUBLIC_STOREFRONT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_CLIENT_ID: string;
    PUBLIC_CUSTOMER_ACCOUNT_API_URL: string;
    PUBLIC_CHECKOUT_DOMAIN: string;

    WEAVERSE_PROJECT_ID: string;
    WEAVERSE_HOST: string;
    WEAVERSE_API_KEY: string;
    JUDGEME_PRIVATE_API_TOKEN: string;
    PUBLIC_GOOGLE_GTM_ID: string;
  }
}

declare module "@shopify/remix-oxygen" {
  /**
   * Declare local additions to the Remix loader context.
   */
  interface AppLoadContext {
    env: Env;
    cart: HydrogenCart;
    storefront: Storefront;
    customerAccount: CustomerAccount;
    session: AppSession;
    waitUntil: ExecutionContext["waitUntil"];
    weaverse: WeaverseClient;
  }

  /**
   * Declare local additions to the Remix session data.
   */
  interface SessionData extends HydrogenSessionData {}
}
