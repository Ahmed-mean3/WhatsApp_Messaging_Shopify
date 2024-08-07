import {
  reactExtension,
  Banner,
  useApi,
  useSubscription,
  Text,
} from "@shopify/ui-extensions-react/checkout";
import { BlockStack } from "@shopify/ui-extensions/checkout";

export default reactExtension("purchase.thank-you.block.render", () => (
  <Extension />
));

function Extension() {
  const { orderConfirmation } = useApi();
  const { id } = useSubscription(orderConfirmation);

  if (id) {
    return (
      <BlockStack>
        <Banner>
          Please include your order confirmation ID ({id}) in support requests
        </Banner>
        <BlockStack>
          <Text size="large">shopify dj</Text>
          <Text size="small">Description</Text>
        </BlockStack>
      </BlockStack>
    );
  }

  return null;
}
