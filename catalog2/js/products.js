"use strict";

/* =========================================================
   PRODUCTS PAGE
   =========================================================

   الوظائف:
   1. عرض المنتجات
   2. البحث في جميع المنتجات
   3. فلترة القسم الرئيسي
   4. فلترة القسم الفرعي
   5. قراءة الأقسام الفرعية من localStorage
   6. Slider للأقسام الفرعية
   7. Slider للعروض
   8. فتح تفاصيل المنتج بالضغط على الـ Card بالكامل
   9. قراءة category من URL
   10. دعم المنتجات القديمة والجديدة
========================================================= */


/* =========================================================
   STORAGE KEYS
========================================================= */

const PRODUCTS_STORAGE_KEY =
    "furnitureProducts";

const CATEGORIES_STORAGE_KEY =
    "furnitureSubCategories";


/* =========================================================
   MAIN CATEGORIES
========================================================= */

const MAIN_CATEGORY_NAMES = {

    office: "أثاث مكتبي",

    hotel: "أثاث فندقي",

    home: "أثاث منزلي"

};


/* =========================================================
   ELEMENTS
========================================================= */

const productsGrid =
    document.getElementById("productsGrid");

const productsCount =
    document.getElementById("productsCount");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const clearSearch =
    document.getElementById("clearSearch");

const resetProducts =
    document.getElementById("resetProducts");

const resultsText =
    document.getElementById("resultsText");

const activeSubcategory =
    document.getElementById("activeSubcategory");

const categoriesTrack =
    document.getElementById("categoriesTrack");

const categoriesSlider =
    document.getElementById("categoriesSlider");

const noSubcategories =
    document.getElementById("noSubcategories");

const offersTrack =
    document.getElementById("offersTrack");

const offersSlider =
    document.getElementById("offersSlider");

const offersPrev =
    document.getElementById("offersPrev");

const offersNext =
    document.getElementById("offersNext");

const categoriesPrev =
    document.getElementById("categoriesPrev");

const categoriesNext =
    document.getElementById("categoriesNext");


const filterButtons =
    document.querySelectorAll(
        ".filter-btn"
    );


const mainCategoryTabs =
    document.querySelectorAll(
        ".main-category-tab"
    );


/* =========================================================
   STATE
========================================================= */

let currentCategory = "all";

let currentSubCategory = "all";

let currentSearch = "";


/* =========================================================
   URL PARAMETERS
========================================================= */

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const urlCategory =
    urlParams.get("category");


const urlSubCategory =
    urlParams.get("subcategory");


/* =========================================================
   GET PRODUCTS
========================================================= */

function getProducts() {

    /*
        أولاً نحاول قراءة البيانات من
        furnitureProducts
    */

    const saved =
        localStorage.getItem(
            PRODUCTS_STORAGE_KEY
        );


    if (!saved) {

        /*
            لو مفيش منتجات محفوظة في
            localStorage نحاول استخدام
            products الموجودة في data.js
        */

        if (
            typeof products !== "undefined" &&
            Array.isArray(products)
        ) {

            return products;

        }


        return [];

    }


    try {

        const parsed =
            JSON.parse(saved);


        if (
            Array.isArray(parsed)
        ) {

            return parsed;

        }

    } catch (error) {

        console.error(
            "خطأ في قراءة المنتجات:",
            error
        );

    }


    return [];

}


/* =========================================================
   GET SUB CATEGORIES
========================================================= */

function getSubCategories() {

    const saved =
        localStorage.getItem(
            CATEGORIES_STORAGE_KEY
        );


    if (!saved) {

        return [];

    }


    try {

        const parsed =
            JSON.parse(saved);


        if (
            Array.isArray(parsed)
        ) {

            return parsed;

        }

    } catch (error) {

        console.error(
            "خطأ في قراءة الأقسام الفرعية:",
            error
        );

    }


    return [];

}


/* =========================================================
   SAVE PRODUCTS
========================================================= */

function saveProducts(
    productList
) {

    localStorage.setItem(
        PRODUCTS_STORAGE_KEY,
        JSON.stringify(productList)
    );

}


/* =========================================================
   NORMALIZE PRODUCT
========================================================= */

