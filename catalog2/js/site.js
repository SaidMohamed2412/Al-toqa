// =========================================================
// SHARED SITE CONTACTS / UI
// One small file keeps public contact behavior in one place.
// =========================================================
"use strict";

(function initSite() {
    const config = window.SITE_CONFIG;
    if (!config) return;

    const phoneDigits = String(config.companyPhone || "").replace(/\D/g, "");
    const whatsappDigits = String(config.companyWhatsApp || "").replace(/\D/g, "");

    document.querySelectorAll("[data-site-phone]").forEach((element) => {
        if (element.tagName === "A") {
            element.href = phoneDigits ? `tel:${phoneDigits}` : "#";
        }
        if (element.dataset.sitePhoneText !== "false") {
            element.textContent = config.companyPhone || "";
        }
    });

    document.querySelectorAll("[data-site-whatsapp]").forEach((element) => {
        element.href = whatsappDigits ? `https://wa.me/${whatsappDigits}` : "#";
        element.target = "_blank";
        element.rel = "noopener noreferrer";
    });

    document.querySelectorAll("[data-site-email]").forEach((element) => {
        if (element.tagName === "A") element.href = `mailto:${config.companyEmail}`;
        element.textContent = config.companyEmail || "";
    });

    if (!document.querySelector(".floating-whatsapp") && whatsappDigits) {
        const link = document.createElement("a");
        link.className = "floating-whatsapp";
        link.href = `https://wa.me/${whatsappDigits}`;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", "تواصل معنا عبر واتساب");
        link.title = "تواصل معنا عبر واتساب";
        link.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.3 11.3 0 0 0 12.45.8C6.2.8 1.1 5.9 1.1 12.15c0 2 .52 3.95 1.5 5.66L1 23l5.34-1.55a11.35 11.35 0 0 0 6.1 1.77h.01c6.24 0 11.34-5.1 11.34-11.35 0-3.03-1.17-5.88-3.29-8.02ZM12.45 21.2h-.01a9.4 9.4 0 0 1-4.8-1.31l-.34-.2-3.17.92.95-3.09-.22-.35a9.35 9.35 0 1 1 7.59 4.03Zm5.15-7.03c-.28-.14-1.65-.81-1.91-.9-.26-.1-.45-.14-.64.14-.19.28-.73.9-.9 1.08-.16.19-.33.21-.61.07-.28-.14-1.18-.43-2.24-1.38-.83-.74-1.39-1.65-1.55-1.93-.16-.28-.02-.43.12-.57.12-.12.28-.33.42-.49.14-.16.19-.28.28-.47.09-.19.05-.35-.02-.49-.07-.14-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49h-.54c-.19 0-.49.07-.75.35-.26.28-.99.97-.99 2.37s1.01 2.75 1.15 2.94c.14.19 1.99 3.04 4.83 4.26.68.29 1.21.46 1.63.59.68.22 1.3.19 1.79.12.55-.08 1.65-.67 1.88-1.32.23-.65.23-1.2.16-1.32-.07-.12-.26-.19-.54-.33Z"/></svg>`;
        document.body.appendChild(link);
    }
})();
