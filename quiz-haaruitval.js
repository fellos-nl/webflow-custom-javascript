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
    const requiredFields = section.querySelectorAll("[required]");
    return Array.from(requiredFields).every((field) => field.checkValidity());
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
      document
        .querySelectorAll("[ignore-required-on-submit]")
        .forEach((group) => {
          const radios = group.querySelectorAll('input[type="radio"]');
          radios.forEach((radio) => {
            radio.removeAttribute("required");
          });
        });

      submitButton.classList.toggle("is-disabled", !isValid);
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

  // Progress bar
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
});
