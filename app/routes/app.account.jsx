import { authenticate } from "../shopify.server";
import { defer } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
    Box,
    Card,
    Layout,
    Page,
    BlockStack,
    List,
    Text,
  } from "@shopify/polaris";

export const loader = async ({ request }) => {

 const { admin } = await authenticate.admin(request);
 const response = await admin.graphql(
   `#graphql
    query {
        shop {
          name
          plan {
            displayName
          }
          primaryDomain {
            host
            id
          }
          email
        }
      }      
   `,
 );
  
    const shopData = await response.json();
    return defer({shopData});
};

export default function AccountPage() {
    const loaderdata = useLoaderData();
    const shopData = loaderdata.shopData.data.shop;
    return (
        <Page>
            <Box padding="400" width="586px">
                <h1 className="Polaris-Header-Title">Account Information</h1>
            </Box>
            <Layout>
                <Layout.Section>
                <Card>
                    <BlockStack gap="400">
                    <Text as="h2" variant="headingMd">
                        {shopData.name}
                    </Text>
                    <List>
                    <List.Item>
                            <p><strong>Billing: </strong>Monthly</p>
                        </List.Item>
                        <List.Item>
                            <p><strong>Plan: </strong>{shopData.plan.displayName}</p>
                        </List.Item>
                        <List.Item>
                        <p><strong>Email: </strong>{shopData.email}</p>
                        </List.Item>
                        <List.Item>
                            <p><strong>Shop: </strong>{shopData.primaryDomain.host}</p>
                        </List.Item>
                    </List>
                    </BlockStack>
                </Card>
                </Layout.Section>
            </Layout>
        </Page>
    )
}