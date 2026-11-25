// Año del footer
document.getElementById("year").textContent = new Date().getFullYear();

// Tema claro/oscuro (se recuerda en el navegador)
const root = document.documentElement;
const toggle = document.getElementById("theme-toggle");

try {
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
} catch (_) {}

toggle.addEventListener("click", () => {
  const isDark =
    root.dataset.theme === "dark" ||
    (!root.dataset.theme && matchMedia("(prefers-color-scheme: dark)").matches);
  root.dataset.theme = isDark ? "light" : "dark";
  try { localStorage.setItem("theme", root.dataset.theme); } catch (_) {}
});