function normalizeProduct(
    product
) {

    if (!product) {

        return null;

    }


    /*
        بعض المنتجات القديمة ممكن يكون
        فيها image فقط.

        المنتجات الجديدة ممكن يكون فيها
        images array.
    */


    let images = [];


    if (
        Array.isArray(product.images)
    ) {

        images =
            product.images.filter(
                Boolean
            );

    }


    if (
        !images.length &&
        product.image
    ) {

        images = [
            product.image
        ];

    }


    return {

        ...product,

        images: images,

        image:
            product.image ||
            images[0] ||
            "",

        name:
            product.name ||
            product.productName ||
            "منتج بدون اسم",

        code:
            product.code ||
            product.productCode ||
            "",

        category:
            product.category ||
            "office",

        subCategory:
            product.subCategory ||
            product.subCategoryId ||
            product.subcategory ||
            "",

        subCategoryName:
            product.subCategoryName ||
            "",

        description:
            product.description ||
            "",

        material:
            product.material ||
            "",

        dimensions:
            product.dimensions ||
            "",

        status:
            product.status ||
            "active",

        featured:
            Boolean(
                product.featured
            ),

        discount:
            product.discount ||
            product.offer ||
            product.discountPercent ||
            0

    };

}


/* =========================================================
   GET NORMALIZED PRODUCTS
========================================================= */

function getNormalizedProducts() {

    return getProducts()
        .map(normalizeProduct)
        .filter(Boolean);

}


/* =========================================================
   GET PRODUCT SUBCATEGORY ID
========================================================= */

function getProductSubCategoryId(
    product
) {

    return String(
        product.subCategory ||
        product.subCategoryId ||
        product.subcategory ||
        ""
    );

}


/* =========================================================
   GET PRODUCT SUBCATEGORY NAME
========================================================= */

function getProductSubCategoryName(
    product
) {

    if (
        product.subCategoryName
    ) {

        return product.subCategoryName;

    }


    const subCategories =
        getSubCategories();


    const subCategory =
        subCategories.find(
            function (item) {

                return (
                    String(item.id) ===
                    getProductSubCategoryId(
                        product
                    )
                );

            }
        );


    return (
        subCategory?.name ||
        ""
    );

}


/* =========================================================
   GET PRODUCT IMAGE
========================================================= */

function getProductImage(
    product
) {

    if (
        product.images &&
        product.images.length
    ) {

        return product.images[0];

    }


    if (product.image) {

        return product.image;

    }


    return "";


}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


/* =========================================================
   GET CATEGORY NAME
========================================================= */

function getCategoryName(
    category
) {

    return (
        MAIN_CATEGORY_NAMES[
            category
        ] ||
        category ||
        ""
    );

}


/* =========================================================
   PRODUCT MATCH SEARCH
========================================================= */

function productMatchesSearch(
    product,
    search
) {

    if (!search) {

        return true;

    }


    const subCategoryName =
        getProductSubCategoryName(
            product
        );


    const searchableText = [

        product.name,

        product.code,

        product.description,

        product.material,

        product.dimensions,

        product.category,

        getCategoryName(
            product.category
        ),

        subCategoryName

    ]
        .join(" ")
        .toLowerCase();


    return searchableText.includes(
        search.toLowerCase()
    );

}


/* =========================================================
   FILTER PRODUCTS
========================================================= */

function getFilteredProducts() {

    const allProducts =
        getNormalizedProducts();


    return allProducts.filter(
        function (product) {


            /* =========================================
               HIDDEN PRODUCTS
            ========================================= */

            if (
                product.status ===
                "hidden"
            ) {

                return false;

            }


            /* =========================================
               MAIN CATEGORY
            ========================================= */

            if (
                currentCategory !==
                "all"
            ) {

                if (
                    product.category !==
                    currentCategory
                ) {

                    return false;

                }

            }


            /* =========================================
               SUB CATEGORY
            ========================================= */

            if (
                currentSubCategory !==
                "all"
            ) {

                const productSubCategory =
                    getProductSubCategoryId(
                        product
                    );


                if (
                    productSubCategory !==
                    String(
                        currentSubCategory
                    )
                ) {

                    return false;

                }

            }


            /* =========================================
               SEARCH
            ========================================= */

            if (
                !productMatchesSearch(
                    product,
                    currentSearch
                )
            ) {

                return false;

            }


            return true;

        }
    );

}


