import { authenticate } from "../shopify.server";
import { defer } from "@remix-run/node";
import {
  Box,
  Card,
  Layout,
  Link,
  List,
  Page,
  Text,
  BlockStack,
} from "@shopify/polaris";

export const loader = async ({ request }) => {

  const { admin } = await authenticate.admin(request);
  const shop = await admin.graphql(
    `#graphql
     query {
       shop {
         id
       }
     }
    `,
  );
   
  const shopData = await shop.json();
  const shopId = shopData?.data?.shop?.id
  const handles = getWishlistProducts(shopId);
  const response = await admin.graphql(
    `#graphql
     query {
      productByHandle(handle: "the-3p-fulfilled-snowboard") {
        id
        title
        featuredImage {
          id
          altText
          src
          width
          }
        }
       }      
    `,
  );
   
     const productData = await response.json();
     console.log(productData)
     return defer({productData});
 };

export default function StatePage() {
  return (
    <Page>
      <Box padding="400" width="586px">
        <h1 className="Polaris-Header-Title">Wishlist State</h1>
    </Box>
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="300">
              <Text as="p" variant="bodyMd">
                The app template comes with an additional page which
                demonstrates how to create multiple pages within app navigation
                using{" "}
                <Link
                  url="https://shopify.dev/docs/apps/tools/app-bridge"
                  target="_blank"
                  removeUnderline
                >
                  App Bridge
                </Link>
                .
              </Text>
              <Text as="p" variant="bodyMd">
                To create your own page and have it show up in the app
                navigation, add a page inside <Code>app/routes</Code>, and a
                link to it in the <Code>&lt;ui-nav-menu&gt;</Code> component
                found in <Code>app/routes/app.jsx</Code>.
              </Text>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="200">
              <Text as="h2" variant="headingMd">
                Resources
              </Text>
              <List>
                <List.Item>
                  <Link
                    url="https://shopify.dev/docs/apps/design-guidelines/navigation#app-nav"
                    target="_blank"
                    removeUnderline
                  >
                    App nav best practices
                  </Link>
                </List.Item>
              </List>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

function Code({ children }) {
  return (
    <Box
      as="span"
      padding="025"
      paddingInlineStart="100"
      paddingInlineEnd="100"
      background="bg-surface-active"
      borderWidth="025"
      borderColor="border"
      borderRadius="100"
    >
      <code>{children}</code>
    </Box>
  );
}

export async function getWishlistProducts(shopId) {
  console.log("Shop Id: ", shopId)
  const allProducts = await prisma.vTProducts.findMany({
    where: {
      shopId: shopId
    },
    select: {
      handle: true
    }
  });
  // const uniqueArray = [...new Set(allProducts)];
  // console.log("All Products: ",uniqueArray)
}