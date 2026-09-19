"use strict";

/* =========================================================
   CATEGORIES MANAGEMENT
========================================================= */


/* =========================================================
   CONSTANTS
========================================================= */

const CATEGORIES_STORAGE_KEY =
    "furnitureSubCategories";


/* =========================================================
   ELEMENTS
========================================================= */

const categoryForm =
    document.getElementById("categoryForm");

const categoryNameInput =
    document.getElementById("categoryName");

const parentCategoryInput =
    document.getElementById("parentCategory");

const categoryImageInput =
    document.getElementById("categoryImage");

const categoryImagePreview =
    document.getElementById("categoryImagePreview");

const subcategoriesGrid =
    document.getElementById("subcategoriesGrid");

const categoriesEmpty =
    document.getElementById("categoriesEmpty");

const resetCategoryBtn =
    document.getElementById("resetCategoryBtn");

const filterButtons =
    document.querySelectorAll(
        ".category-filter-btn"
    );

const mainCategoryCards =
    document.querySelectorAll(
        ".main-category-card"
    );


/* =========================================================
   STATE
========================================================= */

let currentFilter = "all";

function escapeHTML(value) {
    const element = document.createElement("div");
    element.textContent = String(value ?? "");
    return element.innerHTML;
}


/* =========================================================
   GET CATEGORIES
========================================================= */

function getSubCategories() { return Array.isArray(window.__categoriesCache) ? window.__categoriesCache : []; }

async function loadSubCategories() {
    saveSubCategories(await window.apiRequest("/api/categories"));
    return window.__categoriesCache;
}


/* =========================================================
   SAVE CATEGORIES
========================================================= */

function saveSubCategories(categories) {
    window.__categoriesCache = Array.isArray(categories) ? categories : [];
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(window.__categoriesCache));
}


/* =========================================================
   GENERATE ID
========================================================= */

function generateCategoryId() {

    return (
        Date.now().toString() +
        Math.floor(
            Math.random() * 1000
        ).toString()
    );

}


/* =========================================================
   MAIN CATEGORY NAME
========================================================= */

function getMainCategoryName(
    category
) {

    const names = {

        office:
            "أثاث مكتبي",

        hotel:
            "أثاث فندقي",

        home:
            "أثاث منزلي"

    };

    return (
        names[category] ||
        category
    );

}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

if (categoryImageInput) {

    categoryImageInput.addEventListener(
        "change",
        function () {

            const file =
                this.files?.[0];

            if (!file) {

                resetImagePreview();

                return;

            }

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "من فضلك اختر ملف صورة صحيح."
                );

                this.value = "";

                resetImagePreview();

                return;

            }


            const reader =
                new FileReader();

            reader.onload =
                function (event) {

                    categoryImagePreview.innerHTML = `

                        <img
                            src="${event.target.result}"
                            alt="معاينة صورة القسم"
                        >

                    `;

                };


            reader.readAsDataURL(file);

        }
    );

}


/* =========================================================
   RESET IMAGE PREVIEW
========================================================= */

function resetImagePreview() {

    if (!categoryImagePreview) {
        return;
    }

    categoryImagePreview.innerHTML = `

        <div>

            <span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            </span>

            <strong>
                معاينة الصورة
            </strong>

            <small>
                ستظهر الصورة هنا
            </small>

        </div>

    `;

}


/* =========================================================
   RENDER CATEGORIES
========================================================= */

