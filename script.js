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
    ["زمرد","EMERALD","#a7f1bd","#14804d","#06402d","IMG_3860.jpeg"],
    ["یاقوت","RUBY","#ff9b9b","#a51e3b","#4c071a"],
    ["زبرجد","PERIDOT","#e6f79b","#88a92e","#40551a"],
    ["اپال","OPAL","#f7d7f2","#9bb9d8","#6b6b9a","IMG_3859.jpeg"],
    ["آمتیست","AMETHYST","#dcb8ff","#8452b5","#3d245f"],
    ["توپاز طلایی","GOLDEN TOPAZ","#ffe6a1","#d39a32","#79501c"],
    ["توپاز سوئیس","SWISS TOPAZ","#b8f0ff","#28a9dc","#07517c"],
    ["توپاز بلو","BLUE TOPAZ","#b8f0ff","#28a9dc","#07517c","IMG_3870.jpeg"],
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

  // Load products maintained through Pages CMS and render them in their collections.
  function renderManagedProducts() {
    const targets = {
      rings: document.getElementById("managedRings"),
      gemstones: document.getElementById("managedGemstones"),
      tasbih: document.getElementById("managedTasbih")
    };
    if (!Object.values(targets).some(Boolean)) return;
    fetch("data/products.json?v=" + Date.now())
      .then(response => { if (!response.ok) throw new Error("catalog unavailable"); return response.json(); })
      .then(payload => {
        (payload.products || []).forEach(product => {
          const target = targets[product.category];
          if (!target) return;
          const card = document.createElement("article");
          card.className = product.category === "tasbih" ? "tasbih-placeholder tasbih-product" : "gemstone-card gemstone-card-refined managed-product";
          const image = document.createElement("img");
          image.className = product.category === "tasbih" ? "tasbih-photo" : "gemstone-photo";
          image.loading = "lazy";
          image.alt = product.name || "محصول تاتاروس";
          let imagePath = product.image || "";
          if (imagePath && !imagePath.startsWith("http") && !imagePath.startsWith("/")) imagePath = "/tataros/" + imagePath;
          image.src = imagePath;
          card.appendChild(image);
          const name = document.createElement("b");
          name.textContent = product.name || "";
          card.appendChild(name);
          if (product.description) {
            const description = document.createElement("p");
            description.className = "managed-product-description";
            description.textContent = product.description;
            card.appendChild(description);
          }
          if (product.price) {
            const price = document.createElement("small");
            price.className = "managed-product-price";
            price.textContent = Number(product.price).toLocaleString("fa-IR") + " تومان";
            card.appendChild(price);
          }
          target.appendChild(card);
        });
      })
      .catch(error => console.warn("Tataros catalog could not be loaded:", error));
  }
  renderManagedProducts();

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
    const photo = event.target.closest(".gemstone-photo, .tasbih-photo");
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

// TATAROS — shared Desert Oud ambience player
document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("tataros-music-toggle")) return;
  const audio = document.createElement("audio");
  audio.id = "tataros-background-music";
  audio.loop = true;
  audio.preload = "none";
  audio.src = encodeURI("Mazagan Oud Chill – Desert Oud عود الصحراء.m4a");
  audio.volume = 0.22;
  audio.setAttribute("aria-label", "Desert Oud background music");
  document.body.appendChild(audio);

  const button = document.createElement("button");
  button.id = "tataros-music-toggle";
  button.type = "button";
  button.className = "tataros-music-toggle";
  button.setAttribute("aria-label", "پخش موسیقی");
  button.innerHTML = '<span class="music-icon" aria-hidden="true">♫</span><span class="music-label">پخش موسیقی</span>';
  document.body.appendChild(button);

  button.addEventListener("click", async function () {
    if (audio.paused) {
      try {
        await audio.play();
        button.classList.add("is-playing");
        button.setAttribute("aria-label", "توقف موسیقی");
        button.querySelector(".music-label").textContent = "توقف موسیقی";
      } catch (error) {
        button.querySelector(".music-label").textContent = "دوباره تلاش کنید";
      }
    } else {
      audio.pause();
      button.classList.remove("is-playing");
      button.setAttribute("aria-label", "پخش موسیقی");
      button.querySelector(".music-label").textContent = "پخش موسیقی";
    }
  });
});
