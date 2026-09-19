// =========================================================
// ADD PRODUCT
// Furniture Factory
// =========================================================

"use strict";


// =========================================================
// STORAGE KEYS
// =========================================================

const PRODUCTS_STORAGE_KEY =
    "furnitureProducts";

const SUBCATEGORIES_STORAGE_KEY =
    "furnitureSubCategories";


// =========================================================
// ELEMENTS
// =========================================================

const addProductForm =
    document.getElementById("addProductForm");

const productName =
    document.getElementById("productName");

const productCode =
    document.getElementById("productCode");

const productCategory =
    document.getElementById("productCategory");

const productStatus =
    document.getElementById("productStatus");

const productDescription =
    document.getElementById("productDescription");

const productMaterial =
    document.getElementById("productMaterial");

const productDimensions =
    document.getElementById("productDimensions");

const productFeatured =
    document.getElementById("productFeatured");

const productColorInput =
    document.getElementById("productColorInput");

const addColorBtn =
    document.getElementById("addColorBtn");

const selectedColors =
    document.getElementById("selectedColors");

const productImage =
    document.getElementById("productImage");

const imagePreview =
    document.getElementById("imagePreview");

const productFormMessage =
    document.getElementById("productFormMessage");


// =========================================================
// CREATE SUBCATEGORY SELECT
// =========================================================

let productSubcategory =
    document.getElementById("productSubcategory");


// =========================================================
// CATEGORY NAMES
// =========================================================

const mainCategoryNames = {

    office:
        "أثاث مكتبي",

    hotel:
        "أثاث فندقي",

    home:
        "أثاث منزلي"

};


// =========================================================
// STATE
// =========================================================

let selectedProductColors = [];

let selectedProductImages = [];


// =========================================================
// GET PRODUCTS
// =========================================================

function getProducts() {

    const savedProducts =
        localStorage.getItem(
            PRODUCTS_STORAGE_KEY
        );

    if (savedProducts) {

        try {

            const parsedProducts =
                JSON.parse(
                    savedProducts
                );

            if (
                Array.isArray(
                    parsedProducts
                )
            ) {

                return parsedProducts;

            }

        } catch (error) {

            console.error(
                "خطأ في قراءة المنتجات:",
                error
            );

        }

    }


    // =====================================================
    // DEFAULT DATA
    // =====================================================

    if (
        typeof products !== "undefined" &&
        Array.isArray(products)
    ) {

        localStorage.setItem(
            PRODUCTS_STORAGE_KEY,
            JSON.stringify(products)
        );

        return products;

    }


    return [];

}


// =========================================================
// SAVE PRODUCTS
// =========================================================

function saveProducts(
    productsList
) {

    localStorage.setItem(
        PRODUCTS_STORAGE_KEY,
        JSON.stringify(
            productsList
        )
    );

}


// =========================================================
// GET SUBCATEGORIES
// =========================================================

let availableSubCategories = [];

function getSubCategories() {

    if (availableSubCategories.length) {
        return availableSubCategories;
    }

    const savedCategories = localStorage.getItem(SUBCATEGORIES_STORAGE_KEY);


    if (!savedCategories) {

        return [];

    }


    try {

        const parsedCategories =
            JSON.parse(
                savedCategories
            );


        if (
            Array.isArray(
                parsedCategories
            )
        ) {

            availableSubCategories = parsedCategories;
            return availableSubCategories;

        }

    } catch (error) {

        console.error(
            "خطأ في قراءة الأقسام الفرعية:",
            error
        );

    }


    return [];

}

async function syncSubCategoriesBeforeFormUse() {
    const remoteCategories = await window.apiRequest("/api/categories");
    availableSubCategories = Array.isArray(remoteCategories) ? remoteCategories : [];
    localStorage.setItem(SUBCATEGORIES_STORAGE_KEY, JSON.stringify(availableSubCategories));
    loadSubcategories();
}


// =========================================================
// GENERATE PRODUCT CODE
// =========================================================

function generateProductCode(
    category
) {

    const productsList =
        getProducts();


    const prefixMap = {

        office:
            "OFF",

        hotel:
            "HOT",

        home:
            "HOM"

    };


    const prefix =
        prefixMap[category] ||
        "PRD";


    let maxNumber = 0;


    productsList.forEach(
        function (product) {

            const code =
                String(
                    product.code || ""
                );


            if (
                code.startsWith(
                    prefix + "-"
                )
            ) {

                const number =
                    parseInt(
                        code.replace(
                            prefix + "-",
                            ""
                        ),
                        10
                    );


                if (
                    !isNaN(number) &&
                    number > maxNumber
                ) {

                    maxNumber =
                        number;

                }

            }

        }
    );


    return (
        prefix +
        "-" +
        String(
            maxNumber + 1
        ).padStart(
            3,
            "0"
        )
    );

}


