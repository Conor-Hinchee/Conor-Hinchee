const initBreadcrumb = () => {
  const breadcrumbNavButton = document.querySelector("#breadcrumbNavButton");

  breadcrumbNavButton.addEventListener("click", () => {
    const breadcrumbDropdown = document.querySelector("#breadcrumbNavDropdown");
    breadcrumbDropdown.classList.toggle("hidden");
  });
};

export default initBreadcrumb;
