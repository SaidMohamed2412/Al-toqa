// =========================================================
// QUOTE SYSTEM SHARED UTILITIES
// =========================================================
"use strict";

const QUOTES_STORAGE_KEY = "furnitureQuoteRequests";
const QUOTE_CART_STORAGE_KEY = "furnitureQuoteCart";
const CUSTOMER_PROFILE_STORAGE_KEY = "furnitureCustomerProfile";
const QUOTE_VAT_RATE = 0.14;

function getQuotes() {
    try {
        const saved = localStorage.getItem(QUOTES_STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("خطأ في قراءة عروض الأسعار:", error);
        return [];
    }
}

function saveQuotes(quotes) {
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(quotes));
}

function getQuoteCart() {
    try {
        const saved = localStorage.getItem(QUOTE_CART_STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error("خطأ في قراءة سلة عرض السعر:", error);
        return [];
    }
}

function saveQuoteCart(cart) {
    localStorage.setItem(QUOTE_CART_STORAGE_KEY, JSON.stringify(cart));
}

function clearQuoteCart() {
    localStorage.removeItem(QUOTE_CART_STORAGE_KEY);
}

function getCustomerProfile() {
    try {
        const saved = localStorage.getItem(CUSTOMER_PROFILE_STORAGE_KEY);
        const parsed = saved ? JSON.parse(saved) : null;
        return parsed && typeof parsed === "object" ? parsed : null;
    } catch (error) {
        return null;
    }
}

function saveCustomerProfile(profile) {
    localStorage.setItem(CUSTOMER_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

function addProductToQuoteCart(product, quantity = 1) {
    if (!product || !product.id) return getQuoteCart();

    const cart = getQuoteCart();
    const existing = cart.find(item => String(item.productId) === String(product.id));
    const safeQuantity = Math.max(1, Number(quantity) || 1);
    const image = Array.isArray(product.images) && product.images.length
        ? product.images[0]
        : (product.image || "");

    if (existing) {
        existing.quantity = Math.max(1, Number(existing.quantity) || 1) + safeQuantity;
        existing.product = {
            id: product.id,
            name: product.name || "منتج",
            code: product.code || "",
            categoryName: product.categoryName || product.category || "",
            description: product.description || "",
            material: product.material || "",
            dimensions: product.dimensions || "",
            image
        };
    } else {
        cart.push({
            productId: product.id,
            quantity: safeQuantity,
            product: {
                id: product.id,
                name: product.name || "منتج",
                code: product.code || "",
                categoryName: product.categoryName || product.category || "",
                description: product.description || "",
                material: product.material || "",
                dimensions: product.dimensions || "",
                image
            }
        });
    }

    saveQuoteCart(cart);
    return cart;
}

function removeProductFromQuoteCart(productId) {
    const cart = getQuoteCart().filter(item => String(item.productId) !== String(productId));
    saveQuoteCart(cart);
    return cart;
}

function updateQuoteCartQuantity(productId, quantity) {
    const cart = getQuoteCart();
    const item = cart.find(entry => String(entry.productId) === String(productId));
    if (item) item.quantity = Math.max(1, Number(quantity) || 1);
    saveQuoteCart(cart);
    return cart;
}

function getQuoteCartCount() {
    return getQuoteCart().reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
}

function getQuoteStatusText(status) {
    return {
        new: "جديد",
        priced: "تم التسعير",
        contacted: "تم التواصل",
        completed: "مكتمل",
        cancelled: "ملغي"
    }[status] || "جديد";
}

function getProjectTypeText(type) {
    return {
        office: "مكتب / شركة",
        hotel: "فندق",
        home: "منزل",
        villa: "فيلا",
        commercial: "مشروع تجاري",
        other: "أخرى"
    }[type] || type || "-";
}

function formatQuoteDate(date) {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleString("ar-EG", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


async function submitQuoteToServer(quote) {
    if (typeof window.apiRequest !== "function") {
        throw new Error("إعدادات الاتصال بالخادم غير متاحة.");
    }

    return window.apiRequest("/api/quotes", {
        method: "POST",
        body: JSON.stringify(quote)
    });
}

function calculateQuoteTotals(items) {
    const subtotal = (items || []).reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        return sum + quantity * unitPrice;
    }, 0);
    const vat = subtotal * QUOTE_VAT_RATE;
    return { subtotal, vat, total: subtotal + vat };
}
