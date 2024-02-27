document.addEventListener("DOMContentLoaded", () => {
  const variants = {
    // Key format: "Geneesmiddel-Strength-Quantity"
    "Sildenafil-50mg-4-tabletten": {
      variantId: "47695236923696",
      basePrice: 29.99,
    },
    "Sildenafil-50mg-8-tabletten": {
      variantId: "47695236956464",
      basePrice: 54.99,
    },
    "Sildenafil-100mg-4-tabletten": {
      variantId: "47695236989232",
      basePrice: 34.99,
    },
    "Sildenafil-100mg-8-tabletten": {
      variantId: "47695237022000",
      basePrice: 64.99,
    },

    "Tadalafil-10mg-4-tabletten": {
      variantId: "47695262253360",
      basePrice: 34.99,
    },
    "Tadalafil-10mg-8-tabletten": {
      variantId: "47695262286128",
      basePrice: 64.99,
    },
    "Tadalafil-20mg-4-tabletten": {
      variantId: "47695262318896",
      basePrice: 34.99,
    },
    "Tadalafil-20mg-8-tabletten": {
      variantId: "47695262351664",
      basePrice: 64.99,
    },

    "Viagra®-50mg-4-tabletten": {
      variantId: "47695296102704",
      basePrice: 44.99,
    },
    "Viagra®-50mg-8-tabletten": {
      variantId: "47695296135472",
      basePrice: 84.99,
    },
    "Viagra®-100mg-4-tabletten": {
      variantId: "47695296201008",
      basePrice: 49.99,
    },
    "Viagra®-100mg-8-tabletten": {
      variantId: "47695296233776",
      basePrice: 94.99,
    },

    "Cialis®-10mg-4-tabletten": {
      variantId: "47716640260400",
      basePrice: 44.99,
    },
    "Cialis®-10mg-8-tabletten": {
      variantId: "47716640293168",
      basePrice: 84.99,
    },
    "Cialis®-20mg-4-tabletten": {
      variantId: "47716640325936",
      basePrice: 49.99,
    },
    "Cialis®-20mg-8-tabletten": {
      variantId: "47716640358704",
      basePrice: 94.99,
    },
    // Add all other combinations
  };

  const sellingPlans = {
    eenmalig: { sellingPlanId: "eenmalig", priceModifier: 1.0 },
    "elke-maand": { sellingPlanId: "690456723760", priceModifier: 1.0 },
    "elke-2-maanden": { sellingPlanId: "690456756528", priceModifier: 1.0 },
    "elke-3-maanden": { sellingPlanId: "690456789296", priceModifier: 1.0 },
  };

  // List of keys to clear from localStorage
  const keysToClear = ["levering", "aantal", "sterkte", "variant"];

  // Loop through each key and remove it
  keysToClear.forEach((key) => {
    localStorage.removeItem(key);
  });

  // Auto-click on element with ID "Sildenafil"
  document.getElementById("Sildenafil").click();

  // Directly update the UI based on "Sildenafil" selection
  // This ensures that the UI is correctly initialized based on this default selection
  updateSelection("Sildenafil");

  // Simplify radio button logic with event delegation
  document.addEventListener("change", (event) => {
    if (event.target.matches('.treatment-radio-group input[type="radio"]')) {
      updateRadioSelection(event.target);
    } else if (event.target.matches('input[name="geneesmiddel"]')) {
      updateSelection(event.target.value);
    }
  });

  function updateRadioSelection(radioButton) {
    const categoryContainer = radioButton.closest(".treatment-radio-group");
    const labelsInSameCategory = categoryContainer.querySelectorAll(
      ".treatment-radio-field",
    );

    labelsInSameCategory.forEach((label) =>
      label.classList.remove("is-active"),
    );

    if (radioButton.checked) {
      radioButton.closest(".treatment-radio-field").classList.add("is-active");
    }
  }

  function updateSelection(product) {
    updatePriceAndShopifyInputs();
    const productInfo = getProductInfo(product);
    updateDisplayedFields(productInfo.newValues);
    Object.keys(productInfo.newOptions).forEach((category) => {
      const selectedOption = getUserSelection(
        category,
        productInfo.newValues[category],
      );
      updateModalOptions(category, productInfo.newOptions, selectedOption);
    });
  }

  function getProductInfo(product) {
    const info = {
      Sildenafil: {
        newValues: {
          variant: "Generiek",
          sterkte: "50mg",
          aantal: "4 tabletten",
          levering: "elke maand",
        },
        newOptions: {
          variant: ["Generiek", "Viagra®"],
          sterkte: ["50mg", "100mg"],
          aantal: ["4 tabletten", "8 tabletten"],
          levering: [
            "elke maand",
            "elke 2 maanden",
            "elke 3 maanden",
            "eenmalig",
          ],
        },
      },
      Tadalafil: {
        newValues: {
          variant: "Generiek",
          sterkte: "20mg",
          aantal: "4 tabletten",
          levering: "elke maand",
        },
        newOptions: {
          variant: ["Generiek", "Cialis®"],
          sterkte: ["10mg", "20mg"],
          aantal: ["4 tabletten", "8 tabletten"],
          levering: [
            "elke maand",
            "elke 2 maanden",
            "elke 3 maanden",
            "eenmalig",
          ],
        },
      },
    };
    return info[product] || {};
  }

  function updateDisplayedFields(fields) {
    Object.keys(fields).forEach((field) => {
      document.getElementById(`${field}Display`).innerText = fields[field];
    });
  }

  function updateModalOptions(category, options, selectedOption) {
    const container = document.getElementById(`options-${category}`);
    container.innerHTML = ""; // Clear existing options
    options[category].forEach((option) =>
      createOptionElement(container, option, selectedOption, category),
    );
  }

  function createOptionElement(container, option, selectedOption, category) {
    const label = document.createElement("label");
    label.className = "treatment-radio-field w-radio";
    label.innerHTML = `
      <div class="w-form-formradioinput w-form-formradioinput--inputType-custom treatment-radio-button w-radio-input"></div>
      <input type="radio" name="Radio-${category}" id="Radio-${option.replace(/\s+/g, "-")}" value="${option}" style="opacity: 0; position: absolute; z-index: -1" ${option === selectedOption ? "checked" : ""}>
      <span class="fs-radio_label-4 w-form-label" for="Radio-${option.replace(/\s+/g, "-")}">${option}</span>
    `;
    if (option === selectedOption) label.classList.add("is-active");
    container.appendChild(label);
  }

  function getUserSelection(category, defaultValue) {
    return localStorage.getItem(category) || defaultValue;
  }

  // Form submission handling generalized for all categories
  ["variant", "sterkte", "aantal", "levering"].forEach((category) => {
    document
      .getElementById(`button-${category}`)
      .addEventListener("click", (event) => {
        event.preventDefault();
        const selectedOption = document.querySelector(
          `input[name="Radio-${category}"]:checked`,
        ).value;
        updateDisplayAndStoreSelection(category, selectedOption);
        updatePriceAndShopifyInputs();
        closeModal(category);
        return false;
      });
  });

  function updateDisplayAndStoreSelection(category, selectedOption) {
    // Update displayed text
    document.getElementById(`${category}Display`).innerText = selectedOption;

    // Update hidden input value
    document.getElementById(`${category}Input`).value =
      mapSelectionToInputValue(category, selectedOption);

    // Store the selection in localStorage
    localStorage.setItem(category, selectedOption);
  }

  function mapSelectionToInputValue(category, selection) {
    // You can expand this function to properly map the displayed selection to the value you want to store in the hidden input.
    // For example, if you need to map "4 tabletten" to "4-tabletten" or similar.
    switch (category) {
      case "variant":
      case "sterkte":
        // Assuming these do not need mapping
        return selection;
      case "aantal":
        // Example mapping for "aantal"
        return selection.replace(/\s+/g, "-").toLowerCase();
      case "levering":
        // Example mapping for "levering"
        return selection.replace(/\s+/g, "-").toLowerCase();
      default:
        return selection;
    }
  }

  function closeModal(category) {
    const modal = document.querySelector(`.popup_form-treatment-${category}`);
    if (modal) modal.style.display = "none";
  }

  // Initialize display with stored selections
  ["variant", "sterkte", "aantal", "levering"].forEach((category) => {
    const storedValue = localStorage.getItem(category);
    if (storedValue) {
      updateDisplayAndStoreSelection(category, storedValue);
    }
  });

  function resetOptionsBasedOnGeneesmiddel(selectedGeneesmiddel) {
    // Define default options for both Sildenafil and Tadalafil
    const defaultOptions = {
      Sildenafil: {
        variant: "Generiek",
        sterkte: "50mg",
        aantal: "4 tabletten",
        levering: "elke maand",
      },
      Tadalafil: {
        variant: "Generiek",
        sterkte: "20mg",
        aantal: "4 tabletten",
        levering: "elke maand",
      },
    };

    // Get the default options for the selected geneesmiddel
    const selectedDefaults = defaultOptions[selectedGeneesmiddel];

    // Loop through each category and reset its options and UI based on the selected geneesmiddel
    ["variant", "sterkte", "aantal", "levering"].forEach((category) => {
      // Reset the stored value to the default for this category
      localStorage.setItem(category, selectedDefaults[category]);

      // Update the UI to reflect the default option for the selected geneesmiddel
      updateDisplayAndStoreSelection(category, selectedDefaults[category]);

      // Find and reset the 'is-active' class for the default option within each category
      const categoryContainer = document.querySelector(`#options-${category}`);
      if (categoryContainer) {
        const labels = categoryContainer.querySelectorAll(
          ".treatment-radio-field",
        );
        labels.forEach((label) => label.classList.remove("is-active")); // Clear all first

        // Find the label that matches the default option and add 'is-active'
        const defaultOptionElement = categoryContainer.querySelector(
          `input[value="${selectedDefaults[category]}"]`,
        );
        if (defaultOptionElement) {
          defaultOptionElement
            .closest(".treatment-radio-field")
            .classList.add("is-active");
        }
      }
    });
  }

  // Example of listening for changes to "geneesmiddel" and resetting options based on selection
  document
    .querySelectorAll('input[name="geneesmiddel"]')
    .forEach((geneesmiddelRadioButton) => {
      geneesmiddelRadioButton.addEventListener("change", () => {
        const selectedGeneesmiddel = document.querySelector(
          'input[name="geneesmiddel"]:checked',
        ).value;
        resetOptionsBasedOnGeneesmiddel(selectedGeneesmiddel); // Call the reset function with the selected geneesmiddel
      });
    });

  function getKey(geneesmiddel, strength, quantity) {
    return `${geneesmiddel}-${strength}-${quantity}`;
  }

  function updatePriceAndShopifyInputs() {
    const selectedGeneesmiddel = getSelectedOptionValue("geneesmiddel");
    const selectedStrength = getSelectedOptionValue("sterkte");
    const selectedQuantity = getSelectedOptionValue("aantal");
    const selectedDelivery = getSelectedOptionValue("levering");

    const variantKey = getKey(
      selectedGeneesmiddel,
      selectedStrength,
      selectedQuantity,
    );
    const variant = variants[variantKey];
    const plan = sellingPlans[selectedDelivery];

    // Update the frequency text based on the selling plan
    let frequencyText = "";
    switch (selectedDelivery) {
      case "elke-maand":
        frequencyText = "per maand";
        break;
      case "elke-2-maanden":
        frequencyText = "elke 2 maanden";
        break;
      case "elke-3-maanden":
        frequencyText = "elke 3 maanden";
        break;
      case "eenmalig":
      default:
        frequencyText = "eenmalig";
        break;
    }

    if (variant && plan) {
      // Calculate price based on selling plan
      const finalPrice = variant.basePrice * plan.priceModifier;

      // Update UI
      document.querySelector(".treatment-price").textContent =
        `€${finalPrice.toFixed(2)} ${frequencyText}`;
      document.getElementById("shopifyVariantId").value = variant.variantId;
      document.getElementById("shopifySellingPlanId").value =
        plan.sellingPlanId || "";
    }
  }

  // Example utility function to get selected option value
  function getSelectedOptionValue(category) {
    let value;

    if (category === "geneesmiddel") {
      // Get selected geneesmiddel
      const geneesmiddel = document.querySelector(
        'input[name="geneesmiddel"]:checked',
      ).value;
      // Get selected variant
      const variant = document.getElementById("variantInput").value;

      // Construct the product name based on geneesmiddel and variant
      if (geneesmiddel === "Sildenafil" && variant === "Generiek") {
        value = "Sildenafil";
      } else if (geneesmiddel === "Sildenafil" && variant === "Viagra®") {
        value = "Viagra®";
      } else if (geneesmiddel === "Tadalafil" && variant === "Generiek") {
        value = "Tadalafil";
      } else if (geneesmiddel === "Tadalafil" && variant === "Cialis®") {
        value = "Cialis®";
      }
    } else {
      // For sterkte, aantal, and levering, use the value from hidden inputs
      value = document.getElementById(`${category}Input`).value;
    }

    return value;
  }
});
