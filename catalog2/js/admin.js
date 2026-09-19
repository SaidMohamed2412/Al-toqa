// =========================================================
// FURNITURE ADMIN SYSTEM
// =========================================================

"use strict";


// =========================================================
// DARK MODE
// =========================================================

(function initTheme() {

    const savedTheme =
        localStorage.getItem("adminTheme");

    if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
    }

})();


// =========================================================
// UPDATE THEME BUTTON
// =========================================================

const ICON_MOON =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>';

const ICON_SUN =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

function updateThemeButtons() {

    const buttons =
        document.querySelectorAll(".theme-btn");

    const isDark =
        document.documentElement.classList.contains("dark");

    buttons.forEach(function (button) {

        button.innerHTML =
            isDark ? ICON_SUN : ICON_MOON;

        button.setAttribute(
            "aria-label",
            isDark
                ? "تفعيل الوضع الفاتح"
                : "تفعيل الوضع الداكن"
        );

        button.setAttribute(
            "title",
            isDark
                ? "تفعيل الوضع الفاتح"
                : "تفعيل الوضع الداكن"
        );

    });

}


// =========================================================
// TOGGLE THEME
// =========================================================

function toggleTheme() {

    const html =
        document.documentElement;

    const isDark =
        html.classList.toggle("dark");

    localStorage.setItem(
        "adminTheme",
        isDark ? "dark" : "light"
    );

    updateThemeButtons();

}


// =========================================================
// LOGIN
// =========================================================

function initLogin() {

    const loginForm =
        document.getElementById("loginForm");

    const loginError =
        document.getElementById("loginError");

    if (!loginForm) {
        return;
    }

    const expiredMessage = sessionStorage.getItem("adminLoginMessage");
    if (expiredMessage && loginError) {
        loginError.textContent = expiredMessage;
        loginError.classList.add("show");
        sessionStorage.removeItem("adminLoginMessage");
    }


    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const usernameInput =
                document.getElementById("username");

            const passwordInput =
                document.getElementById("password");


            const username =
                usernameInput
                    ? usernameInput.value.trim()
                    : "";

            const password =
                passwordInput
                    ? passwordInput.value
                    : "";


            // =================================================
            // REAL SERVER LOGIN
            // =================================================

            try {
                const result = await window.apiRequest("/api/auth/login", {
                    method: "POST",
                    body: JSON.stringify({ username, password })
                });

                localStorage.setItem("adminToken", result.token);
                localStorage.setItem("adminLoggedIn", "true");

                if (loginError) loginError.classList.remove("show");
                window.location.href = "dashboard.html";
                return;
            } catch (error) {
                console.error(error);
            }

            // =================================================
            // WRONG LOGIN
            // =================================================

            if (loginError) {

                loginError.classList.add(
                    "show"
                );

            }


            if (passwordInput) {

                passwordInput.focus();

            }

        }
    );

}


// =========================================================
// SHOW / HIDE PASSWORD
// =========================================================

function initPasswordToggle() {

    const togglePassword =
        document.getElementById(
            "togglePassword"
        );

    const password =
        document.getElementById(
            "password"
        );


    if (
        !togglePassword ||
        !password
    ) {
        return;
    }


    togglePassword.addEventListener(
        "click",
        function () {

            const isPassword =
                password.type === "password";


            password.type =
                isPassword
                    ? "text"
                    : "password";


            togglePassword.innerHTML =
                isPassword
                    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
                    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;


            togglePassword.setAttribute(
                "aria-label",
                isPassword
                    ? "إخفاء كلمة المرور"
                    : "إظهار كلمة المرور"
            );

        }
    );

}


// =========================================================
// ADMIN AUTHENTICATION
// =========================================================

function checkAdminAuth() {

    const path =
        window.location.pathname.toLowerCase();


    const isAdminPage =
        path.includes("/admin/");


    const isLoginPage =
        path.endsWith("/admin/login.html") ||
        path.endsWith("/admin/login.htm");


    if (
        !isAdminPage ||
        isLoginPage
    ) {
        return;
    }


    const loggedIn =
        localStorage.getItem(
            "adminLoggedIn"
        );


    if (loggedIn !== "true") {

        window.location.href =
            "login.html";

    }

}


// =========================================================
// LOGOUT
// =========================================================

function initLogout() {

    const logoutBtn =
        document.getElementById(
            "logoutBtn"
        );


    if (!logoutBtn) {
        return;
    }


    logoutBtn.addEventListener(
        "click",
        function () {

            localStorage.removeItem("adminLoggedIn");
            localStorage.removeItem("adminToken");


            window.location.href =
                "login.html";

        }
    );

}


// =========================================================
// MOBILE SIDEBAR
// =========================================================

function initMobileSidebar() {

    const sidebarToggle =
        document.getElementById(
            "sidebarToggle"
        );

    const sidebar =
        document.querySelector(
            ".admin-sidebar"
        );


    if (
        !sidebarToggle ||
        !sidebar
    ) {
        return;
    }


    sidebarToggle.addEventListener(
        "click",
        function () {

            sidebar.classList.toggle(
                "show"
            );

        }
    );


    // إغلاق القائمة عند الضغط على أي رابط

    const links =
        sidebar.querySelectorAll(
            "a.sidebar-link"
        );


    links.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    sidebar.classList.remove(
                        "show"
                    );

                }
            );

        }
    );

}


// =========================================================
// CLOSE SIDEBAR WHEN CLICK OUTSIDE
// =========================================================

function initOutsideSidebarClick() {

    document.addEventListener(
        "click",
        function (event) {

            const sidebar =
                document.querySelector(
                    ".admin-sidebar"
                );

            const toggle =
                document.getElementById(
                    "sidebarToggle"
                );


            if (
                !sidebar ||
                !toggle
            ) {
                return;
            }


            if (
                window.innerWidth > 800
            ) {
                return;
            }


            if (
                sidebar.contains(event.target) ||
                toggle.contains(event.target)
            ) {
                return;
            }


            sidebar.classList.remove(
                "show"
            );

        }
    );

}


// =========================================================
// ENTER KEY LOGIN
// =========================================================

function initLoginKeyboard() {

    const username =
        document.getElementById(
            "username"
        );

    const password =
        document.getElementById(
            "password"
        );


    if (
        !username ||
        !password
    ) {
        return;
    }


    [username, password].forEach(
        function (input) {

            input.addEventListener(
                "input",
                function () {

                    const error =
                        document.getElementById(
                            "loginError"
                        );


                    if (error) {

                        error.classList.remove(
                            "show"
                        );

                    }

                }
            );

        }
    );

}


// =========================================================
// INITIALIZE
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Theme
        updateThemeButtons();


        document
            .querySelectorAll(".theme-btn")
            .forEach(
                function (button) {

                    button.addEventListener(
                        "click",
                        toggleTheme
                    );

                }
            );


        // Login
        initLogin();


        // Password
        initPasswordToggle();


        // Authentication
        checkAdminAuth();


        // Logout
        initLogout();


        // Mobile sidebar
        initMobileSidebar();


        // Outside click
        initOutsideSidebarClick();


        // Login keyboard/input
        initLoginKeyboard();

    }
);
