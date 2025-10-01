document.addEventListener("DOMContentLoaded", () => {
  const menu = document.getElementById("menu");
  const menuIcon = document.getElementById("menu-icon");
  const mainContent = document.getElementById("mainContent");
  const logoutBtn = document.getElementById("logoutBtn");
  const cutoffDisplay = document.getElementById("cutoffDisplay");


  const newDailyRate = localStorage.getItem("newDailyRate");
  const newOverTimeRate = localStorage.getItem("newOverTimeRate");
  const increaseStart = localStorage.getItem("increaseStartDate");
  const acknowledgedDate = localStorage.getItem("acknowledgedDate");

  if (newDailyRate && newOverTimeRate && increaseStart) {
    const today = new Date().setHours(0, 0, 0, 0);
    const start = new Date(increaseStart).setHours(0, 0, 0, 0);

    if (today >= start && acknowledgedDate !== increaseStart) {
      const formattedStartDate = new Date(increaseStart).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric"
      });

      Swal.fire({
        icon: "warning",
        title: "New Rates",
        html: `
        <div style="text-align: left; font-size: 16px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Effective Date:</span> <span><i>${formattedStartDate}</i></span>
          </div>
          <div style="margin-top: 12px;"></div>
          <div style="display: flex; justify-content: space-between;">
            <span>Daily Rate:</span> <span>${parseFloat(newDailyRate).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Overtime Rate:</span> <span>${parseFloat(newOverTimeRate).toFixed(2)}</span>
          </div>
        </div>
      `,
        confirmButtonText: "OK"
      }).then(() => {
        // Apply new rates
        localStorage.setItem("dailyRate", newDailyRate);
        localStorage.setItem("overTimeRate", newOverTimeRate);

        // Clear scheduled increase
        localStorage.removeItem("newDailyRate");
        localStorage.removeItem("newOverTimeRate");
        localStorage.removeItem("increaseStartDate");

        // Remember acknowledgment to not show modal again until new date is set
        localStorage.setItem("acknowledgedDate", increaseStart);
      });
    }
  }




  // Cards
  const daysWorkedEl = document.getElementById("daysWorked");
  const hoursWorkedEl = document.getElementById("hoursWorked");
  const overtimeHoursEl = document.getElementById("overtimeHours");
  const legalHolidayCountEl = document.getElementById("legalHolidayCount");
  const specialHolidayCountEl = document.getElementById("specialHolidayCount");
  const legalHolidayOTEl = document.getElementById("legalHolidayOT");
  const specialHolidayOTEl = document.getElementById("specialHolidayOT");

  // Get user email
  const currentUserEmail = sessionStorage.getItem("currentUserEmail");
  if (!currentUserEmail) {
    Swal.fire({
      icon: "warning",
      title: "Not Logged In",
      text: "Please log in to access the dashboard.",
    }).then(() => {
      window.location.href = "index.html";
    });
    return;
  }

  // Logout button
  logoutBtn.addEventListener("click", () => {
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
        localStorage.removeItem("rememberMe");
        Swal.fire({
          icon: "success",
          title: "Logged Out"
        }).then(() => {
          window.location.href = "index.html";
        });
      }
    });
  });



  // Load settings
  const dailyRate = parseFloat(localStorage.getItem("dailyRate")) || 0;
  const overtimeRate = parseFloat(localStorage.getItem("overTimeRate")) || 0;
  const firstCutoff = localStorage.getItem("firstCutoff");
  const secondCutoff = localStorage.getItem("secondCutoff");

  if (firstCutoff && secondCutoff) {
    cutoffDisplay.textContent = `Cutoff Period: ${firstCutoff} to ${secondCutoff}`;
  } else {
    cutoffDisplay.textContent = "Cutoff Period: Not Set";
  }

  // Load shifts (same logic as payslip.js)
  const allShifts = JSON.parse(localStorage.getItem(currentUserEmail + "_shifts") || "[]");
  const cutoffStart = firstCutoff ? new Date(firstCutoff) : null;
  const cutoffEnd = secondCutoff ? new Date(secondCutoff) : null;
  if (cutoffEnd) cutoffEnd.setHours(23, 59, 59, 999);

  const shiftsInPeriod = cutoffStart && cutoffEnd
    ? allShifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= cutoffStart && shiftDate <= cutoffEnd;
    })
    : allShifts;

  // Initialize counters
  let regularDays = 0, regularOTHours = 0;
  let legalHolidayDays = 0, legalHolidayOT = 0;
  let specialHolidayDays = 0, specialHolidayOT = 0;
  let totalWorkedHours = 0;

  shiftsInPeriod.forEach(shift => {
    const hours = parseFloat(shift.hours || 0);
    const ot = Math.max(0, hours - 8);
    totalWorkedHours += hours;


    const dayEquivalent = hours > 0 ? Math.min(hours / 8, 1) : 0;

    if (shift.type === "Legal Holiday") {
      if (hours > 0) {
        legalHolidayDays += dayEquivalent;
        legalHolidayOT += ot;
      } else {
        legalHolidayDays += 1;
        shift.legalHolidayZeroHours = true;
      }
    } else if (shift.type === "Special Holiday") {
      if (hours > 0) {
        specialHolidayDays += dayEquivalent;
        specialHolidayOT += ot;
      } else {
        specialHolidayDays += 1;
        shift.specialHolidayZeroHours = true;
      }
    } else {
      if (hours > 0) {
        regularDays += dayEquivalent;
        regularOTHours += ot;
      }
    }
  });


  // Display results
  daysWorkedEl.textContent = regularDays;
  hoursWorkedEl.textContent = totalWorkedHours;
  overtimeHoursEl.textContent = regularOTHours;
  legalHolidayCountEl.textContent = legalHolidayDays;
  specialHolidayCountEl.textContent = specialHolidayDays;
  legalHolidayOTEl.textContent = legalHolidayOT;
  specialHolidayOTEl.textContent = specialHolidayOT;

  // Chart.js Pie Chart
  const ctx = document.getElementById("workPieChart").getContext("2d");
  new Chart(ctx, {
    type: "pie",
    data: {
      labels: [
        "Regular Days",
        "Regular OT",
        "Legal Holiday",
        "Special Holiday",
        "Legal Holiday OT",
        "Special Holiday OT",
      ],
      datasets: [
        {
          data: [
            regularDays,
            regularOTHours,
            legalHolidayDays,
            specialHolidayDays,
            legalHolidayOT,
            specialHolidayOT,
          ],
          backgroundColor: [
            "#36A2EB", // Regular Days
            "#FF6384", // Regular OT
            "#4BC0C0", // Legal Holiday
            "#FFCD56", // Special Holiday
            "#9966FF", // Legal Holiday OT
            "#FF9F40", // Special Holiday OT
          ],
        },
      ],
    },
    options: {
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            font: {
              family: "Noto Sans",
              size: 12,
            },
            color: "#333",
          },
        },
      },
    },
  });

  // Toggle Menu with animated icon
  window.toggleMenu = function () {
    const isOpen = menu.classList.contains("show");
    const gap = 20;

    // Animate icon
    menuIcon.classList.add("animate-out");
    setTimeout(() => {
      menuIcon.setAttribute("name", isOpen ? "menu-outline" : "close-outline");
      menuIcon.classList.remove("animate-out");
      menuIcon.classList.add("animate-in");
      setTimeout(() => menuIcon.classList.remove("animate-in"), 300);
    }, 300);

    // Toggle menu
    menu.classList.toggle("show");

    // Adjust content
    mainContent.style.marginTop = !isOpen
      ? menu.offsetHeight + gap + "px"
      : "20px";
  };
});