/* =========================================================
   RENDER PRODUCTS
========================================================= */

function renderProducts() {

    if (!productsGrid) {

        return;

    }


    const filteredProducts =
        getFilteredProducts();


    productsGrid.innerHTML = "";


    /* =========================================
       COUNT
    ========================================= */

    if (productsCount) {

        productsCount.textContent =
            filteredProducts.length;

    }


    /* =========================================
       EMPTY STATE
    ========================================= */

    if (!filteredProducts.length) {

        productsGrid.style.display =
            "none";


        if (emptyState) {

            emptyState.style.display =
                "block";

        }


        updateResultsText(
            0
        );


        return;

    }


    productsGrid.style.display =
        "grid";


    if (emptyState) {

        emptyState.style.display =
            "none";

    }


    /* =========================================
       PRODUCTS
    ========================================= */

    filteredProducts.forEach(
        function (product) {

            const card =
                createProductCard(
                    product
                );


            productsGrid.appendChild(
                card
            );

        }
    );


    updateResultsText(
        filteredProducts.length
    );

}


/* =========================================================
   CREATE PRODUCT CARD
========================================================= */

function createProductCard(
    product
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "product-card";


    card.setAttribute(
        "tabindex",
        "0"
    );


    const image =
        getProductImage(
            product
        );


    const subCategoryName =
        getProductSubCategoryName(
            product
        );


    const discount =
        Number(
            product.discount
        ) || 0;


    let badges = "";


    if (product.featured) {

        badges += `

            <span class="product-badge featured-badge">
                مميز
            </span>

        `;

    }


    if (discount > 0) {

        badges += `

            <span class="product-badge offer-badge">
                خصم ${discount}%
            </span>

        `;

    }


    card.innerHTML = `

        <div class="product-card-image">

            ${
                image
                ?
                `
                    <img
                        src="${image}"
                        alt="${escapeHTML(product.name)}"
                        loading="lazy"
                    >
                `
                :
                `
                    <div class="product-image-placeholder">
                        <span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4"/><path d="M6 13v7"/><path d="M18 13v7"/><path d="M6 8h12"/></svg></span>
                        <small>
                            لا توجد صورة
                        </small>
                    </div>
                `
            }


            ${
                badges
                ?
                `
                    <div class="product-badges">
                        ${badges}
                    </div>
                `
                :
                ""
            }


            <div class="product-card-overlay">

                <span>
                    عرض التفاصيل
                </span>

            </div>

        </div>


        <div class="product-card-content">


            <div class="product-card-meta">

                <span>
                    ${escapeHTML(
                        getCategoryName(
                            product.category
                        )
                    )}
                </span>


                ${
                    subCategoryName
                    ?
                    `
                        <span>
                            ${escapeHTML(
                                subCategoryName
                            )}
                        </span>
                    `
                    :
                    ""
                }

            </div>


            <h3>
                ${escapeHTML(
                    product.name
                )}
            </h3>


            ${
                product.code
                ?
                `
                    <p class="product-code">
                        ${escapeHTML(
                            product.code
                        )}
                    </p>
                `
                :
                ""
            }


            ${
                product.description
                ?
                `
                    <p class="product-description">
                        ${escapeHTML(
                            product.description
                        )}
                    </p>
                `
                :
                ""
            }


            <div class="product-card-footer">

                ${
                    product.material
                    ?
                    `
                        <span>
                            ${escapeHTML(
                                product.material
                            )}
                        </span>
                    `
                    :
                    ""
                }


                <button type="button" class="add-to-quote-btn" data-quote-product="${escapeHTML(String(product.id))}">
                    + إضافة للعرض
                </button>

                <span class="product-details-arrow">
                    ←
                </span>

            </div>

        </div>

    `;


    /*
        الضغط على الـ Card بالكامل
        يفتح صفحة التفاصيل.
    */

    const quoteButton = card.querySelector(".add-to-quote-btn");
    quoteButton?.addEventListener("click", function (event) {
        event.stopPropagation();
        if (typeof addProductToQuoteCart === "function") {
            addProductToQuoteCart(product, 1);
            quoteButton.textContent = "✓ تمت الإضافة";
            setTimeout(() => { quoteButton.textContent = "+ إضافة للعرض"; }, 1400);
        }
    });

    card.addEventListener(
        "click",
        function () {

            openProductDetails(
                product.id
            );

        }
    );


    /*
        دعم Enter من الكيبورد
    */

    card.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                openProductDetails(
                    product.id
                );

            }

        }
    );


    return card;

}


