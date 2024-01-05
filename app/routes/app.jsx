import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { MONTHLY_PLAN,ANNUAL_PLAN, authenticate } from "../shopify.server";
import { redirect } from "@remix-run/node";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];


export const loader = async ({ request }) => {
  const { admin,billing } = await authenticate.admin(request);

  const result = await admin.graphql(`
  #graphql
    query Shop {
      app {
        installation {
          launchUrl
          activeSubscriptions {
            createdAt
            id
            currentPeriodEnd
            name
            trialDays
            status
            returnUrl
          }
        }
      }
    }
  `)

  const resultJson = await result.json();
  const { activeSubscriptions, launchUrl } = resultJson.data.app.installation;

  // if(activeSubscriptions.length < 1 ){
  //   const billingCheck = await billing.require({
  //     plans: [MONTHLY_PLAN, ANNUAL_PLAN],
  //     isTest: true,
  //     onFailure: () => redirect(launchUrl),
     
  //   });
  
  //   const subscription = billingCheck.appSubscriptions[0];
  //   console.log(`Shop is on ${subscription.name} (id ${subscription.id})`);
  // }

  //Cancle subscription

  //   const billingCheck = await billing.require({
  //   plans: [MONTHLY_PLAN],
  //   onFailure: async () => billing.request({ plan: MONTHLY_PLAN }),
  // });

  // const subscription = billingCheck.appSubscriptions[0];
  // const cancelledSubscription = await billing.cancel({
  //   subscriptionId: subscription.id,
  //   isTest: true,
  //   prorate: true,
  //   });

  // console.log("cancelledSubscription ", cancelledSubscription);
  
   return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <ui-nav-menu>
        <Link to="/app" rel="home">
          Home
        </Link>
        <Link to="/app/help">Help & Support</Link>
        <Link to="/app/state">State</Link>
        <Link to="/app/account">Account</Link>
      </ui-nav-menu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};

export const action = async ({ request }) => {
  let { _action } = Object.fromEntries(await request.formData());
  const { billing } = await authenticate.admin(request);
  if (_action === "monthly") {    
    await billing.require({
      plans: [MONTHLY_PLAN],
      onFailure: async () => {
        const response = await billing.request({
          plan: MONTHLY_PLAN,
          isTest: true,
          returnUrl: "",
        })
        console("response", response)
        return response;
      },
    });
    return null;
  }
  if (_action === "annual") {    
    await billing.require({
      plans: [ANNUAL_PLAN],
      onFailure: async () => {
        const response = await billing.request({
          plan: ANNUAL_PLAN,
          isTest: true,
          returnUrl: "",
        })
        console("response", response)
        return response;
      },
    });
    return null;
  }
  return redirect("/app");
}
