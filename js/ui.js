// ui.js
export let showNodeLabel = true;
export let showCoordinates = true;
export let showForceArrows = true;
export let showNetForce = true;

export function setupUI(/* references if needed: svg, etc. */) {
  // enact the above hardcoded choices onto the html file
  document.getElementById("toggleNodeLabel").checked = showNodeLabel;
  document.getElementById("toggleCoordinates").checked = showCoordinates;
  document.getElementById("toggleForceArrows").checked = showForceArrows;
  document.getElementById("toggleNetForce").checked = showNetForce;

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
      if(!this.checked){document.getElementById("toggleNetForce").disabled = true} else {document.getElementById("toggleNetForce").disabled = false;}
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
