import {
  Page,
  Box,
  Card,
  CalloutCard,
  Text,
  Grid,
  Divider,
  BlockStack,
  ExceptionList,
  Button,
} from "@shopify/polaris";
import { useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { authenticate, MONTHLY_PLAN, ANNUAL_PLAN } from "../shopify.server";
import { CheckIcon } from '@shopify/polaris-icons';

interface Plan {
  name: string;
  id?: string;
}

interface LoaderData {
  billing: any;
  plan: Plan;
}

interface PlanInfo {
  title: string;
  description: string;
  price: string;
  action: string;
  name: string;
  url: string;
  features: string[];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const { billing } = await authenticate.admin(request);

  try {
    // Attempt to check if the shop has an active payment for any plan
    // Check billing (non-required approach to avoid redirect)
    const billingCheck = await (billing as any).check({
      plans: [MONTHLY_PLAN, ANNUAL_PLAN],
      isTest: true,
    });

    const subscription = billingCheck.appSubscriptions[0];
    
    if (subscription) {
      console.log(`Shop is on ${subscription.name} (id ${subscription.id})`);
      return { billing, plan: subscription };
    }
    
    console.log('Shop does not have any active plans.');
    return { billing, plan: { name: "Free" } };

  } catch (error) {
    console.log('Billing check failed, defaulting to Free plan');
    return { billing: null, plan: { name: "Free" } };
  }
}

const planData: PlanInfo[] = [
  {
    title: "Free",
    description: "Free plan with basic features",
    price: "0",
    action: "Upgrade to pro",
    name: "Free",
    url: "/app/upgrade",
    features: [
      "100 wishlist per day",
      "500 Products",
      "Basic customization",
      "Basic support",
      "Basic analytics"
    ]
  },
  {
    title: "Pro",
    description: "Pro plan with advanced features",
    price: "10",
    name: "Monthly subscription",
    action: "Upgrade to pro",
    url: "/app/upgrade",
    features: [
      "Unlimted wishlist per day",
      "10000 Products",
      "Advanced customization",
      "Priority support",
      "Advanced analytics"
    ]
  },
];

export default function PricingPage() {
  const { plan } = useLoaderData<LoaderData>();

  console.log('plan', plan);
  return (
    <Page>
      <ui-title-bar title="Pricing" />
      <CalloutCard
          title="Change your plan"
          illustration="https://cdn.shopify.com/s/files/1/0583/6465/7734/files/tag.png?v=1705280535"
          primaryAction={{
            content: 'Cancel Plan',
            url: '/app/cancel',
          }}
        >
          { plan.name == "Monthly subscription" ? (
            <p>
              You're currently on pro plan. All features are unlocked.
            </p>
          ) : (
            <p>
              You're currently on free plan. Upgrade to pro to unlock more features.
            </p>
          )}
      </CalloutCard>

      <div style={{ margin: "0.5rem 0"}}>
        <Divider />
      </div>

      <Grid>
        {planData.map((plan_item, index) => (
          <Grid.Cell key={index} columnSpan={{xs: 6, sm: 3, md: 3, lg: 6, xl: 6}}>
            <Card background={ plan_item.name == plan.name ? "bg-surface-success" : "bg-surface" }>
              <Box padding="400">
                <Text as="h3" variant="headingMd">
                  {plan_item.title}
                </Text>
                <Text as="p" variant="bodyMd">
                  {plan_item.description}
                  <br />
                  <Text as="p" variant="headingLg" fontWeight="bold">
                    {plan_item.price === "0" ? "" : "$" + plan_item.price}
                  </Text>
                </Text>

                <div style={{ margin: "0.5rem 0"}}>
                  <Divider />
                </div>

                <BlockStack gap="100">
                  {plan_item.features.map((feature, index) => (
                    <ExceptionList
                      key={index}
                      items={[
                        {
                          icon: CheckIcon,
                          description: feature,
                        },
                      ]}
                    />
                  ))}
                </BlockStack>
                <div style={{ margin: "0.5rem 0"}}>
                  <Divider />
                </div>

                { plan_item.name == "Monthly subscription" ?
                  plan.name != "Monthly subscription" ? (
                    <Button variant="primary" url={plan_item.url}>
                      {plan_item.action}
                    </Button>
                  ) : (
                    <Text as="p" variant="bodyMd">
                      You're currently on this plan
                    </Text>
                  )
                : null }
              </Box>
            </Card>
          </Grid.Cell>
        ))}
      </Grid>
    </Page>
  );
}
