import type { EmailsContent } from '../schema';

/** 追蹤信範本（V1 由真人手動寄出）。可替換欄位：{{name}} {{report_url}} {{personal_line}} {{category_note}} */
export const emails: EmailsContent = {
  d0: {
    subject: '你的綠領職涯 MRI 報告寫好了',
    body: `{{name}} 你好，

報告寫好了。{{personal_line}}

在這裡看：{{report_url}}

這個連結是你的，會一直在，原始資料 90 天後自動刪除。

我是一份一份自己讀的，不是機器套版。哪一段你覺得不準，直接回這封信告訴我，你的反駁我會拿去把診斷改得更好。

Michael`,
  },
  d2: {
    subject: '你的報告，我想多補一句',
    body: `{{name}} 你好，

你的報告我又看了一次，有一個當時沒寫進去的觀察：

{{personal_line}}

如果想把這件事在你自己的處境裡想清楚，回這封信跟我說一聲就好，我本人回。真的想聊得深一點，我也有一對一的書面解讀，不過那是後話，你先看看這句對不對得上。

報告在這：{{report_url}}

Michael`,
  },
  d6: {
    subject: '你的 MRI，我收個尾',
    body: `{{name}} 你好，

這是最後一封，之後不會再打擾你。

{{category_note}}

時機對的話，報告在這：{{report_url}}。時機還沒到也沒關係，診斷不會過期，哪天想起來再回來就好。真有想問的，這封信回過來，我都在。

Michael`,
  },
};
