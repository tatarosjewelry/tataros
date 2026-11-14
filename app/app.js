if ("serviceWorker" in navigator) window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
let count=0;document.querySelectorAll(".bag,.bag-link").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();alert("سبد خرید تاتاروس به‌زودی فعال می‌شود.");}));
document.getElementById("favorites").addEventListener("click",e=>{e.preventDefault();alert("بخش علاقه‌مندی‌ها به‌زودی فعال می‌شود.");});
document.getElementById("account").addEventListener("click",e=>{e.preventDefault();alert("حساب کاربری تاتاروس به‌زودی فعال می‌شود.");});