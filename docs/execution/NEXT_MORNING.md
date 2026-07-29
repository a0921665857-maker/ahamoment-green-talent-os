# NEXT_MORNING — 早上先讀這一份就好

> 2026-07-30 · Gate 8 自主執行完成
> 其他文件都可以晚點看。這一份三分鐘讀完。

## 一、做完了什麼

八個工作包，八個獨立 commit，全部通過 typecheck、221 個測試與 production build。

1. **服務頁從 11 檔收斂成 2 檔付費服務**，價格公開寫死：Offer 與路徑判讀、MBA 故事單次拆解，台灣 NT$6,800／英文與新加坡 SGD 420。沒有「起」、沒有退費保證、三檔多週陪跑永久下架。價格只存在 `lib/services.ts` 一個地方。
2. **免費 30 分鐘改名為「30 分鐘定位對談」**，產品說明裡直接寫「最後會告訴你要多少錢」。舊名字「你這份報告，我親自唸給你聽」把通話定義成售後服務，那是開口報價 0/10 的結構成因。
3. **付款路徑做完了**（Stripe Payment Links，沒有裝任何新套件）：簽章驗證的 webhook、去重、測試模式隔離、成功頁、取消頁。**目前是關的**，見下面第三節。
4. **量測修好了**：`mri_started` 從「頁面被打開」改成「第一次真的動手」；判斷力題庫從零埋點變成五個事件；報告頁有捲動深度。**新舊數字不能直接比。**
5. **全站有導覽了**：19 頁各自手寫的 nav 換成一個共用 header（三個決策入口）＋ footer 全站索引。桌機加了 LINE ID 可複製（lin.ee 連結在電腦上是死的）。
6. **90 天自動刪除從承諾變成程式**：每天跑的 purge cron，預設 dry run。
7. **隱私頁補上第三方處理者、跨境傳輸、cookie、付款資料**——這四件事以前一個字都沒揭露。
8. **綠領揭薪指數上線**（新頁面 `/salary-index`）：98 筆實揭薪資、22 個格子、只有 3 個夠格公布數字，其餘 19 個照樣列出並寫「還差幾筆」。
9. **六份營運材料**寫好了（再接觸稿、見證邀請、通話紀錄範本、90 天記分板、會前問卷、備忘錄範本），在 `ops/`。

## 二、production 現在還是舊的 —— 這是唯一一個真正的技術阻礙

**你的 machine hook 擋住了 `git push origin main`**（`guard-hook.mjs`：「上 prod 是 Michael 的最後一關」）。我沒有繞過它，也不該繞。

狀態：
- `main` 已在**本機**合併完成並重新驗證過（typecheck ✅ · 221 tests ✅ · build ✅），領先 `origin/main` 9 個 commit。
- **branch 已推上去**：`claude/gate-8-autonomous-execution` → Vercel 會有一個 preview 部署可以先看。
- **工作目錄乾淨**，你原本未提交的四個內容線檔案（material-bank、threads-log、threads-published-corpus、voice-canon）我沒有動、沒有提交，仍在你手上。

要上 production，你自己跑這一行：

```bash
git -C "C:\Users\michael\Desktop\ahamoment\ahamoment-green-talent-os-final\ahamoment-green-talent-os" push origin main
```

想先看 preview 再決定的話，去 Vercel 找 `claude/gate-8-autonomous-execution` 那個部署。

**回滾**：`git revert -m 1 7159777` 然後 push，會完整回到現在的 production 狀態。沒有跑過任何破壞性 migration。

## 三、Stripe：程式全做完，等你四個環境變數

付款按鈕現在**不會出現**，因為四個 payment link 環境變數是空的。這是刻意的預設：沒設就不渲染，不會出現點了沒反應的死鍵。

我沒辦法幫你做完付款測試——**沒有 Stripe 憑證**，而規則寫明不得在缺憑證時製造假的付款成功。所以這一段是「程式與測試完成，實際啟用等你」。

照 `docs/execution/STRIPE_SETUP.md` 做，大約 30 分鐘：建四個 Payment Link（兩個服務 × 兩個幣別）→ 後台設「付款後轉址」到 `/zh-TW/payment/success`（這個只能在 Stripe 後台設，不能用網址參數）→ 建 webhook 取得 signing secret → 填進 Vercel → 用測試卡走一次 → 切正式。

## 四、需要你裁決的事（四項，都不是「能不能收費」）

見 `docs/execution/FOUNDER_DECISIONS.md`。四項是：production push、Stripe 環境變數、揭薪指數的 15 筆抽查、以及首頁要不要一起改。

## 五、你今天該親手做的三件事

1. **把 main 推上去**（或先看 preview）。一行指令，見上面第二節。
2. **開始寄再接觸訊息**。稿子在 `ops/outreach/EXISTING_LEADS_OUTREACH.md`，對象是 24 位交過材料 ＋ 10 位已通話的人。**每一則都要把價格寫進去**——這是整個 Gate 8 之後唯一還沒被機器解決的問題，而它只有你能做。
3. **向那 10 位已通話的人要一句可具名的回饋**（稿在 `ops/outreach/TESTIMONIAL_REQUESTS.md`）。目標 3 則。拿到 0 則不是延後，是關於產品的紅燈訊號，而且比再跑 5 場通話便宜一百倍就能知道。

---

*EP、MOM、moonlighting、能不能收費、能不能公開價格——這些在 Gate 8 全部已 bypass，本文件與後續文件都不會再提。*
