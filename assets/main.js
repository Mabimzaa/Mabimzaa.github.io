// Lève le caviardage au clic / toucher (sur mobile il n'y a pas de survol).
document.querySelectorAll(".redact").forEach((el) => {
  el.addEventListener("click", () => {
    const open = el.classList.toggle("is-open");
    el.setAttribute("aria-expanded", open ? "true" : "false");
  });
});

// Année automatique dans le pied de page
const y = document.getElementById("year");
if (y) y.textContent = new Date().getFullYear();
