document.addEventListener("DOMContentLoaded", function () {
  var addArticleBtn = document.querySelector(".prescription-add-row");

  addArticleBtn.addEventListener("click", function () {
    var container = document.querySelector(".prescription-select-container");
    var originalSelect = document.querySelector(".prescription-article-select");
    var newSelect = originalSelect.cloneNode(true);
    newSelect.value = "";

    // Create a div to hold the select and the remove button
    var selectDiv = document.createElement("div");
    selectDiv.className = "prescription-add-container";

    // Append the new select to the div
    selectDiv.appendChild(newSelect);

    // Create and append the SVG remove button
    var removeBtnHTML = `<div class="icon-1x1-medium is-remove-button"><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
  </svg></div>`;
    selectDiv.insertAdjacentHTML("beforeend", removeBtnHTML);

    // Append the div to the container
    container.appendChild(selectDiv);

    // Find and attach click event listener to the remove button
    selectDiv
      .querySelector(".is-remove-button")
      .addEventListener("click", function () {
        selectDiv.remove();
      });
  });
});
