// HOME ADVERTISING SLIDER - Supabase via Flask API
"use strict";
async function loadBanners(){ return await window.apiRequest("/api/banners"); }
function escapeBanner(value){const div=document.createElement("div");div.textContent=value??"";return div.innerHTML;}
(async function initBannerSlider(){
 const root=document.getElementById("homeAdSlider"); if(!root)return;
 try{
  const banners=(await loadBanners()).filter(b=>b.active!==false&&b.image);
  if(!banners.length)return;
  const track=root.querySelector(".home-ad-track"),dots=root.querySelector(".home-ad-dots"),prev=root.querySelector("[data-banner-prev]"),next=root.querySelector("[data-banner-next]");
  track.innerHTML=banners.map((b,i)=>`<article class="home-ad-slide ${i===0?"active":""}"><img src="${escapeBanner(b.image)}" alt="${escapeBanner(b.title||"إعلان")}"><div class="home-ad-overlay"></div><div class="home-ad-content"><span>FURNITURE FACTORY</span><h2>${escapeBanner(b.title||"")}</h2><p>${escapeBanner(b.text||"")}</p>${b.button?`<a href="${escapeBanner(b.link||"products.html")}">${escapeBanner(b.button)} <b>←</b></a>`:""}</div></article>`).join("");
  dots.innerHTML=banners.map((_,i)=>`<button type="button" class="${i===0?"active":""}" data-banner-dot="${i}" aria-label="الإعلان ${i+1}"></button>`).join("");
  const slides=[...track.children];let current=0,timer;const go=index=>{current=(index+banners.length)%banners.length;slides.forEach((x,i)=>x.classList.toggle("active",i===current));dots.querySelectorAll("button").forEach((x,i)=>x.classList.toggle("active",i===current));};const start=()=>{clearInterval(timer);if(banners.length>1)timer=setInterval(()=>go(current+1),5000);};prev?.addEventListener("click",()=>{go(current-1);start()});next?.addEventListener("click",()=>{go(current+1);start()});dots.querySelectorAll("button").forEach(d=>d.addEventListener("click",()=>{go(Number(d.dataset.bannerDot));start()}));root.addEventListener("mouseenter",()=>clearInterval(timer));root.addEventListener("mouseleave",start);start();
 }catch(e){console.error("تعذر تحميل البانرات من قاعدة البيانات:",e)}
})();
