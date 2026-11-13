document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      const targetId = link.getAttribute("href");
      if (targetId === "#") { event.preventDefault(); return; }
      const target = document.querySelector(targetId);
      if (target) { event.preventDefault(); target.scrollIntoView({behavior:"smooth",block:"start"}); }
    });
  });

  const preciousStones = [
    ["الماس","DIAMOND","#ffffff","#a9c8dc","#55718a"],
    ["زمرد","EMERALD","#a7f1bd","#14804d","#06402d","IMG_3859.jpeg"],
    ["یاقوت","RUBY","#ff9b9b","#a51e3b","#4c071a"],
    ["زبرجد","PERIDOT","#e6f79b","#88a92e","#40551a"],
    ["اپال","OPAL","#f7d7f2","#9bb9d8","#6b6b9a","IMG_3860.jpeg"],
    ["آمتیست","AMETHYST","#dcb8ff","#8452b5","#3d245f"],
    ["توپاز طلایی","GOLDEN TOPAZ","#ffe6a1","#d39a32","#79501c"],
    ["توپاز سوئیس","SWISS TOPAZ","#b8f0ff","#28a9dc","#07517c"],
    ["توپاز لندن","LONDON BLUE TOPAZ","#9ac8ef","#245a91","#102d52"],
    ["سیترین","CITRINE","#ffe49a","#d69a24","#87501a"],
    ["کوارتز صورتی","ROSE QUARTZ","#ffe0e8","#dc91a8","#8f526b"],
    ["لاجورد","LAPIS LAZULI","#9bb9f5","#244b9b","#101d4c"],
    ["گارنت","GARNET","#f39a9c","#9b203b","#4b0d22"]
  ];

  const matteStones = [
    ["فیروزه","TURQUOISE","#8de7dc","#138b91","#07505c"],
    ["عقیق","AGATE","#f2a08b","#a94335","#4d171e"],
    ["شرف‌الشمس","SHARAF AL-SHAMSE","#f4d58c","#b58a42","#60451f"],
    ["عقیق مات","MATTE AGATE","#d9b49a","#87624e","#392a26"],
    ["حدید","HEMATITE","#b7bdc7","#555d68","#202630"],
    ["یشم","JADE","#c6d9a7","#78945b","#34482e"],
    ["اونیکس","ONYX","#92969d","#292d35","#080b10"],
    ["چشم‌ببر","TIGER'S EYE","#e6bd78","#9b652d","#432b19"],
    ["شاه‌مقصود","SHAH-MAQSOOD","#b8c9a0","#71865a","#35432d"],
    ["سنگ لاوا","LAVA STONE","#929292","#3e4145","#17191d"],
    ["عقیق سیاه","BLACK AGATE","#8b929b","#333a45","#10151d"]
  ];

  function renderStones(gridId, stones) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = stones.map(stone =>
      '<article class="gemstone-card gemstone-card-refined" style="--stone-light:'+stone[2]+';--stone:'+stone[3]+';--stone-dark:'+stone[4]+'">' +
        '<span class="gemstone-crystal" aria-hidden="true"></span>' +
        (stone[5] ? '<img class="gemstone-photo" src="'+stone[5]+'" alt="'+stone[0]+'" loading="lazy">' : '') +
        '<b>'+stone[0]+'</b><small>'+stone[1]+'</small>' +
      '</article>'
    ).join("");
  }

  renderStones("gemstoneGrid", preciousStones);
  renderStones("matteGemstoneGrid", matteStones);

  // Open product photos in an on-site lightbox instead of navigating away.
  const lightbox = document.createElement("div");
  lightbox.className = "gemstone-lightbox";
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  lightbox.setAttribute("aria-label", "نمایش بزرگ عکس سنگ");
  lightbox.innerHTML = '<button class="gemstone-lightbox-close" type="button" aria-label="بستن">×</button><img alt=""><p></p>';
  document.body.appendChild(lightbox);

  function closeLightbox() {
    lightbox.classList.remove("is-open");
    document.body.classList.remove("lightbox-open");
  }

  document.addEventListener("click", function(event) {
    const photo = event.target.closest(".gemstone-photo");
    if (photo) {
      event.preventDefault();
      const largeImage = lightbox.querySelector("img");
      largeImage.src = photo.src;
      largeImage.alt = photo.alt;
      lightbox.querySelector("p").textContent = photo.alt;
      lightbox.classList.add("is-open");
      document.body.classList.add("lightbox-open");
      return;
    }
    if (event.target === lightbox || event.target.closest(".gemstone-lightbox-close")) closeLightbox();
  });

  document.addEventListener("keydown", function(event) {
    if (event.key === "Escape") closeLightbox();
  });
});