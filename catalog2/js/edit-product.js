// =========================================================
// EDIT PRODUCT
// =========================================================

"use strict";


// =========================================================
// GET PRODUCT ID FROM URL
// =========================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );

const productId =
    urlParams.get("id");


// =========================================================
// GET PRODUCTS
// =========================================================

function getProducts() {

    const savedProducts =
        localStorage.getItem(
            "furnitureProducts"
        );


    if (savedProducts) {

        try {

            const parsedProducts =
                JSON.parse(
                    savedProducts
                );


            if (
                Array.isArray(parsedProducts)
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
    // DEFAULT PRODUCTS
    // =====================================================

    if (
        typeof products !== "undefined" &&
        Array.isArray(products)
    ) {

        localStorage.setItem(
            "furnitureProducts",
            JSON.stringify(products)
        );

        return products;

    }


    return [];

}


// =========================================================
// SAVE PRODUCTS
// =========================================================

function saveProducts(productsList) {

    localStorage.setItem(
        "furnitureProducts",
        JSON.stringify(productsList)
    );

}


// =========================================================
// ELEMENTS
// =========================================================

const editProductForm =
    document.getElementById(
        "editProductForm"
    );


const productName =
    document.getElementById(
        "productName"
    );


const productCode =
    document.getElementById(
        "productCode"
    );


const productCategory =
    document.getElementById(
        "productCategory"
    );
let productSubcategory = null;

function getSubCategories() { return Array.isArray(window.__editCategoriesCache) ? window.__editCategoriesCache : []; }
async function loadEditCategories(){ try { window.__editCategoriesCache = await window.apiRequest("/api/categories"); } catch(e){ console.error(e); window.__editCategoriesCache=[]; } }

function createEditSubcategoryField() {
    if (!productCategory || document.getElementById("productSubcategory")) return;
    const field = productCategory.closest(".form-field"); if (!field) return;
    const wrapper = document.createElement("div"); wrapper.className = "form-field";
    wrapper.innerHTML = `<label for="productSubcategory">القسم الفرعي</label><select id="productSubcategory"><option value="">بدون قسم فرعي</option></select><small class="field-hint">اختر القسم الفرعي المرتبط بالمنتج.</small>`;
    field.insertAdjacentElement("afterend", wrapper); productSubcategory = document.getElementById("productSubcategory");
}

function loadEditSubcategories(selectedValue = "") {
    if (!productSubcategory) return; const main = productCategory?.value || "";
    const list = getSubCategories().filter(item => String(item.parentCategory || item.parent || item.mainCategory || "") === String(main));
    productSubcategory.innerHTML = `<option value="">بدون قسم فرعي</option>`;
    list.forEach(item => { const id = item.id || item.slug || item.name; const option = document.createElement("option"); option.value = id; option.textContent = item.name || "قسم فرعي"; productSubcategory.appendChild(option); });
    if (selectedValue) productSubcategory.value = String(selectedValue); productSubcategory.disabled = !main;
}



const productStatus =
    document.getElementById(
        "productStatus"
    );


const productDescription =
    document.getElementById(
        "productDescription"
    );


const productMaterial =
    document.getElementById(
        "productMaterial"
    );


const productDimensions =
    document.getElementById(
        "productDimensions"
    );


const productFeatured =
    document.getElementById(
        "productFeatured"
    );


const productImage =
    document.getElementById(
        "productImage"
    );


const imagePreview =
    document.getElementById(
        "imagePreview"
    );


const formMessage =
    document.getElementById(
        "productFormMessage"
    );


const productColorInput =
    document.getElementById(
        "productColorInput"
    );


const addColorBtn =
    document.getElementById(
        "addColorBtn"
    );


const selectedColors =
    document.getElementById(
        "selectedColors"
    );


// =========================================================
// NOT FOUND ELEMENT
// =========================================================

const productNotFound =
    document.getElementById(
        "productNotFound"
    );


// =========================================================
// CATEGORY NAMES
// =========================================================

const categoryNames = {

    office: "أثاث مكتبي",

    hotel: "أثاث فندقي",

    home: "أثاث منزلي"

};


// =========================================================
// PRODUCTS
// =========================================================

let productsList =
    getProducts();


// =========================================================
// FIND PRODUCT
// =========================================================

let currentProduct =
    productsList.find(
        function (product) {

            return (
                String(product.id) ===
                String(productId)
            );

        }
    );


// =========================================================
// STATE
// =========================================================

// الصور الحالية
let selectedImages = [];


// الألوان الحالية
let selectedColorList = [];


// =========================================================
// SHOW MESSAGE
// =========================================================

function showMessage(
    message,
    type
) {

    if (!formMessage) {
        return;
    }


    formMessage.textContent =
        message;


    formMessage.className =
        "product-form-message show " +
        type;


    setTimeout(
        function () {

            if (formMessage) {

                formMessage.classList.remove(
                    "show"
                );

            }

        },
        4000
    );

}


// =========================================================
// PRODUCT NOT FOUND
// =========================================================

function showProductNotFound() {

    if (editProductForm) {

        editProductForm.style.display =
            "none";

    }


    if (productNotFound) {

        productNotFound.style.display =
            "block";

    }

}


// =========================================================
// LOAD PRODUCT DATA
// =========================================================

function loadProductData() {

    if (!currentProduct) {

        showProductNotFound();

        return;

    }


    // =====================================================
    // BASIC DATA
    // =====================================================

    if (productName) {

        productName.value =
            currentProduct.name || "";

    }


    // =====================================================
    // PRODUCT CODE
    // =====================================================

    if (productCode) {

        productCode.value =
            currentProduct.code || "";

        // منع تعديل الكود
        productCode.readOnly =
            true;

    }


    // =====================================================
    // CATEGORY
    // =====================================================

    if (productCategory) {

        productCategory.value =
            currentProduct.category || "";

    }

    createEditSubcategoryField();
    loadEditSubcategories(currentProduct.subcategoryId || currentProduct.subCategoryId || currentProduct.subCategory || currentProduct.subcategory || "");
    productCategory?.addEventListener("change", function () { loadEditSubcategories(""); });


    // =====================================================
    // STATUS
    // =====================================================

    if (productStatus) {

        productStatus.value =
            currentProduct.active === false
                ? "hidden"
                : "active";

    }


    // =====================================================
    // DESCRIPTION
    // =====================================================

    if (productDescription) {

        productDescription.value =
            currentProduct.description || "";

    }


    // =====================================================
    // MATERIAL
    // =====================================================

    if (productMaterial) {

        productMaterial.value =
            currentProduct.material || "";

    }


    // =====================================================
    // DIMENSIONS
    // =====================================================

    if (productDimensions) {

        productDimensions.value =
            currentProduct.dimensions || "";

    }


    // =====================================================
    // FEATURED
    // =====================================================

    if (productFeatured) {

        productFeatured.checked =
            currentProduct.featured === true;

    }


    // =====================================================
    // IMAGES
    // =====================================================

    if (
        Array.isArray(
            currentProduct.images
        ) &&
        currentProduct.images.length > 0
    ) {

        selectedImages =
            [
                ...currentProduct.images
            ];

    } else if (
        currentProduct.image
    ) {

        selectedImages =
            [
                currentProduct.image
            ];

    } else {

        selectedImages = [];

    }


    // =====================================================
    // COLORS
    // =====================================================

    if (
        Array.isArray(
            currentProduct.colors
        )
    ) {

        selectedColorList =
            [
                ...currentProduct.colors
            ];

    } else {

        selectedColorList = [];

    }


    renderImagePreview();

    renderColors();

}


// =========================================================
// RENDER IMAGE PREVIEW
// =========================================================

function renderImagePreview() {

    if (!imagePreview) {
        return;
    }


    // =====================================================
    // NO IMAGES
    // =====================================================

    if (
        selectedImages.length === 0
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
                    لم تتم إضافة صور
                </small>

            </div>

        `;

        return;

    }


    // =====================================================
    // CLEAR
    // =====================================================

    imagePreview.innerHTML =
        "";


    // =====================================================
    // IMAGES
    // =====================================================

    selectedImages.forEach(
        function (
            imageData,
            index
        ) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "preview-image-item";


            item.innerHTML = `

                <img
                    src="${imageData}"
                    alt="صورة المنتج ${index + 1}"
                >


                <span
                    class="preview-image-number"
                >

                    ${
                        index === 0
                            ? "الرئيسية"
                            : index + 1
                    }

                </span>


                ${
                    index !== 0
                        ? `
                            <button
                                type="button"
                                class="set-main-image-btn"
                                data-index="${index}"
                                title="تعيين كصورة رئيسية"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                            </button>
                        `
                        : ""
                }


                <button
                    type="button"
                    class="remove-image-btn"
                    data-index="${index}"
                    title="حذف الصورة"
                >
                    ×
                </button>

            `;


            imagePreview.appendChild(
                item
            );

        }
    );


    // =====================================================
    // REMOVE IMAGE
    // =====================================================

    imagePreview
        .querySelectorAll(
            ".remove-image-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        selectedImages.splice(
                            index,
                            1
                        );


                        renderImagePreview();

                    }
                );

            }
        );


    // =====================================================
    // SET MAIN IMAGE
    // =====================================================

    imagePreview
        .querySelectorAll(
            ".set-main-image-btn"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        const selectedImage =
                            selectedImages[index];


                        selectedImages.splice(
                            index,
                            1
                        );


                        selectedImages.unshift(
                            selectedImage
                        );


                        renderImagePreview();

                    }
                );

            }
        );

}


// =========================================================
// IMAGE UPLOAD
// =========================================================

if (productImage) {

    productImage.addEventListener(
        "change",
        function () {

            const files =
                Array.from(
                    this.files || []
                );


            if (
                files.length === 0
            ) {

                return;

            }


            // =================================================
            // MAX IMAGES
            // =================================================

            const maxImages =
                4;


            if (
                selectedImages.length +
                    files.length >
                maxImages
            ) {

                showMessage(
                    `يمكنك إضافة ${maxImages} صور كحد أقصى.`,
                    "error"
                );


                this.value =
                    "";


                return;

            }


            // =================================================
            // READ FILES
            // =================================================

            files.forEach(
                function (file) {

                    // =========================================
                    // TYPE
                    // =========================================

                    if (
                        !file.type.startsWith(
                            "image/"
                        )
                    ) {

                        showMessage(
                            "اختر صورًا فقط.",
                            "error"
                        );

                        return;

                    }


                    // =========================================
                    // SIZE
                    // =========================================

                    const maxSize =
                        2 *
                        1024 *
                        1024;


                    if (
                        file.size >
                        maxSize
                    ) {

                        showMessage(
                            `الصورة "${file.name}" أكبر من 2MB.`,
                            "error"
                        );

                        return;

                    }


                    // =========================================
                    // FILE READER
                    // =========================================

                    const reader =
                        new FileReader();


                    reader.onload =
                        function (event) {

                            selectedImages.push(
                                event.target.result
                            );


                            renderImagePreview();

                        };


                    reader.onerror =
                        function () {

                            showMessage(
                                "حدث خطأ أثناء قراءة الصورة.",
                                "error"
                            );

                        };


                    reader.readAsDataURL(
                        file
                    );

                }
            );


            // السماح باختيار نفس الصورة مرة أخرى
            this.value =
                "";

        }
    );

}


// =========================================================
// RENDER COLORS
// =========================================================

function renderColors() {

    if (!selectedColors) {
        return;
    }


    selectedColors.innerHTML =
        "";


    if (
        selectedColorList.length === 0
    ) {

        return;

    }


    selectedColorList.forEach(
        function (
            color,
            index
        ) {

            const colorItem =
                document.createElement(
                    "div"
                );


            colorItem.className =
                "selected-color";


            colorItem.innerHTML = `

                <span>
                    ${color}
                </span>


                <button
                    type="button"
                    data-index="${index}"
                    title="حذف اللون"
                >
                    ×
                </button>

            `;


            selectedColors.appendChild(
                colorItem
            );

        }
    );


    // =====================================================
    // REMOVE COLORS
    // =====================================================

    selectedColors
        .querySelectorAll(
            "button"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const index =
                            Number(
                                this.dataset.index
                            );


                        selectedColorList.splice(
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
            "اكتب اسم اللون أولًا.",
            "error"
        );


        productColorInput.focus();

        return;

    }


    // =====================================================
    // DUPLICATE
    // =====================================================

    const exists =
        selectedColorList.some(
            function (item) {

                return (
                    item.toLowerCase() ===
                    color.toLowerCase()
                );

            }
        );


    if (exists) {

        showMessage(
            "هذا اللون تمت إضافته بالفعل.",
            "error"
        );


        productColorInput.focus();

        return;

    }


    // =====================================================
    // ADD
    // =====================================================

    selectedColorList.push(
        color
    );


    productColorInput.value =
        "";


    renderColors();


    productColorInput.focus();

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
// ENTER COLOR
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
// FORM SUBMIT
// =========================================================

if (editProductForm) {

    editProductForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            // =================================================
            // CHECK PRODUCT
            // =================================================

            if (!currentProduct) {

                showMessage(
                    "المنتج غير موجود.",
                    "error"
                );

                return;

            }


            // =================================================
            // VALUES
            // =================================================

            const name =
                productName
                    ? productName.value.trim()
                    : "";


            const category =
                productCategory
                    ? productCategory.value
                    : "";


            const status =
                productStatus
                    ? productStatus.value
                    : "active";


            const description =
                productDescription
                    ? productDescription.value.trim()
                    : "";


            const material =
                productMaterial
                    ? productMaterial.value.trim()
                    : "";


            const dimensions =
                productDimensions
                    ? productDimensions.value.trim()
                    : "";


            const featured =
                productFeatured
                    ? productFeatured.checked
                    : false;


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
                    "من فضلك اختر قسم المنتج.",
                    "error"
                );


                productCategory?.focus();

                return;

            }


            // =================================================
            // UPDATE PRODUCT
            // =================================================

            currentProduct.name =
                name;


            // الكود لا يتغير
            currentProduct.code =
                currentProduct.code || "";


            currentProduct.category =
                category;


            currentProduct.categoryName =
                categoryNames[category] ||
                "بدون قسم";

            const selectedSubcategory = productSubcategory?.value || "";
            const selectedSubcategoryObject = getSubCategories().find(item => String(item.id || item.slug || item.name) === String(selectedSubcategory));
            currentProduct.subcategoryId = selectedSubcategoryObject ? (selectedSubcategoryObject.id || selectedSubcategoryObject.slug || selectedSubcategoryObject.name) : "";
            currentProduct.subcategoryName = selectedSubcategoryObject ? (selectedSubcategoryObject.name || "") : "";
            currentProduct.subCategoryId = currentProduct.subcategoryId;
            currentProduct.subCategoryName = currentProduct.subcategoryName;


            currentProduct.description =
                description;


            currentProduct.material =
                material;


            currentProduct.dimensions =
                dimensions;


            currentProduct.colors =
                [
                    ...selectedColorList
                ];


            // =================================================
            // IMAGES
            // =================================================

            currentProduct.images =
                [
                    ...selectedImages
                ];


            // الصورة الأولى هي الرئيسية
            currentProduct.image =
                selectedImages.length > 0
                    ? selectedImages[0]
                    : "";


            // =================================================
            // STATUS
            // =================================================

            currentProduct.active =
                status === "active";


            // =================================================
            // FEATURED
            // =================================================

            currentProduct.featured =
                featured;


            // =================================================
            // UPDATED DATE
            // =================================================

            currentProduct.updatedAt =
                new Date().toISOString();


            // =================================================
            // SAVE
            // =================================================

            try {
                const savedProduct = await window.apiRequest(`/api/products/${currentProduct.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(currentProduct)
                });
                const idx = productsList.findIndex(p => String(p.id) === String(currentProduct.id));
                if (idx >= 0) productsList[idx] = savedProduct || currentProduct;
                saveProducts(productsList);
            } catch (error) {
                console.error(error);
                showMessage(error.message || 'تعذر حفظ التعديل في قاعدة البيانات.', 'error');
                return;
            }


            // =================================================
            // SUCCESS
            // =================================================

            showMessage(
                "تم تعديل المنتج وحفظ التغييرات بنجاح.",
                "success"
            );


            // =================================================
            // REDIRECT
            // =================================================

            setTimeout(
                function () {

                    window.location.href =
                        "products.html";

                },
                1000
            );

        }
    );

}


// =========================================================
// CANCEL BUTTON
// =========================================================

const cancelEditBtn =
    document.getElementById(
        "cancelEdit"
    );


if (cancelEditBtn) {

    cancelEditBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                "products.html";

        }
    );

}


// =========================================================
// INITIALIZE - load authoritative data from Flask/Supabase
// =========================================================

(async function initializeEditProduct() {
    try {
        const remoteProducts = await window.apiRequest("/api/admin/products");
        if (Array.isArray(remoteProducts)) {
            productsList = remoteProducts;
            window.__editProductsCache = remoteProducts;
            currentProduct = productsList.find(function (product) {
                return String(product.id) === String(productId);
            });
        }
    } catch (error) {
        console.error("تعذر تحميل المنتج من Supabase:", error);
    }
    loadProductData();
})();
