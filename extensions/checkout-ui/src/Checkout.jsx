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
import axios from "axios";
// 1. Choose an extension target
export default reactExtension("purchase.checkout.block.render", () => (
  <Extension />
));
//https://fakestoreapi.com/products
const fetchCustomData = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch(
      `https://centranage.myshopify.com/apps/proxy-1/getCheck?shop=centranage.myshopify.com`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Check if the response is HTML or JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      console.log("Data received:", data);
      return data;
    } else {
      const text = await response.text();
      console.error("Expected JSON, but got:", text);
      throw new Error("Unexpected response format");
    }
  } catch (error) {
    console.error("Failed to fetch custom data:", error);
  }
};

// const fetchCustomData = async () => {
//   try {
//     const response = await fetch(
//       `https://centranage.myshopify.com/apps/proxy-1/getCheck?shop=centranage.myshopify.com`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       }
//     );
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }
//     const data = await response.json();
//     console.log("Data received:", data);
//     return data;
//   } catch (error) {
//     console.error("Failed to fetch custom data:", error);
//     return null;
//   }
// };
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
    try {
      let response;
      fetch("https://api.ipify.org?format=json")
        .then((response) => {
          return response.json();
        })
        .then(async (res) => {
          console.log(" IP", res);
          response = await axios.get(
            `https://zeen-backend.vercel.app/api/user/getZeenPrefillData/${res.ip}`,
            {
              headers: {
                "Content-Type": "application/json",
                "api-key": "dj&3jlA*",
              },
            }
          );
          console.log("Data received:", response.data);
          // return response.data;
        })
        .catch((err) => console.error("Problem fetching my IP", err));
    } catch (error) {
      console.error("Failed to fetch custom dataaaa:", error.message);
    }
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
      <Button onPress={getData}>Button testing</Button>
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
