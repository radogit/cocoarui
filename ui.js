// todo: UI control panel - enact the above hardcoded choices onto the html file

// ui.js
export let showNodeLabel = true;
export let showForceArrows = true;
export let showNetForce = true;
export let showCoordinates = true;

export function setupUI(/* references if needed: svg, etc. */) {
  const toggleNodeLabel = document.getElementById("toggleNodeLabel");
  if (toggleNodeLabel) {
    toggleNodeLabel.addEventListener("change", function() {
      showNodeLabel = this.checked;
      document.querySelectorAll(".id-label").forEach(el => {
        el.style.display = showNodeLabel ? null : "none";
      });
    });
  }

  const toggleForceArrowsInput = document.getElementById("toggleForceArrows");
  if (toggleForceArrowsInput) {
    toggleForceArrowsInput.addEventListener("change", function() {
      showForceArrows = this.checked;
      document.querySelectorAll(".force-arrows").forEach(el => {
        el.style.display = showForceArrows ? null : "none";
      });
    });
  }

  const toggleNetForceInput = document.getElementById("toggleNetForce");
  if (toggleNetForceInput) {
    toggleNetForceInput.addEventListener("change", function() {
      showNetForce = this.checked;
    });
  }

  const toggleCoordinatesInput = document.getElementById("toggleCoordinates");
  if (toggleCoordinatesInput) {
    toggleCoordinatesInput.addEventListener("change", function() {
      showCoordinates = this.checked;
      document.querySelectorAll(".coord-label").forEach(el => {
        el.style.display = showCoordinates ? null : "none";
      });
    });
  }
}