// =========================================================
// UPDATE PRODUCT CODE
// =========================================================

function updateProductCode() {

    if (!productCode) {
        return;
    }


    const category =
        productCategory?.value || "";


    if (!category) {

        productCode.value = "";

        return;

    }


    productCode.value =
        generateProductCode(
            category
        );

}


// =========================================================
// CREATE SUBCATEGORY FIELD
// =========================================================

function createSubcategoryField() {

    if (
        !productCategory ||
        productSubcategory
    ) {

        return;

    }


    const categoryField =
        productCategory.closest(
            ".form-field"
        );


    if (!categoryField) {
        return;
    }


    const wrapper =
        document.createElement(
            "div"
        );


    wrapper.className =
        "form-field";


    wrapper.innerHTML = `

        <label for="productSubcategory">
            القسم الفرعي
        </label>

        <select
            id="productSubcategory"
            name="subcategory"
        >

            <option value="">
                اختر القسم الفرعي
            </option>

        </select>

        <small class="field-hint">
            اختر القسم الفرعي المناسب للمنتج.
        </small>

    `;


    categoryField.insertAdjacentElement(
        "afterend",
        wrapper
    );


    productSubcategory =
        document.getElementById(
            "productSubcategory"
        );

}


// =========================================================
// LOAD SUBCATEGORIES
// =========================================================

function loadSubcategories() {

    if (!productSubcategory) {
        return;
    }


    const selectedMainCategory =
        productCategory?.value || "";


    const subcategories =
        getSubCategories();


    productSubcategory.innerHTML = `

        <option value="">
            ${
                selectedMainCategory
                    ? "اختر القسم الفرعي"
                    : "اختر القسم الرئيسي أولاً"
            }
        </option>

    `;


    if (!selectedMainCategory) {

        productSubcategory.disabled =
            true;

        return;

    }


    productSubcategory.disabled =
        false;


    const filteredCategories =
        subcategories.filter(
            function (category) {

                return (
                    String(
                        category.parentCategory ||
                        category.parent ||
                        category.mainCategory ||
                        ""
                    ) ===
                    String(
                        selectedMainCategory
                    )
                );

            }
        );


    filteredCategories.forEach(
        function (category) {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                category.id ||
                category.slug ||
                category.name;


            option.textContent =
                category.name ||
                "قسم فرعي";


            productSubcategory.appendChild(
                option
            );

        }
    );

}


// =========================================================
// COLORS
// =========================================================

function renderColors() {

    if (!selectedColors) {
        return;
    }


    selectedColors.innerHTML = "";


    if (
        selectedProductColors.length === 0
    ) {

        return;

    }


    selectedProductColors.forEach(
        function (color, index) {

            const colorItem =
                document.createElement(
                    "div"
                );


            colorItem.className =
                "selected-color-item";


            colorItem.innerHTML = `

                <span>
                    ${escapeHTML(color)}
                </span>

                <button
                    type="button"
                    class="remove-color-btn"
                    data-index="${index}"
                    aria-label="حذف اللون"
                >
                    ×
                </button>

            `;


            selectedColors.appendChild(
                colorItem
            );

        }
    );


    const removeButtons =
        selectedColors.querySelectorAll(
            ".remove-color-btn"
        );


    removeButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const index =
                        Number(
                            button.dataset.index
                        );


                    selectedProductColors.splice(
                        index,
                        1
                    );


                    renderColors();

                }
            );

        }
    );

}


// =========================================================
// ADD COLOR
// =========================================================

function addColor() {

    if (!productColorInput) {
        return;
    }


    const color =
        productColorInput.value.trim();


    if (!color) {

        showMessage(
            "من فضلك اكتب اسم اللون أولاً.",
            "error"
        );

        productColorInput.focus();

        return;

    }


    const alreadyExists =
        selectedProductColors.some(
            function (item) {

                return (
                    item.toLowerCase() ===
                    color.toLowerCase()
                );

            }
        );


    if (alreadyExists) {

        showMessage(
            "هذا اللون تمت إضافته بالفعل.",
            "error"
        );

        return;

    }


    selectedProductColors.push(
        color
    );


    productColorInput.value = "";


    renderColors();


    productColorInput.focus();

}


// =========================================================
// IMAGE PREVIEW
// =========================================================

