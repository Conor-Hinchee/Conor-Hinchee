/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/Home/js/blocking.js":
/*!*********************************!*\
  !*** ./src/Home/js/blocking.js ***!
  \*********************************/
/***/ (() => {

eval("// THIS IS A BLOCKING SCRIPT ANYTHING ADDED HERE WILL ADD TO THE PAGE LOAD TIME\nvar useDarkMode = function useDarkMode() {\n  document.documentElement.classList.add(\"dark\");\n  // localStorage.setItem(\"theme\", \"dark\");\n};\nvar useLightMode = function useLightMode() {\n  document.documentElement.classList.remove(\"dark\");\n  // localStorage.setItem(\"theme\", \"light\");\n};\nvar getOSPreference = function getOSPreference() {\n  var _window$matchMedia, _window;\n  return (_window$matchMedia = (_window = window).matchMedia) !== null && _window$matchMedia !== void 0 && _window$matchMedia.call(_window, \"(prefers-color-scheme: dark)\").matches ? \"dark\" : \"light\";\n};\nvar watchOSTheme = function watchOSTheme() {\n  var _window$matchMedia2, _window2;\n  (_window$matchMedia2 = (_window2 = window).matchMedia) === null || _window$matchMedia2 === void 0 ? void 0 : _window$matchMedia2.call(_window2, \"(prefers-color-scheme: dark)\").addEventListener(\"change\", function (e) {\n    if (!localStorage.getItem(\"theme\")) {\n      e.matches ? useDarkMode() : useLightMode();\n    }\n  });\n};\nvar initTheme = function initTheme() {\n  try {\n    if (localStorage.getItem(\"theme\") === \"dark\") {\n      useDarkMode();\n      return;\n    }\n    if (localStorage.getItem(\"theme\") === \"light\") {\n      useLightMode();\n      return;\n    }\n    if (window.matchMedia && !localStorage.getItem(\"theme\")) {\n      var osPreference = getOSPreference();\n      if (osPreference === \"dark\") {\n        useDarkMode();\n        return;\n      }\n      useLightMode();\n    }\n  } catch (e) {\n    console.error(\"Error initializing theme:\", e);\n    useLightMode();\n  }\n};\ninitTheme();\nwatchOSTheme();\n\n//# sourceURL=webpack://conorhinchee.com/./src/Home/js/blocking.js?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = {};
/******/ 	__webpack_modules__["./src/Home/js/blocking.js"]();
/******/ 	
/******/ })()
;