document.body.addEventListener("click", async (event) => {
    const targetElement = event.target;
  
    if (targetElement.closest('[wized="checkout_button"]')) {
      const storedProducts = JSON.parse(
        localStorage.getItem(window.LOCAL_STORAGE_KEY) || "[]"
      );

      
  
      const lineItems = storedProducts.map((product) => {
        return {
          variantId: product.productVariantId,
          quantity: product.quantity,
          sellingPlanId: product.sellingPlanId
        };
      });
  
      // Convert to the GraphQL format
      const formattedLineItems = lineItems
        .map(
          (item) => item.sellingPlanId ? `{merchandiseId: "${item.variantId}", quantity: ${item.quantity}, sellingPlanId: "${item.sellingPlanId}"}` : `{merchandiseId: "${item.variantId}", quantity: ${item.quantity}}`
        )
        .join(", ");
  
      // Set the Wized variable
      Wized.data.v.checkoutItems = `[${formattedLineItems}]`;
  
      // Execute the Wized request
      await Wized.requests.execute("create_shopify_otc_checkout");
  
      // Get the checkout URL
      const checkoutURL = Wized.data.r.create_shopify_otc_checkout.data.data.cartCreate.cart.checkoutUrl;
  
      // Redirect the user to the checkout URL
      if (checkoutURL) {
        window.location.href = checkoutURL;
      } else {
        console.error("Failed to retrieve checkout URL");
      }
    }
  });