/* =========================================================
   OPEN PRODUCT DETAILS
========================================================= */

function openProductDetails(
    productId
) {

    if (
        productId === undefined ||
        productId === null ||
        productId === ""
    ) {

        return;

    }


    window.location.href =
        `product-details.html?id=${encodeURIComponent(
            productId
        )}`;

}


/* =========================================================
   UPDATE RESULTS TEXT
========================================================= */

function updateResultsText(
    count
) {

    if (!resultsText) {

        return;

    }


    if (currentSearch) {

        resultsText.textContent =
            `نتائج البحث عن "${currentSearch}"`;

        return;

    }


    if (
        currentSubCategory !==
        "all"
    ) {

        const subCategory =
            getSubCategories().find(
                function (item) {

                    return (
                        String(item.id) ===
                        String(
                            currentSubCategory
                        )
                    );

                }
            );


        if (subCategory) {

            resultsText.textContent =
                subCategory.name;

            return;

        }

    }


    if (
        currentCategory !==
        "all"
    ) {

        resultsText.textContent =
            getCategoryName(
                currentCategory
            );

        return;

    }


    resultsText.textContent =
        "جميع المنتجات";

}


/* =========================================================
   RENDER SUB CATEGORIES
========================================================= */

function renderSubCategories() {

    if (!categoriesTrack) {

        return;

    }


    const subCategories =
        getSubCategories();


    categoriesTrack.innerHTML =
        "";


    if (!subCategories.length) {

        categoriesTrack.innerHTML =
            "";


        if (noSubcategories) {

            noSubcategories.style.display =
                "block";

        }


        return;

    }


    if (noSubcategories) {

        noSubcategories.style.display =
            "none";

    }


    /*
        لو المستخدم اختار قسم رئيسي
        نعرض الأقسام الفرعية التابعة له فقط.
    */

    let visibleCategories =
        subCategories;


    if (
        currentCategory !==
        "all"
    ) {

        visibleCategories =
            subCategories.filter(
                function (category) {

                    return (
                        category.parentCategory ===
                        currentCategory
                    );

                }
            );

    }


    /*
        إنشاء زر "الكل"
    */

    if (
        currentCategory !==
        "all" ||
        visibleCategories.length
    ) {

        const allCard =
            document.createElement(
                "button"
            );


        allCard.type =
            "button";


        allCard.className =
            "subcategory-circle-card all-subcategory";


        if (
            currentSubCategory ===
            "all"
        ) {

            allCard.classList.add(
                "active"
            );

        }


        allCard.innerHTML = `

            <div class="subcategory-circle-image all-category-image">

                <span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </span>

            </div>


            <strong>
                الكل
            </strong>

            <small>
                جميع المنتجات
            </small>

        `;


        allCard.addEventListener(
            "click",
            function () {

                currentSubCategory =
                    "all";


                renderSubCategories();

                renderProducts();

                updateActiveSubCategory();

            }
        );


        categoriesTrack.appendChild(
            allCard
        );

    }


    /*
        الأقسام الفرعية
    */

    visibleCategories.forEach(
        function (category) {

            const card =
                document.createElement(
                    "button"
                );


            card.type =
                "button";


            card.className =
                "subcategory-circle-card";


            if (
                String(
                    currentSubCategory
                ) ===
                String(
                    category.id
                )
            ) {

                card.classList.add(
                    "active"
                );

            }


            card.innerHTML = `

                <div class="subcategory-circle-image">

                    ${
                        category.image
                        ?
                        `
                            <img
                                src="${category.image}"
                                alt="${escapeHTML(
                                    category.name
                                )}"
                                loading="lazy"
                            >
                        `
                        :
                        `
                            <span>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4"/><path d="M6 13v7"/><path d="M18 13v7"/><path d="M6 8h12"/></svg>
                            </span>
                        `
                    }

                </div>


                <strong>
                    ${escapeHTML(
                        category.name
                    )}
                </strong>


                <small>
                    ${escapeHTML(
                        getCategoryName(
                            category.parentCategory
                        )
                    )}
                </small>

            `;


            card.addEventListener(
                "click",
                function () {

                    currentSubCategory =
                        String(
                            category.id
                        );


                    /*
                        لو القسم الفرعي تابع
                        لقسم رئيسي، نحدد القسم الرئيسي
                    */

                    if (
                        category.parentCategory
                    ) {

                        currentCategory =
                            category.parentCategory;


                        updateMainCategoryButtons();

                        updateFilterButtons();

                    }


                    renderSubCategories();

                    renderProducts();

                    updateActiveSubCategory();

                }
            );


            categoriesTrack.appendChild(
                card
            );

        }
    );


    updateActiveSubCategory();

}


