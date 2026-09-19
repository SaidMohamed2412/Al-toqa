// =========================================================
// ADMIN QUOTES MANAGEMENT
// =========================================================

"use strict";


// =========================================================
// ELEMENTS
// =========================================================

const quotesTable =
    document.getElementById(
        "quotesTable"
    );

const quotesEmpty =
    document.getElementById(
        "quotesEmpty"
    );

const quoteSearch =
    document.getElementById(
        "quoteSearch"
    );

const quoteStatusFilter =
    document.getElementById(
        "quoteStatusFilter"
    );

const quotesResultsCount =
    document.getElementById(
        "quotesResultsCount"
    );

const totalQuotes =
    document.getElementById(
        "totalQuotes"
    );

const newQuotes =
    document.getElementById(
        "newQuotes"
    );

const contactedQuotes =
    document.getElementById(
        "contactedQuotes"
    );

const completedQuotes =
    document.getElementById(
        "completedQuotes"
    );

const refreshQuotes =
    document.getElementById(
        "refreshQuotes"
    );


// =========================================================
// MODAL
// =========================================================

const quoteModal =
    document.getElementById(
        "quoteModal"
    );

const quoteModalBody =
    document.getElementById(
        "quoteModalBody"
    );

const modalQuoteTitle =
    document.getElementById(
        "modalQuoteTitle"
    );

const closeQuoteModal =
    document.getElementById(
        "closeQuoteModal"
    );

const closeQuoteModalBottom =
    document.getElementById(
        "closeQuoteModalBottom"
    );


// =========================================================
// DELETE MODAL
// =========================================================

const quoteDeleteModal =
    document.getElementById(
        "quoteDeleteModal"
    );

const cancelQuoteDelete =
    document.getElementById(
        "cancelQuoteDelete"
    );

const confirmQuoteDelete =
    document.getElementById(
        "confirmQuoteDelete"
    );


// =========================================================
// STATE
// =========================================================

let quotesList = [];

let quoteToDelete = null;


// =========================================================
// LOAD QUOTES
// =========================================================

async function loadQuotes() {

    // Prefer the real server; localStorage remains a compatibility fallback.
    if (typeof window.apiRequest === "function" && localStorage.getItem("adminToken")) {
        try {
            const remoteQuotes = await window.apiRequest("/api/quotes");
            if (Array.isArray(remoteQuotes)) {
                quotesList = remoteQuotes;
                return;
            }
        } catch (error) {
            console.warn("تعذر تحميل الطلبات من الخادم، سيتم استخدام النسخة المحلية.", error);
        }
    }

    if (
        typeof getQuotes ===
        "function"
    ) {

        quotesList =
            getQuotes();

    } else {

        const savedQuotes =
            localStorage.getItem(
                "furnitureQuoteRequests"
            );


        try {

            quotesList =
                savedQuotes
                    ? JSON.parse(
                        savedQuotes
                    )
                    : [];

        } catch (error) {

            console.error(
                error
            );

            quotesList = [];

        }

    }

}


// =========================================================
// GET STATUS TEXT
// =========================================================

function getStatusText(
    status
) {

    if (
        typeof getQuoteStatusText ===
        "function"
    ) {

        return getQuoteStatusText(
            status
        );

    }


    const statuses = {

        new: "جديد",

        contacted: "تم التواصل",

        completed: "مكتمل",

        cancelled: "ملغي"

    };


    return (
        statuses[status] ||
        "جديد"
    );

}


// =========================================================
// GET PROJECT TEXT
// =========================================================

function getProjectText(
    type
) {

    if (
        typeof getProjectTypeText ===
        "function"
    ) {

        return getProjectTypeText(
            type
        );

    }


    const types = {

        office: "مكتب / شركة",

        hotel: "فندق",

        home: "منزل",

        villa: "فيلا",

        commercial: "مشروع تجاري",

        other: "أخرى"

    };


    return (
        types[type] ||
        type ||
        "-"
    );

}


// =========================================================
// FORMAT DATE
// =========================================================

function formatDate(
    date
) {

    if (
        typeof formatQuoteDate ===
        "function"
    ) {

        return formatQuoteDate(
            date
        );

    }


    if (!date) {

        return "-";

    }


    const parsedDate =
        new Date(date);


    if (
        Number.isNaN(
            parsedDate.getTime()
        )
    ) {

        return "-";

    }


    return parsedDate.toLocaleString(
        "ar-EG",
        {
            year: "numeric",
            month: "short",
            day: "numeric"
        }
    );

}


