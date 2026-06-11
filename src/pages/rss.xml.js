import rss from "@astrojs/rss";
import { getCollection } from "astro:content";

export async function GET(context) {
  const posts = (await getCollection("posts"))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  return rss({
    title: "たびすけ｜旅をたすける、旅でみつける",
    description:
      "国内旅行記・旅のノウハウ・グルメ宿レビューを発信する旅メディア「たびすけ」。",
    site: context.site,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      categories: [post.data.category, ...post.data.tags],
      link: `/posts/${post.id}/`,
    })),
    customData: `<language>ja</language>`,
  });
}
