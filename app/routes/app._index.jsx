import { useEffect, useState } from "react";
import { json } from "@remix-run/node";
import { useActionData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { ActionArgs } from "@remix-run/node";
import createApp from "@shopify/app-bridge";
import { getSessionToken } from "@shopify/app-bridge/utilities";


export const loader = async ({ request }) => {

//  const app = createApp({
//   apiKey: "46d60d2e35f97b8bd4fd586a44edc30d",
// });

//  const sessionToken = await getSessionToken(app);

//  console.log("sessionToken", sessionToken)
 const { admin } = await authenticate.admin(request);

 const response = await admin.graphql(
   `#graphql
    query {
      shop {
        name
        id
        plan {
          displayName
        }
        primaryDomain {
          host
          id
        }
      }
    }
   `,
 );

 const shopData = await response.json();
//  addShopDetails(shopData);

  return null;
};


export const action = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  const color = ["Red", "Orange", "Yellow", "Green"][
    Math.floor(Math.random() * 4)
  ];
  const response = await admin.graphql(
    `#graphql
      mutation populateProduct($input: ProductInput!) {
        productCreate(input: $input) {
          product {
            id
            title
            handle
            status
            variants(first: 10) {
              edges {
                node {
                  id
                  price
                  barcode
                  createdAt
                }
              }
            }
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `${color} Snowboard`,
          variants: [{ price: Math.random() * 100 }],
        },
      },
    }
  );
  const responseJson = await response.json();

  return json({
    product: responseJson.data.productCreate.product,
  });
};

export default function Index() {
  const nav = useNavigation();
  const actionData = useActionData();
  const submit = useSubmit();
  const isLoading =
    ["loading", "submitting"].includes(nav.state) && nav.formMethod === "POST";
  const productId = actionData?.product?.id.replace(
    "gid://shopify/Product/",
    ""
  );

  useEffect(() => {
    if (productId) {
      shopify.toast.show("Product created");
    }
  }, [productId]);
  const generateProduct = () => submit({}, { replace: true, method: "POST" });


  return (
    <Page>
      <ui-title-bar title="VtNetzwelt WishList">
        <button variant="primary" onClick={generateProduct}>
          Generate a product
        </button>
      </ui-title-bar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Congrats on creating a new Shopify app 🎉
                  </Text>
                  <Text variant="bodyMd" as="p">
                    This embedded app template uses{" "}
                    <Link
                      url="https://shopify.dev/docs/apps/tools/app-bridge"
                      target="_blank"
                      removeUnderline
                    >
                      App Bridge
                    </Link>{" "}
                    interface examples like an{" "}
                    <Link url="/app/additional" removeUnderline>
                      additional page in the app nav
                    </Link>
                    , as well as an{" "}
                    <Link
                      url="https://shopify.dev/docs/api/admin-graphql"
                      target="_blank"
                      removeUnderline
                    >
                      Admin GraphQL
                    </Link>{" "}
                    mutation demo, to provide a starting point for app
                    development.
                  </Text>
                </BlockStack>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">
                    Get started with products
                  </Text>
                  <Text as="p" variant="bodyMd">
                    Generate a product with GraphQL and get the JSON output for
                    that product. Learn more about the{" "}
                    <Link
                      url="https://shopify.dev/docs/api/admin-graphql/latest/mutations/productCreate"
                      target="_blank"
                      removeUnderline
                    >
                      productCreate
                    </Link>{" "}
                    mutation in our API references.
                  </Text>
                </BlockStack>
                <InlineStack gap="300">
                  <Button loading={isLoading} onClick={generateProduct}>
                    Generate a product
                  </Button>
                  {actionData?.product && (
                    <Button
                      url={`shopify:admin/products/${productId}`}
                      target="_blank"
                      variant="plain"
                    >
                      View product
                    </Button>
                  )}
                </InlineStack>
                {actionData?.product && (
                  <Box
                    padding="400"
                    background="bg-surface-active"
                    borderWidth="025"
                    borderRadius="200"
                    borderColor="border"
                    overflowX="scroll"
                  >
                    <pre style={{ margin: 0 }}>
                      <code>{JSON.stringify(actionData.product, null, 2)}</code>
                    </pre>
                  </Box>
                )}
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    App template specs
                  </Text>
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Framework
                      </Text>
                      <Link
                        url="https://remix.run"
                        target="_blank"
                        removeUnderline
                      >
                        Remix
                      </Link>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Database
                      </Text>
                      <Link
                        url="https://www.prisma.io/"
                        target="_blank"
                        removeUnderline
                      >
                        Prisma
                      </Link>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Interface
                      </Text>
                      <span>
                        <Link
                          url="https://polaris.shopify.com"
                          target="_blank"
                          removeUnderline
                        >
                          Polaris
                        </Link>
                        {", "}
                        <Link
                          url="https://shopify.dev/docs/apps/tools/app-bridge"
                          target="_blank"
                          removeUnderline
                        >
                          App Bridge
                        </Link>
                      </span>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        API
                      </Text>
                      <Link
                        url="https://shopify.dev/docs/api/admin-graphql"
                        target="_blank"
                        removeUnderline
                      >
                        GraphQL API
                      </Link>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Next steps
                  </Text>
                  <List>
                    <List.Item>
                      Build an{" "}
                      <Link
                        url="https://shopify.dev/docs/apps/getting-started/build-app-example"
                        target="_blank"
                        removeUnderline
                      >
                        {" "}
                        example app
                      </Link>{" "}
                      to get started
                    </List.Item>
                    <List.Item>
                      Explore Shopify’s API with{" "}
                      <Link
                        url="https://shopify.dev/docs/apps/tools/graphiql-admin-api"
                        target="_blank"
                        removeUnderline
                      >
                        GraphiQL
                      </Link>
                    </List.Item>
                  </List>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
      <Card>
        <Text as="h2" variant="bodyMd">
          VtNetzwelt Wishlist
        </Text>
      </Card>
    </Page>
  );
}

export async function addShopDetails(shopData) {
  if(shopData?.data?.shop){
    const shopResponse = shopData?.data?.shop;
    const getShopData = await db.vTShop.findFirst({ where: { shopId: shopResponse.id } });
    if(getShopData == null){
      console.log(shopResponse)
      await prisma.vTShop.create({
        data: {
          host: shopResponse.primaryDomain.host,
          shopId: shopResponse.id,
          name: shopResponse.name,
          plan: shopResponse.plan.displayName,
          status: true,
          accessToken: 'abd'
        }
      });
      console.log("====Added in Shop====") 
    }
  }
}

export async function createCustomer() {
  console.log("++++++++++++++");
  const shopId = 1234567890;
  const customerId = 6465415741521;
  const shop = 'test.com';
  const productId = 123;
  const isRemove = false;
  let productArray = [productId];
  const productsAsString = productArray.join(',');
  const VTCustomer = await db.vTCustomer.findFirst({ where: { shopId: shopId } });
  if(VTCustomer == null){
    
    const newUser = await prisma.vTCustomer.create({
      data: {
        customerId: customerId,
        shopId: shopId,
        shop: shop,
      }
    });
    console.log("new user", newUser);

    const newProduct = await prisma.vTProducts.create({
      data: {
        shopId: shopId,
        productId: productId,
      }
    });
    console.log("new product", newProduct);

    const newWishlist = await prisma.vTWishlist.create({
      data: {
        customerId: customerId,
        collectionId: 1,
        products: productsAsString
      }
    });
    console.log("new wishlist", newWishlist);

    console.log("======Add==========")
  }else{
    const selectdata = await prisma.vTCustomer.findFirst({
      where: {
        customerId: customerId,
        shopId: shopId
      },
      select: {
        customerId: true
      }
    })

    const wishlistItem = await prisma.vTWishlist.findFirst({
      where: {
        customerId: selectdata.customerId,
      },
      select: {
        id: true,
        products: true
      }
    })
    const wishlistProducts = wishlistItem.products.split(',').map(item => item.trim());
    if(isRemove){
      const updatedProducts = wishlistProducts.filter((item) => item !== productId.toString());
      const wishlistItemUpdate = await prisma.vTWishlist.update({
        where: {
          id: wishlistItem.id,
        },
        data: {
          products: updatedProducts.join(',')
        }
      })
      
      console.log("======Remove item from wishlist==========")
    }else{
      wishlistProducts.push(productId.toString());
      const updatedProducts = wishlistProducts.join(',')
      
      const wishlistItemUpdate = await prisma.vTWishlist.update({
        where: {
          id: wishlistItem.id,
        },
        data: {
          products: updatedProducts
        }
      })
      console.log("======add item to wishlist==========")
    }    
    
  } 

};


const SHOP_QUERY = `#graphql
query {
  shop {
    name
    id
    plan {
      displayName
      partnerDevelopment
      shopifyPlus
    }
    primaryDomain {
      host
      id
    }
  }
}
`
