# تشغيل Backend Python على PythonAnywhere

1. ارفع مجلد `catalog` إلى PythonAnywhere، لكن لا ترفع `server/venv` أو `server/.env`.
2. افتح Bash Console ونفّذ (اختر نفس إصدار Python الذي اخترته من تبويب Web):
   ```bash
   cd ~/catalog/server
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   nano .env
   ```
3. عدّل بيانات `.env` ولا ترفع الملف إلى GitHub.
4. من تبويب Web أنشئ Flask Web App واختر Manual configuration.
5. في WSGI file استخدم:
   ```python
   import sys
   path = '/home/YOUR_USERNAME/catalog/server'
   if path not in sys.path: sys.path.append(path)
   from app import app as application
   ```
6. لا تضف Static files mapping؛ التطبيق يخدم ملفات الواجهة (`/css` و`/js` و`/assets`) بنفسه. يمكنك فتح الموقع من `/`.
7. اضغط Reload.
8. بعد أول رفع أو تحديث لقاعدة البيانات، نفّذ `supabase/setup.sql` في Supabase SQL Editor، ثم اختبر `/api/health`.
