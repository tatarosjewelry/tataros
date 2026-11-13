document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      const targetId = link.getAttribute("href");
      if (targetId === "#") { event.preventDefault(); return; }
      const target = document.querySelector(targetId);
      if (target) { event.preventDefault(); target.scrollIntoView({behavior:"smooth",block:"start"}); }
    });
  });

  const grid = document.getElementById("gemstoneGrid");
  if (!grid) return;
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
  grid.innerHTML = stones.map(stone =>
    '<article class="gemstone-card gemstone-card-refined" style="--stone-light:'+stone[2]+';--stone:'+stone[3]+';--stone-dark:'+stone[4]+'">' +
      '<span class="gemstone-crystal" aria-hidden="true"></span>' +
      '<b>'+stone[0]+'</b><small>'+stone[1]+'</small>' +
    '</article>'
  ).join("");
});
