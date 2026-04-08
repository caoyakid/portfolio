# Tech Stack — 個人作品集網站

## 前端框架

| 選項 | 說明 | 推薦 |
|------|------|------|
| **Next.js (App Router)** | SSR + SSG 混合，SEO 友善，檔案路由，支援 API Routes | ✅ 首選 |
| Astro | 靜態優先，適合 blog，但互動性較弱 | 備選 |
| Vite + React | 純 SPA，SEO 較差，不推薦作品集主站 | ❌ |

> [!IMPORTANT]
> 推薦 **Next.js**，原因：可同時處理前端頁面、後端 API（預約、信件、內容 CRUD），一個 repo 搞定。

---

## 後端 / API 層

Next.js **API Routes / Route Handlers** 即可涵蓋大部分需求：
- 預約送出 → 寄信
- 文章 CRUD（新增、鎖定、公開）
- 時段管理（available / unavailable）
- 全文搜尋

> [!NOTE]
> 若未來流量大或需要解耦，可考慮獨立 Express / Fastify 後端，但初期沒必要。

---

## 資料庫

| 選項 | 說明 | 推薦 |
|------|------|------|
| **PostgreSQL + Prisma ORM** | 關聯型，適合文章分類、預約管理、全文搜尋（tsvector） | ✅ 首選 |
| Supabase（hosted PostgreSQL） | 提供即開即用 DB + Auth + Storage，省去自架成本 | ✅ 強力備選 |
| MongoDB | 文件型，文章儲存彈性，但預約與關聯查詢複雜度高 | 備選 |
| SQLite | 輕量，適合本地開發，但雲端部署限制多 | 開發用 |

> [!TIP]
> 推薦 **Supabase**（hosted PostgreSQL）：免費額度夠個人使用，內建 Storage 放圖片/影片、Auth 管理登入（你自己管理後台）、全文搜尋原生支援。

---

## 檔案儲存（圖片 / 影片）

| 選項 | 說明 |
|------|------|
| **Supabase Storage** | 若已用 Supabase，直接整合 |
| Cloudinary | 圖片/影片轉碼、自動壓縮，有免費額度 |
| AWS S3 + CloudFront | 最彈性，操作稍複雜 |
| Vercel Blob | 與 Vercel 部署整合最簡單 |

---

## 寄信服務

| 選項 | 說明 |
|------|------|
| **Resend** | 現代 Email API，免費 100封/天，Next.js 整合極簡單 | ✅
| SendGrid | 老牌，功能全，但設定較繁瑣 |
| Nodemailer + Gmail SMTP | 免費但 Gmail 有限制，適合初期測試 |

---

## 搜尋引擎

| 選項 | 說明 |
|------|------|
| **PostgreSQL Full-Text Search** | 原生 tsvector，免費，支援中文需加 zhparser | ✅ 初期首選 |
| Algolia | 強大 fuzzy 搜尋，免費額度有限 |
| MeiliSearch（self-hosted） | 開源，支援 fuzzy，需自架 |

> [!NOTE]
> 初期用 PostgreSQL FTS + `pg_trgm`（trigram）即可支援 fuzzy 搜尋與多關鍵字，夠用。中文支援需特別處理（或用 Supabase Edge Function）。

---

## 動態效果（首頁）

- **Framer Motion** — React 動畫首選，照片輪播、進場動效
- **GSAP** — 更複雜的時間軸動畫（選用）
- **react-player** — 影片播放

---

## 行事曆 / 預約 UI

- **react-big-calendar** 或 **FullCalendar** — 顯示 available/unavailable 時段
- 或自製簡易月曆（若需求單純）

---

## 部署

| 選項 | 說明 |
|------|------|
| **Vercel** | Next.js 原廠，零設定部署，免費額度足夠個人站 | ✅ 首選 |
| Railway | 若需要跑自己的後端服務 |
| Fly.io | 容器化部署，彈性高 |

---

## 認證（後台管理）

- **NextAuth.js（Auth.js）** — 支援 Google / GitHub OAuth，你自己登入管理後台
- 或 Supabase Auth（若已用 Supabase）

---

## 總結推薦組合

```
Next.js (App Router)
  + Supabase (PostgreSQL + Storage + Auth)
  + Resend (Email)
  + Framer Motion (動畫)
  + FullCalendar (預約行事曆)
  + Vercel (部署)
```

這個組合：**全部有免費額度、個人開發友善、scalable**。
