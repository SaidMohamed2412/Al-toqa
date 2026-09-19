"use strict";

(function () {
  const grid = document.getElementById("featuredGrid");
  const empty = document.getElementById("featuredEmpty");
  const count = document.getElementById("featuredCount");
  const search = document.getElementById("featuredSearch");

  let productsCache = [];
  function getProductsList() { return productsCache; }
  function save(list) { productsCache = Array.isArray(list) ? list : []; }

  function imagePath(image) {
    if (!image) return "../assets/images/products/placeholder.jpg";
    if (/^(data:|https?:|\.\.\/)/.test(image)) return image;
    return "../" + image.replace(/^((\.\.\/)+)/, "");
  }

  async function loadRemoteProducts() {
    try {
      const remote = await window.apiRequest("/api/products");
      if (Array.isArray(remote)) {
        productsCache = remote;
        return remote;
      }
    } catch (error) {
      console.error("تعذر تحميل المنتجات من Supabase:", error);
    }
    return getProductsList();
  }

  async function render() {
    const list = await loadRemoteProducts();
    const q = (search?.value || "").trim().toLowerCase();
    const featuredTotal = list.filter(p => p.featured === true).length;
    if (count) count.textContent = featuredTotal;

    const filtered = list.filter(p => {
      const text = `${p.name || ""} ${p.code || ""} ${p.categoryName || ""}`.toLowerCase();
      return !q || text.includes(q);
    });

    if (!filtered.length) {
      grid.innerHTML = "";
      empty.hidden = false;
      return;
    }
    empty.hidden = true;
    grid.innerHTML = filtered.map(p => {
      const on = p.featured === true;
      const image = imagePath(p.image || (Array.isArray(p.images) ? p.images[0] : ""));
      return `<article class="featured-card ${on ? "is-featured" : ""}">
        <div class="featured-image"><img src="${image}" alt="${escapeHtml(p.name || "منتج")}" loading="lazy"><span class="featured-status">${on ? "مميز" : "غير مميز"}</span></div>
        <div class="featured-info"><div><h3>${escapeHtml(p.name || "منتج")}</h3><span>${escapeHtml(p.code || "")}</span></div>
          <button type="button" class="featured-toggle ${on ? "on" : ""}" data-id="${escapeAttr(p.id)}">${on ? "إلغاء التمييز" : "جعله مميزًا"}</button>
        </div>
      </article>`;
    }).join("");

    grid.querySelectorAll(".featured-toggle").forEach(btn => btn.addEventListener("click", async () => {
      const id = String(btn.dataset.id);
      const productsList = getProductsList();
      const product = productsList.find(p => String(p.id) === id);
      if (!product) return;
      const nextFeatured = product.featured !== true;
      try {
        const saved = await window.apiRequest(`/api/products/${id}`, {
          method: "PATCH",
          body: JSON.stringify({ featured: nextFeatured })
        });
        product.featured = saved?.featured ?? nextFeatured;
        save(productsList);
        render();
      } catch (error) {
        console.error(error);
        alert(error.message || "تعذر تحديث المنتج.");
      }
    }));
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c]));
  }
  function escapeAttr(value) { return escapeHtml(value); }
  search?.addEventListener("input", render);
  render();
})();
