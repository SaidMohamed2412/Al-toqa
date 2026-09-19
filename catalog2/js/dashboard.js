// =========================================================
// DASHBOARD
// =========================================================


// =========================================================
// GET PRODUCTS
// =========================================================

function getDashboardProducts() {

    const savedProducts =
        localStorage.getItem(
            "furnitureProducts"
        );


    if (savedProducts) {

        try {

            const parsedProducts =
                JSON.parse(savedProducts);


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
// PRODUCTS
// =========================================================

let dashboardProducts =
    getDashboardProducts();


// =========================================================
// STATISTICS
// =========================================================

const totalProducts =
    document.getElementById(
        "totalProducts"
    );

const officeProducts =
    document.getElementById(
        "officeProducts"
    );

const hotelProducts =
    document.getElementById(
        "hotelProducts"
    );

const homeProducts =
    document.getElementById(
        "homeProducts"
    );


// =========================================================
// UPDATE STATISTICS
// =========================================================

if (totalProducts) {

    totalProducts.textContent =
        dashboardProducts.length;

}


if (officeProducts) {

    officeProducts.textContent =
        dashboardProducts.filter(
            function (product) {

                return (
                    product.category ===
                    "office"
                );

            }
        ).length;

}


if (hotelProducts) {

    hotelProducts.textContent =
        dashboardProducts.filter(
            function (product) {

                return (
                    product.category ===
                    "hotel"
                );

            }
        ).length;

}


if (homeProducts) {

    homeProducts.textContent =
        dashboardProducts.filter(
            function (product) {

                return (
                    product.category ===
                    "home"
                );

            }
        ).length;

}


// =========================================================
// RECENT PRODUCTS
// =========================================================

const recentProducts =
    document.getElementById(
        "recentProducts"
    );


// =========================================================
// IMAGE PATH
// =========================================================

function getProductImage(image) {

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
// DISPLAY RECENT
// =========================================================

function displayRecentProducts() {

    if (!recentProducts) {
        return;
    }


    recentProducts.innerHTML = "";


    const latestProducts =
        [...dashboardProducts]
            .reverse()
            .slice(0, 5);


    if (
        latestProducts.length === 0
    ) {

        recentProducts.innerHTML = `

            <div class="recent-empty">
                لا توجد منتجات حاليًا
            </div>

        `;

        return;

    }


    latestProducts.forEach(
        function (product) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "recent-product";


            const image =
                getProductImage(
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


            item.innerHTML = `

                <div class="recent-image">

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


                <div class="recent-info">

                    <strong>
                        ${product.name || "بدون اسم"}
                    </strong>

                    <span>
                        ${product.categoryName || "بدون قسم"}
                    </span>

                </div>


                <span
                    class="status ${statusClass}"
                >
                    ${statusText}
                </span>

            `;


            recentProducts.appendChild(
                item
            );

        }
    );

}


// =========================================================
// INIT
// =========================================================

displayRecentProducts();

// The dashboard must reflect Supabase, not a stale browser cache.
(async function syncDashboardProducts() {
    try {
        const remote = await window.apiRequest("/api/admin/products");
        if (!Array.isArray(remote)) return;
        dashboardProducts = remote;
        localStorage.setItem("furnitureProducts", JSON.stringify(remote));
        if (totalProducts) totalProducts.textContent = dashboardProducts.length;
        if (officeProducts) officeProducts.textContent = dashboardProducts.filter(product => product.category === "office").length;
        if (hotelProducts) hotelProducts.textContent = dashboardProducts.filter(product => product.category === "hotel").length;
        if (homeProducts) homeProducts.textContent = dashboardProducts.filter(product => product.category === "home").length;
        displayRecentProducts();
    } catch (error) {
        console.error("تعذر مزامنة إحصاءات لوحة التحكم:", error);
    }
})();
