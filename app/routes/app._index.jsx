import { React, useState,useCallback } from "react";
import { redirect } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { defer } from "@remix-run/node";
import {
  Page,
  Button,
  Text,
  Card,
  Layout,
  BlockStack,
  Form,
  Divider,
  List,
  InlineGrid,
  Tabs,
  Icon,
  Select,
  DataTable,
} from "@shopify/polaris";
import {
  ComposeMajor
} from '@shopify/polaris-icons';
import { authenticate } from "../shopify.server";
import db from "../db.server";


export const loader = async ({ request }) => {

 const { admin, session } = await authenticate.admin(request);

 const themes = await admin.rest.resources.Theme.all({
  session: session,
});

 //console.log("auth test",admin); 
 const response = await admin.graphql(
   `#graphql
    query {
      shop {
        name
        url
        id
        plan {
          displayName
        }
        primaryDomain {
          host
          id
        }
      }
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
   `,
 );
  
 const shopData = await response.json();

// const createToken = await admin.graphql(
//   `#graphql
//     mutation storefrontAccessTokenCreate {
//       storefrontAccessTokenCreate(input: {title: "VT-Wishlist"}) {
//         storefrontAccessToken {
//           accessToken
//         }
//         userErrors {
//           field
//           message
//         }
//       }
//     }
//   `,
// );
  
  //console.log("shopData ", shopData)
  addShopDetails(shopData);
  
  
  const { activeSubscriptions } = shopData.data.app.installation;
  return defer({activeSubscriptions,shopData,themes}); 
};

