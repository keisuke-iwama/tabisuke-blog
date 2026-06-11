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
 * ▼ ここに A8.net の広告を追加していく ▼
 * 下記はサンプル(enabled:false なので表示されません)。
 * A8.netで提携できたら linkHtml を差し替えて enabled:true にしてください。
 */
export const AFFILIATES: AffiliateProgram[] = [
  {
    id: "rakuten-travel",
    name: "楽天トラベル(サンプル枠)",
    categories: ["国内旅行記", "グルメ・宿レビュー"],
    label: "この旅の宿を予約する",
    linkHtml: `<!-- ここに A8.net の楽天トラベル広告タグを貼り付け -->`,
    enabled: false,
  },
  {
    id: "jalan",
    name: "じゃらん(サンプル枠)",
    categories: ["国内旅行記", "グルメ・宿レビュー"],
    label: "宿・温泉を探す",
    linkHtml: `<!-- ここに A8.net のじゃらん広告タグを貼り付け -->`,
    enabled: false,
  },
  {
    id: "travel-wifi",
    name: "海外/国内Wi-Fi・旅行用品(サンプル枠)",
    categories: ["旅のノウハウ"],
    label: "旅の準備に",
    linkHtml: `<!-- ここに A8.net の関連広告タグを貼り付け -->`,
    enabled: false,
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
