document.body.addEventListener("click", async (event) => {
  const targetElement = event.target;

  if (targetElement.closest('[wized="checkout_button"]')) {
    const storedProducts = JSON.parse(
      localStorage.getItem(window.LOCAL_STORAGE_KEY) || "[]",
    );

    const lineItems = storedProducts.map((product) => {
      return {
        price_id: product.stripe_price_id,
        quantity: product.quantity,
      };
    });

    // Check if any item in storedProducts has mode === 'subscription'
    const hasSubscription = storedProducts.some(
      (product) => product.mode === "subscription",
    );
    let checkoutMode = hasSubscription ? "subscription" : "payment";

    // Set the Wized variable
    Wized.data.v.checkoutItems = lineItems;
    Wized.data.v.checkoutMode = checkoutMode;

    // Get Auth User To Prefill Customer Data If Logged In
    await Wized.requests.execute("get_session");
    await Wized.requests.execute("get_auth_user");

    // Execute the Wized request
    await Wized.requests.execute("create_stripe_otc_checkout_session");

    // Get the checkout URL
    const checkoutURL =
      Wized.data.r.create_stripe_otc_checkout_session.data.session_url;

    // Redirect the user to the checkout URL
    if (checkoutURL) {
      window.location.href = checkoutURL;
    } else {
      console.error("Failed to retrieve checkout URL");
    }
  }
});
