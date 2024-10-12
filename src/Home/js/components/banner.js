const Desktop_Width = 1028;
const Tablet_Width = 768;
const Mobile_Width = 480;

// const getDeviceType = (screenWidth) => {
//     if (screenWidth > Tablet_Width) {
//         return "desktop";
//     } else if (screenWidth <= Tablet_Width && screenWidth > Mobile_Width) {
//         return "tablet";
//     } else if (screenWidth <= Mobile_Width) {
//         return "mobile";
//     }
// };

const changeTheme = (event = {}, override = "") => {
    const { setTheme } = event?.target?.dataset || "";

    if (override === "dark" || setTheme === "dark") {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");

        // set the theme to dark, reverse the icon to light
        const lightModeItem = document.querySelector("#lightModeItem");
        const darkModeItem = document.querySelector("#darkModeItem");
        const mainElement = document.querySelector("main");
        const allOandI = document.querySelectorAll(".OandI");

        mainElement.classList.replace("bgGridWhite", "bgGridDark");

        if (lightModeItem.classList.contains("hidden")) {
            lightModeItem.classList.toggle("hidden");
            lightModeItem.classList.toggle("flex");
            darkModeItem.classList.toggle("hidden");
            darkModeItem.classList.toggle("flex");
        }

        if (allOandI.length) {
            allOandI.forEach((oAndI) => {
                oAndI.classList.replace(
                    "OandIAnimationLightMode",
                    "OandIAnimationDarkMode",
                );
            });
        }
    }

    if (override === "light" || setTheme === "light") {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");

        // set the theme to light, reverse the icon to dark
        const lightModeItem = document.querySelector("#lightModeItem");
        const darkModeItem = document.querySelector("#darkModeItem");
        const mainElement = document.querySelector("main");
        const allOandI = document.querySelectorAll(".OandI");

        mainElement.classList.replace("bgGridDark", "bgGridWhite");

        if (darkModeItem.classList.contains("hidden")) {
            lightModeItem.classList.toggle("hidden");
            lightModeItem.classList.toggle("flex");
            darkModeItem.classList.toggle("hidden");
            darkModeItem.classList.toggle("flex");
        }

        if (allOandI.length) {
            allOandI.forEach((oAndI) => {
                oAndI.classList.replace(
                    "OandIAnimationDarkMode",
                    "OandIAnimationLightMode",
                );
            });
        }
    }
};

const setLayoutIconAriaPressed = (layout) => {
    const desktopLayoutButton = document.querySelector("#desktopLayoutButton");
    const tabletLayoutButton = document.querySelector("#tabletLayoutButton");
    const mobileLayoutButton = document.querySelector("#mobileLayoutButton");

    if (layout === "desktop") {
        desktopLayoutButton.setAttribute("aria-pressed", "true");
        tabletLayoutButton.setAttribute("aria-pressed", "false");
        mobileLayoutButton.setAttribute("aria-pressed", "false");
    }
    if (layout === "tablet") {
        desktopLayoutButton.setAttribute("aria-pressed", "false");
        tabletLayoutButton.setAttribute("aria-pressed", "true");
        mobileLayoutButton.setAttribute("aria-pressed", "false");
    }
    if (layout === "mobile") {
        desktopLayoutButton.setAttribute("aria-pressed", "false");
        tabletLayoutButton.setAttribute("aria-pressed", "false");
        mobileLayoutButton.setAttribute("aria-pressed", "true");
    }
};

const showFrame = () => {
    const app = document.querySelector("#app");
    const frame = document.querySelector("#frame");

    // fade the opacity of the app to zero using CSS transitions
    app.style.transition = "opacity 1s ease-out";
    app.style.opacity = 0;

    frame.style.opacity = 0;
    frame.classList.toggle("hidden");
    frame.style.transition = "opacity 2s ease-in";
    frame.style.opacity = 1;
    // fadeOut();
};

const generateFrame = () => {
    showFrame();

    // const app = document.querySelector("#app");
    // app.style.display = "none";
    // // console.log(nextScale);

    // const iframe = document.createElement("iframe");
    // iframe.src = "https://conorhinchee.com/";
    // // iframe.style.width = "100%";
    // iframe.style.width = Tablet_Width + "px";
    // iframe.style.height = "100%";
    // iframe.style.border = "none"; // Optional: Remove border for a cleaner look

    // const main = document.querySelector("main");
    // main.appendChild(iframe);
    // app.style.display = "block"; // Make sure the app is visible again

    //   app.style.transform = "scale(" + nextScale + ")";
};

// const resizeHandler = () => {
//     let resizeTimer;
//     clearTimeout(resizeTimer);
//     resizeTimer = setTimeout(() => {
//         const screenWidth = window.innerWidth;
//         const deviceType = getDeviceType(screenWidth);
//         setLayoutIconAriaPressed(deviceType);
//     }, 250);
// };

const handleDesktopIconClick = () => {
    setLayoutIconAriaPressed("desktop");
    generateFrame(Desktop_Width);
};

const handleTabletIconClick = () => {
    setLayoutIconAriaPressed("tablet");
    generateFrame(Tablet_Width);
};

const handleMobileIconClick = () => {
    setLayoutIconAriaPressed("mobile");
    generateFrame(Mobile_Width);
};

// const resizeListener = () => window.addEventListener("resize", resizeHandler);

// const removeResizeListener = () =>
//     window.removeEventListener("resize", resizeHandler);

const setClickListeners = () => {
    const editPageButton = document.querySelector("#editPageButton");
    editPageButton.addEventListener("click", () => { });

    const desktopLayoutButton = document.querySelector("#desktopLayoutButton");
    const tabletLayoutButton = document.querySelector("#tabletLayoutButton");
    const mobileLayoutButton = document.querySelector("#mobileLayoutButton");

    desktopLayoutButton.addEventListener("click", handleDesktopIconClick);
    tabletLayoutButton.addEventListener("click", handleTabletIconClick);
    mobileLayoutButton.addEventListener("click", handleMobileIconClick);

    const darkModeItem = document.querySelector("#darkModeItem");
    const darkModeButton = darkModeItem.firstElementChild;
    darkModeButton.addEventListener("click", changeTheme);

    const lightModeItem = document.querySelector("#lightModeItem");
    const lightModeButton = lightModeItem.firstElementChild;
    lightModeButton.addEventListener("click", changeTheme);
};

const hideBanner = () => {
    const banner = document.querySelector("header");
    banner.style.display = "none";
};

const initBanner = () => {
    const currentTheme = localStorage.getItem("theme");
    changeTheme(null, currentTheme);

    const urlParams = new URLSearchParams(window.location.search);
    const isIframe = urlParams.get("iframe") === "true";

    if (isIframe) {
        hideBanner();
    } else {
        setClickListeners();
    }

    // initial screen width
    // const screenWidth = window.innerWidth;

    // const deviceType = getDeviceType(screenWidth);
    // setLayoutIconAriaPressed(deviceType);


    // resizeListener();
};

export default initBanner;
