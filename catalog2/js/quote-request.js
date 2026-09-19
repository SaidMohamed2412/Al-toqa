// =========================================================
// MULTI-PRODUCT QUOTE REQUEST PAGE
// =========================================================
"use strict";

(function () {
    const form = document.getElementById("quoteForm");
    const cartItemsEl = document.getElementById("quoteCartItems");
    const emptyEl = document.getElementById("quoteCartEmpty");
    if (!form || !cartItemsEl) return;

    const profile = typeof getCustomerProfile === "function" ? getCustomerProfile() : null;
    const nameInput = document.getElementById("customerName");
    const companyInput = document.getElementById("companyName");
    const phoneInput = document.getElementById("customerPhone");
    const emailInput = document.getElementById("customerEmail");

    if (profile) {
        if (nameInput && profile.customerName) nameInput.value = profile.customerName;
        if (companyInput && profile.companyName) companyInput.value = profile.companyName;
        if (phoneInput && profile.customerPhone) phoneInput.value = profile.customerPhone;
        if (emailInput && profile.customerEmail) emailInput.value = profile.customerEmail;
    }

    let productsCache = [];
    async function products() {
        if (productsCache.length) return productsCache;
        productsCache = await window.apiRequest("/api/products");
        return productsCache;
    }

    function snapshotProduct(product) {
        const images = Array.isArray(product.images) && product.images.length ? product.images : [product.image || ""];
        return {
            id: product.id,
            name: product.name || "منتج",
            code: product.code || "",
            categoryName: product.categoryName || product.category || "",
            description: product.description || "",
            material: product.material || "",
            dimensions: product.dimensions || "",
            image: images[0] || ""
        };
    }

    function esc(value) {
        const div = document.createElement("div");
        div.textContent = value ?? "";
        return div.innerHTML;
    }

    function renderCart() {
        const cart = typeof getQuoteCart === "function" ? getQuoteCart() : [];
        if (!cart.length) {
            cartItemsEl.innerHTML = "";
            emptyEl.hidden = false;
            return;
        }
        emptyEl.hidden = true;
        cartItemsEl.innerHTML = cart.map((item, index) => {
            const p = item.product || {};
            return `<article class="quote-cart-item">
                <div class="quote-cart-number">${index + 1}</div>
                <div class="quote-cart-image">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}">` : '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27,6.96 12,12.01 20.73,6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>'}</div>
                <div class="quote-cart-info">
                    <strong>${esc(p.name || "منتج")}</strong>
                    <span>${esc(p.code || "")}</span>
                    <small>${esc(p.description || p.material || p.dimensions || "")}</small>
                </div>
                <div class="quote-cart-quantity">
                    <label>الكمية</label>
                    <div class="quantity-control">
                        <button type="button" data-minus="${esc(item.productId)}">−</button>
                        <input type="number" min="1" value="${Number(item.quantity) || 1}" data-quantity="${esc(item.productId)}">
                        <button type="button" data-plus="${esc(item.productId)}">+</button>
                    </div>
                </div>
                <button type="button" class="quote-cart-remove" data-remove="${esc(item.productId)}" aria-label="حذف المنتج">×</button>
            </article>`;
        }).join("");

        cartItemsEl.querySelectorAll("[data-remove]").forEach(btn => btn.addEventListener("click", () => {
            removeProductFromQuoteCart(btn.dataset.remove);
            renderCart();
        }));
        cartItemsEl.querySelectorAll("[data-quantity]").forEach(input => input.addEventListener("change", () => {
            updateQuoteCartQuantity(input.dataset.quantity, input.value);
            renderCart();
        }));
        cartItemsEl.querySelectorAll("[data-plus]").forEach(btn => btn.addEventListener("click", () => {
            const cart = getQuoteCart();
            const item = cart.find(x => String(x.productId) === String(btn.dataset.plus));
            updateQuoteCartQuantity(btn.dataset.plus, (Number(item?.quantity) || 1) + 1);
            renderCart();
        }));
        cartItemsEl.querySelectorAll("[data-minus]").forEach(btn => btn.addEventListener("click", () => {
            const cart = getQuoteCart();
            const item = cart.find(x => String(x.productId) === String(btn.dataset.minus));
            updateQuoteCartQuantity(btn.dataset.minus, Math.max(1, (Number(item?.quantity) || 1) - 1));
            renderCart();
        }));
    }

    window.addEventListener("storage", renderCart);
    renderCart();

    form.addEventListener("submit", async function (event) {
        event.preventDefault();
        const cart = getQuoteCart();
        const message = document.getElementById("quoteFormMessage");
        const show = (text, type) => {
            if (!message) return;
            message.textContent = text;
            message.className = `quote-form-message show ${type}`;
            message.scrollIntoView({ behavior: "smooth", block: "center" });
        };

        if (!cart.length) return show("من فضلك أضف منتجًا واحدًا على الأقل إلى عرض السعر.", "error");

        const customerName = nameInput?.value.trim() || "";
        const companyName = companyInput?.value.trim() || "";
        const customerPhone = phoneInput?.value.trim() || "";
        const customerEmail = emailInput?.value.trim() || "";
        const projectType = document.getElementById("projectType")?.value || "";
        const quoteDetails = document.getElementById("quoteDetails")?.value.trim() || "";
        const budget = document.getElementById("budget")?.value || "";
        const deliveryDate = document.getElementById("deliveryDate")?.value || "";
        const contactMethod = document.querySelector('input[name="contactMethod"]:checked')?.value || "phone";

        if (!customerName) return show("من فضلك أدخل اسم العميل.", "error");
        if (!companyName) return show("من فضلك أدخل اسم الشركة.", "error");
        if (!customerPhone) return show("من فضلك أدخل رقم الهاتف.", "error");
        if (!/^01[0125][0-9]{8}$/.test(customerPhone.replace(/[\s-]/g, ""))) return show("من فضلك أدخل رقم موبايل مصري صحيح (01xxxxxxxxx).", "error");
        if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) return show("من فضلك أدخل بريدًا إلكترونيًا صحيحًا.", "error");

        const requests = [];
        const today = new Date();
        const prefix = `QUOTE-${today.getFullYear()}${String(today.getMonth()+1).padStart(2,"0")}${String(today.getDate()).padStart(2,"0")}-`;
        let max = 0;
        requests.forEach(q => {
            const id = String(q.id || "");
            if (id.startsWith(prefix)) max = Math.max(max, parseInt(id.slice(prefix.length), 10) || 0);
        });
        const quoteId = prefix + String(max + 1).padStart(3, "0");

        const items = cart.map(item => ({
            productId: item.productId,
            productName: item.product?.name || "منتج",
            productCode: item.product?.code || "",
            categoryName: item.product?.categoryName || "",
            description: item.product?.description || "",
            material: item.product?.material || "",
            dimensions: item.product?.dimensions || "",
            image: item.product?.image || "",
            quantity: Math.max(1, Number(item.quantity) || 1),
            unitPrice: 0,
            lineTotal: 0
        }));

        const quote = {
            id: quoteId,
            customerName,
            companyName,
            customerPhone,
            customerEmail,
            projectType,
            quoteDetails,
            budget,
            deliveryDate,
            contactMethod,
            items,
            subtotal: 0,
            vatRate: QUOTE_VAT_RATE,
            vatAmount: 0,
            grandTotal: 0,
            paymentTerms: "",
            deliveryPeriod: "",
            status: "new",
            createdAt: new Date().toISOString()
        };

        saveCustomerProfile({ customerName, companyName, customerPhone, customerEmail });

        try {
            await submitQuoteToServer(quote);
            clearQuoteCart();
            renderCart();
            form.reset();
            if (profile) {
                if (nameInput) nameInput.value = customerName;
                if (companyInput) companyInput.value = companyName;
                if (phoneInput) phoneInput.value = customerPhone;
                if (emailInput) emailInput.value = customerEmail;
            }
            show(`تم إرسال طلب عرض السعر بنجاح — رقم الطلب: ${quoteId}`, "success");
        } catch (error) {
            console.error("Quote API error:", error);
            show(`تعذر إرسال الطلب إلى قاعدة البيانات. لم يتم اعتبار الطلب مُرسلًا.`, "error");
        }
    });

    // If a product id is passed to contact.html, add it to the quote automatically.
    const requestedId = (new URLSearchParams(location.search).get("product") || new URLSearchParams(location.search).get("id"));
    if (requestedId) {
        products().then(list => { const product = list.find(p => String(p.id) === String(requestedId)); if (product) addProductToQuoteCart(snapshotProduct(product), 1); renderCart(); }).catch(console.error);
    }
})();
