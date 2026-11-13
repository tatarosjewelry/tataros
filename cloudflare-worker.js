const OWNER = "tatarosjewelry";
const REPO = "tataros";
const BRANCH = "main";
const PRODUCTS_PATH = "data/products.json";
const ALLOWED_ORIGIN = "https://tatarosjewelry.github.io";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store"
    }
  });
}

function decodeBase64Utf8(value) {
  const binary = atob(value.replace(/\s/g, ""));
  const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64Utf8(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binary);
}

async function github(path, method, body, env) {
  const url = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${path}`;
  const options = {
    method: method || "GET",
    headers: {
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "Tataros-Product-Manager"
    }
  };
  if (body) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  const response = await fetch(url, options);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(result.message || `GitHub API error: ${response.status}`);
  }
  return result;
}

async function readProducts(env) {
  const file = await github(PRODUCTS_PATH, "GET", null, env);
  const data = JSON.parse(decodeBase64Utf8(file.content));
  return { file, products: Array.isArray(data.products) ? data.products : [] };
}

async function saveProducts(file, products, message, env) {
  return github(PRODUCTS_PATH, "PUT", {
    message,
    content: encodeBase64Utf8(JSON.stringify({ products }, null, 2) + "\n"),
    sha: file.sha,
    branch: BRANCH
  }, env);
}

async function saveImage(input, env) {
  if (!input.imageBase64) return null;
  const extension = ({ "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" })[input.mimeType];
  if (!extension) throw new Error("فرمت عکس باید JPG، PNG یا WEBP باشد.");
  const path = `images/product-${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
  await github(path, "PUT", {
    message: `Add Tataros product image ${path.split("/").pop()}`,
    content: input.imageBase64,
    branch: BRANCH
  }, env);
  return `/tataros/${path}`;
}

function validate(input) {
  if (!input || typeof input.name !== "string" || !input.name.trim()) {
    throw new Error("نام محصول را وارد کنید.");
  }
  if (!["rings", "gemstones", "tasbih"].includes(input.category)) {
    throw new Error("دسته‌بندی محصول معتبر نیست.");
  }
  if (input.price && !/^\d+$/.test(String(input.price).replace(/,/g, ""))) {
    throw new Error("قیمت باید فقط عدد باشد.");
  }
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (!env.GITHUB_TOKEN) return json({ error: "GITHUB_TOKEN secret is missing." }, 500);

    const url = new URL(request.url);
    if (url.pathname !== "/products" && url.pathname !== "/") {
      return json({ error: "مسیر درخواست پیدا نشد." }, 404);
    }

    try {
      if (request.method === "GET") {
        const { products } = await readProducts(env);
        return json({ products });
      }

      if (request.method === "POST") {
        const input = await request.json();
        validate(input);
        const imagePath = await saveImage(input, env);
        if (!imagePath) throw new Error("لطفاً عکس محصول را انتخاب کنید.");
        const { file, products } = await readProducts(env);
        products.push({
          name: input.name.trim(),
          category: input.category,
          price: input.price ? String(input.price).replace(/,/g, "") : "",
          description: String(input.description || "").trim(),
          image: imagePath
        });
        await saveProducts(file, products, `Add product: ${input.name.trim()}`, env);
        return json({ success: true, products });
      }

      if (request.method === "PUT" || request.method === "DELETE") {
        const index = Number(url.searchParams.get("index"));
        if (!Number.isInteger(index) || index < 0) return json({ error: "شناسه محصول نامعتبر است." }, 400);
        const { file, products } = await readProducts(env);
        if (index >= products.length) return json({ error: "محصول پیدا نشد." }, 404);

        if (request.method === "DELETE") {
          const removed = products.splice(index, 1)[0];
          await saveProducts(file, products, `Delete product: ${removed.name || index}`, env);
          return json({ success: true, products });
        }

        const input = await request.json();
        validate(input);
        const imagePath = await saveImage(input, env);
        products[index] = {
          ...products[index],
          name: input.name.trim(),
          category: input.category,
          price: input.price ? String(input.price).replace(/,/g, "") : "",
          description: String(input.description || "").trim(),
          image: imagePath || products[index].image
        };
        await saveProducts(file, products, `Update product: ${input.name.trim()}`, env);
        return json({ success: true, products });
      }

      return json({ error: "روش درخواست پشتیبانی نمی‌شود." }, 405);
    } catch (error) {
      return json({ error: error.message || "خطای ناشناخته" }, 500);
    }
  }
};
