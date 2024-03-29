document.addEventListener("DOMContentLoaded", function () {
  const formSections = document.querySelectorAll(".form-section");

  formSections.forEach((section, index) => {
    section.setAttribute("data-question-index", index);
    attachInputListeners(section, index);
  });

  let lastSectionIndex = 0; // Global variable to keep track of the last section
  let navigationHistory = []; // Initialize this at the beginning of your script

  showSection(0);

  function showSection(index, isForwardNavigation = true) {
    const sections = document.querySelectorAll(".form-section");
    sections.forEach((section, idx) => {
      section.style.display = idx === index ? "flex" : "none";
    });

    // Check if navigating to disqualification section and exclude from history
    if (
      isForwardNavigation &&
      !sections[index].classList.contains("disqualification")
    ) {
      navigationHistory.push(index);
    }

    if (!sections[index].classList.contains("disqualification")) {
      lastSectionIndex = index; // Update lastSectionIndex if not going to disqualification section
    }

    updateNavigationState(index);
    updateProgressBar(); // Ensure the progress bar is updated every time a section is shown
  }

  function nextSection(currentIndex) {
    let nextIndex = currentIndex + 1; // Default to the next section

    // Find an input with the skip-next attribute within the current section
    const currentSection = formSections[currentIndex];
    const skipInput = currentSection.querySelector("input[skip-next]:checked");
    if (skipInput) {
      const skipValue = skipInput.getAttribute("skip-next");
      if (skipValue.toLowerCase() === "true") {
        nextIndex++; // Skip just one section if value is true
      } else {
        const skipCount = parseInt(skipValue, 10);
        if (!isNaN(skipCount)) {
          nextIndex += skipCount; // Adjust nextIndex to skip the specified number of sections
        }
      }
    }

    // Ensure the nextIndex does not exceed the total number of sections
    if (nextIndex >= formSections.length) {
      nextIndex = formSections.length - 1; // Adjust to stay within bounds, or handle as needed
    }

    if (areRequiredFieldsFilled(formSections[currentIndex])) {
      showSection(nextIndex, true);
    } else {
      console.log("Please fill in all required fields before proceeding.");
    }
  }

  function previousSection() {
    if (navigationHistory.length > 1) {
      navigationHistory.pop(); // Remove the current section, assuming you're always here after navigating forward.
      const previousIndex = navigationHistory[navigationHistory.length - 1]; // Look at the last element without removing it.
      showSection(previousIndex, false); // Navigate back without pushing onto the stack again.
    } else {
      // Handle cases where there's no history (e.g., at the start of the form)
    }
  }

  // Check if required form fields in current section are checked
  function areRequiredFieldsFilled(section) {
    // Existing validation for required fields
    const requiredFields = section.querySelectorAll("[required]");
    let areFieldsValid = Array.from(requiredFields).every((field) =>
      field.checkValidity(),
    );

    // Birthday validation
    const birthdayInput = section.querySelector("#Geboortedatum");
    if (birthdayInput && !validateBirthday(birthdayInput.value)) {
      areFieldsValid = false; // Invalidate if birthday is not valid
    }

    // Email validation
    const emailInput = section.querySelector("#Email");
    if (emailInput && !validateEmail(emailInput.value)) {
      areFieldsValid = false; // Invalidate if email is not valid
    }

    // Password validation
    const passwordInput = section.querySelector("#Password");
    const confirmPasswordInput = section.querySelector("#Password-confirm");
    if (passwordInput && !validatePassword(passwordInput.value)) {
      areFieldsValid = false; // Invalidate if password is not valid
    }

    // Check if passwords match
    if (
      passwordInput &&
      confirmPasswordInput &&
      passwordInput.value !== confirmPasswordInput.value
    ) {
      areFieldsValid = false; // Invalidate if passwords do not match
    }

    return areFieldsValid;
  }

  // Check if ALL required form fields are checked
  function areAllRequiredFieldsValid() {
    const sections = document.querySelectorAll(".form-section");

    for (let section of sections) {
      const requiredFields = section.querySelectorAll(
        "[required]:not(#disqualify-checkbox)",
      );
      for (let field of requiredFields) {
        if (!field.checkValidity()) {
          return false;
        }
      }

      // Birthday validation
      const birthdayInput = section.querySelector("#Geboortedatum");
      if (birthdayInput && !validateBirthday(birthdayInput.value)) {
        return false;
      }

      // Email validation
      const emailInput = section.querySelector("#Email");
      if (emailInput && !validateEmail(emailInput.value)) {
        return false;
      }

      // Password validation
      const passwordInput = section.querySelector("#Password");
      if (passwordInput && !validatePassword(passwordInput.value)) {
        return false;
      }

      // Confirm Password validation
      const confirmPasswordInput = section.querySelector("#Password-confirm");
      if (
        passwordInput &&
        confirmPasswordInput &&
        passwordInput.value !== confirmPasswordInput.value
      ) {
        return false;
      }
    }
    
    return true; // All required fields are valid, including email and password, and passwords match
  }

  function updateNavigationState(index) {
    const section = formSections[index];
    const nextButton = section.querySelector(".next-button");
    const reviewButton = section.querySelector(".review-answers");
    const submitButton = document.querySelector(".button-submit");
    const submitSection = document.querySelector(".form-section.submit");
    const isValid = areRequiredFieldsFilled(section); // check required fields in current section
    const isAllValid = areAllRequiredFieldsValid(); // Check all required fields in the form

    if (nextButton) {
      nextButton.classList.toggle("is-disabled", !isValid);
    }

    if (reviewButton) {
      reviewButton.classList.toggle("is-disabled", !isValid);
    }

    if (submitButton && section === submitSection) {
      submitButton.classList.toggle("is-disabled", !isAllValid);
      if (document.getElementById("disqualify-checkbox")) {
        document
          .getElementById("disqualify-checkbox")
          .removeAttribute("required");
      }
    }
  }

  function attachInputListeners(section, index) {
    const inputs = section.querySelectorAll(
      "input[required], select[required], textarea[required], input[data-disqualify]",
    );
    inputs.forEach((input) => {
      const eventType =
        input.type === "checkbox" || input.type === "radio"
          ? "change"
          : "input";
      input.addEventListener(eventType, () => {
        updateNavigationState(index);

        // Specific logic for radio buttons to automatically navigate
        if (
          input.type === "radio" &&
          input.checked &&
          input.dataset.disqualify !== "true"
        ) {
          // Call nextSection with a slight delay to ensure a smooth user experience
          setTimeout(() => nextSection(index), 200); // Adjust the delay as needed
        }

        // If this input can disqualify the user, check immediately upon change
        if (input.dataset.disqualify === "true" && input.checked) {
          navigateToDisqualificationSection();
        }
      });
    });
  }

  function navigateToDisqualificationSection() {
    const disqualificationIndex = findDisqualificationSectionIndex();
    if (disqualificationIndex !== -1) {
      showSection(disqualificationIndex, false);
    }
  }

  function findDisqualificationSectionIndex() {
    const disqualificationSection = document.querySelector(
      ".form-section.disqualification",
    );
    return disqualificationSection
      ? parseInt(
          disqualificationSection.getAttribute("data-question-index"),
          10,
        )
      : -1;
  }

  document.querySelectorAll(".next-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const currentIndex = parseInt(
        button.closest(".form-section").getAttribute("data-question-index"),
        10,
      );
      if (!button.classList.contains("is-disabled")) {
        nextSection(currentIndex);
      }
    });
  });

  document.querySelectorAll(".prev-button").forEach((button) => {
    button.addEventListener("click", () => {
      previousSection();
    });
  });

  document.querySelectorAll(".review-answers").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      if (!button.classList.contains("is-disabled")) {
        showSection(lastSectionIndex); // Only navigate back if the checkbox is checked
      }
    });
  });

  document
    .querySelector(".button-submit")
    .addEventListener("click", function (event) {
      if (this.classList.contains("is-disabled")) {
        event.preventDefault();
      }
    });

  // Calculate the percentage of completed form sections
  function calculateProgress() {
    const formSections = document.querySelectorAll(
      ".form-section:not(.disqualification)",
    );
    const activeSectionIndex = Array.from(formSections).findIndex((section) => {
      return window.getComputedStyle(section).display === "flex";
    });
    // Ensure progress does not exceed 100% in cases where activeSectionIndex could be the last section
    const percentage = ((activeSectionIndex + 1) / formSections.length) * 100;
    return Math.min(percentage, 100); // Clamp the value to 100% to prevent overflow
  }

  // Update the progress bar width based on the calculated percentage
  function getActiveSection() {
    const sections = document.querySelectorAll(".form-section");
    for (const section of sections) {
      const style = window.getComputedStyle(section);
      if (style.display === "flex") {
        return section;
      }
    }
    return null; // No active section found
  }

  function updateProgressBar() {
    const activeSection = getActiveSection();

    if (activeSection) {
      const progressBar = activeSection.querySelector(".form_progress-tracker");
      if (progressBar) {
        const percentage = calculateProgress();
        progressBar.style.width = `${percentage}%`;
      }
    }
  }

  // Attach event listeners to form inputs to update the progress bar
  document.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("change", updateProgressBar);
  });

  // Initial update of the progress bar
  updateProgressBar();

  // Generic function to toggle error display
  function toggleErrorDisplay(input, isValid, errorMessageElement) {
    if (!isValid) {
      errorMessageElement.classList.remove("hide-error-message");
      input.classList.add("error");
    } else {
      errorMessageElement.classList.add("hide-error-message");
      input.classList.remove("error");
    }
  }

  const emailInput = document.getElementById("Email");
  const passwordInput = document.getElementById("Password");
  const confirmPasswordInput = document.getElementById("Password-confirm");
  const birthdayInput = document.getElementById('Geboortedatum');
  const birthdayErrorMessage = document.getElementById('geboortedatum-error-message');

  function validateBirthdayInput() {
    const isValidFormat = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(\d{4})$/.test(birthdayInput.value);
    const isOldEnough = validateBirthday(birthdayInput.value);
  
    let errorMessage = '';
    if (!isValidFormat) {
      errorMessage = 'Ongeldige datum. Gebruik het format dd-mm-yyyy.';
    } else if (!isOldEnough) {
      errorMessage = 'Je moet minstens 18 jaar oud zijn om je aan te melden.';
    }
  
    // Display the appropriate error message
    birthdayErrorMessage.textContent = errorMessage;
  
    // Toggle visibility of the error message and input field styling based on validation
    toggleErrorDisplay(birthdayInput, isValidFormat && isOldEnough, birthdayErrorMessage);
  }

  function validateEmailInput() {
    // Email validation
    toggleErrorDisplay(
      emailInput,
      validateEmail(emailInput.value),
      document.getElementById("email-error-message"),
    );
  }

  function validatePasswordInput() {
    // Password validation
    toggleErrorDisplay(
      passwordInput,
      validatePassword(passwordInput.value),
      document.getElementById("password-error-message"),
    );
  }

  function validateConfirmPasswordInput() {
    // Password confirmation validation
    const passwordsMatch = confirmPasswordInput.value === passwordInput.value;
    toggleErrorDisplay(
      confirmPasswordInput,
      passwordsMatch,
      document.getElementById("password-confirm-error-message"),
    );
  }

  birthdayInput.addEventListener('blur', validateBirthdayInput);
  emailInput.addEventListener("blur", validateEmailInput);
  passwordInput.addEventListener("blur", validatePasswordInput);
  confirmPasswordInput.addEventListener("blur", validateConfirmPasswordInput);

  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  function validateBirthday(birthday) {
    // Function to validate the birthday format dd-mm-yyyy and check if user is at least 18 years old
    const re = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[012])-(\d{4})$/;
    const match = birthday.match(re);
  
    if (match) {
      // Extract day, month, year from the birthday
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1; // JavaScript months are 0-based
      const year = parseInt(match[3], 10);
  
      const birthDate = new Date(year, month, day);
      const currentDate = new Date();
      let age = currentDate.getFullYear() - birthDate.getFullYear();
      const m = currentDate.getMonth() - birthDate.getMonth();
  
      // Calculate exact age
      if (m < 0 || (m === 0 && currentDate.getDate() < birthDate.getDate())) {
        age--;
      }
  
      // Check if age is at least 18
      return age >= 18;
    } else {
      return false; // Invalid format
    }
  }
  

  function validatePassword(password) {
    const re =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,15}$/;
    return re.test(password);
  }
});
