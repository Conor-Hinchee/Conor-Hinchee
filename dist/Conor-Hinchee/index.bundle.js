(() => {
  "use strict";
  var e = 768,
    t = 480,
    n = function (n) {
      return n > e
        ? "desktop"
        : n <= e && n > t
          ? "tablet"
          : n <= t
            ? "mobile"
            : void 0;
    },
    r = function () {
      var e,
        t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
        n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "",
        r = (
          (null == t || null === (e = t.target) || void 0 === e
            ? void 0
            : e.dataset) || ""
        ).setTheme;
      if ("dark" === n || "dark" === r) {
        document.documentElement.classList.add("dark"),
          localStorage.setItem("theme", "dark");
        var o = document.querySelector("#lightModeItem"),
          i = document.querySelector("#darkModeItem"),
          a = document.querySelector("main"),
          l = document.querySelectorAll(".OandI");
        a.classList.replace("bgGridWhite", "bgGridDark"),
          o.classList.contains("hidden") &&
            (o.classList.toggle("hidden"),
            o.classList.toggle("flex"),
            i.classList.toggle("hidden"),
            i.classList.toggle("flex")),
          l.length &&
            l.forEach(function (e) {
              e.classList.replace(
                "OandIAnimationLightMode",
                "OandIAnimationDarkMode",
              );
            });
      }
      if ("light" === n || "light" === r) {
        document.documentElement.classList.remove("dark"),
          localStorage.setItem("theme", "light");
        var c = document.querySelector("#lightModeItem"),
          s = document.querySelector("#darkModeItem"),
          d = document.querySelector("main"),
          u = document.querySelectorAll(".OandI");
        d.classList.replace("bgGridDark", "bgGridWhite"),
          s.classList.contains("hidden") &&
            (c.classList.toggle("hidden"),
            c.classList.toggle("flex"),
            s.classList.toggle("hidden"),
            s.classList.toggle("flex")),
          u.length &&
            u.forEach(function (e) {
              e.classList.replace(
                "OandIAnimationDarkMode",
                "OandIAnimationLightMode",
              );
            });
      }
    },
    o = function (e) {
      var t = document.querySelector("#desktopLayoutButton"),
        n = document.querySelector("#tabletLayoutButton"),
        r = document.querySelector("#mobileLayoutButton");
      "desktop" === e &&
        (t.setAttribute("aria-pressed", "true"),
        n.setAttribute("aria-pressed", "false"),
        r.setAttribute("aria-pressed", "false")),
        "tablet" === e &&
          (t.setAttribute("aria-pressed", "false"),
          n.setAttribute("aria-pressed", "true"),
          r.setAttribute("aria-pressed", "false")),
        "mobile" === e &&
          (t.setAttribute("aria-pressed", "false"),
          n.setAttribute("aria-pressed", "false"),
          r.setAttribute("aria-pressed", "true"));
    },
    i = function (r) {
      var o = window.innerWidth,
        i = n(o),
        a = o / r;
      r <= t && "mobile" === i && ((a = 1), d()),
        r <= e && "tablet" === i && ((a = 1), d()),
        r > e && "desktop" === i && ((a = 1), d()),
        (document.querySelector("#app").style.transform = "scale(" + a + ")");
    },
    a = function () {
      var e;
      clearTimeout(e),
        (e = setTimeout(function () {
          var e = window.innerWidth,
            t = n(e);
          o(t);
        }, 250));
    },
    l = function () {
      o("desktop"), i(1028);
    },
    c = function () {
      o("tablet"), i(e);
    },
    s = function () {
      o("mobile"), i(t);
    },
    d = function () {
      return window.removeEventListener("resize", a);
    };
  function u(e) {
    return (
      (u =
        "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
          ? function (e) {
              return typeof e;
            }
          : function (e) {
              return e &&
                "function" == typeof Symbol &&
                e.constructor === Symbol &&
                e !== Symbol.prototype
                ? "symbol"
                : typeof e;
            }),
      u(e)
    );
  }
  function m(e, t) {
    var n = Object.keys(e);
    if (Object.getOwnPropertySymbols) {
      var r = Object.getOwnPropertySymbols(e);
      t &&
        (r = r.filter(function (t) {
          return Object.getOwnPropertyDescriptor(e, t).enumerable;
        })),
        n.push.apply(n, r);
    }
    return n;
  }
  function y(e) {
    for (var t = 1; t < arguments.length; t++) {
      var n = null != arguments[t] ? arguments[t] : {};
      t % 2
        ? m(Object(n), !0).forEach(function (t) {
            f(e, t, n[t]);
          })
        : Object.getOwnPropertyDescriptors
          ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
          : m(Object(n)).forEach(function (t) {
              Object.defineProperty(
                e,
                t,
                Object.getOwnPropertyDescriptor(n, t),
              );
            });
    }
    return e;
  }
  function f(e, t, n) {
    return (
      (t = (function (e) {
        var t = (function (e, t) {
          if ("object" !== u(e) || null === e) return e;
          var n = e[Symbol.toPrimitive];
          if (void 0 !== n) {
            var r = n.call(e, "string");
            if ("object" !== u(r)) return r;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return String(e);
        })(e);
        return "symbol" === u(t) ? t : String(t);
      })(t)) in e
        ? Object.defineProperty(e, t, {
            value: n,
            enumerable: !0,
            configurable: !0,
            writable: !0,
          })
        : (e[t] = n),
      e
    );
  }
  var g = {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    },
    v = {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    },
    b = function () {
      var e = document.getElementById("consentBanner");
      (e.style.transitionDuration = "1.3s"), (e.style.opacity = "1");
    },
    p = function () {
      window.removeEventListener("scroll", h);
      var e = document.getElementById("consentBanner");
      (e.style.transitionDuration = ".5s"),
        (e.style.height = "250px"),
        (e.style.width = "100%");
      var t = document.getElementById("consentContent");
      (t.style.transitionDuration = "1.3s"),
        (t.style.display = "block"),
        (t.style.opacity = "1");
    },
    h = function () {
      var e;
      window.scrollY > 100 &&
        (((e =
          document.getElementById("consentBanner")).style.transitionDuration =
          "1.3s"),
        (e.style.width = "100%")),
        window.scrollY > 500 && p();
    },
    L = function (e) {
      (window.dataLayer = window.dataLayer || []), window.dataLayer.push(e);
    };
  function w(e) {
    return (
      (function (e) {
        if (Array.isArray(e)) return S(e);
      })(e) ||
      (function (e) {
        if (
          ("undefined" != typeof Symbol && null != e[Symbol.iterator]) ||
          null != e["@@iterator"]
        )
          return Array.from(e);
      })(e) ||
      (function (e, t) {
        if (e) {
          if ("string" == typeof e) return S(e, t);
          var n = Object.prototype.toString.call(e).slice(8, -1);
          return (
            "Object" === n && e.constructor && (n = e.constructor.name),
            "Map" === n || "Set" === n
              ? Array.from(e)
              : "Arguments" === n ||
                  /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                ? S(e, t)
                : void 0
          );
        }
      })(e) ||
      (function () {
        throw new TypeError(
          "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
        );
      })()
    );
  }
  function S(e, t) {
    (null == t || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
    return r;
  }
  var k = [],
    E = function () {
      var e = w(k);
      k.forEach(function (t, n) {
        var r = t.alive,
          o = t.age,
          i = (function (e) {
            var t = 0;
            return (
              e.forEach(function (e) {
                k[e].alive && t++;
              }),
              t
            );
          })(t.neighbors);
        r && i <= 1 && ((e[n].alive = !1), (e[n].age = -1)),
          r && i < 1 && i < 4 && (e[n].age = o + 1),
          r && i > 3 && ((e[n].alive = !1), (e[n].age = -1)),
          r || 3 !== i || ((e[n].alive = !0), (e[n].age = 0)),
          r || -1 !== o || (e[n].age = 0);
      }),
        (k = w(e)).forEach(function (e) {
          var t = e.alive,
            n = e.age,
            r = e.domItem;
          t ||
            -1 !== n ||
            (r.classList.remove("worm"), r.classList.add("skull")),
            t || -1 === n || r.classList.remove("skull"),
            t && (r.classList.remove("skull"), r.classList.add("worm"));
        });
    };
  var I, O, q, A, B, j;
  (function () {
    var e = localStorage.getItem("theme");
    r(null, e);
    var t = window.innerWidth,
      i = n(t);
    o(i),
      (function () {
        document
          .querySelector("#editPageButton")
          .addEventListener("click", function () {});
        var e = document.querySelector("#desktopLayoutButton"),
          t = document.querySelector("#tabletLayoutButton"),
          n = document.querySelector("#mobileLayoutButton");
        e.addEventListener("click", l),
          t.addEventListener("click", c),
          n.addEventListener("click", s),
          document
            .querySelector("#darkModeItem")
            .firstElementChild.addEventListener("click", r),
          document
            .querySelector("#lightModeItem")
            .firstElementChild.addEventListener("click", r);
      })(),
      window.addEventListener("resize", a);
  })(),
    document
      .querySelector("#breadcrumbNavButton")
      .addEventListener("click", function () {
        var e = document.querySelector("#breadcrumbNavDropdown");
        console.log(document.querySelector("#breadcrumbNavDropdown").classList),
          e.classList.toggle("hidden");
      }),
    document.querySelector(".hex").addEventListener("click", function () {
      document.querySelector(".hex").classList.toggle("rotateHex");
    }),
    (function () {
      window.dataLayer = window.dataLayer || [];
      var e = localStorage.getItem("gtagConsent");
      if (null !== e) {
        var t = JSON.parse(e);
        return console.log("consent", t), void L("consent", y({}, t));
      }
      L("consent", y({}, g)), window.addEventListener("scroll", h);
      var n = document.querySelector("#consentBanner");
      setTimeout(b, 1e3),
        n.addEventListener("click", function () {
          p();
        }),
        document
          .getElementById("cookieConsent")
          .addEventListener("click", function () {
            L("consent", y({}, v)),
              localStorage.setItem("gtagConsent", JSON.stringify(v)),
              (n.style.display = "none");
          }),
        document
          .getElementById("cookieDecline")
          .addEventListener("click", function () {
            L("consent", y({}, g)),
              localStorage.setItem("gtagConsent", JSON.stringify(g)),
              (n.style.display = "none");
          });
    })(),
    document.querySelector("#gameOfLife") &&
      ((O = document.querySelector("#gameOfLife")),
      (q = O.clientHeight),
      (A = O.clientWidth),
      (B = Math.floor(q / 25 + 2)),
      (j = Math.floor(A / 25)),
      (I = new Uint8Array(B * j)),
      self.crypto.getRandomValues(I),
      I.forEach(function (e) {
        k.push({ alive: e % 2 == 0, age: 0, domItem: null, neighbors: [] });
      }),
      k.forEach(function (e, t) {
        var n = document.createElement("div");
        (n.style.width = "".concat(25, "px")),
          (n.style.height = "".concat(25, "px")),
          (n.style.backgroundColor = "white"),
          (n.style.border = "1px solid black"),
          (n.style.flexGrow = "0"),
          (n.style.flexShrink = "0");
        var r = e.alive ? "worm" : "skull";
        n.classList.add(r),
          (e.domItem = n),
          (e.neighbors = w(
            (function (e, t, n) {
              var r = n - 1,
                o = n * t - n,
                i = n * t - 1;
              return 0 === e
                ? [e + 1, r, r + 1, r + 2, r + n, o, i]
                : e === r
                  ? [0, e + 1, e + 1 + n, e + 1 + n - 1, e - 1, i - 1, i, o]
                  : e === o
                    ? [e + 1, 1, 0, r, i, e - 1, e - n, e - n + 1]
                    : e === i
                      ? [o, 0, r, r - 1, e - 1, e - n - 1, e - n, e - n - n + 1]
                      : e > 0 && e < r
                        ? [
                            e + 1,
                            e + 1 + n,
                            e + n,
                            e - 1 + n,
                            e - 1,
                            i - (n - (e - 1)),
                            i - (n - e),
                            i - (n - (e + 1)),
                          ]
                        : e % n == 0
                          ? [
                              e + 1,
                              e + 1 + n,
                              e + n,
                              e + n + n - 1,
                              e + n - 1,
                              e - 1,
                              e - 1 - n + 1,
                              e - 1 - n + 2,
                            ]
                          : (e - r) % n == 0
                            ? [
                                e - n + 1,
                                e + n,
                                e + n - 1,
                                e - 1,
                                e - 1 - n,
                                e - n,
                                e + 1,
                                e - n - n + 2,
                              ]
                            : e > o
                              ? [
                                  e + 1,
                                  e - (e + 1 - n),
                                  e - 1 - (e + 1 - n),
                                  e - 2 - (e + 1 - n),
                                  e - 1,
                                  e - n - 1,
                                  e - n,
                                  e - n + 1,
                                ]
                              : [
                                  e + 1,
                                  e + n,
                                  e + n - 1,
                                  e + n - 2,
                                  e - 1,
                                  e - 1 - n,
                                  e - n,
                                  e - n + 1,
                                ];
            })(t, B, j),
          )),
          O.appendChild(n);
      }),
      setInterval(E, 1e3));
})();
