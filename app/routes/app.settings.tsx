import {
  Box,
  Card,
  Page,
  Text,
  BlockStack,
  InlineGrid,
  TextField,
  Button,
} from "@shopify/polaris";
import { useState } from "react";
import { Form, useLoaderData } from "react-router";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";
import { authenticate } from "../shopify.server";
import db from "../db.server";

interface Settings {
  shop?: string;
  name?: string;
  description?: string;
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { session } = await authenticate.admin(request);
  // get data from database if it exists. If not return empty object
  let settings = await db.settings.findFirst({
    where: {
      shop: session.shop,
    },
  });

  return settings || {};
}

export async function action({ request }: ActionFunctionArgs) {
  // updates persistent data
  let formData = await request.formData();
  const data = Object.fromEntries(formData);
  const { session } = await authenticate.admin(request);

  // update database
  await db.settings.upsert({
    where: { shop: session.shop },
    update: {
      name: data.name as string,
      description: data.description as string,
      shop: session.shop
    },
    create: {
      name: data.name as string,
      description: data.description as string,
      shop: session.shop
    }
  });

  return data;
}

export default function SettingsPage() {
  const settings = useLoaderData<Settings>();
  const [formState, setFormState] = useState<Settings>(settings || {});

  return (
    <Page>
      <ui-title-bar title="Settings" />
      <BlockStack gap="800">
        <InlineGrid columns={{ xs: "1fr", md: "2fr 5fr" }} gap="400">
          <Box
            as="section"
            paddingInlineStart={{ xs: "400", sm: "0" }}
            paddingInlineEnd={{ xs: "400", sm: "0" }}
          >
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Settings
              </Text>
              <Text as="p" variant="bodyMd">
                Update app settings and preferences.
              </Text>
            </BlockStack>
          </Box>
          <Card roundedAbove="sm">
            <Form method="POST">
              <BlockStack gap="400">
                <TextField 
                  label="App name" 
                  name="name" 
                  value={formState?.name || ""} 
                  onChange={(value) => setFormState({ ...formState, name: value })}
                  autoComplete="off"
                />
                <TextField 
                  label="Description" 
                  name="description" 
                  value={formState?.description || ""} 
                  onChange={(value) => setFormState({ ...formState, description: value })}
                  autoComplete="off"
                />
                <Button submit>Save</Button>
              </BlockStack>
            </Form>
          </Card>
        </InlineGrid>
      </BlockStack>
    </Page>
  );
}
