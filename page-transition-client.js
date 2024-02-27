window.Wized = window.Wized || [];
window.Wized.push(async (Wized) => {
  try {
    // Wait for the 'get_user' request to finish
    const result = await Wized.requests.waitFor("get_user");

    // Check if the request was successful
    // You may need to adjust the success condition based on how success is indicated in your result
    if (result && result.ok) {
      // Execute your logic here if the request was successful
      let transitionTrigger = $(".page-loader_trigger");
      let introDurationMS = 1600;
      let exitDurationMS = 1200;
      let excludedClass = "no-transition";

      // On Page Load
      if (transitionTrigger.length > 0) {
        transitionTrigger.click();
        $("body").addClass("no-scroll-transition");
        setTimeout(() => {
          $("body").removeClass("no-scroll-transition");
        }, introDurationMS);
      }
      // On Link Click
      $("a").on("click", function (e) {
        if (
          $(this).prop("hostname") == window.location.host &&
          $(this).attr("href").indexOf("#") === -1 &&
          !$(this).hasClass(excludedClass) &&
          $(this).attr("target") !== "_blank" &&
          transitionTrigger.length > 0
        ) {
          e.preventDefault();
          $("body").addClass("no-scroll-transition");
          let transitionURL = $(this).attr("href");
          transitionTrigger.click();
          setTimeout(function () {
            window.location = transitionURL;
          }, exitDurationMS);
        }
      });
      // On Back Button Tap
      window.onpageshow = function (event) {
        if (event.persisted) {
          window.location.reload();
        }
      };

      /* Hide Transition on Window Width Resize
      setTimeout(() => {
        $(window).on("resize", function () {
          setTimeout(() => {
            $(".loader_component").css("display", "none");
          }, 50);
        });
      }, introDurationMS);
      */
    } else {
      // Handle the case where the request was not successful
      console.error("The request did not succeed:", result);
    }
  } catch (error) {
    // Error handling if waiting for the request fails
    console.error("An error occurred while waiting for the request:", error);
  }
});
