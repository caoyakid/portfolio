# Implementation Plan — 個人作品集網站

> [!NOTE]
> 品牌名稱：**hue.studio**（個人品牌，同時作為域名）| 設計基調：**白底、簡潔高端**
> UI 元件透過 GitHub MCP Server 抓取（shadcn/ui、radix-ui 等）。
> `style_ref/` 截圖放好後通知我，開工前優先參考。

## 背景與目標

建立個人品牌網站 **hue.studio**，整合：照片/影片展示、時段預訂系統、富文本內容管理（旅遊/日記/投資）、彈性分類、全站搜尋。

---

## 雙視角架構（核心設計原則）

| | 訪客 View | Admin View（你登入後）|
|---|---|---|
| 文章 | 僅看 `public` 文章 | 可見全部（含 `locked`）|
| 排版 | 固定唯讀 | 可拖拉調整圖片/文章排序 |
| 新增文章 | ❌ | ✅（遊記、日記、投資均可）|
| 預訂管理 | 只能送出預約 | 可管理預約狀態、設定時段 |
| 分類管理 | 唯讀瀏覽 | 可新增/修改/刪除分類 |

> [!IMPORTANT]
> 所有寫入操作（新增、編輯、排序、刪除）均需 admin 身份驗證，前端依登入狀態動態切換 UI。

---

## 功能模組拆解

### 模組 1：首頁 — 動態展示 + 預訂系統

**展示區塊**
- Hero 區塊同時支援照片輪播 + 自動播放影片（兩者混合），媒體類型保持可擴充
- Framer Motion 進場動畫、hover 視差效果
- CMS 後台可上傳圖片或影片，並調整順序

**行事曆預訂**
- 顯示月曆，綠色 = available、灰色 = unavailable
- 訪客點選日期 → 填寫姓名、Email、預訂原因 → 送出
- 後端收到後：① 寫入 DB（狀態：pending）② 寄信到你的信箱（Resend）
- 你與客人確認後，登入後台將時段標記為 unavailable
- **預訂單位：小時**，同一天可設定多個獨立時段（例如 10:00–11:00、14:00–16:00）
- 你預先在後台設定 available 時段，訪客只能從可用時段中點選預約

**後台（你）**
- 登入（NextAuth / Supabase Auth）
- 管理預訂紀錄（pending / confirmed / rejected）
- 在月曆上標記 available/unavailable 時段（支援拖拉或點選）

---

### 模組 2：內容頁面 — 文章 / 日記 / 旅遊 / 投資

**文章屬性**
- 標題、內文（Rich Text）
- 封面圖
- 多媒體嵌入（圖片、影片）
- 分類（多選 tag + 主分類）
- 狀態：`public` / `locked`（locked = 需密碼或僅你可見）
- 建立時間、更新時間

**Rich Text 編輯器選項**
| 選項 | 說明 |
|------|------|
| **Tiptap** | 輕量、可擴充、支援圖片/影片嵌入 | ✅ 推薦 |
| TinyMCE | 功能全，偏重量 |
| Notion-like (Novel) | Notion 風格 block editor，開源 |

**鎖定機制（已確認）**
- Locked 文章：**僅你登入後台後可見**，訪客預設看不到
- 未來預留 **付費解鎖** 擴充點（Payment 串接，如 Stripe），目前不實作
- 訪客頁面：locked 文章不出現在列表與搜尋結果中

---

### 模組 3：彈性分類系統

**需求（已確認）**
- 自訂分類名稱（旅遊、投資、日記…）
- 支援**層級結構**（父分類 → 子分類）
- **全站固定顯示**側邊欄，可收合的樹狀選單，訪客永遠知道有哪些內容可看
- 按年份自動歸檔（可作為一種分類維度）

**DB 結構（草案）**
```
categories
  - id
  - name
  - parent_id (self-reference, nullable)
  - slug
  - sort_order

posts
  - id
  - title
  - body (rich text / markdown)
  - cover_image_url
  - status (public / locked)
  - password_hash (nullable)
  - category_id
  - tags (array)
  - created_at
  - updated_at
```

---

### 模組 4：全站搜尋

- 搜尋範圍：文章標題 + 內文
- 支援多關鍵字（空白分隔）
- Fuzzy 容錯（`pg_trgm` trigram similarity）
- locked 文章**不出現**在搜尋結果
- 搜尋結果關鍵字高亮
- **位置**：全站顯示，不強制置頂，根據整體設計風格決定（可能是 floating bar 或 sidebar 內）

**技術方案**
- PostgreSQL `tsvector` + `pg_trgm` 擴充
- 搜尋 API：`/api/search?q=關鍵字`
- 前端：Combobox UI（下拉即時預覽），Enter 跳轉搜尋結果頁

---

## 系統架構概覽

```
瀏覽器
  └── Next.js (Vercel)
        ├── 前端頁面 (App Router / RSC)
        └── API Routes
              ├── /api/bookings    ← 預訂送出、狀態管理
              ├── /api/posts       ← 文章 CRUD
              ├── /api/categories  ← 分類 CRUD
              ├── /api/search      ← 全文搜尋
              └── /api/timeslots   ← 時段管理

Supabase
  ├── PostgreSQL  ← 所有資料
  └── Storage     ← 圖片 / 影片

Resend            ← 預訂通知信
```

---

## 頁面路由規劃（草案）

| 路由 | 說明 |
|------|------|
| `/` | 首頁：Hero 展示 + 預訂行事曆 |
| `/posts` | 所有文章列表（含搜尋、分類篩選） |
| `/posts/[slug]` | 單篇文章 |
| `/admin` | 後台入口（登入保護） |
| `/admin/bookings` | 預訂管理 |
| `/admin/timeslots` | 時段管理 |
| `/admin/posts` | 文章管理 |
| `/admin/categories` | 分類管理 |

---

## 多語言（i18n）

- **中英文切換 button**（已確認），全站語言 toggle
- 推薦使用 `next-intl` 或 `next-i18next`
- 文章內容本身可選擇只寫一種語言，UI 元素（nav、button、標籤）雙語
- 未來可擴充文章雙語版本

---

## SEO

- Nice-to-have，不是硬需求
- Next.js App Router 預設 SSR，自然支援基本 SEO（Metadata API）
- 不需另外做 sitemap / 結構化資料等進階 SEO

---

---

## 待執行細節

> [!IMPORTANT]
> 以下細節待你準備好後確認：

1. **你的真實姓名 / 英文名**：用於網站版權宣告、About 頁面與聯繫資訊
2. **style_ref 資料夾**：請把參考截圖放進去，實作前我會先看
3. **付費解鎖（未來）**：Stripe 或其他 payment provider 偏好？（目前不急，僅作為未來擴充參考）
