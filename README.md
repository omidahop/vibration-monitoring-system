# سیستم پیشرفته ثبت داده‌های ویبره تجهیزات

<div align="center">
  <img src="public/icons/icon-192x192.png" alt="Logo" width="120" height="120">
  
  [![Deploy Status](https://github.com/yourusername/vibration-monitoring-system/workflows/Deploy%20to%20Cloudflare%20Workers/badge.svg)](https://github.com/yourusername/vibration-monitoring-system/actions)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![PWA](https://img.shields.io/badge/PWA-enabled-blue.svg)](https://web.dev/progressive-web-apps/)
  [![Persian](https://img.shields.io/badge/Lang-Persian-green.svg)](#)
</div>

سیستم جامع و پیشرفته برای ثبت، نظارت و تحلیل داده‌های ویبره تجهیزات صنعتی با امکانات PWA، مدیریت کاربران و پنل مدیریتی.

## 🎯 ویژگی‌های کلیدی

### 🔐 امنیت و احراز هویت
- ✅ سیستم احراز هویت پیشرفته با JWT
- ✅ مدیریت نقش‌های کاربری (مدیر، سرپرست، اپراتور)
- ✅ تایید کاربران توسط مدیر
- ✅ تاریخچه کامل فعالیت‌ها (Audit Logs)
- ✅ Rate Limiting و محافظت در برابر حملات
- ✅ Session Management امن

### 📱 PWA (Progressive Web App)
- ✅ قابلیت نصب روی موبایل و دسکتاپ
- ✅ کارکرد آفلاین با Background Sync
- ✅ Push Notifications
- ✅ Service Worker پیشرفته
- ✅ Caching استراتژی‌های مختلف

### 🎛️ پنل مدیریت
- ✅ مدیریت کاربران و درخواست‌های ثبت‌نام
- ✅ آمار و گزارش‌های لحظه‌ای
- ✅ نظارت بر سلامت سیستم
- ✅ تاریخچه کامل فعالیت‌ها
- ✅ داشبورد تعاملی

### 📊 ویژگی‌های داده‌ای
- ✅ ثبت داده‌های ویبره برای 12 تجهیز در 2 واحد
- ✅ 12 پارامتر مختلف ویبره
- ✅ نمودارهای تعاملی با Chart.js
- ✅ آنالیز افزایش‌های غیرعادی
- ✅ اسلایدشو قابل تنظیم
- ✅ Export/Import داده‌ها

### ⚙️ تنظیمات شخصی‌سازی
- ✅ ذخیره تنظیمات کاربری در سرور
- ✅ تم روشن/تیره
- ✅ تنظیم اولویت‌ها
- ✅ شخصی‌سازی رنگ‌ها
- ✅ تنظیمات زبان و فرمت تاریخ

## 🏗️ معماری سیستم

```mermaid
graph TB
    A[Frontend - PWA] --> B[Cloudflare Workers]
    B --> C[Cloudflare D1 Database]
    B --> D[Cloudflare KV Cache]
    E[GitHub Actions] --> F[Automated Deployment]
    G[Service Worker] --> A
    H[User Authentication] --> B
    I[Admin Panel] --> B