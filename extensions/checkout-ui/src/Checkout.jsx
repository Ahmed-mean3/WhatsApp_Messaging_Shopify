import {
  reactExtension,
  Banner,
  BlockStack,
  Checkbox,
  Text,
  useApi,
  useApplyAttributeChange,
  useInstructions,
  useTranslate,
  useShippingAddress,
} from "@shopify/ui-extensions-react/checkout";
import { Button } from "@shopify/ui-extensions/checkout";
import { useEffect } from "react";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));

const fetchCustomData = async () => {
  try {
    const response = await fetch("/api/get-user_data");
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch custom data:", error);
    return null;
  }
};

function Extension() {
  const translate = useTranslate();
  const { extension } = useApi();
  const instructions = useInstructions();
  const applyAttributeChange = useApplyAttributeChange();
  // 2. Check instructions for feature availability, see https://shopify.dev/docs/api/checkout-ui-extensions/apis/cart-instructions for details
  if (!instructions.attributes.canUpdateAttributes) {
    // For checkouts such as draft order invoices, cart attributes may not be allowed
    // Consider rendering a fallback UI or nothing at all, if the feature is unavailable
    return (
      <Banner title="checkout-ui" status="warning">
        {translate("attributeChangesAreNotSupported")}
      </Banner>
    );
  }
  const getData = async () => {
    const data = await fetchCustomData();
    console.log("isData->>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>", data);
  };
  // useEffect(() => {
  //   getData();
  // }, []);
  // 3. Render a U
  return (
    <BlockStack border={"dotted"} padding={"tight"}>
      <Banner title="checkout-ui">heello</Banner>
      <BlockStack>
        <Text size="large">shopify dj</Text>
        <Text size="small">Description</Text>
      </BlockStack>
      <Checkbox onChange={onCheckboxChange}>
        {translate("iWouldLikeAFreeGiftWithMyOrder")}
      </Checkbox>
      <Button
        onPress={() => {
          console.log("button was pressed");
          getData();
        }}
      >
        Button testing api hit
      </Button>
    </BlockStack>
  );

  async function onCheckboxChange(isChecked) {
    // 4. Call the API to modify checkout
    const result = await applyAttributeChange({
      key: "requestedFreeGift",
      type: "updateAttribute",
      value: isChecked ? "yes" : "no",
    });
    console.log("applyAttributeChange result", result);
  }
}
