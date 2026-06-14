/**
 * A8.net アフィリエイト広告の登録リスト
 *
 * 使い方:
 *   1. A8.net で提携した広告(プログラム)の「素材」→「バナー」or「テキスト」リンクを取得
 *   2. そのHTMLタグ(<a ...>...</a> と <img ...> を含む丸ごと)を `linkHtml` に貼り付け
 *   3. `enabled: true` にすると記事に表示される
 *   4. `categories` に、その広告を出したい たびすけのカテゴリを指定
 *      ("国内旅行記" / "旅のノウハウ" / "グルメ・宿レビュー" / "all" = 全カテゴリ)
 *
 * 注意:
 *   - linkHtml はA8.netからコピーした「あなたの媒体ID入り」のタグをそのまま使うこと
 *     (手動でURLを書き換えると成果が計測されません)
 *   - 表示順は配列の上から。各記事には最大 `MAX_PER_ARTICLE` 件まで表示
 */

export type TabisukeCategory =
  | "国内旅行記"
  | "旅のノウハウ"
  | "グルメ・宿レビュー";

export interface AffiliateProgram {
  /** 識別用の一意なID(任意の英数字) */
  id: string;
  /** 管理用の表示名(画面には出ない、自分用メモ) */
  name: string;
  /** どのカテゴリの記事に出すか。"all" で全記事 */
  categories: (TabisukeCategory | "all")[];
  /** 広告の上に出す一言(任意)。例: "旅の宿予約はこちら" */
  label?: string;
  /** A8.netから取得した広告タグHTML(<a>+<img>を丸ごと) */
  linkHtml: string;
  /** true にすると表示される */
  enabled: boolean;
}

/** 1記事あたりに表示する広告の最大数 */
export const MAX_PER_ARTICLE = 2;

/**
 * ▼ A8.net 提携済み広告(媒体「たびすけ」websiteId=005)▼
 * 2026-06-15 時点で提携完了したプログラムの実タグを登録済み。
 * 追加・差し替え時は A8.net の「広告リンク作成」でサイト=たびすけを選び、
 * 取得したHTMLを linkHtml にそのまま貼ること(URLの手書き改変は成果非計測)。
 */
export const AFFILIATES: AffiliateProgram[] = [
  {
    id: "jalan",
    name: "じゃらんnet宿泊予約(リクルート)",
    categories: ["国内旅行記", "グルメ・宿レビュー"],
    label: "この旅の宿を予約する",
    linkHtml: `<a href="https://px.a8.net/svt/ejp?a8mat=4B5WG7+E4GAHE+14CS+68EPE" rel="nofollow">【じゃらん】国内25,000軒の宿をネットで予約OK！2％ポイント還元！</a>
<img border="0" width="1" height="1" src="https://www10.a8.net/0.gif?a8mat=4B5WG7+E4GAHE+14CS+68EPE" alt="">`,
    enabled: true,
  },
  {
    id: "rakuten-travel",
    name: "楽天トラベル(楽天アフィリエイト)",
    categories: ["国内旅行記", "グルメ・宿レビュー"],
    label: "楽天ポイントで宿を予約する",
    // 楽天アフィリエイト発行タグ。href(hb.afl.rakuten.co.jp〜)は計測URLのため改変禁止。アンカー文言のみ表示用に変更。
    linkHtml: `<a href="https://hb.afl.rakuten.co.jp/hgc/54e80c36.b50f4ee1.54e80c37.61398c1d/?pc=https%3A%2F%2Ftravel.rakuten.co.jp%2F&link_type=text&ut=eyJwYWdlIjoidXJsIiwidHlwZSI6InRleHQiLCJjb2wiOjF9" target="_blank" rel="nofollow sponsored noopener" style="word-wrap:break-word;">楽天トラベルで宿を探す</a>`,
    enabled: true,
  },
  {
    id: "skyrental",
    name: "スカイレンタカー(国内格安レンタカー)",
    categories: ["国内旅行記", "旅のノウハウ"],
    label: "現地の移動はレンタカーで",
    linkHtml: `<a href="https://px.a8.net/svt/ejp?a8mat=4B5WG7+EIQP02+2AIA+61RIA" rel="nofollow">九州の格安レンタカー予約なら【スカイレンタカー】</a>
<img border="0" width="1" height="1" src="https://www12.a8.net/0.gif?a8mat=4B5WG7+EIQP02+2AIA+61RIA" alt="">`,
    enabled: true,
  },
  {
    id: "global-wifi",
    name: "グローバルWiFi(海外WiFiレンタル)",
    categories: ["旅のノウハウ"],
    label: "海外旅行のネット環境に",
    linkHtml: `<a href="https://px.a8.net/svt/ejp?a8mat=4B5WG7+E5N5OY+2JMM+64C3M" rel="nofollow">グローバルWiFi公式サイトを見てみる</a>
<img border="0" width="1" height="1" src="https://www16.a8.net/0.gif?a8mat=4B5WG7+E5N5OY+2JMM+64C3M" alt="">`,
    enabled: true,
  },
  {
    id: "ry-rental",
    name: "アールワイレンタル(スーツケースレンタル)",
    categories: ["旅のノウハウ"],
    label: "旅の準備・持ち物に",
    linkHtml: `<a href="https://px.a8.net/svt/ejp?a8mat=4B5WG7+E68LAQ+3J30+62ENM" rel="nofollow">スーツケースレンタルなら【アールワイレンタル】</a>
<img border="0" width="1" height="1" src="https://www14.a8.net/0.gif?a8mat=4B5WG7+E68LAQ+3J30+62ENM" alt="">`,
    enabled: true,
  },
];

/**
 * 指定カテゴリに出せる有効な広告を最大 MAX_PER_ARTICLE 件返す。
 * カテゴリ一致(または "all")かつ enabled かつ linkHtml が実在するもののみ。
 */
export function pickAffiliates(category: string): AffiliateProgram[] {
  return AFFILIATES.filter(
    (a) =>
      a.enabled &&
      a.linkHtml.trim().length > 0 &&
      !a.linkHtml.trim().startsWith("<!--") &&
      (a.categories.includes("all") ||
        a.categories.includes(category as TabisukeCategory))
  ).slice(0, MAX_PER_ARTICLE);
}
