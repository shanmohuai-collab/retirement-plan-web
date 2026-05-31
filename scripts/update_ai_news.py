import json
from datetime import datetime, timedelta

# 现有数据
existing = []
with open('/Users/zhaoyang/WorkBuddy/retirement-plan-web/public/data/ai-news.json', 'r', encoding='utf-8') as f:
    existing = json.load(f)

# 新新闻
new_news = [
    {
        "date": "2026-05-31",
        "title": "李飞飞团队发布GPIC数据集，含1亿对图像-文本数据共28万亿像素",
        "summary": "李飞飞团队联合斯坦福等机构发布GPIC数据集，包含1亿对图像-文本数据共28万亿像素，旨在解决旧基准失效等问题，已免费开放并配套新评估协议。",
        "source": "李飞飞团队 / AITNT",
        "url": "https://www.aitntnews.com/newDetail.html?newId=25672",
        "category": "研究",
        "tags": ["李飞飞", "GPIC", "数据集", "ImageNet", "计算机视觉"]
    },
    {
        "date": "2026-05-31",
        "title": "英联邦短篇小说奖获奖作品被曝100%由AI生成，7805位人类作家落败",
        "summary": "2026英联邦短篇小说奖加勒比地区获奖作品《The Serpent in the Grove》经Claude等工具检测确认100%由AI生成，该作品从7806篇投稿中胜出，引发文学界对AI创作的激烈讨论。",
        "source": "TAIFT / AITNT",
        "url": "https://www.aitntnews.com/newDetail.html?newId=25670",
        "category": "生成式AI",
        "tags": ["AI创作", "文学创作", "英联邦短篇小说奖", "AI伦理"]
    },
    {
        "date": "2026-05-31",
        "title": "腾讯发布AI游戏创作平台「代号Craft」，自然语言从零生成可运行游戏",
        "summary": "腾讯游戏发布AI游戏创作平台「代号Craft」，用户可通过自然语言从0到1生成可直接运行的2D和3D游戏，内置完整AIGC工具并免费开放2万多预制美术资产，大幅降低游戏创作门槛。",
        "source": "腾讯 / AITNT",
        "url": "https://www.aitntnews.com/newDetail.html?newId=25664",
        "category": "应用落地",
        "tags": ["腾讯", "代号Craft", "AI游戏", "AIGC"]
    },
    {
        "date": "2026-05-31",
        "title": "MiniMax启动A股上市辅导备案，过去两月ARR增长超100%",
        "summary": "上海AI大模型龙头MiniMax于5月29日向上海证监局提交上市辅导备案，启动A股上市进程，中信证券任辅导机构。其股价较发行价涨409%至840港元，市值达2634亿港元，全球客户超百万，用户约3亿。",
        "source": "AIBOT / AITNT",
        "url": "https://www.aitntnews.com/newDetail.html?newId=25668",
        "category": "应用落地",
        "tags": ["MiniMax", "IPO", "大模型", "A股"]
    },
    {
        "date": "2026-05-31",
        "title": "DeepSeek开始限制重生、修改次数，应对算力压力",
        "summary": "2026年5月29日，DeepSeek开始限制普通对话和专家模式的重新生成、修改次数，属应对用户激增、算力压力的临时措施。华为昇腾新卡预计下半年部署扩容后或取消限制。",
        "source": "AITNT",
        "url": "https://www.aitntnews.com/newDetail.html?newId=25660",
        "category": "大模型",
        "tags": ["DeepSeek", "算力限制", "华为昇腾", "大模型"]
    },
    {
        "date": "2026-05-29",
        "title": "Claude Opus 4.8正式发布，从聊天模型蜕变为工程协作系统",
        "summary": "Anthropic正式发布Claude Opus 4.8，在Agentic Coding、Computer Use等多个代理执行任务上超越前代及竞品。新增effort control功能和dynamic workflows，支持并行启动大量协调子代理处理复杂任务。",
        "source": "腾讯新闻 / 雷科技",
        "url": "https://news.qq.com/rain/a/20260529A02XCJ00",
        "category": "大模型",
        "tags": ["Anthropic", "Claude Opus 4.8", "AI Agent", "工程协作"]
    },
    {
        "date": "2026-05-29",
        "title": "Anthropic完成650亿美元H轮融资，估值达9650亿美元超越OpenAI",
        "summary": "Anthropic于当地时间5月28日宣布完成650亿美元H轮融资，由Altimeter Capital、Dragoneer、Greenoaks和红杉资本联合领投，投后估值达9650亿美元，超越OpenAI的8520亿美元估值，登顶全球AI初创企业估值榜首。",
        "source": "界面新闻 / 新浪财经",
        "url": "https://t.cj.sina.com.cn/articles/view/5182171545/134e1a99902002fdb0",
        "category": "应用落地",
        "tags": ["Anthropic", "融资", "H轮", "估值", "OpenAI"]
    }
]

# 合并：新新闻在前
combined = new_news + existing

# 去重：根据title去重，保留第一个（新的在前）
seen_titles = set()
unique = []
for item in combined:
    title = item["title"]
    if title not in seen_titles:
        seen_titles.add(title)
        unique.append(item)

# 保留最近30天的新闻
cutoff = datetime.now() - timedelta(days=30)
filtered = []
for item in unique:
    item_date = datetime.strptime(item["date"], "%Y-%m-%d")
    if item_date >= cutoff:
        filtered.append(item)

# 按日期降序排序
filtered.sort(key=lambda x: x["date"], reverse=True)

# 重新分配id
for i, item in enumerate(filtered, 1):
    item["id"] = i

# 写回文件
with open('/Users/zhaoyang/WorkBuddy/retirement-plan-web/public/data/ai-news.json', 'w', encoding='utf-8') as f:
    json.dump(filtered, f, ensure_ascii=False, indent=2)

print(f"原有新闻: {len(existing)} 条")
print(f"新增新闻: {len(new_news)} 条")
print(f"合并后去重: {len(unique)} 条")
print(f"保留30天内: {len(filtered)} 条")
