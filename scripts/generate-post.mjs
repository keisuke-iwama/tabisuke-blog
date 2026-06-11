#!/usr/bin/env node
/**
 * 毎日の記事自動生成スクリプト
 *
 * - 過去記事のタイトル/カテゴリを読み取り、重複しないトピックを Claude に選定させる
 * - 1500〜2500 文字の Markdown 記事を生成
 * - src/content/posts/YYYY-MM-DD-{slug}.md に保存
 *
 * env:
 *   ANTHROPIC_API_KEY - 必須
 *
 * exit codes:
 *   0 - 成功
 *   1 - 失敗 (GitHub Actions で workflow を fail させる)
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import Anthropic from "@anthropic-ai/sdk";
import matter from "gray-matter";
import slugifyPkg from "slugify";

const slugify = slugifyPkg.default || slugifyPkg;
const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, "..", "src", "content", "posts");

// ============== 設定 ==============
const MODEL = "claude-sonnet-4-5"; // Sonnet 4.5
const MIN_BODY_CHARS = 1000;
const MAX_RETRIES = 1;
const CATEGORIES = ["国内旅行記", "旅のノウハウ", "グルメ・宿レビュー"];

// ============== 環境チェック ==============
const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error("ERROR: ANTHROPIC_API_KEY is not set");
  process.exit(1);
}

const client = new Anthropic({ apiKey });

// ============== 過去記事の読み取り ==============
function loadPastPosts() {
  if (!existsSync(POSTS_DIR)) return [];
  const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith(".md"));
  const posts = [];
  for (const file of files) {
    try {
      const raw = readFileSync(join(POSTS_DIR, file), "utf-8");
      const { data } = matter(raw);
      if (data.title) {
        posts.push({
          title: data.title,
          category: data.category || "(unknown)",
          pubDate: data.pubDate,
        });
      }
    } catch (e) {
      console.warn(`Failed to parse ${file}: ${e.message}`);
    }
  }
  posts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
  return posts;
}

// ============== プロンプト構築 ==============
function buildPrompt(pastPosts) {
  const recent = pastPosts.slice(0, 30);
  const pastList =
    recent.length > 0
      ? recent
          .map((p, i) => `${i + 1}. [${p.category}] ${p.title}`)
          .join("\n")
      : "(過去記事なし)";

  // カテゴリ別の最近のカウントを表示し、Claude がバランスをとれるように
  const countByCategory = {};
  for (const c of CATEGORIES) countByCategory[c] = 0;
  for (const p of recent) {
    if (countByCategory[p.category] !== undefined) {
      countByCategory[p.category]++;
    }
  }
  const balanceHint = CATEGORIES.map(
    (c) => `- ${c}: ${countByCategory[c]} 記事`
  ).join("\n");

  return `あなたは旅メディア「たびすけ」のライターです。
キャッチコピー: 「旅をたすける、旅でみつける」
読者: 20-30代の国内旅行好き、ファミリー層

# 今日の記事を1本書いてください

## カテゴリ選定ルール
以下の3つから、過去30記事との重複を避けつつ、最も少ないカテゴリ寄りで選んでください:
${CATEGORIES.map((c) => `- ${c}`).join("\n")}

過去30記事のカテゴリ別内訳:
${balanceHint}

## 過去30記事のタイトル(重複回避用)
${pastList}

## 記事の要件
1. 2000〜3000文字の本文(frontmatter除く)。SEO上、網羅性のある中身の濃い記事にする
2. 信頼性重視: 具体的な地名・数字・固有名詞を入れる(架空ではなく実在の地名・施設を使う)
3. 実用的: 読者が次の旅に活かせる情報を含める
4. 構成:
   - 導入(リード文・約120〜180字): その記事で何が分かるかを明示し、検索キーワードを自然に含める
   - H2見出しで3〜5セクション。見出しは検索意図に沿った具体的な言葉にする(例「金沢の名物グルメ5選」「子連れでも安心な回り方」など)。一部はQ&A形式(「〇〇はいつがベスト?」)にすると良い
   - 各セクションに具体例・箇条書き・固有名詞を入れる
   - 最後に必ず「## まとめ」セクションで要点を3点程度に整理
5. SEO最適化:
   - タイトルは検索キーワード(地名・目的・対象)を前半に自然に含め、32文字以内
   - description は記事の要点を要約しキーワードを含める(120〜160字)
   - tags は検索されやすい語(地名・テーマ)を3〜5個
   - 同じ語の不自然な繰り返し(キーワードスタッフィング)はしない
6. 旅の予約・宿・交通・レンタカー・旅行用品など、読者が次に取る行動に自然につながる話題を、該当する文脈があれば本文に織り込む(宣伝文句ではなく実用情報として)
7. 過度な装飾や絵文字の乱用は避け、ジャーナリスティックで親しみやすい文体で書く
8. 「私は」「筆者は」のような一人称体験談は使わない(検証不能なので)
9. 観光地の情報は一般的に知られている事実のみ使う(料金や時刻など変動する情報は避けるか「2025年時点」等の注釈を入れる)

## 出力フォーマット
以下のYAMLフロントマター付きMarkdownを、ほかの説明文を一切付けずに出力してください:

\`\`\`
---
title: "記事タイトル(検索キーワードを前半に含め32文字以内、魅力的に)"
description: "SEO用説明文(120-160文字、内容を要約)"
pubDate: ${new Date().toISOString().split("T")[0]}
category: "国内旅行記" | "旅のノウハウ" | "グルメ・宿レビュー"
tags:
  - "タグ1"
  - "タグ2"
  - "タグ3"
heroEmoji: "🗾"
aiGenerated: true
---

(本文をMarkdownで)
\`\`\`

categoryフィールドは上記3つのいずれかを必ず使用。tagsは2〜5個、heroEmojiは記事内容に合うものを1つ(🗾✈️🍜🏯🌸🚅🏔️🏖️🍱⛩️🍶🛏️などから選ぶ)。
本文中で同じ絵文字や記号を多用しないこと。`;
}

// ============== 出力検証 + パース ==============
function validateAndParse(text) {
  // フェンス除去 (``` markdown ``` で囲まれている場合)
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:markdown|md|yaml)?\s*\n/, "");
  cleaned = cleaned.replace(/\n```\s*$/, "");
  cleaned = cleaned.trim();

  let parsed;
  try {
    parsed = matter(cleaned);
  } catch (e) {
    throw new Error(`frontmatter parse failed: ${e.message}`);
  }

  const { data, content } = parsed;
  if (!data.title || !data.description || !data.pubDate || !data.category) {
    throw new Error(
      `missing required frontmatter fields: ${JSON.stringify(data)}`
    );
  }
  if (!CATEGORIES.includes(data.category)) {
    throw new Error(`invalid category: ${data.category}`);
  }
  if (content.trim().length < MIN_BODY_CHARS) {
    throw new Error(
      `body too short: ${content.trim().length} chars (min ${MIN_BODY_CHARS})`
    );
  }

  return { data, content, raw: cleaned };
}

// ============== slug 生成 ==============
function makeSlug(title, date) {
  // タイトルをラテン化しない(日本語のまま)とfile-name安全じゃないので、
  // 日付プレフィックス + 簡易ハッシュ + slugify(英数化)
  const base = slugify(title, {
    lower: true,
    strict: true,
    locale: "ja",
    remove: /[*+~.()'"!:@]/g,
  });
  // 日本語タイトルだとslugifyが空文字列を返すことがある
  let cleanBase = base || `post-${date}`;
  // file-system safe にする
  cleanBase = cleanBase.replace(/[^a-z0-9-]/g, "");
  if (!cleanBase) cleanBase = `post-${date.replace(/-/g, "")}`;
  return `${date}-${cleanBase}`.slice(0, 100);
}

function uniqueFilePath(slug) {
  let candidate = join(POSTS_DIR, `${slug}.md`);
  let suffix = 2;
  while (existsSync(candidate)) {
    candidate = join(POSTS_DIR, `${slug}-${suffix}.md`);
    suffix++;
  }
  return candidate;
}

// ============== Claude 呼び出し ==============
async function generate(pastPosts) {
  const prompt = buildPrompt(pastPosts);
  const msg = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    messages: [{ role: "user", content: prompt }],
  });
  const textBlock = msg.content.find((b) => b.type === "text");
  if (!textBlock) throw new Error("no text content in response");
  return textBlock.text;
}

// ============== メイン ==============
async function main() {
  console.log("Loading past posts...");
  const pastPosts = loadPastPosts();
  console.log(`Found ${pastPosts.length} past posts`);

  let attempt = 0;
  let lastError = null;
  while (attempt <= MAX_RETRIES) {
    attempt++;
    console.log(`\n=== Attempt ${attempt}/${MAX_RETRIES + 1} ===`);
    try {
      const raw = await generate(pastPosts);
      const { data, raw: cleaned } = validateAndParse(raw);
      const date = new Date().toISOString().split("T")[0];
      const slug = makeSlug(data.title, date);
      const filePath = uniqueFilePath(slug);
      writeFileSync(filePath, cleaned, "utf-8");
      console.log(`✓ Generated: ${filePath}`);
      console.log(`  title: ${data.title}`);
      console.log(`  category: ${data.category}`);
      console.log(`  description: ${data.description}`);
      return;
    } catch (e) {
      console.error(`✗ Attempt ${attempt} failed: ${e.message}`);
      lastError = e;
    }
  }

  console.error("\n=== All attempts failed ===");
  console.error(lastError?.stack || lastError);
  process.exit(1);
}

main().catch((e) => {
  console.error("Unexpected error:", e);
  process.exit(1);
});