export default function Index() {
  const data = useLoaderData();
  const shopDetails = data.shopData.data.shop;
  const availableThemes = data.themes.data;
  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  );

  const [theme, setTheme] = useState(163535814974);
  const handleSelectChange = (val) => {
    setTheme(val);
  };

  let themeOptions = [];
  let activeThemeId = null;
  availableThemes.forEach((element) => {
    themeOptions.push(
      {
        label: element.name,
        value: element.id.toString()
      }
    );
    if(element.role == 'main' || element.role == 'published'){
      activeThemeId = element.id;
    }
  });
  const editorUrl = `${shopDetails.url}/admin/themes/${activeThemeId}/editor?context=apps`;
  const tabs = [
    {
      id: 'app-status',
      content: 'App status',
    },
    {
      id: 'theme-config',
      content: 'Theme integration',
    },
  ];

  const rows = [
    ['Emerald Silk Gown', 124689, 140],
    ['Mauve Cashmere Scarf', 124533, 83],
    [
      'Navy Merino Wool Blazer with khaki chinos and yellow belt',
      124518,
      32
    ],
  ];

  return (
    <>
    {data.activeSubscriptions.length < 1 ? (
      <Page>
      <InlineGrid columns={2} gap={800}>
      <Card>
              <form method="post">
                <Text as="h1" variant="headingMd" alignment="center">🌟 Unlock Features with Monthly Subscription! 🌟</Text><br />
                <p>Upgrade your experience with Wishlist by subscribing to our Monthly Plan! Enjoy exclusive benefits, advanced features, and a seamless user journey for just $7 per month.</p><br />
                <Text as="h2" variant="headingMd"> ✨ What You Get: </Text><br />
                <List type="bullet">
                  <List.Item><p><strong>Premium Features:</strong> Access powerful tools and functionalities that take your Wishlist experience to the next level.</p></List.Item>
                  <List.Item><p><strong>Unlimited Usage:</strong> Enjoy unrestricted access and make the most out of Wishlist without any limitations.</p></List.Item>
                  <List.Item><p><strong>Priority Support:</strong> Our dedicated support team is here for you 24/7. Get priority assistance whenever you need help.</p></List.Item>
                  <List.Item><p><strong>Regular Updates:</strong> Stay ahead with the latest features and improvements. We're constantly innovating to enhance your experience.</p></List.Item>
                </List>
                <br/>
                <button submit size="large" variant="primary" fullWidth="true" name="_action" value="monthly" textAlign="center">Start Monthly Subscription</button>
              </form>
          </Card>
          <Card>
              <form method="post" >
                <Text as="h1" variant="headingMd" alignment="center">🎉 Maximize Your Experience with Annual Subscription! 🎉</Text><br />
                <p>Supercharge your Wishlist journey by opting for our Annual Plan! Subscribe for a full year and unlock a world of exclusive features, savings, and seamless usability for only $50.</p><br />
                <Text as="h2" variant="headingMd"> ✨ What You Get: </Text><br />
                <List type="bullet">
                  <List.Item><p><strong>Premium Features:</strong> Access powerful tools and functionalities that take your Wishlist experience to the next level.</p></List.Item>
                  <List.Item><p><strong>Unlimited Usage:</strong> Enjoy unrestricted access and make the most out of Wishlist without any limitations.</p></List.Item>
                  <List.Item><p><strong>Priority Support:</strong> Our dedicated support team is here for you 24/7. Get priority assistance whenever you need help.</p></List.Item>
                  <List.Item><p><strong>Regular Updates:</strong> Stay ahead with the latest features and improvements. We're constantly innovating to enhance your experience.</p></List.Item>
                </List>
                <br/>
                <button type="submit" size="large" variant="primary" fullWidth="true" name="_action" value="annual" textAlign="center">Start Annual Subscription</button>
              </form>
          </Card>
      </InlineGrid>
    </Page>
    ) : 
    <Page>
        <Text as="h2" variant="headingMd" alignment="left" tone="--p-color-bg-fill-emphasis-active">
            Welcome, {shopDetails.name}
        </Text>
        <span>It's so good to see you here!</span> <br /><br /><br />
        <Layout>
          <Layout.Section>
            <Card padding={400}>
            <Text variant="headingMd" as="h2">App setup and activation</Text>
            <Divider borderColor="border-inverse" /> <br />
              <BlockStack>
                <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} fitted>
                  { tabs[selected].id == 'app-status' ? (
                    <Card>
                      <Text as="h2" variant="headingMd">You’re off to a great start</Text>
                      <br />
                      <Text as="h3" variant="headingSm">App status</Text>
                      <Text as="p">Right now this app is <strong>disabled</strong>.</Text> 
                      <br />
                      <div id="toggle-container">
                        <Button id="toggle-button" variant="primary" onClick={toggleLabel}>Enable now</Button>
                      </div>
                      {/* <Button variant="primary">Enable now</Button> */}
                      <br />
                      <br />
                      <Text as="h3" variant="headingSm">Add Wishlist block</Text>
                      <Text as="p">Add Wishlist button to Online Store 2.0 theme.</Text> 
                      <br />
                      <Button variant="secondary" size="large" onClick={() => { window.open(editorUrl, "_blank") }}>Theme editor
                        <Icon
                          source={ComposeMajor}
                          tone="base"
                        />
                      </Button>
                    </Card>
                  ) : 
                  <Card>
                    <Text as="h3">Select the theme you wish to embed the app on.</Text>
                    <br />
                    <Select
                      id="theme_name"
                      label="Select theme"
                      options={themeOptions}
                      onChange={handleSelectChange}
                      value={theme}
                      labelInline
                    />
                    <br />
                    <Button variant="primary">Add</Button>
                  </Card>
                  }
                  
                </Tabs>
              </BlockStack>
            </Card>
            <br />
            <Card padding={400}>
            <Text variant="headingMd" as="h2">Top 10 items in public wishlists</Text>
            <Divider borderColor="border-inverse" /> <br />
            <DataTable
              columnContentTypes={[
                'text',
                'numeric',
                'numeric',
              ]}
              headings={[
                'Product',
                'Inventory',
                'Users have added',
              ]}
              rows={rows}
            />
            </Card>
          </Layout.Section>
        </Layout>
        
    </Page>
  }
    
    </>
    
  );
}

export async function addShopDetails(shopData) {
  if(shopData?.data?.shop){
    const shopResponse = shopData?.data?.shop;
    const getShopData = await db.vTShop.findFirst({ where: { shopId: shopResponse.id } });
    if(getShopData == null){
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
    }
  }
}

function toggleLabel() {
  var button = document.getElementById("toggle-button");

  if (button.innerHTML === "Enable now") {
    button.innerHTML = "Disable now";
  } else {
    button.innerHTML = "Enable now";
  }
}