// =========================================================
// FILTER
// =========================================================

function getFilteredQuotes() {

    const search =
        quoteSearch
            ? quoteSearch.value
                .trim()
                .toLowerCase()
            : "";


    const status =
        quoteStatusFilter
            ? quoteStatusFilter.value
            : "all";


    return quotesList.filter(
        function (quote) {

            const name =
                String(
                    quote.customerName ||
                    ""
                ).toLowerCase();


            const phone =
                String(
                    quote.customerPhone ||
                    ""
                ).toLowerCase();


            const id =
                String(
                    quote.id ||
                    ""
                ).toLowerCase();


            const company =
                String(
                    quote.companyName ||
                    ""
                ).toLowerCase();


            const matchesSearch =
                name.includes(search) ||
                phone.includes(search) ||
                id.includes(search) ||
                company.includes(search);


            const matchesStatus =
                status === "all" ||
                quote.status === status;


            return (
                matchesSearch &&
                matchesStatus
            );

        }
    );

}


// =========================================================
// STATISTICS
// =========================================================

function renderStatistics() {

    if (totalQuotes) {

        totalQuotes.textContent =
            quotesList.length;

    }


    if (newQuotes) {

        newQuotes.textContent =
            quotesList.filter(
                function (quote) {

                    return (
                        quote.status ===
                        "new"
                    );

                }
            ).length;

    }


    if (contactedQuotes) {

        contactedQuotes.textContent =
            quotesList.filter(
                function (quote) {

                    return (
                        quote.status ===
                        "contacted"
                    );

                }
            ).length;

    }


    if (completedQuotes) {

        completedQuotes.textContent =
            quotesList.filter(
                function (quote) {

                    return (
                        quote.status ===
                        "completed"
                    );

                }
            ).length;

    }

}


// =========================================================
// RENDER
// =========================================================

function renderQuotes() {

    if (!quotesTable) {

        return;

    }


    const filteredQuotes =
        getFilteredQuotes();


    if (quotesResultsCount) {

        quotesResultsCount.textContent =
            filteredQuotes.length;

    }


    if (
        filteredQuotes.length === 0
    ) {

        quotesTable.innerHTML = "";


        if (quotesEmpty) {

            quotesEmpty.classList.add(
                "show"
            );

        }


        return;

    }


    if (quotesEmpty) {

        quotesEmpty.classList.remove(
            "show"
        );

    }


    quotesTable.innerHTML = `

        <div class="quote-row header">

            <div>
                رقم الطلب
            </div>

            <div>
                العميل
            </div>

            <div>
                المنتج
            </div>

            <div>
                المشروع
            </div>

            <div>
                الحالة
            </div>

            <div>
                التاريخ
            </div>

            <div>
                الإجراءات
            </div>

        </div>

    `;


    filteredQuotes.forEach(
        function (quote) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "quote-row";


            const status =
                quote.status ||
                "new";


            row.innerHTML = `

                <div>

                    <span class="quote-id">
                        ${escapeHTML(
                            quote.id || "-"
                        )}
                    </span>

                </div>


                <div class="customer-info">

                    <strong>
                        ${escapeHTML(
                            quote.customerName ||
                            "بدون اسم"
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            quote.customerPhone ||
                            "بدون هاتف"
                        )}
                    </span>

                </div>


                <div class="quote-product">

                    <strong>
                        ${escapeHTML(
                            Array.isArray(quote.items) && quote.items.length
                                ? `${quote.items[0].productName || "منتج"}${quote.items.length > 1 ? ` + ${quote.items.length - 1} منتجات` : ""}`
                                : (quote.productName || "غير محدد")
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            Array.isArray(quote.items) && quote.items.length
                                ? `${quote.items.length} منتج`
                                : (quote.productCode || "")
                        )}
                    </span>

                </div>


                <div class="quote-project">

                    ${escapeHTML(
                        getProjectText(
                            quote.projectType
                        )
                    )}

                </div>


                <div>

                    <span
                        class="quote-status ${status}"
                    >
                        ${escapeHTML(
                            getStatusText(
                                status
                            )
                        )}
                    </span>

                </div>


                <div>

                    <span class="customer-info">

                        ${escapeHTML(
                            formatDate(
                                quote.createdAt
                            )
                        )}

                    </span>

                </div>


                <div class="quote-actions">

                    <button
                        type="button"
                        class="quote-action"
                        data-action="view"
                        data-id="${escapeHTML(
                            quote.id
                        )}"
                        title="عرض التفاصيل"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </button>


                    <button
                        type="button"
                        class="quote-action"
                        data-action="contacted"
                        data-id="${escapeHTML(
                            quote.id
                        )}"
                        title="تم التواصل"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    </button>


                    <button
                        type="button"
                        class="quote-action delete"
                        data-action="delete"
                        data-id="${escapeHTML(
                            quote.id
                        )}"
                        title="حذف"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>

                </div>

            `;


            quotesTable.appendChild(
                row
            );

        }
    );


    attachQuoteActions();

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}


