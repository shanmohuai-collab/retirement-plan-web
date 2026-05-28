#!/usr/bin/env python3
import json
from datetime import datetime, timedelta

# Existing data
with open('/Users/zhaoyang/WorkBuddy/retirement-plan-web/public/data/ai-news.json', 'r', encoding='utf-8') as f:
    existing = json.load(f)

# New news items (May 28 and May 27, 2026)
new_items = [
    {
        "date": "2026-05-28",
        "title": "Cognition 融资超 10 亿美元，估值达 260 亿美元，成全球最大独立智能体实验室",
        "summary": "AI 智能体公司 Cognition 完成超 10 亿美元融资，Lux Capital、General Catalyst 联合领投，估值达 260 亿美元。其核心产品 Devin 是全球首个 AI 软件工程师，年化收入从 3700 万美元飙升至 4.92 亿美元。",
        "source": "钛媒体",
        "url": "https://www.tmtpost.com/agent/ai-article?id=16898",
        "category": "AI Agent",
        "tags": ["Cognition", "Devin", "融资", "AI智能体"]
    },
    {
        "date": "2026-05-28",
        "title": "OpenAI 斥资 2.34 亿美元在新加坡设立首个海外 AI 实验室",
        "summary": "OpenAI 宣布投入超 3 亿新元（约 2.34 亿美元）在新加坡设立首个美国本土外的应用 AI 实验室，预计创造 200 多个技术岗位。同日新加坡还宣布与谷歌、英伟达分别达成 AI 合作协议。",
        "source": "钛媒体",
        "url": "https://www.tmtpost.com/agent/ai-article?id=16871",
        "category": "应用落地",
        "tags": ["OpenAI", "新加坡", "AI实验室", "国际化"]
    },
    {
        "date": "2026-05-28",
        "title": "OpenAI 扩大广告平台覆盖至美加澳新免费用户，取消 20 万美元预付门槛",
        "summary": "OpenAI 广告平台进入 ADGI 测试阶段，面向美国、加拿大、澳大利亚、新西兰的免费 ChatGPT 用户开放。取消 20 万美元预付门槛，推出 AI 广告工具包，从服务大型企业转向本地中小企业市场。",
        "source": "钛媒体",
        "url": "https://www.tmtpost.com/agent/ai-article?id=16897",
        "category": "应用落地",
        "tags": ["OpenAI", "广告平台", "ChatGPT", "商业化"]
    },
    {
        "date": "2026-05-28",
        "title": "Snowflake 与 AWS 签署五年 60 亿美元协议，强化 Graviton 芯片 AI 算力布局",
        "summary": "云数据平台 Snowflake 与 AWS 签署五年 60 亿美元协议，采购 AWS 自研 ARM 架构 Graviton 芯片，支撑 Snowflake Cortex AI 工具算力需求。云厂商自研芯片已成行业趋势，AI 算力竞争白热化。",
        "source": "钛媒体",
        "url": "https://www.tmtpost.com/agent/ai-article?id=16899",
        "category": "硬件",
        "tags": ["Snowflake", "AWS", "Graviton", "云算力"]
    },
    {
        "date": "2026-05-28",
        "title": "美光科技市值突破 1 万亿美元，HBM 高带宽内存供货已售罄",
        "summary": "美光科技因 AI 内存需求爆发，股价大涨 19.3%，市值突破 1.01 万亿美元。HBM 高带宽内存 2026 年供货已全部售罄，预计 HBM 市场规模将从 2025 年 350 亿美元增至 2028 年 1000 亿美元。",
        "source": "钛媒体",
        "url": "https://www.tmtpost.com/agent/ai-article?id=16866",
        "category": "硬件",
        "tags": ["美光科技", "HBM", "AI内存", "万亿市值"]
    },
    {
        "date": "2026-05-27",
        "title": "OpenRouter 完成 1.13 亿美元 B 轮融资，英伟达参投，估值超 10 亿美元",
        "summary": "AI 模型聚合平台 OpenRouter 完成 1.13 亿美元 B 轮融资，Google 母公司 CapitalG 领投，a16z、英伟达 NVentures 参投，估值超 10 亿美元。过去 6 个月周度调用量从 5 万亿增至 25 万亿 Tokens。",
        "source": "AITNT / 钛媒体",
        "url": "https://www.tmtpost.com/agent/ai-article?id=16852",
        "category": "应用落地",
        "tags": ["OpenRouter", "API聚合", "融资", "英伟达"]
    },
    {
        "date": "2026-05-27",
        "title": "小米大模型永久降价 99%，正面对标 DeepSeek 价格战",
        "summary": "小米宣布旗下大模型服务永久降价 99%，以极低价格正面迎击 DeepSeek 发起的大模型价格战。此举将进一步压缩行业利润空间，加速 AI 应用普惠化进程。",
        "source": "钛媒体",
        "url": "https://www.tmtpost.com/8004327.html",
        "category": "大模型",
        "tags": ["小米", "大模型降价", "DeepSeek", "价格战"]
    },
    {
        "date": "2026-05-27",
        "title": "星巴克北美 1.1 万家门店停用 AI 库存工具，因 AI 幻觉导致盘点错误",
        "summary": "星巴克在北美 1.1 万家门店试点 9 个月后，正式停用 AI 库存管理工具「自动计数（AC）」。原因是 AI 幻觉导致糖浆等原料盘点严重错误，成为大模型落地零售场景受挫的标志性案例。",
        "source": "AITNT",
        "url": "https://www.aitntnews.com/newDetail.html?newId=25558",
        "category": "应用落地",
        "tags": ["星巴克", "AI幻觉", "零售", "库存管理"]
    },
    {
        "date": "2026-05-27",
        "title": "教皇发布首份 AI 通谕，Anthropic 联创参与撰写，警告 AI 不能统治人类",
        "summary": "教皇方济各发布首份关于人工智能的教宗通谕《壮丽人性》，全文约 4 万字。Anthropic 联合创始人参与撰写，警告 AI 可能演化出恐惧与悲伤等情绪，呼吁确保 AI 始终服务于人类尊严。",
        "source": "AITNT",
        "url": "https://www.aitntnews.com/newDetail.html?newId=25552",
        "category": "可解释性",
        "tags": ["教皇", "AI伦理", "Anthropic", "AI监管"]
    },
    {
        "date": "2026-05-27",
        "title": "北大系 AI 公司深演智能上市，股价大涨 300%，决策 AI 赛道第一股",
        "summary": "北大系 AI 公司深演智能（DeepSight）正式上市，股价大涨 300%，成为决策 AI 应用服务赛道第一股。公司专注营销决策 AI，但近三年净利润缩水近 85%，商业化仍面临挑战。",
        "source": "AITNT",
        "url": "https://www.aitntnews.com/newDetail.html?newId=25548",
        "category": "应用落地",
        "tags": ["深演智能", "IPO", "决策AI", "北大系"]
    }
]

# Combine: new items first
combined = new_items + existing

# Deduplicate by title (keep first occurrence, which are the new ones)
seen_titles = set()
unique = []
for item in combined:
    title = item.get("title", "").strip()
    if title and title not in seen_titles:
        seen_titles.add(title)
        unique.append(item)

# Sort by date descending, then by original order within same date
unique.sort(key=lambda x: x.get("date", ""), reverse=True)

# Filter to last 30 days (from 2026-05-28, keep >= 2026-04-28)
cutoff = (datetime(2026, 5, 28) - timedelta(days=30)).strftime("%Y-%m-%d")
filtered = [item for item in unique if item.get("date", "") >= cutoff]

# Reassign IDs
for idx, item in enumerate(filtered, start=1):
    item["id"] = idx

# Save
with open('/Users/zhaoyang/WorkBuddy/retirement-plan-web/public/data/ai-news.json', 'w', encoding='utf-8') as f:
    json.dump(filtered, f, ensure_ascii=False, indent=2)

print(f"Total items: {len(filtered)}")
print(f"New items added: {len(new_items)}")
print(f"Date range: {filtered[-1]['date']} ~ {filtered[0]['date']}")
