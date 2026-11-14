if ("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
const count= document.getElementById("bag-count");
document.querySelectorAll(".bag-action,.bag-link").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();alert("سبد خرید تاتاروس در مرحله بعد به محصولات و قیمت‌ها متصل می‌شود.");}));
document.getElementById("favorites").addEventListener("click",e=>{e.preventDefault();alert("بخش علاقه‌مندی‌ها در حال آماده‌سازی است.");});
document.getElementById("account").addEventListener("click",e=>{e.preventDefault();alert("حساب کاربری تاتاروس در مرحله بعد فعال می‌شود.");});
document.getElementById("search").addEventListener("click",()=>{const q=prompt("نام محصول یا کالکشن را جستجو کنید:");if(q)alert("جستجوی «"+q+"» به‌زودی فعال می‌شود.");});