// =========================================================
// ACTIONS
// =========================================================

function attachQuoteActions() {

    document
        .querySelectorAll(
            ".quote-action"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            this.dataset.id;


                        const action =
                            this.dataset.action;


                        if (
                            action ===
                            "view"
                        ) {

                            openQuoteModal(
                                id
                            );

                        }


                        if (
                            action ===
                            "contacted"
                        ) {

                            changeQuoteStatus(
                                id,
                                "contacted"
                            );

                        }


                        if (
                            action ===
                            "delete"
                        ) {

                            openDeleteModal(
                                id
                            );

                        }

                    }
                );

            }
        );

}


// =========================================================
// CHANGE STATUS
// =========================================================

function changeQuoteStatus(
    id,
    status
) {

    if (
        typeof updateQuoteStatus ===
        "function"
    ) {

        updateQuoteStatus(
            id,
            status
        );

    } else {

        const index =
            quotesList.findIndex(
                function (quote) {

                    return (
                        String(
                            quote.id
                        ) ===
                        String(id)
                    );

                }
            );


        if (index === -1) {

            return;

        }


        quotesList[index].status =
            status;


        localStorage.setItem(
            "furnitureQuoteRequests",
            JSON.stringify(
                quotesList
            )
        );

    }


    loadQuotes();

    renderStatistics();

    renderQuotes();

}


// =========================================================
// QUOTE PRICING / DETAILS EDITOR
// =========================================================

let activeQuoteId = null;

const saveQuotePricingBtn = document.getElementById("saveQuotePricing");
const printQuotePdfBtn = document.getElementById("printQuotePdf");
const sendQuoteWhatsappBtn = document.getElementById("sendQuoteWhatsapp");

