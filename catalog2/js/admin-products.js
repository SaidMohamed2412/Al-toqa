// =========================================================
// PRODUCTS MANAGEMENT
// =========================================================


// =========================================================
// GET PRODUCTS
// =========================================================

function getProducts() { return Array.isArray(window.__adminProductsCache) ? window.__adminProductsCache : []; }


// =========================================================
// SAVE
// =========================================================

function saveProducts(productsList) { window.__adminProductsCache = Array.isArray(productsList) ? productsList : []; }


// =========================================================
// IMAGE PATH
// =========================================================

function getAdminImagePath(image) {

    if (!image) {

        return "../assets/images/products/placeholder.jpg";

    }


    if (
        image.startsWith(
            "data:image"
        )
    ) {

        return image;

    }


    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {

        return image;

    }


    if (
        image.startsWith("../")
    ) {

        return image;

    }


    return "../" +
        image.replace(
            /^(\.\.\/)+/,
            ""
        );

}


// =========================================================
// ELEMENTS
// =========================================================

const productsTable =
    document.getElementById(
        "productsTable"
    );

const productsEmpty =
    document.getElementById(
        "productsEmpty"
    );

const productsCount =
    document.getElementById(
        "productsCount"
    );

const searchProduct =
    document.getElementById(
        "searchProduct"
    );

const categoryFilter =
    document.getElementById(
        "categoryFilter"
    );

const statusFilter =
    document.getElementById(
        "statusFilter"
    );


// =========================================================
// LOAD PRODUCTS FROM FLASK / SUPABASE
// =========================================================

async function loadProductsFromServer() {
    try {
        const remote = await window.apiRequest("/api/admin/products");
        if (Array.isArray(remote)) {
            window.__adminProductsCache = remote;
            productsList = remote;
            return true;
        }
    } catch (error) {
        console.error("تعذر تحميل المنتجات من Supabase:", error);
        if (productsEmpty) productsEmpty.textContent = error.message || "تعذر الاتصال بقاعدة البيانات.";
    }
    return false;
}


// =========================================================
// PRODUCTS LIST
// =========================================================

let productsList =
    getProducts();


// =========================================================
// DELETE
// =========================================================

let productToDelete = null;


// =========================================================
// RENDER
// =========================================================

function renderProducts() {

    if (
        !productsTable ||
        !productsEmpty ||
        !productsCount
    ) {

        return;

    }


    const search =
        searchProduct
            ? searchProduct.value
                .trim()
                .toLowerCase()
            : "";


    const category =
        categoryFilter
            ? categoryFilter.value
            : "all";


    const status =
        statusFilter
            ? statusFilter.value
            : "all";


    const filteredProducts =
        productsList.filter(
            function (product) {

                const name =
                    String(
                        product.name || ""
                    ).toLowerCase();


                const code =
                    String(
                        product.code || ""
                    ).toLowerCase();


                const matchesSearch =
                    name.includes(search) ||
                    code.includes(search);


                const productStatus =
                    product.active === false
                        ? "hidden"
                        : "active";


                const matchesCategory =
                    category === "all" ||
                    product.category ===
                        category;


                const matchesStatus =
                    status === "all" ||
                    productStatus ===
                        status;


                return (
                    matchesSearch &&
                    matchesCategory &&
                    matchesStatus
                );

            }
        );


    productsCount.textContent =
        filteredProducts.length;


    // =====================================================
    // EMPTY
    // =====================================================

    if (
        filteredProducts.length === 0
    ) {

        productsTable.innerHTML = "";

        productsEmpty.classList.add(
            "show"
        );

        return;

    }


    productsEmpty.classList.remove(
        "show"
    );


    // =====================================================
    // HEADER
    // =====================================================

    productsTable.innerHTML = `

        <div class="product-row header">

            <div>
                الصورة
            </div>

            <div>
                المنتج
            </div>

            <div>
                القسم
            </div>

            <div>
                الحالة
            </div>

            <div>
                الإجراءات
            </div>

        </div>

    `;


    // =====================================================
    // PRODUCTS
    // =====================================================

    filteredProducts.forEach(
        function (product) {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "product-row";


            const image =
                getAdminImagePath(
                    product.image
                );


            const statusClass =
                product.active === false
                    ? "hidden"
                    : "active";


            const statusText =
                product.active === false
                    ? "مخفي"
                    : "ظاهر";


            row.innerHTML = `

                <div class="product-image">

                    <img
                        src="${image}"
                        alt="${product.name || "منتج"}"
                        onerror="
                            this.onerror = null;
                            this.src =
                                '../assets/images/products/placeholder.jpg';
                        "
                    >

                </div>


                <div class="product-info">

                    <strong>
                        ${product.name || "بدون اسم"}
                    </strong>

                    <span>
                        ${product.code || "بدون كود"}
                    </span>

                </div>


                <div>

                    <span class="category-label">

                        ${product.categoryName || "بدون قسم"}

                    </span>

                </div>


                <div>

                    <span
                        class="product-status ${statusClass}"
                    >
                        ${statusText}
                    </span>

                </div>


                <div class="product-actions">

                    <button
                        type="button"
                        class="product-action edit"
                        data-id="${product.id}"
                        title="تعديل"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg>
                    </button>


                    <button
                        type="button"
                        class="product-action delete"
                        data-id="${product.id}"
                        title="حذف"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                    </button>

                </div>

            `;


            productsTable.appendChild(
                row
            );

        }
    );


    // =====================================================
    // EDIT
    // =====================================================

    document
        .querySelectorAll(
            ".product-action.edit"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            this.dataset.id;


                        window.location.href =
                            `edit-product.html?id=${id}`;

                    }
                );

            }
        );


    // =====================================================
    // DELETE
    // =====================================================

    document
        .querySelectorAll(
            ".product-action.delete"
        )
        .forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            this.dataset.id;


                        openDeleteModal(id);

                    }
                );

            }
        );

}


