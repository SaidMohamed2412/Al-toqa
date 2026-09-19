import os, json, secrets, smtplib, base64, uuid, mimetypes
from datetime import datetime, timedelta, timezone
from email.message import EmailMessage
from functools import wraps
from pathlib import Path

from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS
import jwt
from dotenv import load_dotenv
from supabase import create_client

BASE_DIR = Path(__file__).resolve().parent.parent
SERVER_DIR = Path(__file__).resolve().parent

load_dotenv(SERVER_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()
STORAGE_BUCKET = os.getenv("SUPABASE_STORAGE_BUCKET", "product-images").strip()

supabase = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_URL and SUPABASE_KEY else None

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")
# Product images can be larger than the old 1 MB JSON limit.
app.config["MAX_CONTENT_LENGTH"] = 12 * 1024 * 1024
MAX_IMAGE_BYTES = 2 * 1024 * 1024

allowed = [x.strip() for x in os.getenv("CORS_ORIGIN", "").split(",") if x.strip()]
CORS(app, origins=allowed or "*")


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def require_supabase():
    if supabase is None:
        return jsonify(message="لم يتم إعداد اتصال Supabase في ملف .env"), 503
    return None


def token_for(username):
    secret = os.environ["JWT_SECRET"]
    return jwt.encode(
        {"sub": username, "role": "admin",
         "exp": datetime.now(timezone.utc) + timedelta(hours=8)},
        secret,
        algorithm="HS256",
    )


def require_admin(fn):
    @wraps(fn)
    def wrapped(*args, **kwargs):
        header = request.headers.get("Authorization", "")
        token = header[7:] if header.startswith("Bearer ") else ""
        if not token:
            return jsonify(message="غير مصرح."), 401
        try:
            jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
        except Exception:
            return jsonify(message="انتهت جلسة تسجيل الدخول."), 401
        return fn(*args, **kwargs)
    return wrapped


# ---------------------------------------------------------
# Supabase Storage
# ---------------------------------------------------------

def upload_data_url(data_url, folder="products"):
    """Upload a data:image/... URL to Supabase Storage and return its public URL."""
    if not isinstance(data_url, str) or not data_url.startswith("data:image/"):
        return data_url

    try:
        header, encoded = data_url.split(",", 1)
        mime = header.split(";", 1)[0].replace("data:", "", 1).strip()
        raw = base64.b64decode(encoded, validate=True)
        if not mime.startswith("image/"):
            raise ValueError("الملف المرفوع ليس صورة.")
        if len(raw) > MAX_IMAGE_BYTES:
            raise ValueError("حجم الصورة يجب ألا يزيد عن 2MB.")
        ext = mimetypes.guess_extension(mime) or ".jpg"
        filename = f"{folder}/{uuid.uuid4().hex}{ext}"

        supabase.storage.from_(STORAGE_BUCKET).upload(
            filename,
            raw,
            {"content-type": mime, "upsert": "false"},
        )
        return supabase.storage.from_(STORAGE_BUCKET).get_public_url(filename)
    except Exception as exc:
        app.logger.exception("Supabase Storage upload failed")
        raise RuntimeError(f"تعذر رفع صورة المنتج إلى Supabase Storage: {exc}") from exc


def prepare_product(body):
    """Normalize product payload and move base64 images to Storage."""
    if not isinstance(body, dict):
        return {}

    data = dict(body)
    data.pop("id", None)

    images = data.get("images", [])
    if not isinstance(images, list):
        images = []

    prepared = []
    for image in images[:4]:
        if isinstance(image, str) and image:
            prepared.append(upload_data_url(image))

    # Keep legacy `image` synchronized with the first image.
    legacy_image = data.get("image", "")
    if not prepared and isinstance(legacy_image, str) and legacy_image.startswith("data:image/"):
        legacy_image = upload_data_url(legacy_image)

    data["images"] = prepared
    data["image"] = prepared[0] if prepared else legacy_image or ""
    data["active"] = bool(data.get("active", True))
    data["featured"] = bool(data.get("featured", False))

    # Keep dates in a predictable form.
    if not data.get("createdAt"):
        data["createdAt"] = now_iso()

    return data


# ---------------------------------------------------------
# Products API
# ---------------------------------------------------------

@app.get("/api/products")
def api_products():
    error = require_supabase()
    if error:
        return error
    try:
        result = (
            supabase.table("products")
            .select("*")
            .eq("active", True)
            .order("id")
            .execute()
        )
        return jsonify(result.data or [])
    except Exception as exc:
        app.logger.exception("Products read failed")
        return jsonify(message=f"تعذر قراءة المنتجات من Supabase: {exc}"), 500


@app.get("/api/admin/products")
@require_admin
def api_admin_products():
    error = require_supabase()
    if error:
        return error
    try:
        result = supabase.table("products").select("*").order("id").execute()
        return jsonify(result.data or [])
    except Exception as exc:
        app.logger.exception("Admin products read failed")
        return jsonify(message=f"تعذر قراءة منتجات الإدارة من Supabase: {exc}"), 500


@app.post("/api/products")
@require_admin
def api_create_product():
    error = require_supabase()
    if error:
        return error
    try:
        body = prepare_product(request.get_json(silent=True) or {})
        result = supabase.table("products").insert(body).execute()
        return jsonify((result.data or [body])[0]), 201
    except Exception as exc:
        app.logger.exception("Product create failed")
        return jsonify(message=f"تعذر إضافة المنتج إلى Supabase: {exc}"), 500


@app.patch("/api/products/<int:product_id>")
@require_admin
def api_update_product(product_id):
    error = require_supabase()
    if error:
        return error
    try:
        body = request.get_json(silent=True) or {}
        # Do not overwrite createdAt during edits.
        body.pop("id", None)
        body.pop("createdAt", None)
        body = prepare_product(body)
        body.pop("createdAt", None)
        body["updatedAt"] = now_iso()

        result = (
            supabase.table("products")
            .update(body)
            .eq("id", product_id)
            .execute()
        )
        if not result.data:
            return jsonify(message="المنتج غير موجود."), 404
        return jsonify(result.data[0])
    except Exception as exc:
        app.logger.exception("Product update failed")
        return jsonify(message=f"تعذر تعديل المنتج في Supabase: {exc}"), 500


@app.delete("/api/products/<int:product_id>")
@require_admin
def api_delete_product(product_id):
    error = require_supabase()
    if error:
        return error
    try:
        result = supabase.table("products").delete().eq("id", product_id).execute()
        if not result.data:
            return jsonify(message="المنتج غير موجود."), 404
        return jsonify(ok=True)
    except Exception as exc:
        app.logger.exception("Product delete failed")
        return jsonify(message=f"تعذر حذف المنتج من Supabase: {exc}"), 500


# ---------------------------------------------------------
# Categories
# ---------------------------------------------------------

@app.get("/api/categories")
def api_categories():
    error = require_supabase()
    if error:
        return error
    try:
        result = supabase.table("categories").select("*").eq("active", True).order("id").execute()
        return jsonify(result.data or [])
    except Exception as exc:
        return jsonify(message=f"تعذر قراءة الأقسام من Supabase: {exc}"), 500


# ---------------------------------------------------------
# Categories CRUD
# ---------------------------------------------------------

@app.get("/api/categories/all")
@require_admin
def api_admin_categories():
    error = require_supabase()
    if error: return error
    try:
        result = supabase.table("categories").select("*").order("id").execute()
        return jsonify(result.data or [])
    except Exception as exc:
        return jsonify(message=f"تعذر قراءة الأقسام: {exc}"), 500

@app.post("/api/categories")
@require_admin
def api_create_category():
    error = require_supabase()
    if error: return error
    try:
        body = request.get_json(silent=True) or {}
        image = upload_data_url(body.get("image", ""), "categories")
        payload = {"name": str(body.get("name", "")).strip(), "parentCategory": str(body.get("parentCategory", "")).strip(), "image": image, "active": bool(body.get("active", True))}
        if not payload["name"] or not payload["parentCategory"]: return jsonify(message="بيانات القسم غير مكتملة."), 400
        result = supabase.table("categories").insert(payload).execute()
        return jsonify((result.data or [payload])[0]), 201
    except Exception as exc:
        return jsonify(message=f"تعذر إضافة القسم: {exc}"), 500

@app.patch("/api/categories/<category_id>")
@require_admin
def api_update_category(category_id):
    error = require_supabase()
    if error: return error
    try:
        body = request.get_json(silent=True) or {}
        payload = {k: body[k] for k in ("name", "parentCategory", "active") if k in body}
        if "image" in body: payload["image"] = upload_data_url(body.get("image", ""), "categories")
        result = supabase.table("categories").update(payload).eq("id", category_id).execute()
        if not result.data: return jsonify(message="القسم غير موجود."), 404
        return jsonify(result.data[0])
    except Exception as exc:
        return jsonify(message=f"تعذر تعديل القسم: {exc}"), 500

@app.delete("/api/categories/<category_id>")
@require_admin
def api_delete_category(category_id):
    error = require_supabase()
    if error: return error
    try:
        result = supabase.table("categories").delete().eq("id", category_id).execute()
        if not result.data: return jsonify(message="القسم غير موجود."), 404
        return jsonify(ok=True)
    except Exception as exc:
        return jsonify(message=f"تعذر حذف القسم: {exc}"), 500

# ---------------------------------------------------------
# Banners CRUD
# ---------------------------------------------------------

@app.get("/api/banners")
def api_banners():
    error = require_supabase()
    if error: return error
    try:
        result = supabase.table("banners").select("*").eq("active", True).order("sortOrder").order("id").execute()
        return jsonify(result.data or [])
    except Exception as exc:
        return jsonify(message=f"تعذر قراءة البانرات: {exc}"), 500

@app.get("/api/admin/banners")
@require_admin
def api_admin_banners():
    error = require_supabase()
    if error: return error
    try:
        result = supabase.table("banners").select("*").order("sortOrder").order("id").execute()
        return jsonify(result.data or [])
    except Exception as exc:
        return jsonify(message=f"تعذر قراءة البانرات: {exc}"), 500

@app.post("/api/banners")
@require_admin
def api_create_banner():
    error = require_supabase()
    if error: return error
    try:
        body = request.get_json(silent=True) or {}
        image = upload_data_url(body.get("image", ""), "banners")
        payload = {"title": str(body.get("title", "")).strip(), "text": str(body.get("text", "")).strip(), "button": str(body.get("button", "")).strip(), "link": str(body.get("link", "products.html")).strip() or "products.html", "image": image, "active": bool(body.get("active", True)), "sortOrder": int(body.get("sortOrder", 0) or 0)}
        if not payload["title"] or not payload["image"]: return jsonify(message="بيانات البانر غير مكتملة."), 400
        result = supabase.table("banners").insert(payload).execute()
        return jsonify((result.data or [payload])[0]), 201
    except Exception as exc:
        return jsonify(message=f"تعذر إضافة البانر: {exc}"), 500

@app.patch("/api/banners/<banner_id>")
@require_admin
def api_update_banner(banner_id):
    error = require_supabase()
    if error: return error
    try:
        body = request.get_json(silent=True) or {}
        payload = {k: body[k] for k in ("title", "text", "button", "link", "active", "sortOrder") if k in body}
        if "image" in body: payload["image"] = upload_data_url(body.get("image", ""), "banners")
        result = supabase.table("banners").update(payload).eq("id", banner_id).execute()
        if not result.data: return jsonify(message="البانر غير موجود."), 404
        return jsonify(result.data[0])
    except Exception as exc:
        return jsonify(message=f"تعذر تعديل البانر: {exc}"), 500

@app.delete("/api/banners/<banner_id>")
@require_admin
def api_delete_banner(banner_id):
    error = require_supabase()
    if error: return error
    try:
        result = supabase.table("banners").delete().eq("id", banner_id).execute()
        if not result.data: return jsonify(message="البانر غير موجود."), 404
        return jsonify(ok=True)
    except Exception as exc:
        return jsonify(message=f"تعذر حذف البانر: {exc}"), 500

# ---------------------------------------------------------
# Quotes are stored in Supabase (no local JSON files)
# ---------------------------------------------------------

def clean_quote(inp):
    q = dict(inp or {})
    q["id"] = str(q.get("id", ""))[:80]
    q["customerName"] = str(q.get("customerName", "")).strip()[:150]
    q["companyName"] = str(q.get("companyName", "")).strip()[:180]
    q["customerPhone"] = str(q.get("customerPhone", "")).strip()[:30]
    q["customerEmail"] = str(q.get("customerEmail", "")).strip()[:180]
    q["items"] = q.get("items", [])[:100] if isinstance(q.get("items", []), list) else []
    q["status"] = q.get("status") or "new"
    q["createdAt"] = q.get("createdAt") or now_iso()
    return q

# ---------------------------------------------------------
# Auth
# ---------------------------------------------------------

@app.post("/api/auth/login")
def login():
    body = request.get_json(silent=True) or {}
    username = str(body.get("username", ""))
    password = str(body.get("password", ""))

    if not all(os.getenv(k) for k in ["ADMIN_USERNAME", "ADMIN_PASSWORD", "JWT_SECRET"]):
        return jsonify(message="لم يتم إعداد بيانات دخول الـ Backend بعد."), 503

    if (
        not secrets.compare_digest(username, os.environ["ADMIN_USERNAME"])
        or not secrets.compare_digest(password, os.environ["ADMIN_PASSWORD"])
    ):
        return jsonify(message="اسم المستخدم أو كلمة المرور غير صحيحة."), 401

    return jsonify(token=token_for(username))


# ---------------------------------------------------------
# Quotes
# ---------------------------------------------------------

def send_quote_email(q):
    required = ["SMTP_HOST", "SMTP_USER", "SMTP_PASS", "QUOTE_RECEIVER"]
    if not all(os.getenv(k) for k in required): return False, False
    lines = "\n".join(f"{i+1}. {x.get('productName','منتج')} | الكمية: {x.get('quantity',1)} | الكود: {x.get('productCode','-')}" for i, x in enumerate(q["items"]))
    msg = EmailMessage(); msg["From"] = os.environ["SMTP_USER"]; msg["To"] = os.environ["QUOTE_RECEIVER"]; msg["Subject"] = f"طلب عرض سعر جديد - {q['id']}"
    if q.get("customerEmail"): msg["Reply-To"] = q["customerEmail"]
    msg.set_content(f"رقم الطلب: {q['id']}\nالشركة: {q['companyName']}\nالعميل: {q['customerName']}\nالهاتف: {q['customerPhone']}\nالبريد: {q.get('customerEmail','-')}\n\nالمنتجات:\n{lines}\n\nتفاصيل الطلب: {q.get('quoteDetails','-')}")
    port = int(os.getenv("SMTP_PORT", "465")); secure = os.getenv("SMTP_SECURE", "true").lower() == "true"
    if secure:
        with smtplib.SMTP_SSL(os.environ["SMTP_HOST"], port) as s: s.login(os.environ["SMTP_USER"], os.environ["SMTP_PASS"]); s.send_message(msg)
    else:
        with smtplib.SMTP(os.environ["SMTP_HOST"], port) as s: s.starttls(); s.login(os.environ["SMTP_USER"], os.environ["SMTP_PASS"]); s.send_message(msg)
    return True, True

@app.post("/api/quotes")
def create_quote():
    error = require_supabase()
    if error: return error
    q = clean_quote(request.get_json(silent=True) or {})
    if not q["customerName"] or not q["companyName"] or not q["customerPhone"] or not q["items"]: return jsonify(message="بيانات طلب عرض السعر غير مكتملة."), 400
    try:
        existing = supabase.table("quotes").select("id").eq("id", q["id"]).limit(1).execute()
        if existing.data: return jsonify(message="رقم الطلب مستخدم بالفعل."), 409
        payload = {k: q.get(k) for k in ["id","customerName","companyName","customerPhone","customerEmail","projectType","quoteDetails","budget","deliveryDate","contactMethod","items","subtotal","vatRate","vatAmount","grandTotal","paymentTerms","deliveryPeriod","warranty","status","createdAt"]}
        result = supabase.table("quotes").insert(payload).execute()
        saved = (result.data or [payload])[0]
        sent = configured = False
        try: sent, configured = send_quote_email(saved)
        except Exception as exc: app.logger.error("SMTP error: %s", exc)
        return jsonify(ok=True, quoteId=saved["id"], saved=True, emailSent=sent, emailConfigured=configured), 201
    except Exception as exc:
        return jsonify(message=f"تعذر حفظ طلب عرض السعر في Supabase: {exc}"), 500

@app.get("/api/quotes")
@require_admin
def get_quotes():
    error = require_supabase()
    if error: return error
    try:
        result = supabase.table("quotes").select("*").order("createdAt", desc=True).execute()
        return jsonify(result.data or [])
    except Exception as exc: return jsonify(message=f"تعذر قراءة الطلبات: {exc}"), 500

@app.patch("/api/quotes/<quote_id>")
@require_admin
def update_quote(quote_id):
    error = require_supabase()
    if error: return error
    try:
        body = request.get_json(silent=True) or {}
        allowed_fields = {"customerName", "companyName", "customerPhone", "customerEmail", "projectType", "quoteDetails", "budget", "deliveryDate", "contactMethod", "items", "subtotal", "vatRate", "vatAmount", "grandTotal", "paymentTerms", "deliveryPeriod", "warranty", "status"}
        payload = {key: body[key] for key in allowed_fields if key in body}
        payload["updatedAt"] = now_iso()
        result = supabase.table("quotes").update(payload).eq("id", quote_id).execute()
        if not result.data: return jsonify(message="الطلب غير موجود."), 404
        return jsonify(result.data[0])
    except Exception as exc: return jsonify(message=f"تعذر تعديل الطلب: {exc}"), 500

@app.delete("/api/quotes/<quote_id>")
@require_admin
def delete_quote(quote_id):
    error = require_supabase()
    if error: return error
    try:
        result = supabase.table("quotes").delete().eq("id", quote_id).execute()
        if not result.data: return jsonify(message="الطلب غير موجود."), 404
        return jsonify(ok=True)
    except Exception as exc: return jsonify(message=f"تعذر حذف الطلب: {exc}"), 500


# ---------------------------------------------------------
# Utility / static
# ---------------------------------------------------------

@app.get("/api/health")
def health():
    db = bool(supabase)
    if not db:
        return jsonify(ok=False, database=False), 503
    try:
        supabase.table("products").select("id").limit(1).execute()
        return jsonify(ok=True, database=True, storageBucket=STORAGE_BUCKET)
    except Exception as exc:
        return jsonify(ok=False, database=False, message=str(exc)), 503


@app.get("/robots.txt")
def robots():
    site = os.getenv("SITE_URL", request.host_url.rstrip("/"))
    return Response(
        f"User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: {site}/sitemap.xml\n",
        mimetype="text/plain",
    )


@app.get("/sitemap.xml")
def sitemap():
    site = os.getenv("SITE_URL", request.host_url.rstrip("/"))
    pages = ["/index.html", "/products.html", "/product-details.html", "/about.html", "/contact.html"]
    xml = (
        '<?xml version="1.0" encoding="UTF-8"?>'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
        + "".join(f"<url><loc>{site}{p}</loc></url>" for p in pages)
        + "</urlset>"
    )
    return Response(xml, mimetype="application/xml")


@app.route("/", defaults={"path": "index.html"})
@app.route("/<path:path>")
def static_files(path):
    if path.startswith("api/"):
        return jsonify(message="Not found"), 404
    return send_from_directory(BASE_DIR, path)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=int(os.getenv("PORT", "5000")), debug=False)
