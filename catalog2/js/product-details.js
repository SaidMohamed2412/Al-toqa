// =========================================================
// PRODUCT DETAILS
// =========================================================

"use strict";


// =========================================================
// GET PRODUCT ID
// =========================================================

const urlParams =
    new URLSearchParams(
        window.location.search
    );


const productId =
    urlParams.get("id");


// =========================================================
// ELEMENTS
// =========================================================

const productDetails =
    document.getElementById(
        "productDetails"
    );


const productNotFound =
    document.getElementById(
        "productNotFound"
    );


const mainProductImage =
    document.getElementById(
        "mainProductImage"
    );


const productThumbnails =
    document.getElementById(
        "productThumbnails"
    );


const productName =
    document.getElementById(
        "productName"
    );


const productCategory =
    document.getElementById(
        "productCategory"
    );


const productCode =
    document.getElementById(
        "productCode"
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


const productColors =
    document.getElementById(
        "productColors"
    );


const colorsSection =
    document.getElementById(
        "colorsSection"
    );


// =========================================================
// GET PRODUCTS
// =========================================================

function getProducts() { return Array.isArray(window.__productDetailsCache) ? window.__productDetailsCache : []; }

async function loadProductsFromServer(){ try { const remote=await window.apiRequest("/api/products"); window.__productDetailsCache=Array.isArray(remote)?remote:[]; return window.__productDetailsCache; } catch(e){ console.error(e); return []; } }

// =========================================================
// PRODUCTS
// =========================================================

let productsList = getProducts();
let product = productsList.find(function (item) {
    return String(item.id) === String(productId);
});


// =========================================================
// RENDER / LOAD
// =========================================================

function showNotFound() {
    if (productDetails) productDetails.style.display = "none";
    if (productNotFound) productNotFound.classList.add("show");
}

async function initializeProductDetails() {
    try {
        const remote = await window.apiRequest("/api/products");
        if (Array.isArray(remote)) {
            productsList = remote;
            window.__productDetailsCache = remote;
            product = productsList.find(function (item) {
                return String(item.id) === String(productId);
            });
        }
    } catch (error) {
        console.error("تعذر تحميل المنتج من Supabase:", error);
    }

    if (product) renderProduct(product);
    else showNotFound();
}

initializeProductDetails();


// =========================================================
// GET IMAGES
// =========================================================

function getProductImages(product) {

    let images = [];


    // =====================================================
    // IMAGES ARRAY
    // =====================================================

    if (
        Array.isArray(
            product.images
        )
    ) {

        images =
            product.images.filter(
                function (image) {

                    return (
                        typeof image ===
                        "string" &&
                        image.trim() !== ""
                    );

                }
            );

    }


    // =====================================================
    // MAIN IMAGE
    // =====================================================

    if (
        images.length === 0 &&
        product.image
    ) {

        images.push(
            product.image
        );

    }


    // =====================================================
    // REMOVE DUPLICATES
    // =====================================================

    images =
        [...new Set(images)];


    // =====================================================
    // FALLBACK
    // =====================================================

    if (
        images.length === 0
    ) {

        images.push(
            "assets/images/products/placeholder.jpg"
        );

    }


    return images;

}


// =========================================================
// GET IMAGE PATH
// =========================================================

function getImagePath(image) {

    if (!image) {

        return "assets/images/products/placeholder.jpg";

    }


    if (
        image.startsWith(
            "data:image"
        )
    ) {

        return image;

    }


    if (
        image.startsWith(
            "http://"
        ) ||
        image.startsWith(
            "https://"
        )
    ) {

        return image;

    }


    return image;

}


// =========================================================
// RENDER PRODUCT
// =========================================================

function renderProduct(product) {


    // =====================================================
    // BASIC DATA
    // =====================================================

    if (productName) {

        productName.textContent =
            product.name ||
            "منتج";

    }


    if (productCategory) {

        productCategory.textContent =
            product.categoryName ||
            "";

    }


    if (productCode) {

        productCode.textContent =
            product.code ||
            "غير متوفر";

    }


    if (productDescription) {

        productDescription.textContent =
            product.description ||
            "لا يوجد وصف لهذا المنتج.";

    }


    if (productMaterial) {

        productMaterial.textContent =
            product.material ||
            "غير محدد";

    }


    if (productDimensions) {

        productDimensions.textContent =
            product.dimensions ||
            "غير محددة";

    }


    // =====================================================
    // IMAGES
    // =====================================================

    const images =
        getProductImages(
            product
        );


    renderImages(
        images
    );


    // =====================================================
    // COLORS
    // =====================================================

    renderColors(
        product.colors
    );

}


// =========================================================
// RENDER IMAGES
// =========================================================

function renderImages(images) {

    if (
        !mainProductImage ||
        !productThumbnails
    ) {

        return;

    }


    // =====================================================
    // MAIN IMAGE
    // =====================================================

    mainProductImage.src =
        getImagePath(
            images[0]
        );


    mainProductImage.alt =
        product.name ||
        "صورة المنتج";


    mainProductImage.onerror =
        function () {

            this.onerror = null;

            this.src =
                "assets/images/products/placeholder.jpg";

        };


    // =====================================================
    // THUMBNAILS
    // =====================================================

    productThumbnails.innerHTML =
        "";


    images.forEach(
        function (
            image,
            index
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "product-thumbnail";


            if (index === 0) {

                button.classList.add(
                    "active"
                );

            }


            button.innerHTML = `

                <img
                    src="${getImagePath(image)}"
                    alt="صورة ${index + 1}"
                    loading="lazy"
                >

            `;


            button.addEventListener(
                "click",
                function () {

                    mainProductImage.src =
                        getImagePath(
                            image
                        );


                    productThumbnails
                        .querySelectorAll(
                            ".product-thumbnail"
                        )
                        .forEach(
                            function (item) {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                    button.classList.add(
                        "active"
                    );

                }
            );


            productThumbnails.appendChild(
                button
            );

        }
    );

}


// =========================================================
// RENDER COLORS
// =========================================================

function renderColors(colors) {

    if (
        !productColors ||
        !colorsSection
    ) {

        return;

    }


    // =====================================================
    // VALID COLORS
    // =====================================================

    const validColors =
        Array.isArray(colors)
            ? colors.filter(
                function (color) {

                    return (
                        typeof color ===
                        "string" &&
                        color.trim() !== ""
                    );

                }
            )
            : [];


    // =====================================================
    // NO COLORS
    // =====================================================

    if (
        validColors.length === 0
    ) {

        colorsSection.style.display =
            "none";

        return;

    }


    // =====================================================
    // SHOW
    // =====================================================

    colorsSection.style.display =
        "block";


    productColors.innerHTML =
        "";


    // =====================================================
    // COLORS
    // =====================================================

    validColors.forEach(
        function (color) {

            const colorElement =
                document.createElement(
                    "span"
                );


            colorElement.className =
                "detail-color";


            colorElement.textContent =
                color;


            productColors.appendChild(
                colorElement
            );

        }
    );

}
// =========================================================
// ADD CURRENT PRODUCT TO QUOTE CART
// =========================================================

(async function initProductQuoteAction() {
 const btn=document.getElementById("productAddQuoteBtn"), link=document.getElementById("productQuoteLink"); if(!btn&&!link)return;
 const id=new URLSearchParams(location.search).get("id"); if(!id)return;
 const list=await loadProductsFromServer(); const product=list.find(p=>String(p.id)===String(id)); if(!product)return;
 if(link) link.href=`contact.html?product=${encodeURIComponent(id)}`;
 btn?.addEventListener("click",()=>{ if(typeof addProductToQuoteCart==="function"){addProductToQuoteCart(product,1);btn.textContent="✓ تمت إضافة المنتج";setTimeout(()=>btn.textContent="+ إضافة المنتج للعرض",1500);} });
})();
