# hue.studio - 開發進度記錄 (Progress Review)

以下是迄今為止根據 `implementation-plan.md` 和 `tech-stack.md` 所完成的核心系統建設。所有的開發都在 `/Users/lucaho/dev/portfolio/app` 目錄下建立。

## 1. 專案初始化與架構 (Infrastructure)
- 使用 **Next.js 15 (App Router)** 建立全新的應用。
- 安裝與配置所需的依賴：`@prisma/client` (與 V6 降級穩定版相容), `next-auth`, `@supabase/supabase-js`, `resend`, `framer-motion`, `tiptap` 等。

## 2. 資料庫與 API 設計 (Database & API)
- **Prisma Schema (`schema.prisma`)**: 定義了網站所有的資料表：
  - 用戶與驗證 (`User`, `Account`, `Session` 用於後台管理員登入)
  - 內容管理 (`Category` 支援巢狀層級樹, `Post` 文章包含標籤、封面圖、鎖定狀態)
  - 預訂系統 (`TimeSlot` 營業時段, `Booking` 訪客預訂紀錄)
  - 首頁資源 (`HeroMedia` 支援首頁動態圖片或影片切換)
- **API Routes**: 建立支援伺服器端渲染及前後端串接的 RESTful API 路由 (`/api/posts`, `/api/bookings`, `/api/categories`, 等)，並加上了 `isAdmin` 的安全防護，確保只有管理者能 CUID 分類和審核預約。

## 3. UI 與設計系統 (Design System & Aesthetics)
- **客製化樣式 (`globals.css`)**: 捨棄了預設樣式，親自撰寫一套專屬的高端、乾淨風格設計 (Premium Minimalist)。
  - 字體排印：使用 `Inter` 作為內文，搭配 `Playfair Display` (Serif) 作為優雅的標題配置。
  - 色彩計畫：白色、米色基底色 (`var(--color-bg)`)，配上低飽和度的暖系點綴文字，營造攝影/質感個人品牌。
  - 互動與特效：加入骨架屏 (Skeleton Loading)、滑動選單、流暢的 `framer-motion` 進場視差效果。

## 4. 前台頁面功能 (Public Views)
- **首頁 (`/`)**: 整合了具備自動輪播與視差效果的 `HeroSlider` (支援圖片與自動播放影片) 以及 `BookingCalendar` 可讓訪客直接在可用日期上進行時段預約。
- **文章系統 (`/posts` & `/posts/[slug]`)**: 文章列表支援動態搜尋 (`SearchBar`) 與分類篩選 (`category`)；單篇文章能乾淨渲染防禦過度標籤的 Html 格式，並且隱藏狀態為 `locked` 的文章，非管理員不可見。
- **全站元件**: 具備自適應的側邊導覽列 (`Sidebar`)，其中包含了可開合的分類樹與中英切換 (i18n Context) 環境。

## 5. 後台管理系統 (Admin Dashboard)
- **身份驗證 (`/admin/login`)**: 使用 NextAuth 結合 Google OAuth，確保只有設定在 `.env` 的指定 Email 才能以 Admin 狀態登入並顯示後台面板。
- **後台首頁 (`/admin`)**: 顯示基礎營運數據(文章數、新預約數)，及最新預約待辦。
- **預約管理 (`/admin/bookings`, `/admin/timeslots`)**: 提供你直接新增可預約的時間段，並針對訪客提交的預約進行「確認(Confirmed)」、「拒絕(Rejected)」狀態管理。
- **內容編輯 (`/admin/posts/new`, `/admin/categories`)**:
  - `TiptapEditor`: 建構了完善的富文本編輯器，支援粗體、標頭、引言、專屬網址與外部圖片。
  - 分類與標籤支援彈性綁定。

---

## 接下來的步驟 (Next Steps)
要實際將專案跑起來並且測試所有功能，你需要：

1. **設定環境變數 (`.env.local`)**:
   在 `app/.env.local` 中填入你的：
   - Supabase `DATABASE_URL` (PostgreSQL 連線字串)
   - Supabase API Keys (給上傳圖片用)
   - Google Client ID / Secret (後台登入用)
   - Resend API Key & 收發 Emails
  
2. **初始化資料庫**:
   終端機進入 `/app` 目錄後，執行 `npx prisma db push` 讓 Prisma 創建資料庫表。

3. **啟動開發伺服器**:
   執行 `npm run dev`，即可至 `localhost:3000` 預覽你的作品集！