function money(value) {
    return (Number(value) || 0).toLocaleString("ar-EG", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + " جنيه";
}

function getQuoteItems(quote) {
    if (Array.isArray(quote.items) && quote.items.length) return quote.items;
    if (quote.productName) {
        return [{
            productId: quote.productId || "",
            productName: quote.productName,
            productCode: quote.productCode || "",
            description: quote.quoteDetails || "",
            image: quote.productImage || "",
            quantity: Number(quote.productQuantity) || 1,
            unitPrice: Number(quote.unitPrice) || 0,
            lineTotal: Number(quote.lineTotal) || 0
        }];
    }
    return [];
}


function normalizeEgyptPhone(phone) {
    const digits = String(phone || "").replace(/\D/g, "");
    if (digits.startsWith("20")) return digits;
    if (digits.startsWith("0")) return "20" + digits.slice(1);
    return digits;
}

function normalizeEgyptWhatsApp(phone) {
    return normalizeEgyptPhone(phone);
}

function openQuoteModal(id) {
    const quote = quotesList.find(item => String(item.id) === String(id));
    if (!quote || !quoteModal) return;

    activeQuoteId = quote.id;
    const items = getQuoteItems(quote);

    if (modalQuoteTitle) modalQuoteTitle.textContent = `${quote.id} — ${quote.companyName || quote.customerName || "طلب عرض سعر"}`;

    const totals = calculateQuoteTotals(items);

    quoteModalBody.innerHTML = `
        <div class="quote-client-summary">
            <div><span>عناية م.</span><strong>${escapeHTML(quote.customerName || "-")}</strong></div>
            <div><span>الشركة</span><strong>${escapeHTML(quote.companyName || "-")}</strong></div>
            <div><span>الهاتف</span><strong>${escapeHTML(quote.customerPhone || "-")}</strong></div>
            <div><span>البريد</span><strong>${escapeHTML(quote.customerEmail || "غير مضاف")}</strong></div>
            <div><span>تاريخ الطلب</span><strong>${escapeHTML(formatDate(quote.createdAt))}</strong></div>
            <div class="quote-contact-actions">
                ${quote.customerPhone ? `<a class="quote-contact-btn phone" href="tel:${escapeHTML(normalizeEgyptPhone(quote.customerPhone))}">اتصال</a>
                <a class="quote-contact-btn whatsapp" href="https://wa.me/${escapeHTML(normalizeEgyptWhatsApp(quote.customerPhone))}" target="_blank" rel="noopener noreferrer">واتساب</a>` : ""}
                ${quote.customerEmail ? `<a class="quote-contact-btn email" href="mailto:${escapeHTML(quote.customerEmail)}">إيميل</a>` : ""}
            </div>
        </div>

        <div class="quote-items-editor">
            <div class="quote-editor-title"><span>01</span><div><strong>المنتجات والكميات والأسعار</strong><small>أدخل سعر الوحدة وعدّل وصف المنتج قبل إصدار العرض</small></div></div>
            <div class="quote-items-table">
                <div class="quote-item-row quote-item-head"><span>م</span><span>المنتج</span><span>الوصف</span><span>الكمية</span><span>سعر الوحدة</span><span>الإجمالي</span></div>
                ${items.map((item, index) => `
                    <div class="quote-item-row" data-item-index="${index}">
                        <span class="quote-item-number">${index + 1}</span>
                        <div class="quote-item-product">
                            ${item.image ? `<img src="${item.image}" alt="${escapeHTML(item.productName)}">` : ""}
                            <div><strong>${escapeHTML(item.productName || "منتج")}</strong><small>${escapeHTML(item.productCode || "")}</small></div>
                        </div>
                        <div class="quote-item-details">
                            <textarea class="quote-description-input" rows="2" data-description-index="${index}" placeholder="وصف المنتج في عرض السعر...">${escapeHTML(item.description || "")}</textarea>
                            <small>${escapeHTML(item.material || "")} ${item.dimensions ? " • " + escapeHTML(item.dimensions) : ""}</small>
                        </div>
                        <input class="quote-qty-input" type="number" min="1" step="1" value="${Math.max(1, Number(item.quantity) || 1)}" data-qty-index="${index}" placeholder="1" aria-label="الكمية">
                        <input class="quote-price-input" type="number" min="0" step="0.01" value="${Number(item.unitPrice) || ""}" data-price-index="${index}" placeholder="0.00" aria-label="سعر الوحدة">
                        <strong class="quote-line-total" data-line-index="${index}">${money((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}</strong>
                    </div>
                `).join("")}
            </div>
        </div>

        <div class="quote-financial-summary">
            <div class="quote-summary-card"><span>إجمالي المنتجات</span><strong id="quoteSubtotal">${money(totals.subtotal)}</strong></div>
            <div class="quote-summary-card vat"><span>القيمة المضافة (14%)</span><strong id="quoteVat">${money(totals.vat)}</strong></div>
            <div class="quote-summary-card grand"><span>الإجمالي النهائي</span><strong id="quoteGrandTotal">${money(totals.total)}</strong></div>
        </div>

        <div class="quote-terms-editor">
            <div class="quote-editor-title"><span>02</span><div><strong>شروط العرض</strong><small>تظهر هذه البيانات في ملف الـ PDF</small></div></div>
            <label>شروط الدفع<textarea id="quotePaymentTerms" rows="4" placeholder="مثال: 50% مقدم و50% عند التسليم">${escapeHTML(quote.paymentTerms || "")}</textarea></label>
            <label>مدة التوريد<input id="quoteDeliveryPeriod" type="text" value="${escapeHTML(quote.deliveryPeriod || "")}" placeholder="مثال: 15 يوم عمل من تاريخ اعتماد الطلب"></label>
            <label>الضمان<textarea id="quoteWarranty" rows="3" placeholder="مثال: ضمان 3 سنوات ضد عيوب الصناعة. يمكنك تعديل النص حسب كل عرض.">${escapeHTML(quote.warranty || "")}</textarea></label>
        </div>
    `;

    function refreshTotals() {
        let subtotal = 0;
        items.forEach((item, index) => {
            const input = quoteModalBody.querySelector(`[data-price-index="${index}"]`);
            const qtyInput = quoteModalBody.querySelector(`[data-qty-index="${index}"]`);
            const price = Number(input?.value) || 0;
            const qty = Math.max(1, Number(qtyInput?.value) || 1);
            item.unitPrice = price;
            item.quantity = qty;
            const line = qty * price;
            subtotal += line;
            const lineEl = quoteModalBody.querySelector(`[data-line-index="${index}"]`);
            if (lineEl) lineEl.textContent = money(line);
        });
        const vat = subtotal * QUOTE_VAT_RATE;
        const total = subtotal + vat;
        document.getElementById("quoteSubtotal").textContent = money(subtotal);
        document.getElementById("quoteVat").textContent = money(vat);
        document.getElementById("quoteGrandTotal").textContent = money(total);
        return { subtotal, vat, total };
    }

    quoteModalBody.querySelectorAll(".quote-price-input, .quote-qty-input").forEach(input => input.addEventListener("input", refreshTotals));
    refreshTotals();
    quoteModal.classList.add("show");
}

async function saveActiveQuotePricing() {
    if (!activeQuoteId) return null;
    const quote = quotesList.find(item => String(item.id) === String(activeQuoteId));
    if (!quote) return null;

    const items = getQuoteItems(quote);
    items.forEach((item, index) => {
        const input = quoteModalBody.querySelector(`[data-price-index="${index}"]`);
        const qtyInput = quoteModalBody.querySelector(`[data-qty-index="${index}"]`);
        const descriptionInput = quoteModalBody.querySelector(`[data-description-index="${index}"]`);
        item.unitPrice = Math.max(0, Number(input?.value) || 0);
        item.quantity = Math.max(1, Number(qtyInput?.value) || 1);
        item.description = descriptionInput?.value.trim() || "";
        item.lineTotal = (Number(item.quantity) || 0) * item.unitPrice;
    });

    const totals = calculateQuoteTotals(items);
    quote.items = items;
    quote.subtotal = totals.subtotal;
    quote.vatRate = QUOTE_VAT_RATE;
    quote.vatAmount = totals.vat;
    quote.grandTotal = totals.total;
    quote.paymentTerms = document.getElementById("quotePaymentTerms")?.value.trim() || "";
    quote.deliveryPeriod = document.getElementById("quoteDeliveryPeriod")?.value.trim() || "";
    quote.warranty = document.getElementById("quoteWarranty")?.value.trim() || "";
    quote.status = "priced";
    quote.updatedAt = new Date().toISOString();
    // Keep the first product fields for older code.
    quote.productName = items[0]?.productName || quote.productName || "";
    quote.productCode = items[0]?.productCode || quote.productCode || "";
    quote.productQuantity = items[0]?.quantity || quote.productQuantity || "";

    saveQuotes(quotesList);

    if (typeof window.apiRequest === "function" && localStorage.getItem("adminToken")) {
        try {
            await window.apiRequest(`/api/quotes/${encodeURIComponent(quote.id)}`, {
                method: "PATCH",
                body: JSON.stringify(quote)
            });
        } catch (error) {
            console.error(error);
            showAdminToast("تم الحفظ محليًا، لكن تعذر مزامنة الخادم.");
            return quote;
        }
    }

    renderStatistics();
    renderQuotes();
    showAdminToast("تم حفظ تسعير عرض السعر بنجاح");
    return quote;
}

function showAdminToast(message) {
    let toast = document.getElementById("quoteAdminToast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "quoteAdminToast";
        toast.className = "quote-admin-toast";
        document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2200);
}

function openQuotePrint(quote) {
    if (!quote) return;

    const items = getQuoteItems(quote);
    const totals = calculateQuoteTotals(items);
    const oldSheet = document.getElementById("quotePrintSheet");
    if (oldSheet) oldSheet.remove();

    const rows = items.map((item, index) => `
        <tr>
            <td class="col-no">${index + 1}</td>
            <td class="pdf-image-cell">${item.image ? `<img src="${item.image}" class="pdf-product-image" alt="${escapeHTML(item.productName || "منتج")}">` : "—"}</td>
            <td class="col-product"><strong>${escapeHTML(item.productName || "منتج")}</strong><small>${escapeHTML(item.productCode || "")}</small></td>
            <td class="col-details">${escapeHTML(item.description || "-")}<small>${escapeHTML(item.material || "")} ${item.dimensions ? " • " + escapeHTML(item.dimensions) : ""}</small></td>
            <td class="col-qty">${Number(item.quantity) || 1}</td>
            <td class="col-price">${money(item.unitPrice)}</td>
            <td class="col-total">${money((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0))}</td>
        </tr>`).join("");

    const companyAddress = "الشرقية – بلبيس – باستين الإسماعيلية – قطعة 46-47 – المنطقة الصناعية الثالثة";
    const companyName = "التقي للأثاث المكتبي";
    const warranty = quote.warranty || "يتم تحديد الضمان حسب المنتج وبنود العرض المتفق عليها مع العميل.";

    const sheet = document.createElement("section");
    sheet.id = "quotePrintSheet";
    sheet.innerHTML = `
      <div class="print-company-head">
        <div class="print-company-brand">
          <img src="../assets/images/logo.PNG" class="print-company-logo" alt="AL-TOQA">
          <div>
            <div class="print-company-name">AL-TOQA</div>
            <div class="print-company-arabic">${companyName}</div>
          </div>
        </div>
        <div class="print-company-contact">
          <strong>مصنع الأثاث المكتبي</strong>
          <span>${companyAddress}</span>
        </div>
      </div>

      <div class="print-title-row">
        <div>
          <div class="print-kicker">QUOTATION</div>
          <h1>عرض سعر</h1>
          <span class="print-quote-number">${escapeHTML(quote.id)}</span>
        </div>
        <div class="print-date-box">
          <span>تاريخ الإصدار</span>
          <strong>${escapeHTML(formatDate(quote.createdAt))}</strong>
        </div>
      </div>

      <div class="print-info">
        <div><span>عناية م.</span><strong>${escapeHTML(quote.customerName || "-")}</strong></div>
        <div><span>الشركة</span><strong>${escapeHTML(quote.companyName || "-")}</strong></div>
        <div><span>رقم الهاتف</span><strong>${escapeHTML(quote.customerPhone || "-")}</strong></div>
      </div>

      <div class="print-section-heading"><span>01</span><strong>تفاصيل عرض السعر</strong></div>
      <table class="print-table">
        <thead><tr><th>م</th><th>الصورة</th><th>المنتج</th><th>التفاصيل</th><th>الكمية</th><th>سعر الوحدة</th><th>الإجمالي</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>

      <div class="print-bottom-grid">
        <div class="print-terms">
          <div class="print-term-block"><h3>شروط الدفع</h3><div>${escapeHTML(quote.paymentTerms || "يتم الاتفاق على شروط الدفع مع العميل.")}</div></div>
          <div class="print-term-block"><h3>مدة التوريد</h3><div>${escapeHTML(quote.deliveryPeriod || "يتم تحديدها عند اعتماد الطلب.")}</div></div>
          <div class="print-term-block warranty"><h3>الضمان</h3><div>${escapeHTML(warranty)}</div></div>
        </div>
        <div class="print-summary">
          <div><span>إجمالي المنتجات</span><strong>${money(totals.subtotal)}</strong></div>
          <div><span>القيمة المضافة 14%</span><strong>${money(totals.vat)}</strong></div>
          <div class="grand"><span>الإجمالي النهائي</span><strong>${money(totals.total)}</strong></div>
        </div>
      </div>

      <div class="print-footer">
        <strong>${companyName}</strong>
        <span>${companyAddress}</span>
        <small>هذا العرض صادر عن نظام إدارة عروض الأسعار — ${escapeHTML(quote.id)}</small>
      </div>`;

    document.body.appendChild(sheet);
    document.body.classList.add("printing-quote");

    const images = Array.from(sheet.querySelectorAll("img"));
    const waitForImages = Promise.all(images.map(img => new Promise(resolve => {
        if (img.complete) return resolve();
        img.onload = resolve;
        img.onerror = resolve;
    })));

    waitForImages.then(() => {
        setTimeout(() => {
            window.print();
            setTimeout(() => {
                document.body.classList.remove("printing-quote");
                sheet.remove();
            }, 700);
        }, 120);
    });
}

function sendQuoteWhatsApp(quote, popupWindow = null) {
    if (!quote) {
        popupWindow?.close();
        return;
    }

    const phone = String(quote.customerPhone || "").replace(/[^0-9]/g, "");
    if (!phone) {
        popupWindow?.close();
        showAdminToast("لا يوجد رقم هاتف للعميل.");
        return;
    }

    const items = getQuoteItems(quote);
    const totals = calculateQuoteTotals(items);
    const text = [
        `عرض سعر ${quote.id}`,
        `الشركة: ${quote.companyName || "-"}`,
        `العميل: ${quote.customerName || "-"}`,
        ...items.map((i,n) => `${n+1}. ${i.productName} — الكمية: ${i.quantity} — الإجمالي: ${money((Number(i.quantity)||0)*(Number(i.unitPrice)||0))}`),
        `إجمالي المنتجات: ${money(totals.subtotal)}`,
        `القيمة المضافة 14%: ${money(totals.vat)}`,
        `الإجمالي النهائي: ${money(totals.total)}`,
        `مدة التوريد: ${quote.deliveryPeriod || "-"}`
    ].join("\n");

    const url = `https://wa.me/${normalizeEgyptWhatsApp(phone)}?text=${encodeURIComponent(text)}`;
    if (popupWindow && !popupWindow.closed) {
        popupWindow.location.href = url;
    } else {
        window.open(url, "_blank", "noopener,noreferrer");
    }
}

saveQuotePricingBtn?.addEventListener("click", saveActiveQuotePricing);
printQuotePdfBtn?.addEventListener("click", async () => {
    const quote = (await saveActiveQuotePricing()) || quotesList.find(item => String(item.id) === String(activeQuoteId));
    openQuotePrint(quote);
});
sendQuoteWhatsappBtn?.addEventListener("click", async () => {
    // Open synchronously first so mobile/desktop browsers do not block the WhatsApp tab after await.
    const popup = window.open("about:blank", "_blank");
    const quote = (await saveActiveQuotePricing()) || quotesList.find(item => String(item.id) === String(activeQuoteId));
    sendQuoteWhatsApp(quote, popup);
});

// =========================================================
// CONTACT METHOD
// =========================================================

function getContactMethod(
    method
) {

    if (
        typeof getContactMethodText ===
        "function"
    ) {

        return getContactMethodText(
            method
        );

    }


    const methods = {

        phone: "الهاتف",

        whatsapp: "WhatsApp",

        email: "البريد الإلكتروني"

    };


    return (
        methods[method] ||
        method ||
        "-"
    );

}


// =========================================================
// CLOSE MODAL
// =========================================================

function closeModal() {

    if (quoteModal) {

        quoteModal.classList.remove(
            "show"
        );

    }

}


closeQuoteModal
    ?.addEventListener(
        "click",
        closeModal
    );


closeQuoteModalBottom
    ?.addEventListener(
        "click",
        closeModal
    );


quoteModal
    ?.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                quoteModal
            ) {

                closeModal();

            }

        }
    );


