import json
from datetime import datetime, timedelta

# 读取现有数据
with open('/Users/zhaoyang/WorkBuddy/retirement-plan-web/public/data/ai-news.json', 'r', encoding='utf-8') as f:
    existing_news = json.load(f)

# 新搜集的新闻（2026-06-09 和 2026-06-08）
new_news = [
    {
        "date": "2026-06-09",
        "title": "苹果WWDC26：拥抱Gemini，从Siri开始用AI重构一切",
        "summary": "2026年6月9日，苹果WWDC26在Apple Park开幕，这是库克作为CEO主持的最后一次WWDC。大会核心围绕AI全面重构各系统，iOS 27、macOS 27等悉数亮相。Siri基于谷歌Gemini模型彻底重构为独立App，具备跨应用操作、屏幕感知等能力，用户还可将ChatGPT、Claude等设为默认应答引擎，标志着苹果在AI时代全面发力。",
        "source": "中关村在线 / 新浪财经",
        "url": "https://finance.sina.com.cn/roll/2026-06-09/doc-iniatxxe3470802.shtml",
        "category": "应用落地",
        "tags": ["苹果", "WWDC26", "Siri", "Gemini", "iOS 27", "AI重构"]
    },
    {
        "date": "2026-06-08",
        "title": "云知声发布原生Agent大模型U2，提出智能密度概念",
        "summary": "云知声于2026年6月8日发布新一代通用基座模型U2，采用近3000亿参数MoE架构，提出智能密度概念，强调单位Token的投入产出比而非盲目堆叠参数。U2定位为原生通用Agent大模型，将工具调用、任务规划等能力从训练首日原生集成。同步上线OPC公有云MaaS平台，公司5月Token调用收入ARR环比暴涨600%。",
        "source": "新浪数码 / 新浪财经",
        "url": "https://finance.sina.com.cn/tech/it/2026-06-08/doc-iniaswms3893790.shtml",
        "category": "大模型",
        "tags": ["云知声", "U2", "Agent大模型", "MoE", "智能密度"]
    },
    {
        "date": "2026-06-08",
        "title": "高德发布全球首个3D原生城市世界模型ABot-Earth0.5",
        "summary": "高德地图正式发布全球首个完全基于3D数据训练并具备工程实用性的3D原生城市世界模型ABot-Earth0.5。该模型摒弃传统先采集、后拟合方式，直接利用3D数据训练，用户仅需提供卫星图或文字描述即可在消费级单卡上快速生成3DGS格式城市场景，效率较传统方法提升约1000倍，已建成遍及190多个国家和地区的3D地图。",
        "source": "搜狐IT / 高德地图",
        "url": "https://www.sohu.com/a/1033744751_122066678",
        "category": "生成式AI",
        "tags": ["高德", "ABot-Earth0.5", "3D城市模型", "世界模型", "3DGS"]
    },
    {
        "date": "2026-06-08",
        "title": "Mind Lab联合NTU、复旦推出δ-mem，8×8矩阵让大模型记住长对话",
        "summary": "南洋理工大学、复旦大学、Mind Lab等机构联合推出δ-mem记忆技术，通过一个8×8的在线关联记忆状态矩阵，为冻结的Transformer骨干模型赋予长期记忆能力。该技术采用Delta-rule学习规则动态更新记忆状态，参数开销仅占骨干模型的0.12%，在记忆密集型任务上最高提升1.31倍，无需扩展上下文窗口或更换架构。",
        "source": "机器之心Pro / 新浪科技",
        "url": "https://finance.sina.com.cn/tech/roll/2026-06-08/doc-iniasmvu7191606.shtml",
        "category": "大模型",
        "tags": ["Mind Lab", "δ-mem", "长期记忆", "Transformer", "南洋理工", "复旦"]
    },
    {
        "date": "2026-06-08",
        "title": "北大港大团队：大模型发现人类从未想到的新型纳什均衡算法",
        "summary": "北大与港大团队提出LegoNE框架，结合大语言模型与自动数学证明系统，在近似纳什均衡领域取得突破。该系统将博弈论证明技巧抽象为可组合的乐高积木，DeepSeek-R1经11轮搜索发现了全新算法结构，将三人博弈近似纳什均衡误差从0.6+δ降至0.5+δ，证明了多人近似纳什均衡存在独立于传统扩展技术的新路线。",
        "source": "AITNT / Nature Communications",
        "url": "https://www.aitntnews.com/newDetail.html?newId=25953",
        "category": "研究",
        "tags": ["北大", "港大", "纳什均衡", "LegoNE", "DeepSeek-R1", "博弈论"]
    },
    {
        "date": "2026-06-08",
        "title": "美国大学史上最大AI实验：50万人同时接入ChatGPT引发争议",
        "summary": "美国加州州立大学与OpenAI达成1690万美元合作协议，向超50万名师生开放ChatGPT Edu，成全球单一机构最大规模ChatGPT部署。CSU将AI素养纳入新生必修课，但引发教职工强烈抗议——在系统面临23亿美元资金缺口下，52%教授认为AI对教学产生负面影响，67%学生表示未获有效使用指导，凸显AI教育落地的深层矛盾。",
        "source": "DeepTech深科技 / AITNT",
        "url": "https://www.aitntnews.com/newDetail.html?newId=25959",
        "category": "应用落地",
        "tags": ["OpenAI", "ChatGPT", "教育AI", "加州州立大学", "AI实验"]
    }
]

# 合并新旧数据（新数据在前面）
all_news = new_news + existing_news

# 去重：根据title去重，保留最新的（因为新数据在前面）
seen_titles = set()
unique_news = []
for news in all_news:
    title = news["title"]
    if title not in seen_titles:
        seen_titles.add(title)
        unique_news.append(news)

# 只保留最近30天的新闻（从2026-05-11到2026-06-09）
cutoff_date = datetime(2026, 5, 11)
filtered_news = []
for news in unique_news:
    news_date = datetime.strptime(news["date"], "%Y-%m-%d")
    if news_date >= cutoff_date:
        filtered_news.append(news)

# 按日期从新到旧排序
filtered_news.sort(key=lambda x: x["date"], reverse=True)

# 重新分配id
for idx, news in enumerate(filtered_news, start=1):
    news["id"] = idx

# 写回JSON文件
with open('/Users/zhaoyang/WorkBuddy/retirement-plan-web/public/data/ai-news.json', 'w', encoding='utf-8') as f:
    json.dump(filtered_news, f, ensure_ascii=False, indent=2)

# 输出统计信息
print(f"原有新闻数量: {len(existing_news)}")
print(f"新增新闻数量: {len(new_news)}")
print(f"去重后总数: {len(unique_news)}")
print(f"保留30天内新闻数量: {len(filtered_news)}")
print(f"日期范围: {filtered_news[-1]['date']} 至 {filtered_news[0]['date']}")
