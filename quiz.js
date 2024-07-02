document.addEventListener("DOMContentLoaded", function () {
  const formSections = document.querySelectorAll(".form-section");

  formSections.forEach((section, index) => {
    section.setAttribute("data-question-index", index);
    attachInputListeners(section, index);

    // Initialize sections
    section.style.opacity = 0;
    section.style.transition = "opacity 0.5s ease-in-out";
    if (index === 0) {
      section.style.display = "flex";
      section.style.opacity = 1;
    } else {
      section.style.display = "none";
    }
  });

  let lastSectionIndex = 0; // Global variable to keep track of the last section
  let navigationHistory = []; // Initialize this at the beginning of your script

  //showSection(0);

  function showSection(index, isForwardNavigation = true) {
    const sections = document.querySelectorAll(".form-section");

    // Hide all sections
    const duration = 250; // Duration of the fade effect in milliseconds

    sections.forEach((section, idx) => {
      if (idx !== index) {
        section.style.opacity = 0;
        setTimeout(() => {
          section.style.display = "none";
        }, duration);
      }
    });

    // Show the target section with a fade-in effect
    const targetSection = sections[index];
    setTimeout(() => {
      targetSection.style.display = "flex";
      setTimeout(() => {
        targetSection.style.opacity = 1;
      }, 50); // Trigger the fade-in effect after a slight delay
      setTimeout(updateProgressBar, 100); // Ensure the progress bar updates after the section is visible
    }, duration);

    updateNavigationState(index);

    // Scroll to the top of the page
    window.scrollTo(0, 0); // This scrolls the window to the top immediately

    // Reinstating required attributes if not in submit section
    if (!sections[index].classList.contains("submit")) {
      reinstateRequiredAttributes();
    }

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
      showSection(0, false); // Go back to the first section
    }
  }

  // Check if required form fields in current section are checked
  function areRequiredFieldsFilled(section) {
    const requiredFields = section.querySelectorAll("[required]");
    let areFieldsValid = Array.from(requiredFields).every((field) =>
      field.checkValidity()
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

    // Initials validation
    const initialsInput = section.querySelector("#Voorletters");
    if (initialsInput && !validateInitials(initialsInput.value)) {
      areFieldsValid = false; // Invalidate if initials is not valid
    }

    // Password validation
    const passwordInput = section.querySelector("#Password");
    if (passwordInput && !validatePassword(passwordInput.value)) {
      areFieldsValid = false; // Invalidate if password is not valid
    }

    // Gender at birth validation
    const genderInput = section.querySelector("#Geslacht");
    if (genderInput && !validateGender(genderInput)) {
      areFieldsValid = false; // Invalidate if gender at birth is not 'man'
    }

    return areFieldsValid;
  }

  function updateNavigationState(index) {
    const section = formSections[index];
    const nextButton = section.querySelector(".next-button");
    const reviewButton = section.querySelector(".review-answers");
    const submitButton = document.querySelector(".button-submit");
    const submitSection = document.querySelector(".form-section.submit");
    const isValid = areRequiredFieldsFilled(section); // check required fields in current section

    if (nextButton) {
      nextButton.classList.toggle("is-disabled", !isValid);
    }

    if (reviewButton) {
      reviewButton.classList.toggle("is-disabled", !isValid);
    }

    if (submitButton && section === submitSection) {
      // Remove 'required' attribute from groups of inputs if their container has the attribute
      document
        .querySelectorAll("[ignore-required-on-submit]")
        .forEach((group) => {
          // This checks if the element is a direct input or a group container
          if (group.tagName.toLowerCase() === "input") {
            group.removeAttribute("required");
          } else {
            // Assuming this is a container for grouped inputs like radio buttons
            const inputs = group.querySelectorAll("input");
            inputs.forEach((input) => {
              input.removeAttribute("required");
            });
          }
        });

      submitButton.classList.toggle("is-disabled", !isValid);
    }
  }

  function reinstateRequiredAttributes() {
    const conditionalFields = document.querySelectorAll(
      "[ignore-required-on-submit]"
    );
    conditionalFields.forEach((field) => {
      if (field.tagName.toLowerCase() === "input") {
        field.setAttribute("required", "");
      } else {
        const inputs = field.querySelectorAll("input");
        inputs.forEach((input) => {
          input.setAttribute("required", "");
        });
      }
    });
  }

  function attachInputListeners(section, index) {
    const inputs = section.querySelectorAll(
      "input[required], select[required], textarea[required], input[data-disqualify]"
    );
    inputs.forEach((input) => {
      const eventType =
        input.tagName.toLowerCase() === "select" ||
        input.type === "checkbox" ||
        input.type === "radio"
          ? "change"
          : "input";
      input.addEventListener(eventType, () => {
        updateNavigationState(index);

        // Specific logic for radio buttons to automatically navigate
        if (
          input.type === "radio" &&
          input.checked &&
          input.dataset.disqualify !== "true" &&
          input.getAttribute("gotonext") !== "false"
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
      ".form-section.disqualification"
    );
    return disqualificationSection
      ? parseInt(
          disqualificationSection.getAttribute("data-question-index"),
          10
        )
      : -1;
  }

  document.querySelectorAll(".next-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      const currentIndex = parseInt(
        button.closest(".form-section").getAttribute("data-question-index"),
        10
      );

      const currentSection =
        document.querySelectorAll(".form-section")[currentIndex];

      if (!areRequiredFieldsFilled(currentSection)) {
        showSectionErrors(currentSection); // Show errors in the current section
      } else if (!button.classList.contains("is-disabled")) {
        nextSection(currentIndex);
      }
    });
  });

  function showSectionErrors(section) {
    const inputs = section.querySelectorAll(
      "input[required], select[required], textarea[required]"
    );
    inputs.forEach((input) => {
      if (!input.checkValidity()) {
        const errorMessageElement = input.nextElementSibling; // Assuming error messages are right after inputs in HTML
        errorMessageElement.classList.remove("hide-error-message"); // Show error message
        input.classList.add("error"); // Add error class to highlight
      }
    });

    // Optionally scroll to the first error in the section
    const firstError = section.querySelector(".error");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    alert(
      "Vul alle verplichte velden in en corrigeer eventuele fouten voordat je verder gaat."
    ); // Provide an error message, or make this more specific if desired
  }

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
        showFormErrors(); // Function to show errors on the form
      }
    });

  function showFormErrors() {
    // Identify all form sections
    const sections = document.querySelectorAll(".form-section");
    sections.forEach((section) => {
      // Check required fields in each section
      const inputs = section.querySelectorAll(
        "input[required], select[required], textarea[required]"
      );
      inputs.forEach((input) => {
        if (!input.checkValidity()) {
          const errorMessageElement = input.nextElementSibling; // assuming error messages are right after inputs in HTML
          errorMessageElement.classList.remove("hide-error-message"); // Show error message
          input.classList.add("error"); // Add error class to highlight
        }
      });
    });

    // Optionally scroll to the first error
    const firstError = document.querySelector(".error");
    if (firstError) {
      firstError.scrollIntoView({ behavior: "smooth", block: "center" });
    }

    alert(
      "Vul alle verplichte velden in en corrigeer eventuele fouten voordat je verder gaat."
    ); // Provide a generic error message, or make this more specific if desired
  }

  // Progress bar
  // Calculate the percentage of completed form sections
  function calculateProgress() {
    const formSections = document.querySelectorAll(
      ".form-section:not(.disqualification)"
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
  const initialsInput = document.getElementById("Voorletters");
  const passwordInput = document.getElementById("Password");
  const birthdayInput = document.getElementById("Geboortedatum");
  const genderInput = document.getElementById("Geslacht");
  const birthdayErrorMessage = document.getElementById(
    "geboortedatum-error-message"
  );

  function validateBirthdayInput() {
    const isValidFormat =
      /^(0[1-9]|[12][0-9]|3[01])[\/-](0[1-9]|1[012])[\/-](\d{4})$/.test(
        birthdayInput.value
      );
    const isOldEnough = validateBirthday(birthdayInput.value);

    let errorMessage = "";
    if (!isValidFormat) {
      errorMessage =
        "Ongeldige datum. Gebruik het format dd-mm-jjjj of dd/mm/jjjj.";
    } else if (!isOldEnough) {
      errorMessage = "Je moet minstens 18 jaar oud zijn om je aan te melden.";
    }

    // Display the appropriate error message
    birthdayErrorMessage.textContent = errorMessage;

    // Toggle visibility of the error message and input field styling based on validation
    toggleErrorDisplay(
      birthdayInput,
      isValidFormat && isOldEnough,
      birthdayErrorMessage
    );
  }

  function validateEmailInput() {
    // Email validation
    toggleErrorDisplay(
      emailInput,
      validateEmail(emailInput.value),
      document.getElementById("email-error-message")
    );
  }

  function validatePasswordInput() {
    // Password validation
    toggleErrorDisplay(
      passwordInput,
      validatePassword(passwordInput.value),
      document.getElementById("password-error-message")
    );
  }

  function validateInitialsInput() {
    // Initials validation
    toggleErrorDisplay(
      initialsInput,
      validateInitials(initialsInput.value),
      document.getElementById("voorletters-error-message")
    );
  }

  function validateGenderInput() {
    // Email validation
    toggleErrorDisplay(
      genderInput,
      validateGender(genderInput),
      document.getElementById("geslacht-error-message")
    );
  }

  // jQuery is used here for handling the datepicker event
  $(document).ready(function () {
    $("#Geboortedatum").on("hide.datepicker", function () {
      validateBirthdayInput(); // Call your validation function
    });
  });

  birthdayInput?.addEventListener("input", validateBirthdayInput);
  initialsInput?.addEventListener("change", validateInitialsInput);
  emailInput?.addEventListener("change", validateEmailInput);
  genderInput?.addEventListener("input", validateGenderInput);
  passwordInput?.addEventListener("change", validatePasswordInput);

  const voornaamInput = document.getElementById("Voornaam");
  const achternaamInput = document.getElementById("Achternaam");

  function validateFirstNameInput() {
    const inputFilled = voornaamInput.value.trim() !== "";
    toggleErrorDisplay(
      voornaamInput,
      inputFilled,
      document.getElementById("voornaam-error-message")
    );
  }

  function validateLastNameInput() {
    const inputFilled = achternaamInput.value.trim() !== "";
    toggleErrorDisplay(
      achternaamInput,
      inputFilled,
      document.getElementById("achternaam-error-message")
    );
  }

  voornaamInput?.addEventListener("change", validateFirstNameInput);
  achternaamInput?.addEventListener("change", validateLastNameInput);

  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  function validateBirthday(birthday) {
    // Function to validate the birthday format dd-mm-yyyy or dd/mm/yyyy and check if user is at least 18 years old
    const re = /^(0[1-9]|[12][0-9]|3[01])[\/-](0[1-9]|1[012])[\/-](\d{4})$/;
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
    const re = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,21}$/;
    return re.test(password);
  }

  function validateInitials(initials) {
    const re = /^(?:[A-Za-z](?:\.?\s?))*[A-Za-z]\.?$/;
    return re.test(initials);
  }

  function validateGender(genderInput) {
    // Check if the gender matches 'man'
    return genderInput.value.toLowerCase() === "man";
  }
});
