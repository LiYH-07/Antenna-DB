# 📡 Antenna DB — 手機天線規格查詢工具

> 從 Google Sheets 讀取資料，部署在 GitHub Pages，手機瀏覽器直接查閱。

---

## 整體架構

```
Google Sheets (資料源)
       ↓ 自動發佈 CSV
GitHub Pages (靜態網頁)
       ↓ 手機瀏覽器開啟
Antenna DB 查詢頁面
```

---

## 步驟一：準備 Google Sheets

### 1-1 將 Excel 匯入 Google Sheets

1. 打開 [Google Sheets](https://sheets.google.com)，點擊「空白試算表」
2. 選單 → **檔案 → 匯入**
3. 上傳 `Antenna_DB_FIXED_Dashboard_FullSpec.xlsx`
4. 匯入設定選「**取代試算表**」→ 確認匯入

> ✅ 確認匯入後有三個工作表：`Antenna_Master`、`Antenna_Band_Spec`、`Dashboard`

### 1-2 發佈為公開 CSV

1. 選單 → **檔案 → 共用 → 發佈到網路**
2. 「連結」分頁保持預設（整份文件，網頁）
3. 按「**發佈**」確認
4. 關閉這個對話框（不需要複製連結）

### 1-3 取得 Sheet ID

從瀏覽器網址列複製 Sheet ID：

```
https://docs.google.com/spreadsheets/d/【這一段就是 SHEET_ID】/edit
```

範例：
```
https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit
                                        ↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑
```

---

## 步驟二：設定 index.html

打開 `index.html`，找到第 22 行，將 `YOUR_GOOGLE_SHEET_ID_HERE` 替換為你的 ID：

```html
<!-- 修改前 -->
const SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE";

<!-- 修改後（範例）-->
const SHEET_ID = "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms";
```

---

## 步驟三：上傳到 GitHub Pages

### 3-1 建立 Repository

1. 登入 [GitHub](https://github.com)
2. 右上角 **+** → **New repository**
3. Repository name 填：`antenna-db`（或任意名稱）
4. 選 **Public**（必須，GitHub Pages 免費版需要 Public）
5. 按「**Create repository**」

### 3-2 上傳檔案

**方法 A：網頁直接上傳（最簡單）**

1. 在剛建立的 repo 頁面，點擊「**uploading an existing file**」
2. 把 `index.html`、`sw.js`、`manifest.json`、`icon-192.png`、`icon-512.png` 全部拖進去（PWA 快取與主畫面圖示需要）
3. 輸入 commit 訊息（例如：`Add antenna dashboard`）
4. 按「**Commit changes**」

**方法 B：使用 Git（適合後續更新）**

```bash
git clone https://github.com/你的帳號/antenna-db.git
cd antenna-db
cp /path/to/{index.html,sw.js,manifest.json,icon-192.png,icon-512.png} .
git add .
git commit -m "Add antenna dashboard"
git push
```

### 3-3 啟用 GitHub Pages

1. 進入 repo 頁面 → 上方選單 **Settings**
2. 左側找 **Pages**
3. Source 選「**Deploy from a branch**」
4. Branch 選 `main`，資料夾選 `/ (root)`
5. 按「**Save**」

等待約 1–2 分鐘後，頁面會顯示：

```
Your site is live at https://你的帳號.github.io/Antenna-DB/
```
https://LiYH-07.github.io/Antenna-DB/

---

## 步驟四：加入手機主畫面（可選）

### iOS Safari
1. 手機 Safari 開啟網址
2. 底部分享按鈕 → 「**加入主畫面**」
3. 名稱填「Antenna DB」→ 加入

### Android Chrome
1. Chrome 開啟網址
2. 右上角三點 → 「**新增至主畫面**」

之後直接從主畫面開啟，體驗接近原生 App。

---

## 篩選功能說明

頁面上方提供三種篩選分頁：

| 分頁 | 說明 |
|------|------|
| **廠商** | 依製造商篩選天線列表 |
| **PORT 數** | 依連接埠數量篩選 |
| **中華電信 Band** | 僅顯示涵蓋中華電信指定頻段的天線 |

### 中華電信 Band 篩選

選取頻段後，系統將依以下頻點範圍進行比對，**僅顯示天線頻段範圍有重疊的項目**，展開的頻段規格表也只列出符合該頻段的列。

| 頻段 | 頻點範圍 (MHz) | 制式 |
|------|--------------|------|
| L900 | 940 – 960 | LTE |
| L1800 | 1820 – 1870 | LTE |
| N1 | 2150 – 2170 | NR |
| L2600 | 2640 – 2690 | LTE |
| N78 | 3420 – 3510 | NR |

> ℹ️ 篩選邏輯：天線的 `SubBand_Low_MHz` ≤ 頻段上限 **且** `SubBand_High_MHz` ≥ 頻段下限，即視為符合。

---

## 天線涵蓋計算器

「地面涵蓋」模式下，輸入天線型號、天線高度 H<sub>t</sub>、用戶高度 H<sub>r</sub>、總下傾角（機械＋電子）後，顯示：

- **涵蓋模擬圖**：鐵塔側視示意圖，畫出 0° 水平線、主瓣（下傾角）、垂直波束寬（VBW）上下緣、近端／遠端半徑與主瓣落點。
- **頻段切換**：模擬圖上方的頻段 chip（LB / MB / HB…）或點選下方結果表任一列，即切換為該頻段的 VBW、增益、H-BW 重新繪製。
- 若中華電信 Band 篩選啟用，計算器只列出符合該頻段的列。
- 波束上緣 (θ−VBW/2) ≤ 0° 時遠端顯示 ∞ 並提示加大下傾角。

> 模擬圖垂直方向已放大以便辨識，圖上角度為示意；距離標示為實際計算值。

### 路徑損耗估算（COST-231 Hata）

在「地面涵蓋」模式輸入發射功率、饋線／接頭損耗、環境（大都會／都市／郊區／鄉村）、接收門檻與植被附加損耗後，顯示：

- **接收電平 vs 距離** 曲線（點選或滑過可看各距離的接收電平、路損、場型衰減），標出門檻線與最大涵蓋距離
- 各頻段在近端、主瓣落點、遠端的接收電平，以及最大涵蓋距離

計算方式：

```
接收電平 = 發射功率 − 饋線損耗 + 天線增益 − 垂直場型衰減 − 路徑損耗 − 植被損耗
```

- 路徑損耗：1500 MHz 以下用 Okumura-Hata，以上用 COST-231 Hata（大都會 +3 dB）；郊區、鄉村依 Hata 修正式扣減。
- 頻率取子頻段中心；啟用中華電信 Band 篩選時取該頻段中心。
- 垂直場型衰減依 3GPP 近似 12·(偏離主瓣角 / VBW)²，上限 20 dB，所以塔下附近會出現低谷。
- 發射功率輸入 RS 功率（例如 15 dBm）即得到 RSRP。
- **樹林區（植被損耗）**：Hata 沒有樹林類別，另外加植被損耗，從接收電平扣除，最大涵蓋距離同步縮短。有兩種方式：
  - **固定值**：直接輸入 dB（快選：疏林 5／樹林 10／密林 15）。樹林區常用約 8–15 dB。
  - **樹林深度模型**：輸入信號穿過樹林的深度 d（m），依各頻段頻率計算，所以高頻段損耗較大：

    | 模型 | 公式 |
    |------|------|
    | Weissberger | d ≤ 14 m：0.45·f<sup>0.284</sup>·d；14 < d ≤ 400 m：1.33·f<sup>0.284</sup>·d<sup>0.588</sup>（f 單位 GHz） |
    | 早期 ITU-R | 0.2·f<sup>0.3</sup>·d<sup>0.6</sup>（f 單位 MHz） |
    | FITU-R 有葉 | 0.39·f<sup>0.39</sup>·d<sup>0.25</sup>（f 單位 MHz） |
    | FITU-R 落葉 | 0.37·f<sup>0.18</sup>·d<sup>0.59</sup>（f 單位 MHz） |

    深度超過 400 m 時標示為外推：實際上信號會改走越過樹冠的繞射路徑，損耗趨於飽和，模型會高估。台灣常綠林多數時間適用「有葉」。

  兩種方式都建議以實測校正。

> 模型適用範圍：150–2000 MHz、天線高度 30–200 m、用戶高度 1–10 m、距離 1–20 km。超出範圍（例如 3.5 GHz、1 km 以內）會標示為外推，結果僅供參考。未計陰影衰落餘量與穿透損耗。

### 反推下傾角

在計算器輸入「目標涵蓋距離」後，會算出達到該距離所需的總下傾角：

| 方式 | 公式 | 用途 |
|------|------|------|
| 主瓣對準 | θ = atan(ΔH / D) | 主瓣剛好打在目標距離 |
| 上緣對準 | θ = atan(ΔH / D) + VBW/2 | 波束上緣落在目標距離，涵蓋不越過 D，常用於控制越區干擾 |

- ΔH = 天線高度 − 用戶高度。上緣對準依各頻段 VBW 分別計算，並列出對應的近端距離。
- 對照 `Electrical_Tilt_Range_deg`：超出上限時提示需補多少機械下傾。
- 按「套用」即把該下傾角填回計算器，模擬圖同步更新（下傾角取到小數一位，遠端距離會與目標略有差異）。

### 高處涵蓋（大樓／高架橋／山坡）

計算器上方切換到「高處涵蓋」，再選目標類型。三種類型都用同一套算法：目標視為一段距離與高度都可能不同的線，計算波束涵蓋其中哪一段。

| 類型 | 輸入 | 目標線 |
|------|------|--------|
| 🏢 大樓 | 大樓距離、大樓高度、每層樓高 | 垂直的大樓立面，結果換算成樓層 |
| 🌉 高架橋 | 橋中心距離、橋長、橋走向角、橋中心方位、橋面高度（相對天線地面）、用戶高度 | 水平的橋面（用戶高度），可任意轉向 |
| ⛰️ 山坡 | 天線基地海拔、山腳距離／海拔、目標距離／海拔、用戶高度 | 從山腳到目標的斜坡，結果附海拔 |

- **涵蓋區段與比例**：波束（俯角 θ−VBW/2 ~ θ+VBW/2）落在目標線上的區段，以及佔整段的比例；整段都沒照到時，會指出目標在波束上方或下方。
- **兩端衰減**：目標兩端偏離主瓣的角度，以及依 3GPP 垂直場型近似 12·(Δθ/VBW)²（上限 20 dB）估算的衰減。
- **上仰**：下傾角可輸入負值（例如 −5 = 上仰 5°）。
- **高架橋的方位（水平角）**：
  - **橋走向角**：0° = 沿天線方向延伸，90° = 橫越天線前方，其他角度為斜交。
  - **橋中心方位**：橋中心相對天線正前方的方位角，右正左負。
  - 橋上每一點同時計算方位偏角與俯仰偏角，衰減 ≈ 12·(方位偏角 / H-BW)² + 12·(俯仰偏角 / VBW)²，上限 25 dB（3GPP 場型近似），−3 dB 以內視為涵蓋；H-BW 取自試算表 `Horizontal_BW_deg`。
  - 模擬圖改為**俯視圖**（依實際比例）：H-BW 扇區、橋面高度上的 −3 dB 涵蓋範圍、轉向後的橋與被涵蓋的橋段。
  - 反推另列出「方位對準橋段中心」要向左／右轉幾度，以及橋段水平張角（需要的 H-BW）。
- **反推**：主瓣對準起點、主瓣對準終點、置中涵蓋整段（並列出所需 VBW，表格標示各頻段 VBW 是否足夠）；按「套用」填回計算器。

> 未考慮中間地形或建物遮蔽。上仰通常需要機械或支架調整，多數天線的電下傾不支援負角度。

---

## 天線比較

在天線卡片按「＋ 比較」，選 2–3 支後按下方「比較」，即可並排比較：

- **一般規格**：PORT、重量、尺寸、連接器、安裝方式（重量最輕者以底色標示）
- **中華電信頻段**：各頻段的頻點、增益、H/V 波束寬，同一頻段增益最高者以底色標示；未涵蓋的頻段顯示「未涵蓋」
- **全部頻段**：依 Band_ID（LB / MB / HB…）列出各天線的子頻段

---

## 後續更新資料

| 情境 | 操作 |
|------|------|
| 新增天線 | 在 Google Sheets 的 `Antenna_Master` 和 `Antenna_Band_Spec` 新增資料列 → 手機網頁按「⟳ 重整」即可同步 |
| 修改規格 | 直接修改 Google Sheets 對應欄位 |
| 批量新增 | 使用 `antenna-extractor.jsx` 工具提取 PDF → 下載 Excel → 複製貼到 Google Sheets |

> ℹ️ 資料快取 5 分鐘，按「⟳ 重整」強制重新載入最新資料。

---

## 工作表欄位對應

### `Antenna_Master`

| 欄位 | 說明 |
|------|------|
| Antenna_Name | 型號（唯一識別碼）|
| Manufacturer | 製造商 |
| Port_Count | 連接埠數量 |
| Length_mm / Width_mm / Depth_mm | 尺寸（毫米）|
| Weight_kg | 重量 |
| Connector_Type | 連接器類型 |
| Mounting_Type | 安裝方式 |
| Notes | 備註 |

### `Antenna_Band_Spec`

| 欄位 | 說明 |
|------|------|
| Antenna_Name | 對應 Master 的型號 |
| Band_ID | LB / MB / HB / HB_Y1 / HB_Y2 |
| SubBand_Low_MHz | 子頻段下限 |
| SubBand_High_MHz | 子頻段上限 |
| Gain_dBi | 增益 |
| Horizontal_BW_deg | 水平半功率角 |
| Vertical_BW_deg | 垂直半功率角 |
| Electrical_Tilt_Range_deg | 電下傾範圍 |

---

## 常見問題

**Q：網頁顯示「無法載入資料」？**  
A：檢查兩點：① SHEET_ID 是否正確貼上；② Google Sheets 是否已完成「發佈到網路」的步驟。

**Q：資料沒有更新？**  
A：Google Sheets 發佈的 CSV 可能有幾分鐘延遲，按網頁右上角「⟳ 重整」並稍等。

**Q：中華電信 Band 篩選後沒有顯示天線？**  
A：表示目前資料庫中無天線的頻段範圍涵蓋該中華電信頻段，請確認 Google Sheets 的 `SubBand_Low_MHz` / `SubBand_High_MHz` 欄位已正確填寫。

**Q：可以設定密碼保護嗎？**  
A：GitHub Pages 本身不支援密碼。若需要，可以改用 Cloudflare Pages + Access 或改 Private repo + GitHub Pro。

---

*Generated by Claude · Antenna DB v1.5 — 高架橋方位與俯視圖*