// =========================================================
// SEARCH
// =========================================================

if (searchProduct) {

    searchProduct.addEventListener(
        "input",
        renderProducts
    );

}


// =========================================================
// CATEGORY
// =========================================================

if (categoryFilter) {

    categoryFilter.addEventListener(
        "change",
        renderProducts
    );

}


// =========================================================
// STATUS
// =========================================================

if (statusFilter) {

    statusFilter.addEventListener(
        "change",
        renderProducts
    );

}


// =========================================================
// DELETE MODAL
// =========================================================

const deleteModal =
    document.getElementById(
        "deleteModal"
    );

const deleteProductName =
    document.getElementById(
        "deleteProductName"
    );


// =========================================================
// OPEN MODAL
// =========================================================

function openDeleteModal(id) {

    const product =
        productsList.find(
            function (item) {

                return (
                    String(item.id) ===
                    String(id)
                );

            }
        );


    if (!product) {
        return;
    }


    productToDelete =
        id;


    if (deleteProductName) {

        deleteProductName.textContent =
            product.name ||
            "هذا المنتج";

    }


    if (deleteModal) {

        deleteModal.classList.add(
            "show"
        );

    }

}


// =========================================================
// CLOSE MODAL
// =========================================================

function closeDeleteModal() {

    productToDelete = null;


    if (deleteModal) {

        deleteModal.classList.remove(
            "show"
        );

    }

}


// =========================================================
// CLOSE BUTTONS
// =========================================================

document
    .getElementById(
        "closeDeleteModal"
    )
    ?.addEventListener(
        "click",
        closeDeleteModal
    );


document
    .getElementById(
        "cancelDelete"
    )
    ?.addEventListener(
        "click",
        closeDeleteModal
    );


// =========================================================
// CONFIRM DELETE
// =========================================================

document
    .getElementById("confirmDelete")
    ?.addEventListener(
        "click",
        async function () {
            if (productToDelete === null) return;
            const id = productToDelete;
            try {
                await window.apiRequest(`/api/products/${id}`, { method: "DELETE" });
                productsList = productsList.filter(function (product) {
                    return String(product.id) !== String(id);
                });
                saveProducts(productsList);
                closeDeleteModal();
                renderProducts();
            } catch (error) {
                console.error(error);
                alert(error.message || "تعذر حذف المنتج من قاعدة البيانات.");
            }
        }
    );


// =========================================================
// CLICK OUTSIDE MODAL
// =========================================================

if (deleteModal) {

    deleteModal.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                deleteModal
            ) {

                closeDeleteModal();

            }

        }
    );

}


// =========================================================
// INITIALIZE
// =========================================================

(async function initializeAdminProducts() {
    await loadProductsFromServer();
    renderProducts();
})();