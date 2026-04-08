# 广播频道

**将你的 Telegram Channel 转为微博客。**

---

[English](./README.md) | 简体中文

## ✨ 特性

- **将 Telegram Channel 转为微博客**
- **SEO 友好** 支持海量数据的 `/sitemap-index.xml`
- **媒体本地化** 自动抓取 Telegram CDN 图片/音视频至本地，防止链接过期失效
- **浏览器端 0 JS**
- **提供 RSS 和 RSS JSON** `/rss.xml` `/rss.json`

## 🪧 演示

### 真实用户

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
- [小众软件的发现](https://talk.appinn.net/)
- [小报童优惠与排行榜](https://youhui.xiaobaoto.com/)

### 平台

1. [Cloudflare](https://broadcast-channel.pages.dev/)
2. [Netlify](https://broadcast-channel.netlify.app/)
3. [Vercel](https://broadcast-channel.vercel.app/)

广播频道支持部署在 Cloudflare、Netlify、Vercel 等支持 Node.js SSR 的无服务器平台或者 VPS。
具体教程见[部署你的 Astro 站点](https://docs.astro.build/zh-cn/guides/deploy/)。

## 🧱 技术栈

- 框架：[Astro](https://astro.build/)
- 内容管理系统：[Telegram Channels](https://telegram.org/tour/channels)
- 模板: [Sepia](https://github.com/Planetable/SiteTemplateSepia)

## 🏗️ 部署

### Docker

1. `docker pull ghcr.io/miantiao-me/broadcastchannel:main`
2. `docker run -d --name broadcastchannel -p 4321:4321 -e CHANNEL=miantiao_me ghcr.io/miantiao-me/broadcastchannel:main`

### Serverless

1. [Fork](https://github.com/miantiao-me/BroadcastChannel/fork) 此项目到你 GitHub
2. 在 Cloudflare/Netlify/Vercel 创建项目
3. 选择 `BroadcastChannel` 项目和 `Astro` 框架
4. 配置环境变量 `CHANNEL` 为你的频道名称。此为最小化配置，更多配置见下面的配置项
5. 保存并部署
6. 绑定域名（可选）。
7. 更新代码，参考 GitHub 官方文档 [从 Web UI 同步分叉分支](https://docs.github.com/zh/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork#syncing-a-fork-branch-from-the-web-ui)。

#### 进阶高级部署：多 Worker API 架构 (零超时)

如果你的频道存在访问超时或 SEO 抓取失败的问题，你可以开启基于 Cloudflare Workers Assets 的极速分离架构：

1. 配置 GitHub Secrets
   在你的 GitHub 仓库 `Settings -> Secrets and variables -> Actions` 中，添加以下：
   - **Variables (变量)**:
     - `CHANNELS_CONFIG`: 配置频道名称、关联 URL 以及可选的 API 路由。
       示例：`[{"name": "durov", "url": "https://memo.durov.com", "api_route": "durovapi.example.com"}]`
   - **Secrets (机密)**:
     - `CLOUDFLARE_ACCOUNT_ID`: 你的 Cloudflare 账户 ID。
     - `CLOUDFLARE_API_TOKEN`: 具有 **Worker 修改** 权限的令牌。

2. 触发首次同步
   转到 **Actions** 面板，手动触发 **Static Data Sync** 工作流。该 Action 会：
   - 抓取 Telegram 数据并将原始历史记录保存在独立的 `data-{channel}` 分支中。
   - 为每个频道部署一个专属的 Cloudflare Worker（如 `api-durov`）。
   - 将该 Worker 绑定到你的自定义域名路由（如 `durovapi.example.com    `）。

3. 配置你的部署方式 (双重选择)
   - **选项 A：Cloudflare Workers (推荐)**
     - 工作流会自动部署到 Workers。
     - 你的 API 路径将是 `https://durovapi.example.com/latest.json`。
     - 静态资源将被打包并由 Worker 提供服务。
   - **选项 B：静态托管 (传统方式)**
     - `data-durov` 分支依然完整保留所有静态文件（包括 `index.html`）。
     - 你可以将该分支绑定到 GitHub Pages、Vercel 或 Netlify 作为纯静态站使用。
     - 你的 API 路径将是 `https://your-static-host.com/api/latest.json`。

4. 配置你的 Astro 站点
   在你的 Astro 主站点的环境变量（`.env` 或平台配置）中，将 `STATIC_API_URL` 设置为你选择的端点（例如 `https://durovapi.example.com`）。或者，如果两个项目均部署在 Cloudflare，你可以配置 `WORKER_BINDING` 为你的 Service Binding 名称以实现无域名内部高速访问。

## ⚒️ 配置

```env
## Telegram 频道用户名，必须配置。 t.me/ 后面那串字符
CHANNEL=miantiao_me

## 语言和时区设置，语言选项见[dayjs](https://github.com/iamkun/dayjs/tree/dev/src/locale)
LOCALE=zh-cn
TIMEZONE=Asia/Shanghai

## 社交媒体用户名
TELEGRAM=miantiao-me
X=miantiao-me
GITHUB=miantiao-me

## 下面两个社交媒体需要为 URL
DISCORD=https://DISCORD.com
PODCASRT=https://PODCASRT.com

## 头部尾部代码注入，支持 HTML
FOOTER_INJECT=FOOTER_INJECT
HEADER_INJECT=HEADER_INJECT

## SEO 配置项，可不让搜索引擎索引内容
NO_FOLLOW=false
NO_INDEX=false

## 隐藏 Telegram 频道简介
HIDE_DESCRIPTION=false

## Sentry 配置项，收集服务端报错
SENTRY_AUTH_TOKEN=SENTRY_AUTH_TOKEN
SENTRY_DSN=SENTRY_DSN
SENTRY_PROJECT=SENTRY_PROJECT

## Telegram 主机名称和静态资源代理，不建议修改
HOST=telegram.dog

## 启用谷歌站内搜索
GOOGLE_SEARCH_SITE=memo.miantiao.me

## 启用标签页, 标签使用英文逗号分割
TAGS=标签A,标签B,标签C

## 展示评论
COMMENTS=true

## 展示 Reactions
REACTIONS=true

## 链接页面中的超链接, 使用英文逗号和分号分割
LINKS=Title1,URL1;Title2,URL3;Title3,URL3;

## 侧边栏导航项, 使用英文逗号和分号分割
NAVS=Title1,URL1;Title2,URL3;Title3,URL3;

## 启用 RSS 美化
RSS_BEAUTIFY=true

## 高级配置：静态数据 API 节点（详见进阶高级部署）。用于解析数据源及本地化的媒体资源。
STATIC_API_URL=https://api.example.com/miantiao_me

## 【兼容可选配置】Cloudflare Service Binding：无需占用外部域名，内部高速通信。与 STATIC_API_URL 二选一或配合使用（STATIC_API_URL用于静态资源回退）
# WORKER_BINDING=DATA_WORKER
```

## 🙋🏻 常问问题

1. 为什么部署后内容为空？
   - 检查频道是否是公开的，必须是公开的
   - 频道用户名是字符串，不是数字
   - 关闭频道 Restricting Saving Content 设置项
   - 修改完环境变量后需要重新部署
   - Telegram 会屏蔽一些敏感频道的公开展示， 可以通过访问 `https://t.me/s/频道用户名` 确认

## ☕ 赞助

1. [在 Telegram 关注我](https://t.me/miantiao_me)
2. [在 𝕏 上关注我](https://404.li/x)
3. [在 GitHub 赞助我](https://github.com/sponsors/miantiao-me)
