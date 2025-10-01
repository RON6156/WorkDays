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

let currentUserEmail = sessionStorage.getItem("currentUserEmail");
if (!currentUserEmail) {
  Swal.fire({
    icon: 'error',
    title: 'Not logged in',
    confirmButtonText: 'OK'
  }).then(() => window.location.href = "index.html");
}

// Logout
document.getElementById("logoutBtn").addEventListener("click", () => {
  Swal.fire({
    icon: 'warning',
    title: 'Log Out?',
    text: 'Are you sure you want to log out?',
    showCancelButton: true,
    confirmButtonText: 'Yes',
    cancelButtonText: 'Cancel'
  }).then(result => {
    if (result.isConfirmed) {
      sessionStorage.removeItem("currentUserEmail");
      Swal.fire({ icon: 'success', title: 'Logged Out', confirmButtonText: 'OK' })
        .then(() => { window.location.href = "index.html"; });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const generateBtn = document.getElementById("generatePayslip");
  const payslipContent = document.getElementById("payslipContent");
  const payslipOutput = document.getElementById("payslipOutput");

  // Load current and increase rates
  let dailyRate = parseFloat(localStorage.getItem("dailyRate")) || 0;
  let overtimeRate = parseFloat(localStorage.getItem("overTimeRate")) || 0;
  const newDailyRate = parseFloat(localStorage.getItem("newDailyRate")) || null;
  const newOverTimeRate = parseFloat(localStorage.getItem("newOverTimeRate")) || null;
  const increaseStart = localStorage.getItem("increaseStartDate") || null;

  // Apply increased rates automatically if start date reached
  if (newDailyRate && newOverTimeRate && increaseStart) {
    const today = new Date().setHours(0,0,0,0);
    const start = new Date(increaseStart).setHours(0,0,0,0);
    if (today >= start) {
      localStorage.setItem("dailyRate", newDailyRate);
      localStorage.setItem("overTimeRate", newOverTimeRate);
      dailyRate = newDailyRate;
      overtimeRate = newOverTimeRate;

      localStorage.removeItem("newDailyRate");
      localStorage.removeItem("newOverTimeRate");
      localStorage.removeItem("increaseStartDate");

      // Session flag for dashboard notification
      sessionStorage.setItem("rateIncreased", JSON.stringify({ dailyRate, overtimeRate }));
    }
  }

  generateBtn.addEventListener("click", () => {
    const firstCutoff = localStorage.getItem("firstCutoff");
    const secondCutoff = localStorage.getItem("secondCutoff");

    if (!firstCutoff || !secondCutoff) {
      Swal.fire({ icon: 'error', title: 'Missing Cut-off Dates', text: 'Set cut-off dates in Settings first.', confirmButtonText: 'OK' });
      return;
    }

    const allShifts = JSON.parse(localStorage.getItem(currentUserEmail + "_shifts") || "[]");
    const cutoffStart = new Date(firstCutoff);
    const cutoffEnd = new Date(secondCutoff);
    cutoffEnd.setHours(23, 59, 59, 999);

    const shiftsInPeriod = allShifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      return shiftDate >= cutoffStart && shiftDate <= cutoffEnd;
    });

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
        }
      } else if (shift.type === "Special Holiday") {
        if (hours > 0) {
          specialHolidayDays += dayEquivalent;
          specialHolidayOT += ot;
        } else {
          specialHolidayDays += 1; 
        }
      } else {
        if (hours > 0) {
          regularDays += dayEquivalent;
          regularOTHours += ot;
        }
      }
    });

    const regularPay = regularDays * dailyRate;
    const regularOTPay = regularOTHours * overtimeRate;

    let LHPay = 0, LHOTPay = 0;
    shiftsInPeriod.forEach(shift => {
      if (shift.type === "Legal Holiday" && shift.hours > 0) {
        LHPay += dailyRate * 2;
        LHOTPay += Math.max(0, shift.hours - 8) * overtimeRate * 2;
      }
    });

    let SHPay = 0, SHOTPay = 0;
    shiftsInPeriod.forEach(shift => {
      if (shift.type === "Special Holiday" && shift.hours > 0) {
        SHPay += dailyRate * 1.3;
        SHOTPay += Math.max(0, shift.hours - 8) * overtimeRate * 1.3;
      }
    });

    const grossPay = regularPay + regularOTPay + LHPay + LHOTPay + SHPay + SHOTPay;

    const formatValue = val => "₱" + val.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    // Display Rate increase in payslip if exists
    let rateInfo = `Rate/Day: ${formatValue(dailyRate)}\nOvertime Rate/Hour: ${formatValue(overtimeRate)}`;
    if (newDailyRate && newOverTimeRate && increaseStart) {
      rateInfo = `Rate/Day: ${formatValue(dailyRate)} → ${formatValue(newDailyRate)}
Overtime Rate/Hour: ${formatValue(overtimeRate)} → ${formatValue(newOverTimeRate)}
Increase Start: ${increaseStart}`;
    }

    payslipContent.textContent = `
Period: ${firstCutoff} to ${secondCutoff}
${rateInfo}
______________________________________

Regular Day       : ${regularDays}  — ${formatValue(regularPay)}
Worked Hours      : ${totalWorkedHours.toFixed(1)}
Regular Overtime  : ${regularOTHours.toFixed(1)} — ${formatValue(regularOTPay)}

Legal Holiday Pay : ${legalHolidayDays} — ${formatValue(LHPay)}
Legal Holiday OT  : ${legalHolidayOT.toFixed(1)} — ${formatValue(LHOTPay)}

Special Holiday Pay: ${specialHolidayDays} — ${formatValue(SHPay)}
Special Holiday OT : ${specialHolidayOT.toFixed(1)} — ${formatValue(SHOTPay)}

___________________
Gross Pay: ${formatValue(grossPay)}
`;

    payslipOutput.scrollIntoView({ behavior: "smooth" });
  });
});
