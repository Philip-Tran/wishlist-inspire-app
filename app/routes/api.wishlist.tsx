import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import db from "../db.server";

interface FormDataEntry {
  [key: string]: string;
}

/**
 * Creates a JSON response with CORS headers
 */
function corsResponse(request: Request, data: unknown, init?: ResponseInit): Response {
  const origin = request.headers.get("Origin");
  const headers = new Headers(init?.headers);
  headers.set("Access-Control-Allow-Origin", origin || "*");
  headers.set("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
  headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  headers.set("Access-Control-Allow-Credentials", "true");
  headers.set("Content-Type", "application/json");

  return new Response(JSON.stringify(data), {
    ...init,
    headers,
  });
}

// get request: accept request with request: customerId, shop, productId.
// read database and return wishlist items for that customer.
export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");
  const shop = url.searchParams.get("shop");
  const productId = url.searchParams.get("productId");

  if (!customerId || !shop || !productId) {
    return corsResponse(request, {
      message: "Missing data. Required data: customerId, productId, shop",
      method: "GET"
    });
  }

  // If customerId, shop, productId is provided, return wishlist items for that customer.
  const wishlist = await db.wishlist.findMany({
    where: {
      customerId: customerId,
      shop: shop,
      productId: productId,
    },
  });

  return corsResponse(request, {
    ok: true,
    message: "Success",
    data: wishlist,
  });
}

// Expected data comes from post request. If
// customerID, productID, shop
export async function action({ request }: ActionFunctionArgs) {
  // Handle OPTIONS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204 });
  }

  let data = await request.formData();
  const formDataEntries = Object.fromEntries(data) as unknown as FormDataEntry;
  const customerId = formDataEntries.customerId;
  const productId = formDataEntries.productId;
  const shop = formDataEntries.shop;
  const _action = formDataEntries._action;

  if (!customerId || !productId || !shop || !_action) {
    return corsResponse(request, {
      message: "Missing data. Required data: customerId, productId, shop, _action",
      method: _action
    });
  }

  switch (_action) {
    case "CREATE": {
      // Handle CREATE request logic
      await db.wishlist.create({
        data: {
          customerId,
          productId,
          shop,
        },
      });

      return corsResponse(request, { message: "Product added to wishlist", method: _action, wishlisted: true });
    }
    case "PATCH":
      // Handle PATCH request logic here
      return corsResponse(request, { message: "Success", method: "Patch" });

    case "DELETE": {
      // Handle DELETE request logic here
      await db.wishlist.deleteMany({
        where: {
          customerId: customerId,
          shop: shop,
          productId: productId,
        },
      });

      return corsResponse(request, { message: "Product removed from your wishlist", method: _action, wishlisted: false });
    }
    default:
      // Optional: handle other methods or return a method not allowed response
      return new Response("Method Not Allowed", { status: 405 });
  }
}