/* =========================================================
   ACTIVE SUBCATEGORY
========================================================= */

function updateActiveSubCategory() {

    if (!activeSubcategory) {

        return;

    }


    if (
        currentSubCategory ===
        "all"
    ) {

        activeSubcategory.innerHTML =
            "";

        return;

    }


    const category =
        getSubCategories().find(
            function (item) {

                return (
                    String(item.id) ===
                    String(
                        currentSubCategory
                    )
                );

            }
        );


    if (!category) {

        activeSubcategory.innerHTML =
            "";

        return;

    }


    activeSubcategory.innerHTML = `

        <span>
            القسم الحالي:
        </span>

        <strong>
            ${escapeHTML(
                category.name
            )}
        </strong>

        <button
            type="button"
            id="clearSubCategory"
            aria-label="إلغاء القسم الفرعي"
        >
            ×
        </button>

    `;


    const clearButton =
        document.getElementById(
            "clearSubCategory"
        );


    clearButton?.addEventListener(
        "click",
        function () {

            currentSubCategory =
                "all";


            renderSubCategories();

            renderProducts();

            updateActiveSubCategory();

        }
    );

}


/* =========================================================
   MAIN CATEGORY BUTTONS
========================================================= */

function updateMainCategoryButtons() {

    mainCategoryTabs.forEach(
        function (button) {

            button.classList.toggle(
                "active",
                button.dataset.category ===
                currentCategory
            );

        }
    );

}


/* =========================================================
   FILTER BUTTONS
========================================================= */

function updateFilterButtons() {

    filterButtons.forEach(
        function (button) {

            button.classList.toggle(
                "active",
                button.dataset.category ===
                currentCategory
            );

        }
    );

}


/* =========================================================
   MAIN CATEGORY FILTER
========================================================= */

function selectMainCategory(
    category
) {

    currentCategory =
        category;


    /*
        عند تغيير القسم الرئيسي
        نرجع للقسم الفرعي "الكل"
    */

    currentSubCategory =
        "all";


    updateMainCategoryButtons();

    updateFilterButtons();

    renderSubCategories();

    renderProducts();

    updateActiveSubCategory();

}


/* =========================================================
   FILTER EVENTS
========================================================= */

filterButtons.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                selectMainCategory(
                    this.dataset.category
                );

            }
        );

    }
);


/* =========================================================
   MAIN CATEGORY TAB EVENTS
========================================================= */

mainCategoryTabs.forEach(
    function (button) {

        button.addEventListener(
            "click",
            function () {

                selectMainCategory(
                    this.dataset.category
                );

            }
        );

    }
);


/* =========================================================
   SEARCH
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function () {

            currentSearch =
                this.value.trim();


            /*
                البحث هنا لا يلغي القسم
                لكنه يبحث داخل المنتجات
                المطابقة للقسم الحالي.

                ولو القسم = الكل
                يبحث في كل المنتجات.
            */

            renderProducts();

            updateSearchButton();

        }
    );

}


/* =========================================================
   CLEAR SEARCH
========================================================= */

if (clearSearch) {

    clearSearch.addEventListener(
        "click",
        function () {

            if (searchInput) {

                searchInput.value =
                    "";

            }


            currentSearch =
                "";


            renderProducts();

            updateSearchButton();

        }
    );

}


/* =========================================================
   SEARCH BUTTON STATE
========================================================= */

function updateSearchButton() {

    if (!clearSearch) {

        return;

    }


    clearSearch.style.display =
        currentSearch
        ?
        "flex"
        :
        "none";

}


