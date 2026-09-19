// =========================================================
// SITE CONFIGURATION
// Keep shared contact/API settings in one place.
// =========================================================
"use strict";

window.SITE_CONFIG = Object.freeze({
    companyName: "التقي للأثاث المكتبي",
    companyPhone: "01026912265",
    companyWhatsApp: "201026912265",
    companyEmail: "sm2412200@gmail.com",
    // Set window.AL_TOQA_API_URL before this file only when the API is hosted separately.
    apiBaseUrl: window.AL_TOQA_API_URL || (window.location.protocol === "file:"
        ? ""
        : window.location.origin)
});

window.apiRequest = async function apiRequest(path, options = {}) {
    const base = window.SITE_CONFIG.apiBaseUrl;
    if (!base) throw new Error("API غير متاحة عند فتح الموقع مباشرة من ملف file://");

    const token = localStorage.getItem("adminToken");
    const headers = new Headers(options.headers || {});
    if (options.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const response = await fetch(`${base}${path}`, {
        ...options,
        headers
    });

    let data = null;
    try { data = await response.json(); } catch (_) {}

    if (!response.ok) {
        if (response.status === 401 && window.location.pathname.toLowerCase().includes("/admin/") && !window.location.pathname.toLowerCase().endsWith("/login.html")) {
            localStorage.removeItem("adminToken");
            localStorage.removeItem("adminLoggedIn");
            sessionStorage.setItem("adminLoginMessage", "انتهت جلسة تسجيل الدخول. من فضلك سجّل الدخول مرة أخرى.");
            window.location.href = "login.html";
        }
        const error = new Error(data?.message || "حدث خطأ في الاتصال بالخادم.");
        error.status = response.status;
        throw error;
    }

    return data;
};

window.openWhatsApp = function openWhatsApp(message = "") {
    const number = window.SITE_CONFIG.companyWhatsApp;
    const url = `https://wa.me/${number}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
    window.open(url, "_blank", "noopener,noreferrer");
};
