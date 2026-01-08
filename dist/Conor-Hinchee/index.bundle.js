(() => {
  "use strict";
  var e = function () {
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
        c = document.querySelectorAll(".OandI");
      a.classList.replace("bgGridWhite", "bgGridDark"),
        o.classList.contains("hidden") &&
          (o.classList.toggle("hidden"),
          o.classList.toggle("flex"),
          i.classList.toggle("hidden"),
          i.classList.toggle("flex")),
        c.length &&
          c.forEach(function (e) {
            e.classList.replace(
              "OandIAnimationLightMode",
              "OandIAnimationDarkMode",
            );
          });
    }
    if ("light" === n || "light" === r) {
      document.documentElement.classList.remove("dark"),
        localStorage.setItem("theme", "light");
      var l = document.querySelector("#lightModeItem"),
        s = document.querySelector("#darkModeItem"),
        d = document.querySelector("main"),
        u = document.querySelectorAll(".OandI");
      d.classList.replace("bgGridDark", "bgGridWhite"),
        s.classList.contains("hidden") &&
          (l.classList.toggle("hidden"),
          l.classList.toggle("flex"),
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
    window.location.href.includes("blog") && r && window.location.reload();
  };
  var t = function () {
      var e,
        t,
        n = document.querySelector("#breadcrumbNavButton"),
        o = window.location.pathname,
        i = window.location.href.split("#");
      i.length > 1
        ? (n.innerHTML = "#" + i[1])
        : "/" !== o
          ? ((n.innerHTML = o.replaceAll("/", "")),
            (function () {
              document.querySelectorAll(".jumplink").forEach(function (e) {
                e.classList.add("hidden");
              });
              var e = document.querySelector("#breadcrumbNavHome");
              e.classList.remove("hidden"), e.classList.add("block");
            })(),
            o.includes("/blog/") &&
              ((t = document.querySelector(
                "#breadcrumb-Nav-Separator",
              )).classList.remove("hidden"),
              t.classList.add("block"),
              (e = document.querySelector(
                "#breadcrumb-Nav-blog",
              )).classList.remove("hidden"),
              e.classList.add("block"),
              e.addEventListener("click", r),
              (function () {
                var e = window.location.pathname,
                  t = new URLSearchParams(window.location.search);
                if (e.includes("/blog/") && !t.has("post"))
                  window.history.replaceState({}, "", "/blog?post=latest");
              })()))
          : (n.innerHTML = "navigate");
    },
    n = function () {
      var e = document.querySelector("#breadcrumbNavDropdown"),
        n = document.querySelector("body");
      e.classList.toggle("invisible"),
        t(),
        e.classList.contains("invisible") ||
          setTimeout(function () {
            n.addEventListener("click", function t(r) {
              e.contains(r.target) ||
                (e.classList.add("invisible"),
                n.removeEventListener("click", t));
            });
          }, 0);
    },
    r = function () {
      document
        .querySelector("#breadcrumbBlogDropdown")
        .classList.toggle("invisible");
    };
  var o =
      "localhost" === window.location.hostname ||
      document.cookie.includes("debug=true"),
    i = function (e) {
      var t = e.logLevel,
        n = void 0 === t ? "info" : t,
        r = e.message,
        i = n,
        a = JSON.stringify(r);
      ["log", "info", "warn", "error"].includes(n) || (i = "info"),
        "error" !== i ? o && console[i](a) : console.error(a);
    };
  function a(e) {
    return (
      (a =
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
      a(e)
    );
  }
  function c(e, t) {
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
  function l(e, t, n) {
    return (
      (t = (function (e) {
        var t = (function (e) {
          if ("object" !== a(e) || null === e) return e;
          var t = e[Symbol.toPrimitive];
          if (void 0 !== t) {
            var n = t.call(e, "string");
            if ("object" !== a(n)) return n;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return String(e);
        })(e);
        return "symbol" === a(t) ? t : String(t);
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
  function s(e, t) {
    if (e) {
      if ("string" == typeof e) return d(e, t);
      var n = Object.prototype.toString.call(e).slice(8, -1);
      return (
        "Object" === n && e.constructor && (n = e.constructor.name),
        "Map" === n || "Set" === n
          ? Array.from(e)
          : "Arguments" === n ||
              /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
            ? d(e, t)
            : void 0
      );
    }
  }
  function d(e, t) {
    (null == t || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
    return r;
  }
  var u = "cookie-consent",
    f = 180,
    m = {
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      analytics_storage: "denied",
    },
    y = {
      ad_storage: "granted",
      ad_user_data: "granted",
      ad_personalization: "granted",
      analytics_storage: "granted",
    },
    v = function (e, t, n) {
      var r = new Date(Date.now() + 864e5 * n).toUTCString();
      document.cookie = ""
        .concat(e, "=")
        .concat(encodeURIComponent(JSON.stringify(t)), "; expires=")
        .concat(r, "; path=/; SameSite=Lax");
    },
    g = function (e) {
      (window.dataLayer = window.dataLayer || []),
        window.dataLayer.push(
          (function (e) {
            for (var t = 1; t < arguments.length; t++) {
              var n = null != arguments[t] ? arguments[t] : {};
              t % 2
                ? c(Object(n), !0).forEach(function (t) {
                    l(e, t, n[t]);
                  })
                : Object.getOwnPropertyDescriptors
                  ? Object.defineProperties(
                      e,
                      Object.getOwnPropertyDescriptors(n),
                    )
                  : c(Object(n)).forEach(function (t) {
                      Object.defineProperty(
                        e,
                        t,
                        Object.getOwnPropertyDescriptor(n, t),
                      );
                    });
            }
            return e;
          })({ event: "consent_update" }, e),
        ),
        i({
          logLevel: "info",
          message: "Pushed consent update to GTM: ".concat(JSON.stringify(e)),
        });
    },
    b = function () {
      var e = document.getElementById("consentBanner");
      (e.style.transitionDuration = "1s"),
        (e.style.opacity = "1"),
        e.addEventListener(
          "transitionend",
          function () {
            var t = new Event("consentBannerBar");
            e.dispatchEvent(t);
          },
          { once: !0 },
        );
    },
    p = function () {
      var e = document.getElementById("consentBanner"),
        t = document.getElementById("consentTitle");
      (e.style.transition =
        "height 0.5s ease-in-out, background-color 0.3s, color 0.3s, border-color 0.3s"),
        (t.style.transitionDuration = "0.2s"),
        (t.style.opacity = "0"),
        (e.style.height = "250px"),
        (E = !0),
        I(),
        e.addEventListener(
          "transitionend",
          function () {
            var t = new Event("consentBannerFull");
            e.dispatchEvent(t);
          },
          { once: !0 },
        );
    },
    h = window.scrollY,
    w = !1,
    S = !1,
    L = document.documentElement.classList.contains("dark"),
    E = !1,
    O = function () {
      var e = document.getElementById("consentBanner");
      (e.style.backgroundColor = "black"),
        (e.style.color = "white"),
        (e.style.borderColor = "white"),
        (w = !1);
    },
    k = function () {
      var e = document.getElementById("consentBanner");
      (e.style.backgroundColor = "white"),
        (e.style.color = "black"),
        (e.style.borderColor = "black"),
        (w = !0);
    },
    I = function () {
      (L = document.documentElement.classList.contains("dark")) ? O() : k();
    },
    j = function () {
      (L = document.documentElement.classList.contains("dark")) ? k() : O();
    },
    q = function () {
      if (!E) {
        var e = window.scrollY,
          t = e > h;
        (h = e),
          (L = document.documentElement.classList.contains("dark")),
          t ? (e > 400 || S) && (j(), (S = !0)) : (L ? w : !w) && I();
      }
    },
    B = function e() {
      window.scrollY > 200 &&
        (b(),
        window.removeEventListener("scroll", e),
        window.scrollY > 400 ? (j(), (S = !0)) : I(),
        window.addEventListener("scroll", q));
    },
    P = function (e) {
      i({
        logLevel: "info",
        message: "EVENT CONDUCTOR STEVE 🗣️ : Consent Banner State = ".concat(
          e.type,
        ),
      }),
        "consentBannerFull" === e.type &&
          (function () {
            document.getElementById("consentTitle").style.display = "none";
            var e = document.getElementById("consentContent");
            e.classList.remove("hidden"),
              (e.style.transition = "opacity 0.4s ease-in"),
              (e.style.opacity = "1");
          })();
    };
  function A(e) {
    return (
      (A =
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
      A(e)
    );
  }
  function C(e, t) {
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
  function D(e, t, n) {
    return (
      (t = (function (e) {
        var t = (function (e) {
          if ("object" !== A(e) || null === e) return e;
          var t = e[Symbol.toPrimitive];
          if (void 0 !== t) {
            var n = t.call(e, "string");
            if ("object" !== A(n)) return n;
            throw new TypeError("@@toPrimitive must return a primitive value.");
          }
          return String(e);
        })(e);
        return "symbol" === A(t) ? t : String(t);
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
  function M(e, t) {
    (null == t || t > e.length) && (t = e.length);
    for (var n = 0, r = new Array(t); n < t; n++) r[n] = e[n];
    return r;
  }
  var x = [],
    N = function () {
      var e,
        t = document.querySelector("#gameOfLife"),
        n = t.clientHeight,
        r = t.clientWidth,
        o = Math.floor(n / 10 + 2),
        i = Math.floor(r / 10);
      (e = new Uint8Array(o * i)),
        self.crypto.getRandomValues(e),
        e.forEach(function (e) {
          x.push({ alive: e % 4 == 0, age: 0, domItem: null, neighbors: [] });
        }),
        x.forEach(function (e, n) {
          var r = document.createElement("div");
          (r.style.width = "".concat(10, "px")),
            (r.style.height = "".concat(10, "px")),
            (r.style.backgroundColor = "white"),
            (r.style.border = "1px solid black"),
            (r.style.flexGrow = "0"),
            (r.style.flexShrink = "0");
          var a,
            c = e.alive ? "worm" : "skull";
          r.classList.add(c),
            (e.domItem = r),
            (e.neighbors =
              ((a = (function (e, t, n) {
                for (
                  var r = Math.floor(e / n), o = e % n, i = [], a = -1;
                  a <= 1;
                  a++
                )
                  for (var c = -1; c <= 1; c++)
                    if (0 !== a || 0 !== c) {
                      var l = ((r + a + t) % t) * n + ((o + c + n) % n);
                      i.push(l);
                    }
                return i;
              })(n, o, i)),
              (function (e) {
                if (Array.isArray(e)) return M(e);
              })(a) ||
                (function (e) {
                  if (
                    ("undefined" != typeof Symbol &&
                      null != e[Symbol.iterator]) ||
                    null != e["@@iterator"]
                  )
                    return Array.from(e);
                })(a) ||
                (function (e, t) {
                  if (e) {
                    if ("string" == typeof e) return M(e, t);
                    var n = Object.prototype.toString.call(e).slice(8, -1);
                    return (
                      "Object" === n &&
                        e.constructor &&
                        (n = e.constructor.name),
                      "Map" === n || "Set" === n
                        ? Array.from(e)
                        : "Arguments" === n ||
                            /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                          ? M(e, t)
                          : void 0
                    );
                  }
                })(a) ||
                (function () {
                  throw new TypeError(
                    "Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
                  );
                })())),
            t.appendChild(r);
        });
    },
    T = function () {
      var e = x.map(function (e) {
        return (function (e) {
          for (var t = 1; t < arguments.length; t++) {
            var n = null != arguments[t] ? arguments[t] : {};
            t % 2
              ? C(Object(n), !0).forEach(function (t) {
                  D(e, t, n[t]);
                })
              : Object.getOwnPropertyDescriptors
                ? Object.defineProperties(
                    e,
                    Object.getOwnPropertyDescriptors(n),
                  )
                : C(Object(n)).forEach(function (t) {
                    Object.defineProperty(
                      e,
                      t,
                      Object.getOwnPropertyDescriptor(n, t),
                    );
                  });
          }
          return e;
        })({}, e);
      });
      x.forEach(function (t, n) {
        var r = t.alive,
          o = t.age,
          i = (function (e) {
            var t = 0;
            return (
              e.forEach(function (e) {
                x[e].alive && t++;
              }),
              t
            );
          })(t.neighbors);
        r
          ? i < 2 || i > 3
            ? ((e[n].alive = !1), (e[n].age = -1))
            : (e[n].age = o + 1)
          : 3 === i
            ? ((e[n].alive = !0), (e[n].age = 0))
            : -1 === o && (e[n].age = 0);
      }),
        (x = e),
        console.log("painting board"),
        x.forEach(function (e) {
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
  var _, J, U;
  (U = localStorage.getItem("theme")),
    e(null, U),
    "true" === new URLSearchParams(window.location.search).get("iframe")
      ? (document.querySelector("header").style.display = "none")
      : (document
          .querySelector("#darkModeItem")
          .firstElementChild.addEventListener("click", e),
        document
          .querySelector("#lightModeItem")
          .firstElementChild.addEventListener("click", e)),
    (J = document.querySelector("#breadcrumbNavButton")),
    t(),
    J.addEventListener("click", n),
    null === (_ = document.querySelector(".hex")) ||
      void 0 === _ ||
      _.addEventListener("click", function () {
        document.querySelector(".hex").classList.toggle("rotateHex");
      }),
    (function () {
      window.dataLayer = window.dataLayer || [];
      var e = (function (e) {
        var t,
          n,
          r,
          o = (function (e) {
            var t =
              ("undefined" != typeof Symbol && e[Symbol.iterator]) ||
              e["@@iterator"];
            if (!t) {
              if (Array.isArray(e) || (t = s(e))) {
                t && (e = t);
                var n = 0,
                  r = function () {};
                return {
                  s: r,
                  n: function () {
                    return n >= e.length
                      ? { done: !0 }
                      : { done: !1, value: e[n++] };
                  },
                  e: function (e) {
                    throw e;
                  },
                  f: r,
                };
              }
              throw new TypeError(
                "Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
              );
            }
            var o,
              i = !0,
              a = !1;
            return {
              s: function () {
                t = t.call(e);
              },
              n: function () {
                var e = t.next();
                return (i = e.done), e;
              },
              e: function (e) {
                (a = !0), (o = e);
              },
              f: function () {
                try {
                  i || null == t.return || t.return();
                } finally {
                  if (a) throw o;
                }
              },
            };
          })(document.cookie.split("; "));
        try {
          for (o.s(); !(t = o.n()).done; ) {
            var i =
                ((n = t.value.split("=")),
                (r = 2),
                (function (e) {
                  if (Array.isArray(e)) return e;
                })(n) ||
                  (function (e, t) {
                    var n =
                      null == e
                        ? null
                        : ("undefined" != typeof Symbol &&
                            e[Symbol.iterator]) ||
                          e["@@iterator"];
                    if (null != n) {
                      var r,
                        o,
                        i,
                        a,
                        c = [],
                        l = !0,
                        s = !1;
                      try {
                        if (((i = (n = n.call(e)).next), 0 === t)) {
                          if (Object(n) !== n) return;
                          l = !1;
                        } else
                          for (
                            ;
                            !(l = (r = i.call(n)).done) &&
                            (c.push(r.value), c.length !== t);
                            l = !0
                          );
                      } catch (e) {
                        (s = !0), (o = e);
                      } finally {
                        try {
                          if (
                            !l &&
                            null != n.return &&
                            ((a = n.return()), Object(a) !== a)
                          )
                            return;
                        } finally {
                          if (s) throw o;
                        }
                      }
                      return c;
                    }
                  })(n, r) ||
                  s(n, r) ||
                  (function () {
                    throw new TypeError(
                      "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
                    );
                  })()),
              a = i[0],
              c = i[1];
            if (a === e) return JSON.parse(decodeURIComponent(c));
          }
        } catch (e) {
          o.e(e);
        } finally {
          o.f();
        }
        return null;
      })(u);
      if (e)
        return (
          i({
            logLevel: "info",
            message: "Loaded consent from cookie: ".concat(JSON.stringify(e)),
          }),
          localStorage.setItem("trackConsent", JSON.stringify(e)),
          void g(e)
        );
      var t = localStorage.getItem("trackConsent");
      if (null !== t) {
        var n = JSON.parse(t);
        return v(u, n, f), void g(n);
      }
      if (
        (v(u, m, f),
        g(m),
        (function () {
          var e = document.querySelector("#consentBanner");
          document
            .getElementById("cookieConsent")
            .addEventListener("click", function () {
              v(u, y, f),
                localStorage.setItem("trackConsent", JSON.stringify(y)),
                g(y),
                (e.style.display = "none");
            }),
            document
              .getElementById("cookieDecline")
              .addEventListener("click", function () {
                v(u, m, f),
                  localStorage.setItem("trackConsent", JSON.stringify(m)),
                  g(m),
                  (e.style.display = "none");
              }),
            e.addEventListener("click", p),
            e.addEventListener("consentBannerBar", P),
            e.addEventListener("consentBannerFull", P);
        })(),
        window.scrollY > 200)
      )
        return (
          b(),
          window.scrollY > 400 ? (j(), (S = !0)) : I(),
          void window.addEventListener("scroll", q)
        );
      window.addEventListener("scroll", B);
    })(),
    document.querySelector("#gameOfLife") && (N(), setInterval(T, 250));
})();
