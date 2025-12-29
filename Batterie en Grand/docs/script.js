function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

if ('getBattery' in navigator) {
  navigator.getBattery().then(battery => {

    function updateBattery() {
      const level = Math.round(battery.level * 100);
      const percent = document.getElementById("percent");
      percent.textContent = level + "%";

      const leftFill = document.getElementById("leftFill");
      const rightFill = document.getElementById("rightFill");
      const bolt = document.getElementById("bolt");

      // ===== Si ça charge =====
      if (battery.charging) {
        leftFill.style.background = "#22c55e";
        bolt.style.display = "flex";
        percent.style.color = "#22c55e"; // % toujours vert
      } else {
        leftFill.style.background = "#ef4444";
        bolt.style.display = "none";

        // Couleur du % selon niveau
        let color = "#000000";
        if (level > 80) color = "#15803d";
        else if (level > 60) color = "#facc15";
        else if (level > 30) color = "#fb923c";
        else if (level > 10) color = "#dc2626";

        percent.style.color = color;
      }

      // ===== Batterie droite =====
      rightFill.style.height = level + "%";

      let rightColor = "#000000";
      if (level > 80) rightColor = "#15803d";
      else if (level > 60) rightColor = "#facc15";
      else if (level > 30) rightColor = "#fb923c";
      else if (level > 10) rightColor = "#dc2626";

      rightFill.style.background = rightColor;
    }

    updateBattery();
    battery.addEventListener("levelchange", updateBattery);
    battery.addEventListener("chargingchange", updateBattery);
  });
} else {
  document.getElementById("percent").textContent = "Non supporté";
}