function renderImages() {

    if (!imagePreview) {
        return;
    }


    imagePreview.innerHTML = "";


    if (
        selectedProductImages.length === 0
    ) {

        imagePreview.innerHTML = `

            <div class="preview-placeholder">

                <span>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </span>

                <strong>
                    صور المنتج
                </strong>

                <small>
                    ستظهر الصور المختارة هنا
                </small>

            </div>

        `;

        return;

    }


    const imageGrid =
        document.createElement(
            "div"
        );


    imageGrid.className =
        "product-preview-grid";


    selectedProductImages.forEach(
        function (image, index) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "product-preview-item";


            item.innerHTML = `

                <img
                    src="${image.data}"
                    alt="صورة المنتج ${index + 1}"
                >

                <button
                    type="button"
                    class="remove-image-btn"
                    data-index="${index}"
                    aria-label="حذف الصورة"
                    title="حذف الصورة"
                >
                    ×
                </button>

                ${
                    index === 0
                        ? `
                            <span class="main-image-badge">
                                الصورة الرئيسية
                            </span>
                        `
                        : ""
                }

            `;


            imageGrid.appendChild(
                item
            );

        }
    );


    imagePreview.appendChild(
        imageGrid
    );


    const removeButtons =
        imagePreview.querySelectorAll(
            ".remove-image-btn"
        );


    removeButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const index =
                        Number(
                            button.dataset.index
                        );


                    selectedProductImages.splice(
                        index,
                        1
                    );


                    renderImages();

                }
            );

        }
    );

}


// =========================================================
// HANDLE IMAGES
// =========================================================

function handleImages(
    files
) {

    if (!files || files.length === 0) {
        return;
    }


    const maxImages = 4;

    const maxFileSize =
        2 * 1024 * 1024;


    const availableSlots =
        maxImages -
        selectedProductImages.length;


    if (availableSlots <= 0) {

        showMessage(
            "يمكنك إضافة 4 صور كحد أقصى.",
            "error"
        );

        return;

    }


    const selectedFiles =
        Array.from(files)
            .slice(
                0,
                availableSlots
            );


    selectedFiles.forEach(
        function (file) {

            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                showMessage(
                    "الملف المختار ليس صورة.",
                    "error"
                );

                return;

            }


            if (
                file.size >
                maxFileSize
            ) {

                showMessage(
                    `الصورة ${file.name} أكبر من 2MB.`,
                    "error"
                );

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function (event) {

                    selectedProductImages.push({

                        name:
                            file.name,

                        type:
                            file.type,

                        size:
                            file.size,

                        data:
                            event.target.result

                    });


                    renderImages();

                };


            reader.readAsDataURL(
                file
            );

        }
    );


    // يسمح باختيار نفس الصورة مرة أخرى
    // بعد التغيير

    if (productImage) {

        productImage.value = "";

    }

}


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMessage(
    message,
    type = "success"
) {

    if (!productFormMessage) {
        return;
    }


    productFormMessage.textContent =
        message;


    productFormMessage.className =
        "product-form-message show " +
        type;


    productFormMessage.scrollIntoView({

        behavior:
            "smooth",

        block:
            "center"

    });


    setTimeout(
        function () {

            productFormMessage.classList.remove(
                "show"
            );

        },
        5000
    );

}


// =========================================================
// ESCAPE HTML
// =========================================================

function escapeHTML(
    value
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value;


    return div.innerHTML;

}


// =========================================================
// GENERATE PRODUCT ID
// =========================================================

function generateProductId() {

    return (
        Date.now().toString() +
        Math.floor(
            Math.random() * 1000
        ).toString()
    );

}


// =========================================================
// GET SUBCATEGORY OBJECT
// =========================================================

function getSelectedSubcategory() {

    if (!productSubcategory) {
        return null;
    }


    const selectedId =
        productSubcategory.value;


    if (!selectedId) {
        return null;
    }


    const subcategories =
        getSubCategories();


    return (
        subcategories.find(
            function (category) {

                return (
                    String(
                        category.id ||
                        category.slug ||
                        category.name
                    ) ===
                    String(
                        selectedId
                    )
                );

            }
        ) ||
        null
    );

}


// =========================================================
// SUBMIT PRODUCT
// =========================================================

