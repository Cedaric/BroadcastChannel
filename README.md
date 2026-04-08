# BroadcastChannel

**Turn your Telegram Channel into a MicroBlog.**

---

English | [简体中文](./README.zh-cn.md)

## ✨ Features

- **SEO friendly** scalable `/sitemap-index.xml`
- **Media Localization** automatically downloads CDN images/audio/video to prevent link expiration
- **0 JS on the browser side**
- **RSS and RSS JSON** `/rss.xml` `/rss.json`

## 🪧 Demo

### Real users

- [面条实验室](https://memo.miantiao.me/)
- [Find Blog👁发现博客](https://broadcastchannel.pages.dev/)
- [Memos 广场 🎪](https://now.memobbs.app/)
- [APPDO 数字生活指南](https://mini.appdo.xyz/)
- [85.60×53.98卡粉订阅/提醒](https://tg.docofcard.com/)
- [新闻在花频道](https://tg.istore.app/)
- [ALL About RSS](https://blog.rss.tips/)
- [Charles Chin's Whisper](https://memo.eallion.com/)
- [PlayStation 新闻转发](https://playstationnews.pages.dev)
- [Yu's Life](https://daily.pseudoyu.com/)
- [Leslie 和朋友们](https://tg.imlg.co/)
- [OKHK 分享](https://tg.okhk.net/)
- [gledos 的微型博客](https://microblogging.gledos.science)
- [Steve Studio](https://tgc.surgeee.me/)
- [LiFePO4:沙雕吐槽](https://lifepo4.top)
- [Hotspot Hourly](https://hourly.top/)
- [大河马中文财经新闻分享](https://a.xiaomi318.com/)
- [\_My. Tricks 🎩 Collection](https://channel.mykeyvans.com)
- [小报童专栏精选](https://xiaobaotong.genaiprism.site/)
- [Fake news](https://fake-news.csgo.ovh/)
- [miyi23's Geekhub资源分享](https://gh.miyi23.top/)
- [Magazine｜期刊杂志｜财新周刊](https://themagazine.top)
- [Remote Jobs & Cooperation](https://share-remote-jobs.vercel.app/)
- [甬哥侃侃侃--频道发布](https://ygkkktg.pages.dev)
- [Fugoou.log](https://fugoou.xyz)
- [Bboysoul的博客](https://tg.bboy.app/)
- [MakerHunter](https://share.makerhunter.com/)
- [ChatGPT/AI新闻聚合](https://g4f.icu/)
- [Abner's memos](https://memos.abnerz6.top/)
- [Appinn Talk](https://talk.appinn.net/)
- [小报童优惠与排行榜](https://youhui.xiaobaoto.com/)

### Platform

1. [Cloudflare](https://broadcast-channel.pages.dev/)
2. [Netlify](https://broadcast-channel.netlify.app/)
3. [Vercel](https://broadcast-channel.vercel.app/)

BroadcastChannel supports deployment on serverless platforms like Cloudflare, Netlify, Vercel that support Node.js SSR, or on a VPS.
For detailed tutorials, see [Deploy your Astro site](https://docs.astro.build/en/guides/deploy/).

## 🧱 Tech Stack

- Framework: [Astro](https://astro.build/)
- CMS: [Telegram Channels](https://telegram.org/tour/channels)
- Template: [Sepia](https://github.com/Planetable/SiteTemplateSepia)

## 🏗️ Deployment

### Docker

1. `docker pull ghcr.io/miantiao-me/broadcastchannel:main`
2. `docker run -d --name broadcastchannel -p 4321:4321 -e CHANNEL=miantiao_me ghcr.io/miantiao-me/broadcastchannel:main`

### Serverless

1. [Fork](https://github.com/miantiao-me/BroadcastChannel/fork) this project to your GitHub
2. Create a project on Cloudflare/Netlify/Vercel
3. Select the `BroadcastChannel` project and the `Astro` framework
4. Configure the environment variable `CHANNEL` with your channel name. This is the minimal configuration, for more configurations see the options below
5. Save and deploy
6. Bind a domain (optional).
7. Update code, refer to the official GitHub documentation [Syncing a fork branch from the web UI](https://docs.github.com/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork#syncing-a-fork-branch-from-the-web-ui).

#### Advanced Deployment: Multi-Worker API Architecture (Zero Timeouts)

If you experience crawl timeouts or poor SEO indexing for your Sitemap/RSS, you can enable the disconnected static API pipeline powered by Cloudflare Workers Assets:

1. Configure GitHub Secrets
   In your GitHub repository's `Settings -> Secrets and variables -> Actions`, add the following:
   - **Variables**:
     - `CHANNELS_CONFIG`: Configure channel names, associated URLs, and optional API routes.
       Example: `[{"name": "durov", "url": "https://memo.durov.com", "api_route": "durovapi.example.com"}]`
   - **Secrets**:
     - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID.
     - `CLOUDFLARE_API_TOKEN`: Token with **Worker Edit** permissions.

2. Trigger the Initial Sync
   Go to the **Actions** panel and manually trigger the **Static Data Sync** workflow. This will:
   - Fetch Telegram data and store the raw history in separate `data-{channel}` branches.
   - Deploy a dedicated Cloudflare Worker for each channel (e.g., `api-durov`).
   - Bind the Worker to your custom domain (e.g., `durovapi.example.com`).

3. Configure your Deployment (Two Options)
   - **Option A: Cloudflare Workers (Recommended)**
     - The workflow automatically deploys to Workers.
     - Your API will be at `https://durovapi.example.com/latest.json`.
     - Static assets are bundled and served from the Worker.
   - **Option B: Static Hosting (Traditional)**
     - The `data-durov` branch still contains all static files (including `index.html`).
     - You can link this branch to GitHub Pages, Vercel, or Netlify as a pure static site.
     - Your API will be at `https://your-static-host.com/api/latest.json`.

4. Configure your Astro Site
   In your main Astro site's environment variables (`.env` or platform config), set the `STATIC_API_URL` to your chosen endpoint (e.g., `https://durovapi.example.com`). Alternatively, if both projects are deployed on Cloudflare, you can configure `WORKER_BINDING` to your Service Binding name for domainless internal high-speed access.

## ⚒️ Configuration

```env
## Telegram Channel Username, must be configured. The string of characters following t.me/
CHANNEL=miantiao_me

## Language and timezone settings, language options see [dayjs](https://github.com/iamkun/dayjs/tree/dev/src/locale)
LOCALE=en
TIMEZONE=America/New_York

## Social media usernames
TELEGRAM=miantiao-me
X=miantiao-me
GITHUB=miantiao-me
MASTODON=mastodon.social/@Mastodon
BLUESKY=bsky.app

## The following two social media need to be URLs
DISCORD=https://DISCORD.com
PODCAST=https://PODCAST.com

## Header and footer code injection, supports HTML
FOOTER_INJECT=FOOTER_INJECT
HEADER_INJECT=HEADER_INJECT

## SEO configuration options, can prevent search engines from indexing content
NO_FOLLOW=false
NO_INDEX=false

## Hide Telegram channel description
HIDE_DESCRIPTION=false

## Sentry configuration options, collect server-side errors
SENTRY_AUTH_TOKEN=SENTRY_AUTH_TOKEN
SENTRY_DSN=SENTRY_DSN
SENTRY_PROJECT=SENTRY_PROJECT

## Telegram host name and static resource proxy, not recommended to modify
HOST=telegram.dog

## Enable Google Site Search
GOOGLE_SEARCH_SITE=memo.miantiao.me

## Enable tags page, separate tags with commas
TAGS=tag1,tag2,tag3

## Show comments
COMMENTS=true

## Show reactions
REACTIONS=true

## List of links in the Links page, Separate using commas and semicolons
LINKS=Title1,URL1;Title2,URL3;Title3,URL3;

## Sidebar Navigation Item, Separate using commas and semicolons
NAVS=Title1,URL1;Title2,URL3;Title3,URL3;

## Enable RSS beautify
RSS_BEAUTIFY=true

## Advanced: Static API Engine Node (See Advanced Deployment). Used for cross-domain static data and media assets.
STATIC_API_URL=https://api.example.com/miantiao_me

## [Compatible Configuration] Cloudflare Service Binding: No external domain required, internal high-speed communication. Use interchangeably or in combination with STATIC_API_URL (STATIC_API_URL acts as a fallback for static resources).
# WORKER_BINDING=DATA_WORKER
```

## 🙋🏻 FAQs

1. Why is the content empty after deployment?
   - Check if the channel is public, it must be public
   - The channel username is a string, not a number
   - Turn off the "Restricting Saving Content" setting in the channel
   - Redeploy after modifying environment variables
   - Telegram blocks public display of some sensitive channels, you can verify by visiting `https://t.me/s/channelusername`.

## ☕ Sponsor

1. [Follow me on Telegram](https://t.me/miantiao_me)
2. [Follow me on 𝕏](https://404.li/kai)
3. [Sponsor me on GitHub](https://github.com/sponsors/miantiao-me)
