// custom-script.js

document.addEventListener("DOMContentLoaded", async function () {
  // Check if Shopify checkout data is available
  if (window.Shopify && Shopify.checkout && Shopify.checkout.order_id) {
    // Perform your custom API call
    try {
      fetch("https://api.ipify.org?format=json")
        .then((response) => {
          return response.json();
        })
        .then(async (res) => {
          console.log(" IP", res);
          // ip address res.ip
          const response = await fetch(
            "https://zeen-backend.vercel.app/api/user/deleteZeenPrefillData/202.47.48.97",
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
                "api-key": "dj&3jlA*",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          console.log("Data deleted:", data);
          // return response.data;
        })
        .catch((err) => console.error("Problem fetching my IP", err));
    } catch (error) {
      console.error("Error deleting data:", error);
    }
  }
});