function renderSubCategories() {

    if (!subcategoriesGrid) {
        return;
    }


    const categories =
        getSubCategories();


    const filtered =
        categories.filter(
            function (category) {

                if (
                    currentFilter ===
                    "all"
                ) {

                    return true;

                }

                return (
                    category.parentCategory ===
                    currentFilter
                );

            }
        );


    subcategoriesGrid.innerHTML = "";


    if (!filtered.length) {

        subcategoriesGrid.style.display =
            "none";

        categoriesEmpty.style.display =
            "block";

        updateCounts();

        return;

    }


    subcategoriesGrid.style.display =
        "grid";

    categoriesEmpty.style.display =
        "none";


    filtered.forEach(
        function (category) {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "subcategory-card";


            card.innerHTML = `

                <div class="subcategory-image">

                    <img
                        src="${category.image}"
                        alt="${escapeHTML(category.name)}"
                    >

                </div>


                <div class="subcategory-info">

                    <span class="subcategory-parent">
                        ${escapeHTML(
                            getMainCategoryName(
                                category.parentCategory
                            )
                        )}
                    </span>

                    <h3>
                        ${escapeHTML(
                            category.name
                        )}
                    </h3>


                    <div class="subcategory-actions">

                        <button
                            type="button"
                            class="delete-btn"
                            data-id="${category.id}"
                        >
                            حذف
                        </button>

                    </div>

                </div>

            `;


            const deleteButton =
                card.querySelector(
                    ".delete-btn"
                );


            deleteButton.addEventListener(
                "click",
                function () {

                    deleteSubCategory(
                        category.id
                    );

                }
            );


            subcategoriesGrid.appendChild(
                card
            );

        }
    );


    updateCounts();

}


/* =========================================================
   UPDATE COUNTS
========================================================= */

function updateCounts() {

    const categories =
        getSubCategories();


    document
        .querySelectorAll(
            ".category-count"
        )
        .forEach(
            function (element) {

                const category =
                    element.dataset.count;


                const count =
                    categories.filter(
                        function (item) {

                            return (
                                item.parentCategory ===
                                category
                            );

                        }
                    ).length;


                element.textContent =
                    `${count} قسم فرعي`;

            }
        );

}


/* =========================================================
   DELETE CATEGORY
========================================================= */

async function deleteSubCategory(categoryId) {
    const category = getSubCategories().find(item => String(item.id) === String(categoryId));
    if (!category || !confirm(`هل أنت متأكد من حذف قسم "${category.name}"؟`)) return;
    try { await window.apiRequest(`/api/categories/${categoryId}`, {method:"DELETE"}); await loadSubCategories(); renderSubCategories(); }
    catch (e) { alert(e.message || "تعذر حذف القسم."); }
}


/* =========================================================
   ADD CATEGORY
========================================================= */

if (categoryForm) {
    categoryForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        const name = categoryNameInput.value.trim();
        const parentCategory = parentCategoryInput.value;
        const file = categoryImageInput.files?.[0];
        if (!name || !parentCategory || !file) { alert("من فضلك أكمل بيانات القسم والصورة."); return; }
        if (!file.type.startsWith("image/")) { alert("الملف المختار ليس صورة."); return; }
        if (file.size > 2 * 1024 * 1024) { alert("حجم صورة القسم يجب ألا يزيد عن 2MB."); return; }
        const reader = new FileReader();
        reader.onload = async function(e) {
            try {
                await window.apiRequest("/api/categories", {method:"POST", body:JSON.stringify({name,parentCategory,image:e.target.result,active:true})});
                await loadSubCategories(); renderSubCategories(); categoryForm.reset(); resetImagePreview();
                alert("تم حفظ القسم في قاعدة البيانات.");
            } catch (err) { alert(err.message || "تعذر حفظ القسم."); }
        };
        reader.readAsDataURL(file);
    });
}

filterButtons.forEach(function(button) { button.addEventListener("click", function() { currentFilter = this.dataset.category || "all"; filterButtons.forEach(b=>b.classList.remove("active")); this.classList.add("active"); renderSubCategories(); }); });
mainCategoryCards.forEach(function(card) { card.addEventListener("click", function(){ currentFilter=this.dataset.category||"all"; renderSubCategories(); }); });
resetCategoryBtn?.addEventListener("click", function(){ categoryForm?.reset(); resetImagePreview(); });
(async function(){ try { await loadSubCategories(); renderSubCategories(); } catch(e) { console.error(e); if(categoriesEmpty) { categoriesEmpty.style.display="block"; categoriesEmpty.textContent="تعذر تحميل الأقسام من قاعدة البيانات."; } } })();
