const DEFAULT_BREADCRUMB = "navigate";

const hideJumpLinks = () => {
  const jumpLinks = document.querySelectorAll(".jumplink");
  jumpLinks.forEach((jumpLink) => {
    jumpLink.classList.add("hidden");
  });

  // show home link
  const breadcrumbNavHome = document.querySelector("#breadcrumbNavHome");
  breadcrumbNavHome.classList.remove("hidden");
  breadcrumbNavHome.classList.add("block");
};

const showExtraSeparator = () => {
  const breadcrumbNavExtraSeperator = document.querySelector(
    "#breadcrumb-Nav-Separator"
  );
  breadcrumbNavExtraSeperator.classList.remove("hidden");
  breadcrumbNavExtraSeperator.classList.add("block");
};

const showBreadcrumbBlog = () => {
  const breadcrumbNavBlog = document.querySelector("#breadcrumb-Nav-blog");
  breadcrumbNavBlog.classList.remove("hidden");
  breadcrumbNavBlog.classList.add("block");
  breadcrumbNavBlog.addEventListener("click", toggleBlogDropdown);
};

const handleBlogRouting = () => {
  const path = window.location.pathname;
  const searchParams = new URLSearchParams(window.location.search);
  
  if (path.includes("/blog/")) {
    if (!searchParams.has("post")) {
      const newUrl = "/blog?post=latest";
      window.history.replaceState({}, "", newUrl);
      return true; // indicate that redirect happened
    }
  }
  return false;
};

const updateBreadcrumb = () => {
  const breadcrumbNavButton = document.querySelector("#breadcrumbNavButton");
  const breadcrumbDropdown = document.querySelector("#breadcrumbNavDropdown");
  const path = window.location.pathname;
  const fullUrl = window.location.href;
  const id = fullUrl.split("#");

  if (id.length > 1) {
    breadcrumbNavButton.innerHTML = "#" + id[1];
    // TODO REPLACE WITH UPDATING THE MARGIN TOP OF THE DROPDOWN #breadcrumbBlogDropdown ?
    //patch placement of breadcrumb dropdown
    breadcrumbDropdown.style.bottom = "-500%";
  } else if (path !== "/") {
    breadcrumbNavButton.innerHTML = path.replaceAll("/", "");
    hideJumpLinks();
    //patch placement of breadcrumb dropdown
    breadcrumbDropdown.style.bottom = "-270%";

    if(path.includes("/blog/")){
      showExtraSeparator();
      showBreadcrumbBlog();
      handleBlogRouting();
    }
    
  } else {
    breadcrumbNavButton.innerHTML = DEFAULT_BREADCRUMB;
    //patch placement of breadcrumb dropdown
    breadcrumbDropdown.style.bottom = "-500%";
  }
};

const toggleMainDropDown = () => {
  const breadcrumbDropdown = document.querySelector("#breadcrumbNavDropdown");
  const body = document.querySelector("body");
  
  breadcrumbDropdown.classList.toggle("invisible");
  updateBreadcrumb();

  if (!breadcrumbDropdown.classList.contains("invisible")) {
    setTimeout(() => {
      const bodyListener = (e) => {
        if (!breadcrumbDropdown.contains(e.target)) {
          breadcrumbDropdown.classList.add("invisible");
          body.removeEventListener("click", bodyListener);
        }
      };
      body.addEventListener("click", bodyListener);
    }, 0);
  }
};

const toggleBlogDropdown = () => {
  const breadcrumbDropdown = document.querySelector("#breadcrumbBlogDropdown");
  // const body = document.querySelector("body");
  
  breadcrumbDropdown.classList.toggle("invisible");
  // updateBreadcrumb();

  // if (!breadcrumbDropdown.classList.contains("invisible")) {
  //   setTimeout(() => {
  //     const bodyListener = (e) => {
  //       if (!breadcrumbDropdown.contains(e.target)) {
  //         breadcrumbDropdown.classList.add("invisible");
  //         body.removeEventListener("click", bodyListener);
  //       }
  //     };
  //     body.addEventListener("click", bodyListener);
  //   }, 0);
  // }
};

const initBreadcrumb = () => {
  const breadcrumbNavButton = document.querySelector("#breadcrumbNavButton");

  updateBreadcrumb();
  breadcrumbNavButton.addEventListener("click", toggleMainDropDown);
};

export default initBreadcrumb;
