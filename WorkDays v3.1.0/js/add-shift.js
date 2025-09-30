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

const currentUserEmail = sessionStorage.getItem("currentUserEmail");
if (!currentUserEmail) {
  Swal.fire({ icon: "error", title: "Not logged in", confirmButtonText: "OK" })
    .then(() => window.location.href = "index.html");
} else {
  let editOriginalDate = null;

  function getShifts() {
    return JSON.parse(localStorage.getItem(currentUserEmail + "_shifts") || "[]");
  }

  function saveShifts(shifts) {
    localStorage.setItem(currentUserEmail + "_shifts", JSON.stringify(shifts));
  }

  function getMonthKey(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
  }

  function getMonthNameYear(dateStr) {
    const d = new Date(dateStr);
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function renderShifts() {
    const list = document.getElementById("shiftList");
    const shifts = getShifts()
      .filter(s => s.date)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    list.innerHTML = "";
    if (!shifts.length) { list.innerHTML = "<p>No shifts recorded yet.</p>"; return; }

    const grouped = {};
    shifts.forEach(s => {
      const key = getMonthKey(s.date);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(s);
    });

    for (const month in grouped) {
      const header = document.createElement("div");
      header.className = "shift-group";
      header.innerHTML = `<span class="arrow">▶</span><span style="margin-left:8px;">${getMonthNameYear(grouped[month][0].date)}</span>`;

      const container = document.createElement("div");
      container.className = "shift-list";
      grouped[month].forEach(s => {
        const div = document.createElement("div");
        div.className = "shift-item";
        div.innerHTML = `<span><strong>${s.date}</strong> — ${s.hours} hrs (${s.type})</span>
                    <div>
                        <button onclick="editShift('${s.date}')">Edit</button>
                        <button class="delete" onclick="deleteShift('${s.date}')">Delete</button>
                    </div>`;
        container.appendChild(div);
      });

      header.addEventListener("click", () => {
        const isOpen = container.classList.contains("show");
        document.querySelectorAll(".shift-list.show").forEach(el => {
          el.classList.remove("show");
          if (el.previousElementSibling) el.previousElementSibling.classList.remove("open");
        });
        if (!isOpen) {
          container.classList.add("show");
          header.classList.add("open");
        }
      });

      list.appendChild(header);
      list.appendChild(container);
    }
  }

  function addShift() {
    const date = document.getElementById("shiftDate").value;
    const hours = parseFloat(document.getElementById("hoursWorked").value);
    const type = document.getElementById("holidayType").value;
    if (!date || isNaN(hours) || hours < 0) {
      Swal.fire({ icon: "error", title: "Invalid Input", text: "Please enter valid shift details." });
      return;
    }

    let shifts = getShifts();
    const existingIndex = shifts.findIndex(s => s.date === date);

    const proceed = () => {
      if (editOriginalDate) {
        shifts = shifts.filter(s => s.date !== editOriginalDate);
        shifts.push({ date, hours, type });
        editOriginalDate = null;
      } else if (existingIndex > -1) {
        shifts[existingIndex] = { date, hours, type };
      } else {
        shifts.push({ date, hours, type });
      }
      saveShifts(shifts);
      renderShifts();
      document.getElementById("shiftDate").value = "";
      document.getElementById("hoursWorked").value = "";
      document.getElementById("holidayType").value = "Regular Day";
      Swal.fire({ icon: "success", title: "Shift Saved", text: "Shift saved successfully!" });
    };

    if (existingIndex > -1 && !editOriginalDate) {
      Swal.fire({
        icon: "question",
        title: "Overwrite Shift?",
        text: "You already entered a shift for this date. Overwrite it?",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No"
      }).then(r => { if (r.isConfirmed) proceed(); });
    } else { proceed(); }
  }

  function editShift(date) {
    const shift = getShifts().find(s => s.date === date);
    if (!shift) return;
    document.getElementById("shiftDate").value = shift.date;
    document.getElementById("hoursWorked").value = shift.hours;
    document.getElementById("holidayType").value = shift.type;
    editOriginalDate = shift.date;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function deleteShift(date) {
    Swal.fire({
      icon: "warning",
      title: "Delete Shift?",
      text: `Are you sure you want to delete the shift on ${date}?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel"
    }).then(r => {
      if (r.isConfirmed) {
        saveShifts(getShifts().filter(s => s.date !== date));
        renderShifts();
        Swal.fire({ icon: "success", title: "Shift Deleted" });
      }
    });
  }

  function deleteByMonth() {
    const monthInput = document.getElementById("deleteMonth").value;
    if (!monthInput) { Swal.fire({ icon: "error", title: "No Month Selected" }); return; }
    Swal.fire({
      icon: "warning",
      title: "Delete Shifts?",
      text: `Are you sure you want to delete all shifts for ${monthInput}?`,
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel"
    }).then(r => {
      if (!r.isConfirmed) return;
      const [year, month] = monthInput.split("-").map(Number);
      saveShifts(getShifts().filter(s => {
        const d = new Date(s.date);
        return !(d.getFullYear() === year && d.getMonth() + 1 === month);
      }));
      renderShifts();
      document.getElementById("deleteMonth").value = "";
      Swal.fire({ icon: "success", title: "Shifts Deleted" });
    });
  }

  function deleteAllShifts() {
    Swal.fire({
      icon: "warning",
      title: "Delete All Shifts?",
      text: "Are you sure you want to delete ALL shifts?",
      showCancelButton: true,
      confirmButtonText: "Yes",
      cancelButtonText: "Cancel"
    }).then(r => {
      if (r.isConfirmed) {
        saveShifts([]);
        renderShifts();
        Swal.fire({ icon: "success", title: "All Shifts Deleted" });
      }
    });
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
      Swal.fire({
        icon: "success",
        title: "Logged Out"
      }).then(() => {
        window.location.href = "index.html";
      });
    }
  });
});


  renderShifts();
}