/* =========================================================
   RESET ALL FILTERS
========================================================= */

if (resetProducts) {

    resetProducts.addEventListener(
        "click",
        function () {

            currentCategory =
                "all";


            currentSubCategory =
                "all";


            currentSearch =
                "";


            if (searchInput) {

                searchInput.value =
                    "";

            }


            updateMainCategoryButtons();

            updateFilterButtons();

            renderSubCategories();

            renderProducts();

            updateActiveSubCategory();

            updateSearchButton();

        }
    );

}


/* =========================================================
   OFFERS
========================================================= */

function getOfferProducts() {

    const allProducts =
        getNormalizedProducts();


    /*
        المنتج يعتبر عرض إذا:
        - featured = true
        أو
        - discount أكبر من صفر
        أو
        - offer = true
    */

    return allProducts.filter(
        function (product) {

            return (
                product.featured ||
                Number(product.discount) > 0 ||
                product.offer === true
            );

        }
    );

}


/* =========================================================
   RENDER OFFERS
========================================================= */

function renderOffers() {

    if (!offersTrack) {

        return;

    }


    const offers =
        getOfferProducts();


    offersTrack.innerHTML =
        "";


    /*
        لو مفيش عروض
        نعرض بعض المنتجات المميزة
        بدل ما السلايدر يفضل فاضي.
    */

    let displayProducts =
        offers;


    if (!displayProducts.length) {

        displayProducts =
            getNormalizedProducts()
                .filter(
                    function (product) {

                        return (
                            product.status !==
                            "hidden"
                        );

                    }
                )
                .slice(0, 6);

    }


    if (!displayProducts.length) {

        offersTrack.innerHTML = `

            <div class="offer-empty">

                <span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                </span>

                <h3>
                    لا توجد عروض حاليًا
                </h3>

                <p>
                    سيتم عرض المنتجات المميزة هنا.
                </p>

            </div>

        `;


        return;

    }


    displayProducts.forEach(
        function (product) {

            const card =
                createOfferCard(
                    product
                );


            offersTrack.appendChild(
                card
            );

        }
    );

}


/* =========================================================
   CREATE OFFER CARD
========================================================= */

function createOfferCard(
    product
) {

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "offer-card";


    const image =
        getProductImage(
            product
        );


    const discount =
        Number(
            product.discount
        ) || 0;


    card.innerHTML = `

        <div class="offer-card-image">

            ${
                image
                ?
                `
                    <img
                        src="${image}"
                        alt="${escapeHTML(
                            product.name
                        )}"
                        loading="lazy"
                    >
                `
                :
                `
                    <div class="offer-placeholder">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4v9a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4"/><path d="M6 13v7"/><path d="M18 13v7"/><path d="M6 8h12"/></svg>
                    </div>
                `
            }

        </div>


        <div class="offer-card-content">

            <span class="offer-label">
                ${
                    discount > 0
                    ?
                    `خصم ${discount}%`
                    :
                    "منتج مميز"
                }
            </span>


            <h3>
                ${escapeHTML(
                    product.name
                )}
            </h3>


            <p>
                ${escapeHTML(
                    product.description ||
                    "اكتشف تفاصيل المنتج وتصميمه."
                )}
            </p>


            <span class="offer-view">
                اكتشف المنتج ←
            </span>

        </div>

    `;


    card.addEventListener(
        "click",
        function () {

            openProductDetails(
                product.id
            );

        }
    );


    return card;

}


/* =========================================================
   SLIDER HELPER
========================================================= */

function scrollSlider(
    element,
    direction
) {

    if (!element) {

        return;

    }


    const amount =
        Math.max(
            element.clientWidth * 0.75,
            280
        );


    element.scrollBy({

        left:
            direction === "next"
            ?
            amount
            :
            -amount,

        behavior:
            "smooth"

    });

}


/* =========================================================
   OFFERS SLIDER BUTTONS
========================================================= */

if (offersNext) {

    offersNext.addEventListener(
        "click",
        function () {

            scrollSlider(
                offersSlider,
                "next"
            );

        }
    );

}


if (offersPrev) {

    offersPrev.addEventListener(
        "click",
        function () {

            scrollSlider(
                offersSlider,
                "prev"
            );

        }
    );

}


