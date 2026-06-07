import { useState } from "react";
import { redirect, Form, useActionData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";
import indexStyles from "./style.css";

export const links = () => [{ rel: "stylesheet", href: indexStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);

  if (url.searchParams.get("shop")) {
    throw redirect(`/app?${url.searchParams.toString()}`);
  }

  return { showForm: Boolean(login) };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const errors = await login(request);
  
  if (errors) {
    return { errors: loginErrorMessage(errors) };
  }
  
  return null;
};

interface LoaderData {
  showForm: boolean;
}

interface ActionData {
  errors: {
    shop?: string;
  };
}

export default function AuthLogin() {
  const loaderData = useActionData<ActionData>() || { errors: {} };
  const { showForm } = { showForm: true }; // We don't have useLoaderData here, but the form is shown from loader context
  const [shop, setShop] = useState("");

  return (
    <div className="index">
      <div className="content">
        <h1>A short heading about [your app]</h1>
        <p>A tagline about [your app] that describes your value proposition.</p>
        {showForm && (
          <Form method="POST" action="/auth/login">
            <label>
              <span>Shop domain</span>
              <input 
                type="text" 
                name="shop" 
                value={shop}
                onChange={(e) => setShop(e.target.value)}
              />
              <span>e.g: my-shop-domain.myshopify.com</span>
              {loaderData?.errors?.shop && (
                <span style={{ color: "red" }}>{loaderData.errors.shop}</span>
              )}
            </label>
            <button type="submit">Log in</button>
          </Form>
        )}
        <ul>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
          <li>
            <strong>Product feature</strong>. Some detail about your feature and
            its benefit to your customer.
          </li>
        </ul>
      </div>
    </div>
  );
}
