const menu = document.getElementById("menu");
const menuIcon = document.getElementById("menu-icon");
const mainContent = document.getElementById("mainContent");
const body = document.body;

function toggleMenu() {
  const isOpen = menu.classList.contains("show");
  const gap = 20;

  menuIcon.classList.add("animate-out");
  setTimeout(() => {
    menuIcon.setAttribute("name", isOpen ? "menu-outline" : "close-outline");
    menuIcon.classList.remove("animate-out");
    menuIcon.classList.add("animate-in");
    setTimeout(() => menuIcon.classList.remove("animate-in"), 300);
  }, 300);

  menu.classList.toggle("show");
  mainContent.style.marginTop = !isOpen ? menu.offsetHeight + gap + "px" : "20px";
}

document.addEventListener("DOMContentLoaded", () => {
    const dailyRateInput = document.getElementById("dailyRate");
    const overTimeRateInput = document.getElementById("overTimeRate");
    const firstCutoffInput = document.getElementById("firstCutoff");
    const secondCutoffInput = document.getElementById("secondCutoff");
    const saveButton = document.querySelector("button[type='submit']");

    // Load saved settings
    const dailyRate = localStorage.getItem("dailyRate");
    const overTimeRate = localStorage.getItem("overTimeRate");
    const firstCutoff = localStorage.getItem("firstCutoff");
    const secondCutoff = localStorage.getItem("secondCutoff");

    if (dailyRate) dailyRateInput.value = dailyRate;
    if (overTimeRate) overTimeRateInput.value = overTimeRate;
    if (firstCutoff) firstCutoffInput.value = firstCutoff;
    if (secondCutoff) secondCutoffInput.value = secondCutoff;

    // Enable/disable save button
    const checkFields = () => {
      saveButton.disabled = !(
        dailyRateInput.value.trim() &&
        overTimeRateInput.value.trim() &&
        firstCutoffInput.value &&
        secondCutoffInput.value
      );
    };
    checkFields();
    [dailyRateInput, overTimeRateInput, firstCutoffInput, secondCutoffInput].forEach(input => {
      input.addEventListener("input", checkFields);
    });

    // Save settings
    document.getElementById("settingsForm").addEventListener("submit", (e) => {
      e.preventDefault();
      localStorage.setItem("dailyRate", dailyRateInput.value);
      localStorage.setItem("overTimeRate", overTimeRateInput.value);
      localStorage.setItem("firstCutoff", firstCutoffInput.value);
      localStorage.setItem("secondCutoff", secondCutoffInput.value);

      Swal.fire({
        icon: "success",
        title: "Settings Saved",
        text: "Settings saved successfully.",
        confirmButtonText: "OK"
      });
    });


  document.getElementById("logoutBtn").addEventListener("click", () => {
    Swal.fire({
      icon: "warning",
      title: "Log Out?",
      text: "Are you sure you want to log out?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel"
    }).then(r => {
      if (r.isConfirmed) {
        sessionStorage.removeItem("currentUserEmail");
        Swal.fire({ icon: "success", title: "Logged Out" }).then(() => window.location.href = "index.html");
      }
    });
  });
});