/* =========================================================
   CATEGORIES SLIDER BUTTONS
========================================================= */

if (categoriesNext) {

    categoriesNext.addEventListener(
        "click",
        function () {

            scrollSlider(
                categoriesSlider,
                "next"
            );

        }
    );

}


if (categoriesPrev) {

    categoriesPrev.addEventListener(
        "click",
        function () {

            scrollSlider(
                categoriesSlider,
                "prev"
            );

        }
    );

}


/* =========================================================
   AUTO OFFERS SLIDER
========================================================= */

let offersAutoSlide;


function startOffersAutoSlide() {

    stopOffersAutoSlide();


    offersAutoSlide =
        setInterval(
            function () {

                if (!offersSlider) {

                    return;

                }


                const maxScroll =
                    offersSlider.scrollWidth -
                    offersSlider.clientWidth;


                if (
                    maxScroll <= 5
                ) {

                    return;

                }


                if (
                    offersSlider.scrollLeft <=
                    -maxScroll + 10
                ) {

                    offersSlider.scrollTo({

                        left: 0,

                        behavior: "smooth"

                    });

                    return;

                }


                scrollSlider(
                    offersSlider,
                    "next"
                );

            },
            4500
        );

}


function stopOffersAutoSlide() {

    if (offersAutoSlide) {

        clearInterval(
            offersAutoSlide
        );

        offersAutoSlide =
            null;

    }

}


/* =========================================================
   PAUSE AUTO SLIDE ON HOVER
========================================================= */

if (offersSlider) {

    offersSlider.addEventListener(
        "mouseenter",
        stopOffersAutoSlide
    );


    offersSlider.addEventListener(
        "mouseleave",
        startOffersAutoSlide
    );


    offersSlider.addEventListener(
        "touchstart",
        stopOffersAutoSlide,
        {
            passive: true
        }
    );


    offersSlider.addEventListener(
        "touchend",
        function () {

            setTimeout(
                startOffersAutoSlide,
                2500
            );

        },
        {
            passive: true
        }
    );

}


/* =========================================================
   URL CATEGORY
========================================================= */

function initializeFromURL() {

    if (
        urlCategory &&
        [
            "office",
            "hotel",
            "home"
        ].includes(
            urlCategory
        )
    ) {

        currentCategory =
            urlCategory;

    }


    if (urlSubCategory) {

        const subCategories =
            getSubCategories();


        const subCategory =
            subCategories.find(
                function (item) {

                    return (
                        String(item.id) ===
                        String(
                            urlSubCategory
                        )
                    );

                }
            );


        if (subCategory) {

            currentSubCategory =
                String(
                    subCategory.id
                );


            currentCategory =
                subCategory.parentCategory;

        }

    }


    updateMainCategoryButtons();

    updateFilterButtons();

}


/* =========================================================
   REMOTE PRODUCTS (Supabase through Flask)
========================================================= */

async function loadProductsFromServer() {
    try {
        const remote = await window.apiRequest("/api/products");
        if (Array.isArray(remote)) {
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(remote));
            return remote;
        }
    } catch (error) {
        console.error("تعذر تحميل المنتجات من الخادم:", error);
    }
    return getProducts();
}

/* =========================================================
   STORAGE CHANGE
========================================================= */

window.addEventListener(
    "storage",
    function (event) {

        if (
            event.key ===
            PRODUCTS_STORAGE_KEY
        ) {

            renderProducts();

            renderOffers();

        }


        if (
            event.key ===
            CATEGORIES_STORAGE_KEY
        ) {

            renderSubCategories();

            renderProducts();

        }

    }
);


/* =========================================================
   PAGE VISIBILITY
========================================================= */

document.addEventListener(
    "visibilitychange",
    function () {

        if (
            document.hidden
        ) {

            stopOffersAutoSlide();

        } else {

            startOffersAutoSlide();

        }

    }
);


/* =========================================================
   INITIALIZE
========================================================= */

async function initializeProductsPage() {

    // Load the authoritative product list from Flask/Supabase first.
    await loadProductsFromServer();

    initializeFromURL();
    renderSubCategories();
    renderOffers();
    renderProducts();
    updateActiveSubCategory();
    updateSearchButton();
    startOffersAutoSlide();
}


/* =========================================================
   START
========================================================= */

initializeProductsPage();