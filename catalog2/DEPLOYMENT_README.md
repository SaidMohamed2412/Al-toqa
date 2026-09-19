# AL-Toqa Furniture — Online Deployment

This version is prepared for:

- Flask / PythonAnywhere
- Supabase Database
- Supabase Storage for product images

## Important change

Products are now loaded from:

Browser → Flask API → Supabase

The browser no longer treats `localStorage` as the source of truth. It is used only as a temporary cache/fallback.

When an admin adds a product:

1. Admin sends the product to `POST /api/products`.
2. Flask authenticates the admin token.
3. Base64 images are uploaded to the Supabase `product-images` bucket.
4. Only public image URLs are saved in `products`.
5. The saved product is returned to the browser.
6. Catalog, product details, admin products and featured management read the same Supabase data.

## Before deployment

1. Open Supabase SQL Editor.
2. Run `supabase/setup.sql` (including after this update, so the `warranty` field is added to existing databases).
3. Check that your `products` table has all columns used by the project.
4. Create `server/.env` from `server/.env.example`.
5. Put the correct Supabase server-side key in `SUPABASE_KEY`.
6. Set `SITE_URL` and `CORS_ORIGIN` to your real domain.
7. Set a strong `ADMIN_PASSWORD` and `JWT_SECRET`.
8. Install dependencies:
   `pip install -r server/requirements.txt`
9. Test:
   `GET /api/health`
10. Log in through `/admin/login.html`.
11. Add a product and verify it appears in Supabase and the public catalog.

## Security

- Never upload `server/.env` to GitHub.
- Do not include `server/.env` or the local `server/venv` folder in deployment ZIP files.
- Never put a Supabase service-role/server key in frontend JavaScript.
- Change any Supabase key or admin password that was previously exposed.
- The included ZIP intentionally does NOT contain the real `.env`.

## PythonAnywhere

Use a Flask Web App and point the WSGI configuration to the Flask `app` object in:

`server/app.py`

The application serves both the API and the static website, so the production site can use the same origin and does not need a separate frontend server.

## Local testing

From the project root:

`python server/app.py`

Then open:

`http://127.0.0.1:5000/`

Do not open the HTML files directly with `file://`, because API requests need the Flask server.
