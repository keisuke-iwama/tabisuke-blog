// カテゴリ名 ⇔ URLスラッグ(カテゴリ一覧ページ /category/{slug}/ 用)
export const CATEGORY_SLUGS: Record<string, string> = {
  "国内旅行記": "travelogue",
  "旅のノウハウ": "tips",
  "グルメ・宿レビュー": "gourmet-stay",
};

export const CATEGORY_INTRO: Record<string, string> = {
  "国内旅行記": "エリア別のモデルコースや観光ルートを、所要時間・回る順番・費用の目安つきでまとめています。",
  "旅のノウハウ": "予算・持ち物・交通・子連れ旅など、国内旅行の準備と節約に役立つノウハウをまとめています。",
  "グルメ・宿レビュー": "ご当地グルメの楽しみ方や宿の選び方など、旅先の「食べる・泊まる」をまとめています。",
};

export const categoryUrl = (c: string) => `/category/${CATEGORY_SLUGS[c] ?? "tips"}/`;
