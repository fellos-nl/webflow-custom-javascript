(function () {
    window.Wized = window.Wized || []; 
    window.Wized.push((Wized) => {
  
        // Function to update the shipping bar based on the subtotal
        const updateShippingBar = () => {
        const subtotal = parseFloat(calculateSubtotalPrice());
        const progressPercentage = Math.min((subtotal / 100) * 100, 100);
        const shippingBarProgress = document.querySelector(
            ".shipping-progress-bar"
        );
        const remainingAmount = document.querySelector(
            ".free-shipping-text.remaining-amount"
        );
        const defaultText = document.querySelector(".shipping-text");
        const successText = document.querySelector(".shipping-text.hide");
        // Update the width of the progress bar.
        shippingBarProgress.style.width = `${progressPercentage}%`;
        // Update remaining amount and decide which text to display.
        if (subtotal >= 100) {
            defaultText.style.display = "none";
            successText.style.display = "flex";
        } else {
            const amountRemaining = (100 - subtotal).toFixed(2);
            remainingAmount.textContent = `£${amountRemaining}`;
            defaultText.style.display = "flex";
            successText.style.display = "none";
        }
        };
    
        // Define local storage key for products in cart
        window.LOCAL_STORAGE_KEY = "wized_products_in_cart";
        const TIMESTAMP_KEY = "wized_cart_timestamp";
    
        // Function to update the cart empty status
        const updateCartEmptyStatus = async () => {
        const storedProducts = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
        );
        const isEmpty = storedProducts.length === 0;
        Wized.data.v.cartEmpty = isEmpty;
        };
    
        // Function to store product details in local storage
        const storeProductInLocalStorage = (productDetails) => {
        const products = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
        );
        const existingProduct = products.find(
            (product) => product.id === productDetails.id
        );
        if (existingProduct) {
            existingProduct.quantity = productDetails.quantity;
        } else {
            products.push(productDetails);
        }
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
        localStorage.setItem(TIMESTAMP_KEY, Date.now().toString());
        };

        // Function to remove product from local storage
        const removeProductFromLocalStorage = (productId) => {
        let products = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
        products = products.filter((product) => product.id !== productId);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
        };

        const updateProductQuantityInLocalStorage = (productId, newQuantity) => {
        const products = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
        );
        const productToUpdate = products.find(
            (product) => product.id === productId
        );
        if (productToUpdate) {
            productToUpdate.quantity = newQuantity;
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(products));
        }
        };

        const getQuantityFromLocalStorage = (productId) => {
        const products = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
        );
        const product = products.find((product) => product.id === productId);
        return product ? product.quantity : 1;
        };

        const updateQuantityInputForProduct = (productId) => {
        const inputElement = document.querySelector(
            `[wized="cart_item"][data-attribute-id="${productId}"] [wized="cart_item_quantity"]`
        );
        if (inputElement) {
            const quantity = getQuantityFromLocalStorage(productId);
            inputElement.value = quantity;
        } else {
            console.error(`No input element found for product ID: ${productId}`);
        }
        };

        const calculateTotalQuantity = () => {
        const products = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
        );
        return products.reduce((total, product) => total + product.quantity, 0);
        };

        const calculateSubtotalPrice = () => {
        const products = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
        );
        return products
            .reduce((total, product) => {
            const priceValue = parseFloat(product.price.replace("€", ""));
            return total + priceValue * product.quantity;
            }, 0)
            .toFixed(2);
        };

        const updateDisplayedTotals = () => {
        const totalQuantityElem = document.querySelector(
            '[wized="item_quantity_total"]'
        );
        const subtotalPriceElem = document.querySelector(
            '[wized="subtotal_price"]'
        );
        totalQuantityElem.textContent = calculateTotalQuantity();
        subtotalPriceElem.textContent = `€${calculateSubtotalPrice()}`;
        };

        const MAX_RETRIES = 10;
        const RETRY_INTERVAL = 1000;

        const pollForCartItems = async (storedProducts) => {
        let retryCount = 0;
        const pollInterval = setInterval(() => {
            const storedProductIds = storedProducts.map((product) => product.id);
            const foundAllItems = storedProductIds.every((productId) => {
            const inputElement = document.querySelector(
                `[wized="cart_item"][data-attribute-id="${productId}"] [wized="cart_item_quantity"]`
            );
            return inputElement !== null;
            });
            if (foundAllItems || retryCount >= MAX_RETRIES) {
            clearInterval(pollInterval);
            if (foundAllItems) {
                storedProductIds.forEach(updateQuantityInputForProduct);
                updateDisplayedTotals();
            }
            } else {
            retryCount++;
            }
        }, RETRY_INTERVAL);
        };

        const updateCartAndPollItems = async () => {
        const storedProducts = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
        );
        await updateCartIds(); // Get the product IDs
        await Wized.requests.execute("fetch_cart_items"); // Fetch cart items
        await pollForCartItems(storedProducts); // Poll for cart items
        await updateCartEmptyStatus();
        };

        const handleCurrentProductDetailsUpdate = async () => {
        const currentProductDetails = Wized.data.v.currentProductDetails;
        const storedProducts = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
        );
        const existingProduct = storedProducts.find(
            (product) => product.id === currentProductDetails.id
        );
        // If the product already exists in the cart, we bypass the logic to add it again.
        if (existingProduct) return;
        if (currentProductDetails && currentProductDetails.id) {
            storeProductInLocalStorage({
            ...currentProductDetails,
            quantity: 1
            });
            await updateCartAndPollItems();
            updateQuantityInputForProduct(currentProductDetails.id);
            // Update the displayed totals and shipping bar
            updateDisplayedTotals();
            updateShippingBar();
        }
        };

        // Listener for the custom event setup in Wized
        document.addEventListener('currentProductDetailsChanged', async () => {
            await handleCurrentProductDetailsUpdate();
        });

        const updateCartIds = async () => {
        const storedProducts = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
        );
        const cartIds = storedProducts.map((product) => product.id);
        Wized.data.cartIds = JSON.stringify(cartIds);
        };

        document.addEventListener("DOMContentLoaded", async () => {
        const timestamp = localStorage.getItem(TIMESTAMP_KEY);
        const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
        if (timestamp && Date.now() - timestamp > SEVEN_DAYS) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            localStorage.removeItem(TIMESTAMP_KEY);
        }
        await updateCartAndPollItems();
        const storedProducts = JSON.parse(
            localStorage.getItem(LOCAL_STORAGE_KEY) || "[]"
        );
        setTimeout(() => {
            storedProducts.forEach((product) => {
            updateQuantityInputForProduct(product.id);
            });
            updateDisplayedTotals();
        }, 1000);
        const subtotalElement = document.querySelector('[wized="subtotal_price"]');
        if (storedProducts.length === 0 && subtotalElement) {
            subtotalElement.textContent = "€0.00";
        }
        updateShippingBar();
        });

        document.body.addEventListener("click", async (event) => {
        const targetElement = event.target;
        const productDiv = targetElement.closest('[wized="cart_item"]');
    
        if (!productDiv) return;
    
        const inputElement = productDiv.querySelector(
            '[wized="cart_item_quantity"]'
        );
        const productId = productDiv.getAttribute("data-attribute-id");
    
        if (targetElement.closest('[wized="cart_decreament"]')) {
            let currentQuantity = parseInt(inputElement.value, 10) || 0;
            if (currentQuantity > 1) {
            inputElement.value = currentQuantity - 1;
            updateProductQuantityInLocalStorage(productId, currentQuantity - 1);
            }
        } else if (targetElement.closest('[wized="cart_increament"]')) {
            let currentQuantity = parseInt(inputElement.value, 10);
            inputElement.value = currentQuantity + 1;
            updateProductQuantityInLocalStorage(productId, currentQuantity + 1);
        } else if (targetElement.closest('[wized="cart_remove_item"]')) {
            removeProductFromLocalStorage(productId);
            await updateCartIds();
            // Here, we execute the fetch after updating the cartIds
            await Wized.requests.execute("fetch_cart_items");
        }
    
        await pollForCartItems(
            JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]")
        );
        updateDisplayedTotals();
        updateShippingBar();
        await updateCartEmptyStatus();
        });

        // Function to handle manual quantity update
        const handleManualQuantityUpdate = async (inputElement, productId) => {
        const newQuantity = parseInt(inputElement.value, 10);
    
        if (isNaN(newQuantity) || newQuantity < 1) {
            // Reset to the previous quantity if the input is not valid.
            inputElement.value = getQuantityFromLocalStorage(productId);
            return;
        }
    
        updateProductQuantityInLocalStorage(productId, newQuantity);
        updateDisplayedTotals();
        updateShippingBar();
        await updateCartEmptyStatus();
        };
    
        // Event listener for input events to handle manual quantity updates
        document.body.addEventListener("input", (event) => {
        const inputElement = event.target;
        if (inputElement.matches('[wized="cart_item_quantity"]')) {
            const productDiv = inputElement.closest('[wized="cart_item"]');
            if (!productDiv) return;
    
            const productId = productDiv.getAttribute("data-attribute-id");
            handleManualQuantityUpdate(inputElement, productId);
        }
        });

        // Listen for updates to the current product details and call updateCartAndPollItems function
        document.addEventListener('currentProductDetailsChanged', async () => {
            await updateCartAndPollItems();
        });
    }); 
})();