// =========================================================
// DELETE MODAL
// =========================================================

function openDeleteModal(
    id
) {

    quoteToDelete =
        id;


    if (quoteDeleteModal) {

        quoteDeleteModal.classList.add(
            "show"
        );

    }

}


function closeDeleteModal() {

    quoteToDelete =
        null;


    if (quoteDeleteModal) {

        quoteDeleteModal.classList.remove(
            "show"
        );

    }

}


cancelQuoteDelete
    ?.addEventListener(
        "click",
        closeDeleteModal
    );


confirmQuoteDelete
    ?.addEventListener(
        "click",
        async function () {

            if (
                !quoteToDelete
            ) {

                return;

            }


            const quoteId = quoteToDelete;
            try {
                await window.apiRequest(`/api/quotes/${encodeURIComponent(quoteId)}`, {
                    method: "DELETE"
                });
                quotesList = quotesList.filter(function (quote) {
                    return String(quote.id) !== String(quoteId);
                });
                saveQuotes(quotesList);
            } catch (error) {
                console.error(error);
                showAdminToast(error.message || "تعذر حذف عرض السعر من الخادم.");
                return;
            }


            closeDeleteModal();

            loadQuotes();

            renderStatistics();

            renderQuotes();

        }
    );


// =========================================================
// SEARCH
// =========================================================

quoteSearch
    ?.addEventListener(
        "input",
        renderQuotes
    );


// =========================================================
// FILTER
// =========================================================

quoteStatusFilter
    ?.addEventListener(
        "change",
        renderQuotes
    );


// =========================================================
// REFRESH
// =========================================================

refreshQuotes
    ?.addEventListener(
        "click",
        function () {

            loadQuotes();

            renderStatistics();

            renderQuotes();

        }
    );


// =========================================================
// INITIALIZE
// =========================================================

async function initializeQuotesPage() {
    await loadQuotes();
    renderStatistics();
    renderQuotes();
}


initializeQuotesPage();
