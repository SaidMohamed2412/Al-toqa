// =========================
// MOBILE MENU
// =========================

const menuBtn = document.getElementById("menuBtn");
const nav = document.querySelector(".nav");

if (menuBtn && nav) {

    menuBtn.addEventListener("click", () => {

        const isOpen = nav.classList.toggle("show");

        menuBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");

    });

}


// =========================
// DARK MODE
// =========================

const themeBtn =
    document.getElementById("themeBtn");


// ---------------------------------
// APPLY SAVED THEME
// ---------------------------------

const savedTheme =
    localStorage.getItem("theme");


if (savedTheme === "dark") {

    document.body.classList.add("dark");

}


// ---------------------------------
// UPDATE BUTTON ICON
// ---------------------------------

const ICON_MOON =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>';

const ICON_SUN =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

function updateThemeIcon() {

    if (!themeBtn) {
        return;
    }


    if (
        document.body.classList.contains("dark")
    ) {

        themeBtn.innerHTML = ICON_SUN;
        themeBtn.setAttribute("aria-label", "تفعيل الوضع الفاتح");

    } else {

        themeBtn.innerHTML = ICON_MOON;
        themeBtn.setAttribute("aria-label", "تفعيل الوضع الداكن");

    }

}


// تشغيل الأيقونة عند فتح الصفحة

updateThemeIcon();


// ---------------------------------
// TOGGLE THEME
// ---------------------------------

if (themeBtn) {

    themeBtn.addEventListener("click", () => {

        document.body.classList.toggle("dark");


        const isDark =
            document.body.classList.contains("dark");


        // حفظ الاختيار

        localStorage.setItem(
            "theme",
            isDark ? "dark" : "light"
        );


        // تحديث الأيقونة

        updateThemeIcon();

    });

}
