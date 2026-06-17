import type { EmailsContent } from '../schema';

/** 追蹤信範本（V1 由真人手動寄出）。可替換欄位：{{name}} {{report_url}} {{personal_line}} {{category_note}} */
export const emails: EmailsContent = {
  d0: {
    subject: '你的綠色職涯 MRI 報告',
    body: `{{name}} 你好，

你的報告已經完成：{{report_url}}

{{personal_line}}

這個連結屬於你——報告會一直在，原始上傳內容則會在 90 天後自動刪除。如果判讀有哪裡不準，直接回信告訴我；誠實的反駁會讓診斷更好。

Michael
AhaMoment`,
  },
  d2: {
    subject: '你的資料裡，還有一件事值得說',
    body: `{{name}} 你好，

有一個觀察，當時沒放進報告：

{{personal_line}}

如果你想把這件事在實務上想清楚，拆解對談就是為此設計的——而且費用可在 30 天內全額折抵任何更完整的方案。

{{report_url}}

Michael`,
  },
  d6: {
    subject: '為你的 MRI 收個尾',
    body: `{{name}} 你好，

這是最後一封信——之後不會再有任何序列訊息。

{{category_note}}

時機對的話，報告在這裡：{{report_url}}。時機還不對也沒關係——診斷不會過期，等你準備好再回來。

Michael`,
  },
};
