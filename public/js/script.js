// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

// Live character counter for review comment
document.addEventListener("DOMContentLoaded", () => {
  const comment = document.getElementById("comment");
  const counter = document.getElementById("commentCount");
  if (comment && counter) {
    const max = 500;
    comment.setAttribute("maxlength", String(max));
    const update = () => {
      counter.textContent = `${comment.value.length} / ${max}`;
    };
    comment.addEventListener("input", update);
    update();
  }
});
