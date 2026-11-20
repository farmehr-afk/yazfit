# 🚀 راهنمای انتشار YazFit روی هاست اشتراکی (yazfit.com)

اپلیکیشن **کاملاً استاتیک** است — نه PHP می‌خواهد، نه دیتابیس. فقط فایل‌ها را آپلود کنید.

---

## گام ۱ — اتصال دامنه yazfit.com به هاست

دامنه و هاست جدا هستند (رایج‌ترین حالت):

1. وارد پنل **ثبت‌کننده دامنه** شوید (جایی که yazfit.com را خریده‌اید)
2. بخش مدیریت DNS → یک رکورد اضافه کنید:
   | Type | Name | Value | TTL |
   |---|---|---|---|
   | `A` | `@` | **IP هاست شما** | 3600 |
   | `A` | `www` | **IP هاست شما** | 3600 |
3. IP هاست را از هاستینگ بگیرید (در cPanel معمولاً در سایدبار «General Information → Shared IP Address»)
4. در **cPanel هاست**: بخش *Domains* → *Create A New Domain* → `yazfit.com` را اضافه کنید (Document Root: `public_html`)
5. انتشار DNS ۱۵ دقیقه تا چند ساعت طول می‌کشد — با `ping yazfit.com` یا [whatsmydns.net](https://whatsmydns.net) چک کنید

> اگر دامنه و هاست از یک شرکت باشند، گاهی اتصال خودکار انجام می‌شود.

## گام ۲ — آپلود فایل‌ها در cPanel

1. وارد **cPanel** شوید → **File Manager**
2. وارد پوشه `public_html` شوید (اگر چند دامنه دارید: `public_html/yazfit.com`)
3. فایل `yazfit-site.zip` را با دکمه **Upload** بفرستید
4. روی zip راست‌کلیک → **Extract** → محتویات باید مستقیم در `public_html` باشد، طوری که مسیر `public_html/index.html` وجود داشته باشد
5. فایل zip را حذف کنید

**پوشه‌های فایل‌ها:** `index.html` · `styles.css` · `data.js` · `engine.js` · `app-views.js` · `app-core.js` · `manifest.json` · `sw.js` · `icons/` · `.htaccess`

> اگر فایل `.htaccess` مخفی است: در File Manager گزینه **Settings → Show Hidden Files (dotfiles)** را فعال کنید.

## گام ۳ — فعال‌سازی SSL (ضروری برای PWA و نوتیفیکیشن‌ها)

1. cPanel → **SSL/TLS Status** (یا *Security → AutoSSL*)
2. تیک دامنه `yazfit.com` → **Run AutoSSL** (گواهی رایگان Let's Encrypt)
3. چند دقیقه صبر کنید تا `Valid` شود

## گام ۴ — فعال‌کردن ریدایرکت HTTPS

در File Manager فایل `.htaccess` را **Edit** کنید و ۳ خط کامنت‌شده این بخش را از کامنت خارج کنید:

```apache
RewriteCond %{HTTPS} off
RewriteCond %{HTTP:X-Forwarded-Proto} !https
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]
```

## گام ۵ — تست نهایی

- باز کنید: `https://yazfit.com` — باید صفحه خوش‌آمد YazFit بیاید
- **موبایل:** کروم/سافاری → آدرس سایت → منو → **Add to Home Screen / Install** → اپ تمام‌صفحه با آیکون نصب می‌شود
- داخل اپ: «Try demo profile» برای تست سریع

---

## 🔧 عیب‌یابی

| مشکل | راه‌حل |
|---|---|
| صفحه سفید/خطا | کنسول مرورگر (F12) را ببینید؛ معمولاً آپلود ناقص است — همه ۱۰ آیتم را چک کنید |
| «Index of /» می‌آید | `index.html` در ریشه `public_html` نیست یا داخل زیرپوشه اکسترکت شده |
| آیکون نصب PWA نیست | سایت باید HTTPS باشد + یک بار کش مرورگر را خالی کنید (Ctrl+Shift+R) |
| نوتیفیکیشن‌ها نمی‌آیند | روی HTTP کار نمی‌کنند — فقط بعد از SSL؛ ضمن باز بودن اپ کار می‌کنند |
| آپدیت نصفه اعمال شد | کش سرویس‌ورکر: در DevTools → Application → Service Workers → Unregister، یا نسخه cache در `sw.js` را یکی بالا ببرید (`yazfit-v1` → `yazfit-v2`) |

## 📦 آپدیت‌های بعدی

فایل‌های تغییرکرده را دوباره در `public_html` جایگزین کنید (File Manager → Upload → Overwrite). اگر بعداً قالب HTML اختصاصی برای مشتری‌ها (مثل برنامه فرشید) اضافه شد، فقط فایل‌های جدید کنار همین‌ها آپلود می‌شوند — هیچ تنظیم سروری لازم نیست.

## ⚙️ الزامات هاست

- هر هاست اشتراکی لینوکس (cPanel یا DirectAdmin) با Apache یا LiteSpeed ✅
- PHP فقط برای اجرای خود PHP؛ اپ هیچ‌وقت اجرایش نمی‌کند — حتی پلن مینیمم کافی است
- هاست ویندوزی (IIS): به‌جای `.htaccess` فایل `web.config` لازم است — بگویید تا بسازم
