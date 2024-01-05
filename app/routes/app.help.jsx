import React from 'react';
import { Page, Layout, Card, Text, Link } from '@shopify/polaris';

const HelpPage = () => {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Card title="Help and Support" sectioned>
            <Text>
              Welcome to our help and support page! If you have any questions or issues,
              please check the resources below or contact us.
            </Text>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Helpful Resources" sectioned>
            <ul>
              <li>
                <Link url="https://help.shopify.com/">Help Center</Link>
              </li>
              <li>
                <Link url="https://community.shopify.com/">Community Forums</Link>
              </li>
            </ul>
          </Card>
        </Layout.Section>
        <Layout.Section>
          <Card title="Contact Us" sectioned>
            <Text>
              If you need further assistance, please reach out to our support team at{' '}
              <Link url="mailto:vt@example.com">vt@example.com</Link>.
            </Text>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default HelpPage;
