document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      const targetId = link.getAttribute("href");
      if (targetId === "#") { event.preventDefault(); return; }
      const target = document.querySelector(targetId);
      if (target) { event.preventDefault(); target.scrollIntoView({behavior:"smooth",block:"start"}); }
    });
  });

  const book = document.getElementById("gemstoneBook");
  if (!book) return;
  const stones = [
    ["فیروزه","TURQUOISE","#8de7dc","#138b91","#07505c"],
    ["عقیق","AGATE","#f2a08b","#a94335","#4d171e"],
    ["شرف‌الشمس","SHARAF AL-SHAMSE","#f4d58c","#b58a42","#60451f"],
    ["الماس","DIAMOND","#ffffff","#a9c8dc","#55718a"],
    ["زمرد","EMERALD","#a7f1bd","#14804d","#06402d"],
    ["یاقوت","RUBY","#ff9b9b","#a51e3b","#4c071a"],
    ["زبرجد","PERIDOT","#e6f79b","#88a92e","#40551a"],
    ["اپال","OPAL","#f7d7f2","#9bb9d8","#6b6b9a"],
    ["آمتیست","AMETHYST","#dcb8ff","#8452b5","#3d245f"],
    ["توپاز طلایی","GOLDEN TOPAZ","#ffe6a1","#d39a32","#79501c"],
    ["توپاز سوئیس","SWISS TOPAZ","#b8f0ff","#28a9dc","#07517c"],
    ["توپاز لندن","LONDON BLUE TOPAZ","#9ac8ef","#245a91","#102d52"],
    ["سیترین","CITRINE","#ffe49a","#d69a24","#87501a"],
    ["کوارتز صورتی","ROSE QUARTZ","#ffe0e8","#dc91a8","#8f526b"]
  ];
  const right = document.getElementById("gemstonePageRight");
  const left = document.getElementById("gemstonePageLeft");
  const count = document.getElementById("gemstonePageCount");
  const prev = document.getElementById("gemstonePrev");
  const next = document.getElementById("gemstoneNext");
  let spread = 0, touchX = null;
  const fa = n => new Intl.NumberFormat("fa-IR").format(n);
  function page(stone,index){
    if(!stone) return '<div class="gemstone-page gemstone-page-empty"><span class="page-kufic">✧ تاتاروس ✧</span><span class="page-number">'+fa(index+1)+'</span></div>';
    return '<span class="page-kufic">✧ TATARUS ✧</span><div class="stone-art" style="--stone-light:'+stone[2]+';--stone:'+stone[3]+';--stone-dark:'+stone[4]+'"></div><h3>'+stone[0]+'</h3><span class="stone-en">'+stone[1]+'</span><p class="stone-note">گزیده‌ای از زیبایی‌های طبیعی</p><span class="page-number">'+fa(index+1)+'</span>';
  }
  function render(direction){
    const a=stones[spread], b=stones[spread+1];
    right.innerHTML=page(a,spread);
    left.innerHTML=page(b,spread+1);
    right.classList.toggle("turning",!!direction);
    left.classList.toggle("turning",!!direction);
    count.textContent=fa(Math.floor(spread/2)+1)+" / "+fa(Math.ceil(stones.length/2));
    prev.disabled=spread===0;
    next.disabled=spread+2>=stones.length;
  }
  function turn(step){
    const target=Math.max(0,Math.min(stones.length-1,spread+step*2));
    if(target===spread)return;
    spread=target;render(true);
  }
  prev.addEventListener("click",()=>turn(-1));
  next.addEventListener("click",()=>turn(1));
  book.addEventListener("touchstart",e=>{touchX=e.changedTouches[0].screenX},{passive:true});
  book.addEventListener("touchend",e=>{
    if(touchX===null)return;
    const dx=e.changedTouches[0].screenX-touchX;
    if(Math.abs(dx)>45)turn(dx<0?1:-1);
    touchX=null;
  },{passive:true});
  book.addEventListener("keydown",e=>{if(e.key==="ArrowLeft")turn(1);if(e.key==="ArrowRight")turn(-1)});
  book.tabIndex=0;
  render(false);
});