if (addProductForm) {

    addProductForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // =================================================
            // VALUES
            // =================================================

            const name =
                productName?.value.trim() ||
                "";


            const category =
                productCategory?.value ||
                "";


            const status =
                productStatus?.value ||
                "active";


            const description =
                productDescription?.value.trim() ||
                "";


            const material =
                productMaterial?.value.trim() ||
                "";


            const dimensions =
                productDimensions?.value.trim() ||
                "";


            const featured =
                productFeatured?.checked ||
                false;


            // =================================================
            // VALIDATION
            // =================================================

            if (!name) {

                showMessage(
                    "من فضلك أدخل اسم المنتج.",
                    "error"
                );

                productName?.focus();

                return;

            }


            if (!category) {

                showMessage(
                    "من فضلك اختر القسم الرئيسي.",
                    "error"
                );

                productCategory?.focus();

                return;

            }


            // =================================================
            // PRODUCT CODE
            // =================================================

            const code =
                productCode?.value ||
                generateProductCode(
                    category
                );


            // =================================================
            // SUBCATEGORY
            // =================================================

            const selectedSubcategory =
                getSelectedSubcategory();


            // =================================================
            // OLD PRODUCTS
            // =================================================

            const productsList =
                getProducts();


            // =================================================
            // CREATE PRODUCT
            // =================================================

            const newProduct = {

                id:
                    generateProductId(),

                name:
                    name,

                code:
                    code,

                category:
                    category,

                categoryName:
                    mainCategoryNames[
                        category
                    ] || "",

                subcategoryId:
                    selectedSubcategory
                        ? (
                            selectedSubcategory.id ||
                            selectedSubcategory.slug ||
                            selectedSubcategory.name
                        )
                        : "",

                subcategoryName:
                    selectedSubcategory
                        ? selectedSubcategory.name || ""
                        : "",

                subCategoryId:
                    selectedSubcategory
                        ? (selectedSubcategory.id || selectedSubcategory.slug || selectedSubcategory.name)
                        : "",

                subCategoryName:
                    selectedSubcategory
                        ? selectedSubcategory.name || ""
                        : "",

                status:
                    status,

                active:
                    status === "active",

                description:
                    description,

                material:
                    material,

                dimensions:
                    dimensions,

                featured:
                    featured,

                colors:
                    [...selectedProductColors],

                images:
                    selectedProductImages.map(
                        function (image) {

                            return image.data;

                        }
                    ),

                image:
                    selectedProductImages.length > 0
                        ? selectedProductImages[0].data
                        : "",

                createdAt:
                    new Date().toISOString()

            };


            // =================================================
            // SAVE
            // =================================================

            try {
                const savedProduct = await window.apiRequest('/api/products', {
                    method: 'POST',
                    body: JSON.stringify(newProduct)
                });
                productsList.push(savedProduct || newProduct);
                saveProducts(productsList);
            } catch (error) {
                console.error(error);
                showMessage(error.message || 'تعذر حفظ المنتج في قاعدة البيانات.', 'error');
                return;
            }


            // =================================================
            // SUCCESS
            // =================================================

            showMessage(
                `تم إضافة المنتج بنجاح — كود المنتج: ${code}`,
                "success"
            );


            // =================================================
            // RESET
            // =================================================

            addProductForm.reset();


            selectedProductColors =
                [];


            selectedProductImages =
                [];


            renderColors();

            renderImages();

            updateProductCode();

            loadSubcategories();


            // =================================================
            // REDIRECT AFTER SUCCESS
            // =================================================

            setTimeout(
                function () {

                    window.location.href =
                        "products.html";

                },
                1200
            );

        }
    );

}


// =========================================================
// CATEGORY CHANGE
// =========================================================

if (productCategory) {

    productCategory.addEventListener(
        "change",
        function () {

            updateProductCode();

            loadSubcategories();

        }
    );

}


// =========================================================
// ADD COLOR BUTTON
// =========================================================

if (addColorBtn) {

    addColorBtn.addEventListener(
        "click",
        addColor
    );

}


// =========================================================
// ENTER TO ADD COLOR
// =========================================================

if (productColorInput) {

    productColorInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                addColor();

            }

        }
    );

}


// =========================================================
// IMAGE INPUT
// =========================================================

if (productImage) {

    productImage.addEventListener(
        "change",
        function (event) {

            handleImages(
                event.target.files
            );

        }
    );

}


// =========================================================
// INITIALIZE
// =========================================================

createSubcategoryField();

loadSubcategories();

renderColors();
renderImages();

// Sync the local cache with the real database so product codes and
// the admin form always work from the same product list.
(async function syncFormDataBeforeUse() {
    try {
        const [remoteProducts] = await Promise.all([
            window.apiRequest("/api/admin/products"),
            syncSubCategoriesBeforeFormUse()
        ]);
        if (Array.isArray(remoteProducts)) {
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(remoteProducts));
        }
    } catch (error) {
        console.error("تعذر مزامنة بيانات نموذج الإضافة:", error);
    }
    updateProductCode();
})();
