document.addEventListener("DOMContentLoaded", () => {
  const backupBtn = document.getElementById("backupBtn");
  const restoreBtn = document.getElementById("restoreBtn");
  const restoreFile = document.getElementById("restoreFile");

  // 🔹 BACKUP FUNCTION
  backupBtn.addEventListener("click", () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "backup.json";
    a.click();

    URL.revokeObjectURL(url);
    alert("✅ Backup completed. File downloaded.");
  });

  // 🔹 RESTORE FUNCTION
  restoreBtn.addEventListener("click", () => {
    restoreFile.click();
  });

  restoreFile.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);

        for (const key in data) {
          localStorage.setItem(key, data[key]);
        }

        alert("✅ Restore completed. Data has been imported.");
      } catch (err) {
        alert("❌ Invalid file format.");
      }
    };
    reader.readAsText(file);
  });
});
