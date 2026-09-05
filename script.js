const toast = document.getElementById("toast");
const breadcrumbPage = document.getElementById("breadcrumbPage");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(window.toastTimer);
  window.toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2600);
}

function openPage(pageName) {
  const target = document.getElementById(pageName);
  if (!target) return;

  document.querySelectorAll(".app-page").forEach((page) => {
    page.classList.toggle("active-page", page.id === pageName);
  });

  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.page === pageName);
  });

  const activeNav = document.querySelector(`.nav-item[data-page="${pageName}"]`);
  breadcrumbPage.textContent = activeNav
    ? activeNav.textContent.replace(/[▦♧◫◇▤◷⌁⚙]/g, "").replace(/\d+/g, "").trim()
    : "Overview";

  if (window.innerWidth <= 650) {
    document.querySelector(".sidebar").style.display = "none";
  }
}

document.querySelectorAll(".nav-item").forEach((item) => {
  item.addEventListener("click", (event) => {
    event.preventDefault();
    openPage(item.dataset.page);
  });
});

document.querySelectorAll("[data-page-link]").forEach((button) => {
  button.addEventListener("click", () => openPage(button.dataset.pageLink));
});

document.querySelectorAll(".action-button").forEach((button) => {
  button.addEventListener("click", (event) => {
    const pageLink = event.currentTarget.dataset.pageLink;
    if (pageLink) {
      openPage(pageLink);
      return;
    }

    showToast(
      event.currentTarget.dataset.message ||
      "This workspace section is ready to connect"
    );
  });
});

document.querySelector(".mobile-menu").addEventListener("click", () => {
  const sidebar = document.querySelector(".sidebar");
  sidebar.style.display = sidebar.style.display === "flex" ? "none" : "flex";
});

window.addEventListener("resize", () => {
  if (window.innerWidth > 650) {
    document.querySelector(".sidebar").style.display = "flex";
  }
});