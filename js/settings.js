const menu = document.getElementById("menu");
const menuIcon = document.getElementById("menu-icon");
const mainContent = document.getElementById("mainContent");

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

  const newDailyRateInput = document.getElementById("newDailyRate");
  const newOverTimeRateInput = document.getElementById("newOverTimeRate");
  const increaseStartInput = document.getElementById("increaseStartDate");
  const toggleIncreaseBtn = document.getElementById("toggleIncrease");
  const increaseFields = document.getElementById("increaseFields");

  // Toggle animation
  toggleIncreaseBtn.addEventListener("click", () => {
    if (increaseFields.style.maxHeight && increaseFields.style.maxHeight !== "0px") {
      increaseFields.style.maxHeight = "0";
      increaseFields.style.padding = "0";
    } else {
      increaseFields.style.maxHeight = "500px";
      increaseFields.style.padding = "10px 0";
    }
  });

  // Load saved settings
  const dailyRate = localStorage.getItem("dailyRate");
  const overTimeRate = localStorage.getItem("overTimeRate");
  const firstCutoff = localStorage.getItem("firstCutoff");
  const secondCutoff = localStorage.getItem("secondCutoff");
  const newDailyRate = localStorage.getItem("newDailyRate");
  const newOverTimeRate = localStorage.getItem("newOverTimeRate");
  const increaseStart = localStorage.getItem("increaseStartDate");

  if (dailyRate) dailyRateInput.value = dailyRate;
  if (overTimeRate) overTimeRateInput.value = overTimeRate;
  if (firstCutoff) firstCutoffInput.value = firstCutoff;
  if (secondCutoff) secondCutoffInput.value = secondCutoff;
  if (newDailyRate) newDailyRateInput.value = newDailyRate;
  if (newOverTimeRate) newOverTimeRateInput.value = newOverTimeRate;
  if (increaseStart) increaseStartInput.value = increaseStart;

  // Auto-update rates if start date reached
  if (newDailyRate && newOverTimeRate && increaseStart) {
    const today = new Date().setHours(0,0,0,0);
    const start = new Date(increaseStart).setHours(0,0,0,0);
    if (today >= start) {
      localStorage.setItem("dailyRate", newDailyRate);
      localStorage.setItem("overTimeRate", newOverTimeRate);

      // Remove applied increase to prevent duplicate
      localStorage.removeItem("newDailyRate");
      localStorage.removeItem("newOverTimeRate");
      localStorage.removeItem("increaseStartDate");

      // Set a session flag for dashboard notification
      sessionStorage.setItem("rateIncreased", JSON.stringify({
        dailyRate: newDailyRate,
        overtimeRate: newOverTimeRate
      }));
    }
  }

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
  [dailyRateInput, overTimeRateInput, firstCutoffInput, secondCutoffInput].forEach(input => input.addEventListener("input", checkFields));

  // Save settings
  document.getElementById("settingsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    localStorage.setItem("dailyRate", dailyRateInput.value);
    localStorage.setItem("overTimeRate", overTimeRateInput.value);
    localStorage.setItem("firstCutoff", firstCutoffInput.value);
    localStorage.setItem("secondCutoff", secondCutoffInput.value);

    if (newDailyRateInput.value && newOverTimeRateInput.value && increaseStartInput.value) {
      localStorage.setItem("newDailyRate", newDailyRateInput.value);
      localStorage.setItem("newOverTimeRate", newOverTimeRateInput.value);
      localStorage.setItem("increaseStartDate", increaseStartInput.value);
    }

    Swal.fire({
      icon: "success",
      title: "Settings Saved",
      text: "Settings saved successfully.",
      confirmButtonText: "OK"
    });
  });

  // Logout
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
