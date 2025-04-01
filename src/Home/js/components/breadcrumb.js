const DEFAULT_BREADCRUMB = "navigate";

// TODO RENAME FUNCTION
const hideJumpLinks = () => {
  const jumpLinks = document.querySelectorAll(".jumplink");
  jumpLinks.forEach((jumpLink) => {
    jumpLink.classList.add("hidden");
  });

  // show home link
  const breadcrumbNavHome = document.querySelector("#breadcrumbNavHome");
  breadcrumbNavHome.classList.remove("hidden");
};

const updateBreadcrumb = () => {
  const breadcrumbNavButton = document.querySelector("#breadcrumbNavButton");
  const breadcrumbDropdown = document.querySelector("#breadcrumbNavDropdown");
  const path = window.location.pathname;
  const fullUrl = window.location.href;
  const id = fullUrl.split("#");

  if (id.length > 1) {
    breadcrumbNavButton.innerHTML = "#" + id[1];
    //patch placement of breadcrumb dropdown
    breadcrumbDropdown.style.bottom = "-500%";
  } else if (path !== "/") {
    breadcrumbNavButton.innerHTML = path.replaceAll("/", "");
    hideJumpLinks();
    //patch placement of breadcrumb dropdown
    breadcrumbDropdown.style.bottom = "-270%";
  } else {
    breadcrumbNavButton.innerHTML = DEFAULT_BREADCRUMB;
    //patch placement of breadcrumb dropdown
    breadcrumbDropdown.style.bottom = "-500%";
  }
};

const initBreadcrumb = () => {
  const breadcrumbNavButton = document.querySelector("#breadcrumbNavButton");
  const breadcrumbDropdown = document.querySelector("#breadcrumbNavDropdown");

  updateBreadcrumb();

  breadcrumbNavButton.addEventListener("click", () => {
    breadcrumbDropdown.classList.toggle("invisible");
    updateBreadcrumb();
  });
};

export default initBreadcrumb;
