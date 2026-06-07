document.addEventListener('DOMContentLoaded', () => {
    // === 核心数据结构与本地存储 ===
    const Storage = {
        get(key, defaultValue = null) {
            if (['users', 'currentUser'].includes(key)) {
                const data = localStorage.getItem(`goodnight_${key}`);
                return data ? JSON.parse(data) : defaultValue;
            }
            const currentUser = localStorage.getItem('goodnight_currentUser');
            const userPrefix = currentUser ? JSON.parse(currentUser) + '_' : '';
            const data = localStorage.getItem(`goodnight_${userPrefix}${key}`);
            return data ? JSON.parse(data) : defaultValue;
        },
        set(key, value) {
            if (['users', 'currentUser'].includes(key)) {
                localStorage.setItem(`goodnight_${key}`, JSON.stringify(value));
                return;
            }
            const currentUser = localStorage.getItem('goodnight_currentUser');
            const userPrefix = currentUser ? JSON.parse(currentUser) + '_' : '';
            localStorage.setItem(`goodnight_${userPrefix}${key}`, JSON.stringify(value));
        },
        remove(key) {
            if (['users', 'currentUser'].includes(key)) {
                localStorage.removeItem(`goodnight_${key}`);
                return;
            }
            const currentUser = localStorage.getItem('goodnight_currentUser');
            const userPrefix = currentUser ? JSON.parse(currentUser) + '_' : '';
            localStorage.removeItem(`goodnight_${userPrefix}${key}`);
        }
    };

    // 治愈语录库
    const quotes = [
        "今天辛苦了，去梦里休息一下吧。",
        "无论今天发生了什么，都已经过去了。",
        "允许自己偶尔的脆弱，这是勇敢的表现。",
        "晚风会吹走所有的烦恼，明天又是新的一天。",
        "你已经做得很好了，真的。",
        "黑夜是为了让星星显得更亮，你的存在也是。",
        "不要为了迎合别人而委屈自己，你本来就很珍贵。",
        "把不开心的事留在今天，明天我们重新出发。"
    ];

    // 情绪匹配规则库 (key: 喜_怒_哀_惧)
    const emotionRules = {
        "1_1_1_1": { emotion: "麻木 / 无感", desc: "今天情绪很淡，没什么特别的感受，平平淡淡。" },
        "1_1_1_2": { emotion: "轻微不安", desc: "有点不踏实，心里没完全放松，但还能应付。" },
        "1_1_1_3": { emotion: "紧张 / 害怕", desc: "现在有点慌，总担心会出什么事，很难放松下来。" },
        "1_1_2_1": { emotion: "低落 / 闷闷的", desc: "有点提不起劲，情绪不高，也不想做什么事。" },
        "1_1_2_2": { emotion: "低落 + 不安", desc: "情绪不高，又有点不安，心里乱糟糟的。" },
        "1_1_2_3": { emotion: "低落 + 焦虑", desc: "既低落又焦虑，既没动力又担心未来，有点内耗。" },
        "1_1_3_1": { emotion: "难过 / 悲伤", desc: "心里沉甸甸的，有点难过，也有点累。" },
        "1_1_3_2": { emotion: "悲伤 + 不安", desc: "又难过又不安，觉得孤单，又有点害怕。" },
        "1_1_3_3": { emotion: "悲伤 + 焦虑", desc: "又难过又焦虑，情绪很沉，又一直胡思乱想。" },
        "1_2_1_1": { emotion: "烦躁 / 不耐烦", desc: "有点烦，没什么耐心，容易被小事惹到。" },
        "1_2_1_2": { emotion: "烦躁 + 不安", desc: "又烦又不安，容易不耐烦，又有点怕搞砸。" },
        "1_2_1_3": { emotion: "烦躁 + 紧张", desc: "又烦又紧张，一点小事就容易炸毛，又怕冲突。" },
        "1_2_2_1": { emotion: "烦躁 + 低落", desc: "又烦又没精神，不想说话，也不想动。" },
        "1_2_2_2": { emotion: "矛盾 / 复杂情绪", desc: "今天的情绪有点乱，说不清是烦还是难过。" },
        "1_2_2_3": { emotion: "烦躁 + 低落 + 焦虑", desc: "情绪很低落，又烦躁，又一直担心事情。" },
        "1_2_3_1": { emotion: "难过 + 烦躁", desc: "心里又难过又委屈，还带着一点火气。" },
        "1_2_3_2": { emotion: "难过 + 烦躁 + 不安", desc: "难过、烦躁、不安混在一起，心里堵得慌。" },
        "1_2_3_3": { emotion: "崩溃边缘", desc: "情绪有点崩，又难过又烦躁又害怕，快撑不住了。" },
        "1_3_1_1": { emotion: "生气 / 愤怒", desc: "很不爽，想发火，心里憋着一股气。" },
        "1_3_1_2": { emotion: "生气 + 不安", desc: "又生气又不安，想发作又有点怕后果。" },
        "1_3_1_3": { emotion: "愤怒 + 紧张", desc: "很生气，但又有点紧张，怕事情闹大。" },
        "1_3_2_1": { emotion: "生气 + 低落", desc: "又生气又失望，觉得很不值，也提不起劲。" },
        "1_3_2_2": { emotion: "生气 + 矛盾", desc: "又生气又有点难过，不知道该怎么处理。" },
        "1_3_2_3": { emotion: "愤怒 + 焦虑", desc: "又生气又焦虑，火气很大，又一直担心。" },
        "1_3_3_1": { emotion: "生气 + 难过", desc: "又生气又委屈，觉得自己受了很大的委屈。" },
        "1_3_3_2": { emotion: "生气 + 难过 + 不安", desc: "又生气又难过又不安，心里很不是滋味。" },
        "1_3_3_3": { emotion: "强烈负面情绪", desc: "所有负面情绪都很重，又气又难过又害怕。" },
        "2_1_1_1": { emotion: "平静 / 轻松", desc: "状态不错，心里挺稳的，没什么烦心事。" },
        "2_1_1_2": { emotion: "轻松 + 小紧张", desc: "整体挺轻松的，但还是有点小担心。" },
        "2_1_1_3": { emotion: "轻松 + 焦虑", desc: "虽然心情还行，但还是忍不住焦虑。" },
        "2_1_2_1": { emotion: "平静 + 低落", desc: "情绪不算差，但也提不起精神，有点淡。" },
        "2_1_2_2": { emotion: "平淡 + 不安", desc: "情绪平平的，又有点不安，心里不踏实。" },
        "2_1_2_3": { emotion: "平淡 + 焦虑", desc: "情绪一般，但焦虑感比较重，想很多。" },
        "2_1_3_1": { emotion: "难过但还能稳住", desc: "有点难过，但还能正常生活，只是没什么劲。" },
        "2_1_3_2": { emotion: "难过 + 不安但能稳住", desc: "又难过又不安，但还没到崩溃的地步。" },
        "2_1_3_3": { emotion: "难过 + 焦虑但能稳住", desc: "又难过又焦虑，但还能撑住，没表现出来。" },
        "2_2_1_1": { emotion: "有点小脾气", desc: "有点小不爽，但整体还好，能控制住。" },
        "2_2_1_2": { emotion: "有点烦 + 不安", desc: "有点烦，也有点不安，但都不算严重。" },
        "2_2_1_3": { emotion: "有点烦 + 紧张", desc: "有点不耐烦，又有点紧张，怕出问题。" },
        "2_2_2_1": { emotion: "情绪一般", desc: "有开心也有不开心，整体波动不大。" },
        "2_2_2_2": { emotion: "情绪复杂但稳定", desc: "情绪有点杂，但整体还算稳定，没极端。" },
        "2_2_2_3": { emotion: "情绪一般但偏焦虑", desc: "情绪平平，但焦虑感比较明显。" },
        "2_2_3_1": { emotion: "难过 + 小烦躁", desc: "有点难过，也有点小烦躁，说不上来的累。" },
        "2_2_3_2": { emotion: "难过 + 烦躁 + 不安", desc: "情绪有点乱，难过、烦躁、不安都有一点。" },
        "2_2_3_3": { emotion: "难过 + 烦躁 + 焦虑", desc: "负面情绪有点重，但还没到失控的程度。" },
        "2_3_1_1": { emotion: "有点生气但不严重", desc: "有点不爽，但还能控制住，没到暴怒。" },
        "2_3_1_2": { emotion: "生气 + 不安", desc: "有点生气，也有点不安，怕事情闹大。" },
        "2_3_1_3": { emotion: "生气 + 紧张", desc: "有点生气，又有点紧张，有点进退两难。" },
        "2_3_2_1": { emotion: "生气 + 失望", desc: "有点生气，也有点失望，觉得不值。" },
        "2_3_2_2": { emotion: "生气 + 矛盾", desc: "有点生气，也有点难过，不知道怎么办。" },
        "2_3_2_3": { emotion: "生气 + 焦虑", desc: "有点生气，也有点焦虑，火气和担心都有。" },
        "2_3_3_1": { emotion: "生气 + 委屈", desc: "有点生气，也有点委屈，觉得不公平。" },
        "2_3_3_2": { emotion: "生气 + 委屈 + 不安", desc: "情绪有点重，又气又委屈又不安。" },
        "2_3_3_3": { emotion: "强烈负面但能稳住", desc: "负面情绪都很重，但还能控制住，没爆发。" },
        "3_1_1_1": { emotion: "开心 / 满足", desc: "今天心情不错，挺开心的，也挺满足。" },
        "3_1_1_2": { emotion: "开心 + 小紧张", desc: "很开心，但对接下来的事有点小紧张。" },
        "3_1_1_3": { emotion: "开心 + 焦虑", desc: "心情不错，但还是忍不住担心未来。" },
        "3_1_2_1": { emotion: "开心但有点累", desc: "虽然开心，但还是有点疲惫，没完全放松。" },
        "3_1_2_2": { emotion: "开心但有点不安", desc: "心情不错，但心里还是有点不踏实。" },
        "3_1_2_3": { emotion: "开心但焦虑", desc: "表面开心，但其实很焦虑，怕失去现在的状态。" },
        "3_1_3_1": { emotion: "开心但有点难过", desc: "虽然开心，但还是有点淡淡的难过。" },
        "3_1_3_2": { emotion: "开心 + 难过 + 不安", desc: "情绪很矛盾，又开心又难过又不安。" },
        "3_1_3_3": { emotion: "开心但被焦虑和难过影响", desc: "心情有起伏，开心被负面情绪冲淡了。" },
        "3_2_1_1": { emotion: "开心 + 有点小脾气", desc: "整体很开心，但偶尔会有点小不爽。" },
        "3_2_1_2": { emotion: "开心 + 有点烦 + 不安", desc: "开心是有的，但也有烦躁和不安。" },
        "3_2_1_3": { emotion: "开心 + 有点烦 + 紧张", desc: "开心但也有压力，有点烦躁和紧张。" },
        "3_2_2_1": { emotion: "开心但有点累", desc: "虽然开心，但有点疲惫，没完全放松。" },
        "3_2_2_2": { emotion: "情绪丰富", desc: "有开心也有烦恼，整体是积极的。" },
        "3_2_2_3": { emotion: "开心但有压力", desc: "心情不错，但压力不小，有点焦虑。" },
        "3_2_3_1": { emotion: "开心但有点委屈", desc: "整体是开心的，但心里还有点小委屈。" },
        "3_2_3_2": { emotion: "开心但有点矛盾", desc: "情绪有点复杂，开心和负面情绪都有。" },
        "3_2_3_3": { emotion: "开心但被负面情绪拖累", desc: "有开心的瞬间，但整体还是被焦虑和难过影响。" },
        "3_3_1_1": { emotion: "开心但有点气", desc: "整体很开心，但对某件事还是有点不爽。" },
        "3_3_1_2": { emotion: "开心 + 生气 + 不安", desc: "又开心又生气又不安，情绪很复杂。" },
        "3_3_1_3": { emotion: "开心 + 生气 + 紧张", desc: "有开心也有火气，还带着一点紧张。" },
        "3_3_2_1": { emotion: "开心但失望", desc: "虽然开心，但还是有点失望，觉得不够好。" },
        "3_3_2_2": { emotion: "情绪矛盾强烈", desc: "情绪很矛盾，开心、生气、难过混在一起。" },
        "3_3_2_3": { emotion: "开心但被压力影响", desc: "有开心的事，但压力和焦虑感很重。" },
        "3_3_3_1": { emotion: "开心但委屈", desc: "虽然开心，但心里的委屈还没过去。" },
        "3_3_3_2": { emotion: "开心但情绪很复杂", desc: "开心和负面情绪都很强，心里很乱。" },
        "3_3_3_3": { emotion: "情绪极端拉扯", desc: "情绪很强烈，又开心又生气又难过又害怕，非常矛盾。" }
    };

    // 默认回退文案（如果没有精确匹配到组合）
    const fallbackRule = {
        emotion: "复杂、未知",
        desc: "情绪有些复杂，难以名状。没关系，深呼吸，把想说的话写下来，一切都会变好的。"
    };

    // 心理科普文章数据
    const eduArticles = [
        {
            id: 'edu_1',
            title: '为什么深夜容易 emo？',
            preview: '人在夜晚，前额叶皮层的控制力会减弱，情绪更容易占据主导。这不是你的错，只是大脑在休息。',
            content: `
                <p>很多人都有过这样的体验：白天还能正常工作、与人说笑，但一到了深夜，尤其是独处时，各种负面情绪就会如潮水般涌来。孤独、焦虑、遗憾，甚至是莫名其妙的悲伤。</p>
                <p>其实，这在心理学和生理学上都是有科学依据的，你完全不需要为此感到自责。</p>
                <br/>
                <p><strong>1. 前额叶皮层的“下班”</strong><br/>
                大脑的前额叶皮层负责理性思考、逻辑判断和情绪控制。白天，我们需要应对工作和社交，前额叶一直处于“高负荷运转”状态。到了晚上，随着身体疲惫，前额叶的功能会随之减弱。这就好比理性的“守门员”下班了，感性（边缘系统）就会趁机跑出来占据主导地位，导致情绪更容易失控。</p>
                <br/>
                <p><strong>2. 褪黑素与血清素的影响</strong><br/>
                夜晚光线变暗，身体会分泌更多的褪黑素来帮助睡眠，同时，影响情绪的血清素水平可能会降低。这种内分泌的变化，在一定程度上也会让人感到低落或抑郁。</p>
                <br/>
                <p><strong>3. 独处与反刍思维</strong><br/>
                白天周围充满了各种刺激和分散注意力的事物，我们没有时间去细想。而深夜的安静，给了我们一个完全面对自己的空间。大脑会倾向于进行“反刍思维”（Rumination），也就是不受控制地反复咀嚼过去发生的不愉快的事情。</p>
                <br/>
                <p><strong>怎么应对深夜 emo？</strong><br/>
                - <strong>接纳它</strong>：告诉自己“我现在只是大脑累了，这些情绪不代表事实”。<br/>
                - <strong>记录它</strong>：像使用这个树洞一样，把情绪写下来，这是一种很好的“情绪外化”方式。<br/>
                - <strong>转移注意力</strong>：听听白噪音，或者做一些不需要动脑的重复性动作。<br/>
                - <strong>去睡觉</strong>：最简单也最有效的方法。很多时候，睡一觉醒来，你会发现昨晚纠结的事情，其实根本不算什么。</p>
            `
        },
        {
            id: 'edu_2',
            title: '允许自己偶尔停下来',
            preview: '在这个效率至上的社会，我们总觉得“休息”是一种罪恶。但机器需要充电，人也是。',
            content: `
                <p>“我今天什么都没做，感觉好有负罪感。”</p>
                <p>你是不是也经常有这样的想法？在快节奏的现代生活中，我们似乎被设定上了一个“必须时刻保持高效”的发条。只要稍微停下脚步，或者度过了一个没有产出的周末，就会感到焦虑和内疚。</p>
                <br/>
                <p><strong>这种现象被称为“生产力有毒”（Toxic Productivity）。</strong></p>
                <p>我们把自我价值完全等同于产出。如果没有产出，就觉得自己毫无价值。但事实上，人不是机器，不可能 24 小时保持高效运转。</p>
                <br/>
                <p><strong>为什么休息如此重要？</strong><br/>
                - <strong>认知恢复</strong>：大脑在处理复杂任务后需要时间来巩固记忆和恢复精力。真正的休息（如发呆、散步、充足的睡眠）能让大脑的“默认模式网络”（DMN）活跃起来，这对于创造力和问题解决至关重要。<br/>
                - <strong>情绪缓冲</strong>：长期处于紧绷状态，皮质醇（压力荷尔蒙）会一直维持在高水平，容易导致情绪耗竭和抑郁。休息是降低皮质醇的必要途径。<br/>
                - <strong>重建边界</strong>：生活不应该只有工作和学习。允许自己无所事事，是找回生活掌控感的第一步。</p>
                <br/>
                <p><strong>如何做到“心安理得地休息”？</strong><br/>
                下次当你因为“什么都没做”而感到内疚时，试着在心里对自己说：“我现在正在进行一项非常重要的任务——恢复我的精力。”<br/>
                把“休息”也列入你的待办事项清单中，把它当成一件正经事去对待。今天什么都不想干？没关系，那就什么都不干。地球照样转，你依然很棒。</p>
            `
        },
        {
            id: 'edu_3',
            title: '如何应对突如其来的焦虑？',
            preview: '当焦虑感像海浪一样袭来，教你几个简单实用的落地技巧（Grounding Techniques）。',
            content: `
                <p>焦虑往往源于对未来的过度担忧，它会把我们的意识从“此时此地”拉走，陷入无尽的“如果……怎么办”的恐惧中。伴随而来的，可能是心跳加速、呼吸急促、手心出汗等生理反应。</p>
                <br/>
                <p>当这种突如其来的焦虑袭来时，我们可以使用心理学上的<strong>“落地技巧”（Grounding Techniques）</strong>，帮助意识重新回到现实，切断焦虑的循环。</p>
                <br/>
                <p><strong>技巧一：5-4-3-2-1 感觉法</strong><br/>
                深呼吸，环顾四周，尝试去寻找并大声说出（或在心里默念）：<br/>
                - <strong>5</strong> 件你能看到的东西（例如：桌子、灯、窗外的树）。<br/>
                - <strong>4</strong> 件你能摸到的东西（例如：衣服的布料、椅子的扶手）。<br/>
                - <strong>3</strong> 种你能听到的声音（例如：时钟的滴答声、远处的车声）。<br/>
                - <strong>2</strong> 种你能闻到的气味（例如：咖啡的香气、书本的纸香）。<br/>
                - <strong>1</strong> 种你能尝到的味道（或者想象一种你喜欢的味道）。<br/>
                这个方法能迅速调动你的五官，把注意力从内部的担忧转移到外部的环境。</p>
                <br/>
                <p><strong>技巧二：正念呼吸法（4-7-8 呼吸）</strong><br/>
                - 闭上嘴，用鼻子吸气，默数 <strong>4</strong> 秒。<br/>
                - 憋住呼吸，默数 <strong>7</strong> 秒。<br/>
                - 用嘴呼气，发出“呼”的声音，默数 <strong>8</strong> 秒。<br/>
                重复 4 次。这种特定的呼吸频率能够激活副交感神经系统，强制身体放松下来。</p>
                <br/>
                <p><strong>技巧三：物理接触法</strong><br/>
                - 感受双脚踩在地板上的感觉，想象脚底生根。<br/>
                - 去洗个冷水脸，或者手里握住一块冰块。强烈的物理温度刺激能瞬间打破焦虑的思绪。<br/>
                - 双手抱住自己，轻轻拍打手臂（蝴蝶拥抱），给自己一种安全感。</p>
                <br/>
                <p>记住，焦虑是一种自然的情绪反应，它像海浪一样，有起就有落。不要去对抗它，试着用这些方法观察它、接纳它，它自然会慢慢退去。</p>
            `
        },
        {
            id: 'edu_4',
            title: '告别精神内耗：停止“如果...就好了”',
            preview: '反刍思维是情绪的黑洞。与其为了过去的无法改变而后悔，不如把注意力放回当下能做的小事上。',
            content: `
                <p>“如果我当时没说那句话就好了。”“如果我选了另一条路，现在会不会过得更好？”</p>
                <p>我们的大脑非常擅长在深夜进行这种“反事实思维”（Counterfactual Thinking）。这是一种对过去已经发生的事情进行假设性重构的心理过程，通常伴随着强烈的后悔和自责。</p>
                <br/>
                <p><strong>为什么我们会精神内耗？</strong><br/>
                大脑试图通过分析过去的错误来避免未来的失败，这本是一种进化而来的保护机制。但问题在于，过去的既定事实无法改变，反复咀嚼只会让情绪陷入死循环，消耗掉你原本可以用来应对当下生活的心理能量。</p>
                <br/>
                <p><strong>如何跳出内耗的漩涡？</strong><br/>
                - <strong>划定“烦恼时间”</strong>：每天给自己设定 15 分钟的专属时间（比如下午 5 点），专门用来“胡思乱想”。一旦在这个时间之外开始内耗，就告诉自己“停，把它留到明天的烦恼时间再想”。<br/>
                - <strong>识别认知扭曲</strong>：很多时候我们认为的“毁灭性后果”，其实是大脑夸大其词的灾难化思维。试着用旁观者的视角，把你的担忧写在纸上，看看它是否真的有那么可怕。<br/>
                - <strong>行动是最好的解药</strong>：内耗的本质是“想得多，做得少”。去洗个碗、整理一下桌面、下楼扔个垃圾。把注意力转移到具体的、有结果的微小行动上，能迅速打破僵局。</p>
            `
        },
        {
            id: 'edu_5',
            title: '刺猬困境：亲密关系中的边界感',
            preview: '靠得太近会扎伤彼此，离得太远又会感到寒冷。建立健康的心理边界，是保护自己也是保护关系。',
            content: `
                <p>在人际交往中，你是否经常感到一种无形的压迫感？比如难以拒绝别人的请求，或者觉得别人对你的生活干涉过多，亦或是你自己总是忍不住想去“拯救”或控制身边的人。</p>
                <br/>
                <p>这其实都是<strong>心理边界（Psychological Boundaries）</strong>不清的表现。心理边界就像是一道无形的栅栏，划分了“我”和“非我”的区域，决定了别人可以怎样对待我们。</p>
                <br/>
                <p><strong>不健康边界的表现：</strong><br/>
                - <strong>过于松散（海绵型）</strong>：对别人的情绪照单全收，过度共情，为了讨好别人而委屈自己，害怕冲突。<br/>
                - <strong>过于僵硬（城墙型）</strong>：极度防御，拒绝向他人展露脆弱，很难建立深度的信任和亲密关系。</p>
                <br/>
                <p><strong>如何建立健康的边界？</strong><br/>
                - <strong>学会说“不”</strong>：拒绝不是一种攻击，而是一种自我保护。温和但坚定地表达你的底线，不需要为此感到抱歉。<br/>
                - <strong>课题分离</strong>：阿德勒心理学提出“课题分离”。分清什么是“我的课题”，什么是“别人的课题”。别人的情绪和决定是他们自己的课题，你不需要为此负责。<br/>
                - <strong>允许别人失望</strong>：你不可能满足所有人的期待，健康的关系建立在真实的互动之上，而不是完美的伪装。</p>
            `
        },
        {
            id: 'edu_6',
            title: '睡眠拖延症：为什么你舍不得睡？',
            preview: '报复性熬夜，其实是因为白天没有真正属于自己的时间，我们在用透支健康的方式夺回生活的控制权。',
            content: `
                <p>明明已经很困了，眼睛都快睁不开，但就是拿着手机不肯放下，无意识地刷着短视频、看帖子。第二天醒来后悔不已，到了晚上却又重蹈覆辙。</p>
                <br/>
                <p>这种现象在心理学上被称为<strong>“报复性就寝拖延症”（Revenge Bedtime Procrastination）</strong>。</p>
                <br/>
                <p><strong>为什么我们会报复性熬夜？</strong><br/>
                这不是因为你缺乏自制力，而是因为一种深刻的心理补偿机制。如果你在白天被工作、学习或家庭琐事填满，完全没有属于自己的“自主时间”，那么在深夜这个无人打扰的时段，大脑就会产生一种强烈的反叛情绪——“只有现在的时间是完全属于我的，我要把它夺回来”。</p>
                <br/>
                <p>我们在用牺牲睡眠的代价，来换取微薄的自由感和生活掌控感。</p>
                <br/>
                <p><strong>如何打破这种恶性循环？</strong><br/>
                - <strong>在白天为自己“偷”时间</strong>：不要把所有放松都留到睡前。在白天安排出哪怕 15 分钟的绝对私人时间，去喝杯咖啡、听首歌、散个步，让大脑在白天也能喘口气。<br/>
                - <strong>降低睡前的期待</strong>：我们往往期待在深夜完成某种“深度放松”，但刷手机其实是一种高刺激的假性放松。试着用听白噪音、看纸质书代替屏幕蓝光。<br/>
                - <strong>原谅自己</strong>：如果今晚又熬夜了，不要陷入强烈的自责，自责本身也是一种内耗。告诉自己：“没关系，我今天太累了，明天再早点睡就好。”</p>
            `
        },
        {
            id: 'edu_7',
            title: '情绪钝化：为什么我感觉不到快乐了？',
            preview: '当大脑长期处于高压或创伤下，它会为了保护你而开启“低电量模式”，这是一种防御机制。',
            content: `
                <p>“我好像对什么都提不起兴趣了。”“以前喜欢做的事情，现在觉得索然无味。”“别人笑的时候我笑不出来，遇到难过的事也哭不出来。”</p>
                <br/>
                <p>如果你有这样的感觉，你可能正在经历<strong>情绪钝化（Emotional Blunting）</strong>或快感缺失（Anhedonia）。</p>
                <br/>
                <p><strong>为什么会这样？</strong><br/>
                这并不是因为你变成了一个冷漠的人，恰恰相反，这通常是因为你之前承受了太多。当大脑长期处于极度的高压、持续的焦虑、或者经历过某种心理创伤后，为了防止系统崩溃，大脑会启动一种自我保护机制——“切断所有情绪体验”，类似于手机的超级省电模式。</p>
                <br/>
                <p>它屏蔽了痛苦，但也连带着屏蔽了快乐。</p>
                <br/>
                <p><strong>如何唤醒沉睡的感知？</strong><br/>
                - <strong>减少强刺激</strong>：远离那些高多巴胺的即时满足（如短视频、高糖食物），让多巴胺受体慢慢恢复敏感度。<br/>
                - <strong>重建微小的感官体验</strong>：去摸摸树叶的纹理，感受洗澡时水流的温度，专注地品尝一口食物的味道。从最基础的五感开始，慢慢唤醒身体的感知力。<br/>
                - <strong>耐心等待</strong>：这就像是被冻僵的手指，需要时间慢慢回暖，中间可能会伴随刺痛感。给自己多一点耐心，允许自己暂时“没有感觉”。</p>
            `
        },
        {
            id: 'edu_8',
            title: '高敏感人群 (HSP) 的生存指南',
            preview: '你不是玻璃心，你只是有一套更精密的神经系统。高敏感不是缺陷，而是一种独特的天赋。',
            content: `
                <p>“你就是想太多了。”“你怎么这么开不起玩笑？”“这点声音有什么好吵的？”</p>
                <p>如果你经常听到这样的评价，并且容易被环境中的声音、光线、他人的情绪所影响，那么你很有可能属于<strong>高敏感人群（Highly Sensitive Person, HSP）</strong>。据统计，大约有 15%-20% 的人拥有这种特质。</p>
                <br/>
                <p><strong>高敏感的科学真相</strong><br/>
                心理学家 Elaine Aron 指出，HSP 并不是一种心理疾病，而是一种先天的人格特质。高敏感人群的神经系统比普通人更加发达，他们处理信息更深，对细节的捕捉更敏锐。这就像是别人用普通天平称重，而你用的是高精度电子秤，哪怕是一阵微风也能引起指针的剧烈晃动。</p>
                <br/>
                <p><strong>高敏感者的日常困扰：</strong><br/>
                - 容易在人群中感到过度刺激和疲惫（社交电量消耗快）。<br/>
                - 对他人的情绪变化极度敏感，容易产生“过度共情”。<br/>
                - 对批评和指责难以释怀，容易陷入深度反思。</p>
                <br/>
                <p><strong>如何把敏感变成优势？</strong><br/>
                - <strong>建立能量避难所</strong>：HSP 比常人更需要独处的时间来“排毒”和恢复精力。不要为自己需要经常休息而感到抱歉。<br/>
                - <strong>筛选信息源</strong>：主动减少负面新闻、暴力的影视作品和有毒的社交关系，保护自己的心理能量。<br/>
                - <strong>发挥天赋</strong>：高敏感赋予了你极强的洞察力、共情力和创造力。接纳自己的特质，在艺术、写作、深度咨询等领域，这是一种极大的优势。</p>
            `
        },
        {
            id: 'edu_9',
            title: '冒名顶替综合征：你其实比想象中优秀',
            preview: '即使取得了成绩，依然觉得自己是个“骗子”，担心有一天会被人识破。这是一种普遍的心理错觉。',
            content: `
                <p>当你升职加薪、取得好成绩、或者受到别人真诚夸奖的时候，你内心的第一反应是什么？</p>
                <p>是“我值得这一切”，还是“我只是运气好”、“要是他们发现我的真实水平，肯定会大失所望”？</p>
                <br/>
                <p>如果是后者，你可能正受到<strong>冒名顶替综合征（Imposter Syndrome）</strong>的困扰。这种心理现象在很多优秀的人身上尤为常见，他们无法将自己的成功归因于自身的努力和能力，而是将其归结为运气、时机或是在欺骗他人。</p>
                <br/>
                <p><strong>常见的“冒名顶替者”类型：</strong><br/>
                - <strong>完美主义者</strong>：只要没达到 100 分，就觉得自己是失败的。<br/>
                - <strong>独行侠</strong>：认为只有完全靠自己独立完成的成就才算数，拒绝寻求帮助。<br/>
                - <strong>天才型</strong>：习惯了快速掌握技能，一旦遇到需要努力才能学会的东西，就觉得自己“是个废柴”。</p>
                <br/>
                <p><strong>如何克服这种错觉？</strong><br/>
                - <strong>记录事实证据</strong>：建立一个“成就档案”。把你收到的肯定、完成的项目客观地记录下来。当你感到自我怀疑时，拿出来看一看这些白纸黑字的证据。<br/>
                - <strong>重新定义失败</strong>：把失败看作是“学习过程中的一次数据反馈”，而不是“证明我能力不行”的判决书。<br/>
                - <strong>说出来</strong>：和信任的朋友或导师分享这种感觉，你会惊讶地发现，原来大家都有过这种“觉得自己是个骗子”的时刻。知道自己并不孤单，就是治愈的开始。</p>
            `
        },
        {
            id: 'edu_10',
            title: '如何给自己提供“情绪价值”？',
            preview: '不要总是向外索取情绪价值，学会做自己最好的朋友，成为自己的安全基地。',
            content: `
                <p>我们在感情中经常谈论“情绪价值”，希望伴侣、朋友能够理解我们、接纳我们、给我们提供支持。但现实是，没有任何人可以 24 小时待命，完全精准地承接你的所有情绪。</p>
                <p>真正稳定和持久的力量，来自于<strong>自我关怀（Self-Compassion）</strong>，也就是自己给自己提供情绪价值。</p>
                <br/>
                <p><strong>自我关怀的三个核心要素：</strong><br/>
                1. <strong>善待自己</strong>：当遭遇挫折时，停止内心的严厉批评。想象一下，如果你的好朋友遇到了同样的事情，你会怎么安慰他？用同样温柔和理解的语气来对自己说话。<br/>
                2. <strong>普遍人性</strong>：认识到痛苦、失败和脆弱是人类共同的体验，你并不孤单。不是“为什么只有我这么倒霉”，而是“这是生活的一部分，很多人都在经历”。<br/>
                3. <strong>正念觉察</strong>：不夸大也不压抑痛苦。对情绪保持一种平衡的观察，承认“我现在确实很难过”，但不被情绪完全吞噬。</p>
                <br/>
                <p><strong>日常可以做的小练习：</strong><br/>
                - <strong>给自己写一封信</strong>：以一个充满智慧和慈悲的长者的口吻，写信安慰此刻焦虑或低落的自己。<br/>
                - <strong>身体安抚</strong>：感到不安时，双手交叉放在胸前（蝴蝶拥抱），或者轻轻抚摸自己的手臂，这种物理上的自我安抚能直接向大脑传递安全信号。<br/>
                - <strong>创造专属的“自我疗愈仪式”</strong>：无论是泡一个热水澡、点一根香薰蜡烛，还是在这个树洞里写下一段话。每天留一点时间，纯粹地取悦自己。</p>
            `
        },
        {
            id: 'edu_11',
            title: '为什么自动化想法会悄悄影响我们的情绪？',
            preview: '很多时候，让我们痛苦的不是事情本身，而是大脑自动冒出的想法，这些想法并非我们主动产生。',
            content: `
                <p>很多人都有过这样的体验：明明只是一件小事，却忍不住往最坏的方向想，越想越焦虑、越想越自责。这些想法并非我们主动产生，而是大脑自动加工的结果，我们常常在毫无察觉的情况下被它牵着走。</p>
                <p>其实，这些自动化想法在心理学上有明确的解释，你完全不需要为自己“想太多”而感到自责。</p>
                <br/>
                <p><strong>1. 想法滤镜的影响</strong><br/>
                我们过往的成长经历，会在大脑中形成一套固定的解读模式，就像一副隐形的“想法滤镜”。面对同一件事，不同的滤镜会带来完全不同的解读。比如一次普通的失误，有的人会认为“下次注意就好”，有的人却会立刻陷入“我真没用，什么都做不好”的自我否定。这些功能失调的解读方式，就是情绪压力的来源。</p>
                <br/>
                <p><strong>2. 常见的三类消极自动化想法</strong><br/>
                灾难化、非黑即白、过度自责，是最常见的三类消极自动化想法。灾难化会把微小的问题放大成无法挽回的灾难，非黑即白会让我们陷入“要么完美，要么彻底失败”的极端思维，过度自责则会把所有责任都揽在自己身上。这些想法会不断消耗我们的心理能量，让情绪持续走低。</p>
                <br/>
                <p><strong>3. 旧模式的“过时”</strong><br/>
                很多消极自动化想法，其实是过去用来保护我们的生存策略。比如小时候被批评时，过度自责能帮我们避免更严重的惩罚。但当我们长大，环境发生变化，这些旧的思维模式不再适配当下，反而会成为情绪的枷锁。</p>
                <br/>
                <p><strong>如何调整自动化想法？</strong><br/>
                - <strong>觉察它</strong>：当你陷入负面情绪时，停下来问问自己：“我现在脑子里在想什么？”把那个一闪而过的想法抓出来。<br/>
                - <strong>检验它</strong>：像侦探一样找证据，问问自己：“这个想法是事实，还是我的猜测？有没有反例？”<br/>
                - <strong>换个解读</strong>：试着从不同角度看待这件事，写下3种不同的解读方式，打破非黑即白的局限。</p>
            `
        },
        {
            id: 'edu_12',
            title: '如何读懂情绪背后的真实信号？',
            preview: '每一种情绪都是一个信号，它在告诉我们一些被忽略的信息，读懂情绪，就是读懂自己。',
            content: `
                <p>很多人都有过这样的体验：莫名感到烦躁、低落，却说不清自己到底怎么了，只能被模糊的不适感裹挟。其实，每一种情绪都是一个信号，它在告诉我们一些被忽略的信息。</p>
                <p>想要读懂这些信号，我们可以像侦探一样，一步步梳理情绪的来龙去脉，你完全不需要因此感到迷茫。</p>
                <br/>
                <p><strong>1. 情绪本身就是线索</strong><br/>
                积极情绪代表着我们的需求被满足，而消极情绪则在提醒我们：有需求没有被看见，或是面临着潜在的风险。焦虑在提醒我们需要提前准备，悲伤在提醒我们需要被看见和支持，愤怒在提醒我们的边界被侵犯。读懂情绪，就是读懂自己的需求。</p>
                <br/>
                <p><strong>2. 事件与情绪的关联</strong><br/>
                情绪的出现从来都不是凭空的，它一定和某件事有关。我们可以试着回忆情绪发生前的场景：发生了什么事？和谁在一起？身体有没有不舒服？这些看似无关的细节，都可能是情绪的触发点。很多时候，困扰我们的不是情绪本身，而是我们没有找到它的源头。</p>
                <br/>
                <p><strong>3. 想法解读的关键作用</strong><br/>
                同一件事，不同的解读会带来完全不同的情绪反应。比如别人没有及时回复消息，有的人会觉得“他在忙，晚点会回”，有的人却会立刻解读为“他讨厌我了，不想理我”。很多时候，让我们陷入情绪的，不是事件本身，而是我们对事件的解读方式。</p>
                <br/>
                <p><strong>如何读懂情绪信号？</strong><br/>
                - <strong>命名情绪</strong>：用更具体的词汇描述自己的感受，比如用“失望”代替“难受”，用“不安”代替“烦躁”。<br/>
                - <strong>追溯源头</strong>：写下情绪发生前的事件、想法和身体感受，找到它们之间的关联。<br/>
                - <strong>倾听需求</strong>：问问自己：“这个情绪在告诉我什么？我需要什么？”比如焦虑的背后，可能是对失控的恐惧。</p>
            `
        },
        {
            id: 'edu_13',
            title: '真正有效的情绪调节是什么样的？',
            preview: '真正的情绪调节不是消灭负面情绪，而是学会和情绪共处，在照顾感受和解决问题之间找到平衡。',
            content: `
                <p>很多人都有过这样的体验：情绪上头时，拼命告诉自己“别难过了”“冷静下来”，却反而越陷越深，甚至因为控制不住情绪而更加自责。我们常常误以为，情绪调节就是消灭负面情绪，时刻保持开心。</p>
                <p>其实，真正的情绪调节不是对抗情绪，而是学会和情绪共处，你完全不需要因为做不到“时刻开心”而感到失败。</p>
                <br/>
                <p><strong>1. 情绪调节的两个核心方向</strong><br/>
                情绪调节主要分为两大方向：一种是安抚情绪，当情绪过于强烈时，先让自己从痛苦中稳定下来；另一种是解决问题，当情绪稳定后，再去处理引发情绪的根源。很多人之所以调节失败，就是因为在情绪最激烈的时候，强行要求自己去解决问题。</p>
                <br/>
                <p><strong>2. 接纳是调节的第一步</strong><br/>
                很多时候，我们的痛苦不是来自情绪本身，而是来自对情绪的抗拒。当我们告诉自己“我不该难过”“我不能焦虑”时，其实是在和自己对抗，这种对抗只会让情绪更加强烈。真正的调节，是先允许自己有情绪，承认“我现在确实很难过，这是正常的”。</p>
                <br/>
                <p><strong>3. 灵活选择应对方式</strong><br/>
                没有一种调节方法是万能的，我们需要根据当下的状态灵活选择。当你需要安抚情绪时，可以选择深呼吸、听音乐、和朋友倾诉；当你需要解决问题时，可以试着列出行动计划，一步步推进。在照顾感受和解决问题之间找到平衡，才是有效的情绪调节。</p>
                <br/>
                <p><strong>如何做好情绪调节？</strong><br/>
                - <strong>先暂停，再反应</strong>：情绪上头时，先给自己30秒的缓冲时间，再决定如何应对。<br/>
                - <strong>接纳情绪</strong>：告诉自己“我现在有这样的感受，是正常的，不用急着推开它”。<br/>
                - <strong>选择适合的方式</strong>：根据当下的需求，选择安抚情绪或解决问题，不用强迫自己立刻冷静。</p>
            `
        },
        {
            id: 'edu_14',
            title: '为什么我们会突然情绪失控？',
            preview: '这种突然的情绪失控是大脑的本能反应，并不是你的错，而是演化过程中保留下来的生存机制。',
            content: `
                <p>很多人都有过这样的体验：明明只是一件小事，却突然忍不住发火、崩溃大哭，事后又为自己的冲动行为感到后悔和自责。我们常常会觉得，这是因为自己自控力差、脾气不好。</p>
                <p>其实，这种情绪失控是大脑的本能反应，你完全不需要为此感到自责。</p>
                <br/>
                <p><strong>1. 情绪劫持的本能机制</strong><br/>
                这种突然的情绪失控，在心理学上被称为“情绪劫持”。当大脑感知到潜在的威胁时，负责本能反应的杏仁核会瞬间接管身体，让我们来不及思考就做出反应，而负责理性思考的前额叶皮层，会在此时被暂时压制。这是人类演化过程中保留下来的生存本能，并不是你的错。</p>
                <br/>
                <p><strong>2. 触发情绪劫持的信号</strong><br/>
                情绪劫持的发生，往往和过往的负面经历有关。当当下的场景和过去的创伤体验相似时，大脑会立刻进入“防御模式”，触发强烈的情绪反应。比如小时候被当众批评过的人，长大后在公开场合被质疑时，就很容易突然情绪失控。</p>
                <br/>
                <p><strong>3. 觉察是应对的关键</strong><br/>
                情绪劫持发生的过程中，我们往往是毫无察觉的。想要避免情绪失控带来的伤害，关键是提升对情绪的觉察力，在情绪刚出现苗头时，就意识到“我现在正处于冲动状态”，让前额叶皮层重新恢复工作。</p>
                <br/>
                <p><strong>如何应对情绪失控？</strong><br/>
                - <strong>识别信号</strong>：当你感到心跳加速、呼吸急促、大脑一片空白时，立刻提醒自己：“我现在情绪上头了，先停下来。”<br/>
                - <strong>快速抽离</strong>：用五感着陆法，说出你看到、听到、摸到、闻到、尝到的东西，把注意力拉回当下。<br/>
                - <strong>提前预案</strong>：为自己准备“如果…那么…”方案，比如“如果我快要发火了，就先离开现场，喝一杯水再回来”。</p>
            `
        },
        {
            id: 'edu_15',
            title: '情绪智能是如何建立起来的？',
            preview: '情绪智能不是天生的，而是可以通过练习建立起来的，从识别到理解，再到调节和共情。',
            content: `
                <p>很多人都有过这样的体验：明明和别人遇到了同样的事，别人能轻松应对，自己却被情绪困扰很久；或是明明想安慰朋友，却不知道该说什么，反而让气氛更尴尬。我们常常会觉得，这是因为自己情商不够高。</p>
                <p>其实，情绪智能不是天生的，而是可以通过练习建立起来的，你完全不需要因此感到自卑。</p>
                <br/>
                <p><strong>1. 情绪识别是基础</strong><br/>
                情绪智能的第一步，是精准感知和识别自己的情绪。很多人被情绪困扰，是因为无法清晰分辨自己的感受，只能用“难受”“烦躁”这类模糊的词汇概括。当我们能把模糊的不适感转化为清晰的情绪认知时，就已经掌握了情绪智能的基础。</p>
                <br/>
                <p><strong>2. 情绪理解与表达</strong><br/>
                读懂自己的情绪后，还要学会理解情绪背后的需求，并用恰当的方式表达出来。很多时候，我们的情绪困扰来自于无法表达自己的感受，只能用发脾气、冷战的方式传递信息。当我们能用“我感到难过，是因为我希望被看见”代替发脾气时，情绪智能就已经在提升了。</p>
                <br/>
                <p><strong>3. 情绪调节与共情</strong><br/>
                情绪智能的高级阶段，是既能调节自己的情绪，也能理解他人的情绪。共情不是简单的“我懂你”，而是能站在对方的角度，理解他的感受和需求。当我们能兼顾自己和他人的情绪时，人际关系也会变得更和谐。</p>
                <br/>
                <p><strong>如何提升情绪智能？</strong><br/>
                - <strong>情绪日记</strong>：每天花几分钟写下自己的情绪，用更具体的词汇描述感受，积累情绪词汇储备。<br/>
                - <strong>正念练习</strong>：通过正念训练提升觉察力，让自己更敏锐地捕捉情绪的细微变化。<br/>
                - <strong>练习共情</strong>：和别人沟通时，试着先说出对方的感受，比如“听起来你现在很委屈，对吗？”</p>
            `
        },
        {
            id: 'edu_16',
            title: '情绪为什么会引发强烈的身体反应？',
            preview: '情绪和身体是紧密相连的，焦虑时的心跳加速、难过时的胸闷，都是身体发出的正常信号。',
            content: `
                <p>很多人都有过这样的体验：焦虑时会心跳加速、手心出汗，愤怒时会肌肉紧绷、浑身发抖，难过时会胸闷气短、没有食欲。这些强烈的身体反应，常常让我们误以为自己生病了，却忽略了背后的情绪因素。</p>
                <p>其实，情绪和身体是紧密相连的，这些反应都是身体的正常信号，你完全不需要为此感到恐慌。</p>
                <br/>
                <p><strong>1. 情绪的“身体热身”</strong><br/>
                当情绪出现时，身体会自动为应对事件做准备，这就是情绪的“热身反应”。焦虑时心跳加快，是为了让更多血液流向大脑，帮我们快速分析风险；愤怒时肌肉紧绷，是为了调动力量保护自己。这些反应都是身体的本能，是为了让我们更好地应对环境变化。</p>
                <br/>
                <p><strong>2. 反应强度的差异</strong><br/>
                不同的人，情绪引发的身体反应强度也不同，这和先天的遗传基因、后天的成长经历都有关系。长期处于压力环境中，或是有过负面情绪体验的人，大脑会对威胁更敏感，身体反应也会更强烈。比如小时候经常被忽视情绪的人，长大后更容易出现情绪引发的身体不适。</p>
                <br/>
                <p><strong>3. 从身体入手调节情绪</strong><br/>
                当情绪引发强烈的身体反应时，我们可以直接通过调节身体来缓解痛苦。渐进式肌肉放松、深呼吸、自我触摸等方式，都能帮我们降低身体的唤醒度，缓解紧张和不适。当身体放松下来，情绪也会随之慢慢平复。</p>
                <br/>
                <p><strong>如何缓解情绪带来的身体不适？</strong><br/>
                - <strong>渐进式肌肉放松</strong>：从脚趾到头部，依次绷紧再放松身体的肌肉，释放长期紧绷的压力。<br/>
                - <strong>自我安抚触摸</strong>：轻轻拥抱自己，或是把手放在胸口，感受身体的温度，激活安抚激素。<br/>
                - <strong>照顾日常起居</strong>：低落时不必强迫自己振作，先保证充足的睡眠和饮食，给身体恢复的时间。</p>
            `
        },
        {
            id: 'edu_17',
            title: '消极情绪真的毫无用处吗？',
            preview: '每一种情绪都有它的功能和意义，焦虑提醒我们防范风险，悲伤帮我们疗愈创伤，愤怒赋予我们力量。',
            content: `
                <p>很多人都有过这样的体验：一感到焦虑、悲伤或愤怒，就立刻陷入自我批判，觉得这些情绪是软弱、没用的表现，拼命想要摆脱它们。我们常常误以为，只有积极情绪才是有价值的，消极情绪只会带来痛苦。</p>
                <p>其实，每一种情绪都有它的功能和意义，你完全不需要为自己的消极情绪感到羞耻。</p>
                <br/>
                <p><strong>1. 消极情绪的适应功能</strong><br/>
                焦虑提醒我们提前防范风险，让我们为未来做好准备；悲伤帮我们面对失去，疗愈内心的创伤，同时获得他人的支持；愤怒赋予我们保护自己、捍卫权益的力量，让我们在边界被侵犯时敢于反抗。这些消极情绪，都是我们生存和成长的重要工具。</p>
                <br/>
                <p><strong>2. 情绪的自然规律</strong><br/>
                情绪就像天气一样，有着自然起伏的规律，无论多么强烈的情绪，都会随着时间慢慢减弱、消散。很多时候，情绪久久不散，不是因为它本身有多强烈，而是因为我们一直在回避、压抑它，反而让它在内心不断发酵，形成恶性循环。</p>
                <br/>
                <p><strong>3. 压抑情绪的危害</strong><br/>
                当我们把消极情绪当成敌人，拼命想要消灭它时，大脑会进入高度警戒状态，反而催生更多的焦虑和自我否定。长期压抑情绪，不仅会影响心理健康，还可能引发身体上的不适，比如头痛、胃痛、失眠等。</p>
                <br/>
                <p><strong>如何与消极情绪共处？</strong><br/>
                - <strong>接纳情绪</strong>：告诉自己“我现在有这样的情绪，是正常的，它有它的意义”。<br/>
                - <strong>允许流动</strong>：给情绪留出表达的空间，比如通过哭泣、倾诉、写日记的方式释放情绪。<br/>
                - <strong>倾听信息</strong>：问问自己：“这个情绪在提醒我什么？我需要为自己做些什么？”</p>
            `
        },
        {
            id: 'edu_18',
            title: '如何从胡思乱想中拉回当下？',
            preview: '思绪游离是大脑的正常待机模式，关键是区分“想法”和“现实”，创造重新掌控注意力的机会。',
            content: `
                <p>很多人都有过这样的体验：明明在做一件事，大脑却不自觉地飘走了，反复纠结过去的遗憾，或是过度担忧未来的事情，越想越焦虑，越想越痛苦。我们常常会觉得，自己就是个爱胡思乱想的人，没办法控制。</p>
                <p>其实，思绪游离是大脑的正常待机模式，你完全不需要为此感到自责。</p>
                <br/>
                <p><strong>1. 大脑的默认待机模式</strong><br/>
                科学研究发现，人们近一半的清醒时间都在走神，这是大脑的默认待机模式。适度的思绪游离，能帮我们规划未来、总结经验，是一种正常的大脑活动。但在压力和焦虑的状态下，失控的走神会让我们陷入头脑的想象世界，无法专注于当下的生活。</p>
                <br/>
                <p><strong>2. 想法解套的方法</strong><br/>
                想要从胡思乱想中走出来，关键是区分“想法”和“现实”。很多时候，我们痛苦的不是事情本身，而是大脑中不断重复的想象。用“我注意到，此刻我的头脑中有一个……的想法”这样的句式，能帮我们跳出想法，站在旁观者的角度看待它，不再被想象裹挟。</p>
                <br/>
                <p><strong>3. 把注意力拉回当下</strong><br/>
                想法解套的目的，不是让想法消失，而是创造一个重新掌控注意力的机会。当我们意识到自己走神后，可以把注意力拉回当下正在做的事情上，比如感受手里的笔、听身边的声音、专注于当下的呼吸。配合长期的正念练习，我们能越来越敏锐地觉察到自己的走神，快速拉回注意力。</p>
                <br/>
                <p><strong>如何减少胡思乱想？</strong><br/>
                - <strong>想法解套</strong>：用描述性的语言说出你的想法，比如“我注意到，我现在在想过去那件事，如果当时我没做好怎么办”。<br/>
                - <strong>锚定当下</strong>：做一件需要专注的小事，比如洗碗、整理桌面，把注意力放在动作本身。<br/>
                - <strong>正念练习</strong>：每天花几分钟练习正念，提升对注意力的掌控力，减少失控的走神。</p>
            `
        }
    ];

    // === DOM 元素缓存 ===
    const elements = {
        // 认证
        authScreen: document.getElementById('auth-screen'),
        tabLogin: document.getElementById('tab-login'),
        tabRegister: document.getElementById('tab-register'),
        loginForm: document.getElementById('login-form'),
        registerForm: document.getElementById('register-form'),
        loginBtn: document.getElementById('login-btn'),
        registerBtn: document.getElementById('register-btn'),
        logoutBtn: document.getElementById('logout-btn'),
        easterEggTrigger: document.getElementById('easter-egg-trigger'),

        // 导航与页面
        navItems: document.querySelectorAll('.nav-links li'),
        tabPanes: document.querySelectorAll('.tab-pane'),
        appContainer: document.getElementById('app-container'),
        currentUsernameDisplay: document.getElementById('current-username-display'),
        
        // 隐私与锁屏
        lockScreen: document.getElementById('lock-screen'),
        passwordInput: document.getElementById('password-input'),
        unlockBtn: document.getElementById('unlock-btn'),
        lockError: document.getElementById('lock-error'),
        camouflageScreen: document.getElementById('camouflage-screen'),
        forgotLockPassword: document.getElementById('forgot-lock-password'),
        
        // 写日记 - 向导区
        wizardContainer: document.getElementById('wizard-container'),
        wizardProgress: document.getElementById('wizard-progress'),
        wizardProgressText: document.getElementById('wizard-progress-text'),
        wizardDots: document.querySelectorAll('.wizard-dot'),
        wizardSelectionSummary: document.getElementById('wizard-selection-summary'),
        wizardSteps: document.querySelectorAll('.wizard-step'),
        wizardInputs: document.querySelectorAll('.wizard-input'),
        wizardNextBtns: document.querySelectorAll('.wizard-next-btn'),
        wizardBackBtns: document.querySelectorAll('.wizard-back-btn'),
        
        // 日期滚轮选择器
        wizardYear: document.getElementById('wizard-year'),
        wizardMonth: document.getElementById('wizard-month'),
        wizardDay: document.getElementById('wizard-day'),
        timePeriodOptions: document.querySelectorAll('.time-period-option'),
        
        wizardLocation: document.getElementById('wizard-location'),
        wizardPeople: document.getElementById('wizard-people'),
        wizardAction: document.getElementById('wizard-action'),
        
        // 情绪打分滑块
        scoreJoy: document.getElementById('score-joy'),
        scoreAnger: document.getElementById('score-anger'),
        scoreSorrow: document.getElementById('score-sorrow'),
        scoreFear: document.getElementById('score-fear'),
        scoreJoyDesc: document.getElementById('score-joy-desc'),
        scoreAngerDesc: document.getElementById('score-anger-desc'),
        scoreSorrowDesc: document.getElementById('score-sorrow-desc'),
        scoreFearDesc: document.getElementById('score-fear-desc'),
        finishWizardBtn: document.getElementById('finish-wizard-btn'),
        enterEditorBtn: document.getElementById('enter-editor-btn'),
        
        // 匹配结果展示
        resultStep: document.getElementById('wizard-step-result'),
        resultEmotionName: document.getElementById('result-emotion-name'),
        resultEmotionDesc: document.getElementById('result-emotion-desc'),
        resultGeneratedSummary: document.getElementById('result-generated-summary'),

        // 写日记 - 编辑区
        editorContainer: document.getElementById('editor-container'),
        dateDisplay: document.getElementById('current-date-display'),
        editorSummaryDisplay: document.getElementById('editor-summary-display'),
        diaryEditor: document.getElementById('diary-editor'),
        moodTags: document.querySelectorAll('.mood-tag'),
        intensitySlider: document.getElementById('intensity-slider'),
        intensityValue: document.getElementById('intensity-value'),
        saveBtn: document.getElementById('save-diary-btn'),
        quickNoteInput: document.getElementById('quick-note-input'),
        saveQuickNoteBtn: document.getElementById('save-quick-note-btn'),
        
        // 忘记密码
        forgotPasswordForm: document.getElementById('forgot-password-form'),
        showForgotPassword: document.getElementById('show-forgot-password'),
        backToLogin: document.getElementById('back-to-login'),
        forgotUsername: document.getElementById('forgot-username'),
        forgotPhone: document.getElementById('forgot-phone'),
        resetPasswordBtn: document.getElementById('reset-password-btn'),
        forgotError: document.getElementById('forgot-error'),
        
        // 密码显示切换按钮
        togglePasswordBtns: document.querySelectorAll('.toggle-password-btn'),
        
        // 注册手机号
        regPhone: document.getElementById('reg-phone'),
        
        // 历史
        diaryList: document.getElementById('diary-list'),
        searchInput: document.getElementById('search-input'),
        calPrevMonthBtn: document.getElementById('cal-prev-month'),
        calNextMonthBtn: document.getElementById('cal-next-month'),
        calMonthDisplay: document.getElementById('cal-month-display'),
        calendarGrid: document.getElementById('calendar-grid'),
        calendarSummary: document.getElementById('calendar-summary'),
        
        // 时光机
        futureDate: document.getElementById('future-date'),
        futureText: document.getElementById('future-text'),
        saveFutureBtn: document.getElementById('save-future-btn'),
        futureMessagesList: document.getElementById('future-messages-list'),
        
        // 心理科普
        eduListView: document.getElementById('edu-list-view'),
        eduCardContainer: document.getElementById('edu-card-container'),
        eduDetailView: document.getElementById('edu-detail-view'),
        eduDetailTitle: document.getElementById('edu-detail-title'),
        eduDetailBody: document.getElementById('edu-detail-body'),
        eduBackBtn: document.getElementById('edu-back-btn'),
        
        // 设置
        newPassword: document.getElementById('new-password'),
        setPasswordBtn: document.getElementById('set-password-btn'),
        clearPasswordBtn: document.getElementById('clear-password-btn'),
        passwordStatus: document.getElementById('password-status'),
        exportBtn: document.getElementById('export-data-btn'),
        clearDataBtn: document.getElementById('clear-data-btn'),
        
        // 其他
        quoteToast: document.getElementById('quote-toast'),
        quoteText: document.getElementById('quote-text')
    };

    function flashChanged(el) {
        if (!el) return;
        el.classList.remove('is-changed');
        el.offsetHeight;
        el.classList.add('is-changed');
        setTimeout(() => el.classList.remove('is-changed'), 260);
    }

    function updateWizardProgress(stepKey) {
        if (!elements.wizardProgress || !elements.wizardProgressText || !elements.wizardDots) return;

        if (stepKey === 'editor') {
            elements.wizardProgress.classList.add('hidden');
            return;
        }

        elements.wizardProgress.classList.remove('hidden');

        const stepNumber = stepKey === 'result' ? 6 : parseInt(stepKey, 10);
        const safeStep = Number.isFinite(stepNumber) ? Math.min(Math.max(stepNumber, 1), 6) : 1;
        elements.wizardProgressText.textContent = `步骤 ${safeStep}/6`;

        elements.wizardDots.forEach(dot => {
            const n = parseInt(dot.dataset.step, 10);
            if (n === safeStep) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }

    function updateWizardSelectionSummary() {
        if (!elements.wizardSelectionSummary) return;

        const year = elements.wizardYear ? elements.wizardYear.value : '';
        const month = elements.wizardMonth ? elements.wizardMonth.value : '';
        const day = elements.wizardDay ? elements.wizardDay.value : '';
        const period = state.selectedTimePeriod;

        if (!year || !month || !day) {
            elements.wizardSelectionSummary.textContent = '';
            return;
        }

        const dateText = `${year}年${month}月${day}日`;
        elements.wizardSelectionSummary.innerHTML = period
            ? `已选择：<strong>${dateText}</strong> · <strong>${period}</strong>`
            : `已选择：<strong>${dateText}</strong>`;
    }

        // 当前状态
        let state = {
            isHidden: false,
            initialized: false,
            calendarDate: new Date(),
            selectedTimePeriod: '',
            wizardData: {
                time: '',
                eventDate: '',
                location: '',
                people: '',
                action: ''
            },
            scores: {
                joy: 1,
                anger: 1,
                sorrow: 1,
                fear: 1
            },
            matchedEmotion: null,
            generatedSummary: ''
        };

    // === 认证模块 ===
    const Auth = {
        init() {
            // 绑定事件
            elements.tabLogin.addEventListener('click', () => this.switchTab('login'));
            elements.tabRegister.addEventListener('click', () => this.switchTab('register'));
            elements.loginBtn.addEventListener('click', () => this.login());
            elements.registerBtn.addEventListener('click', () => this.register());
            elements.logoutBtn.addEventListener('click', () => this.logout());

            // 监听回车
            document.getElementById('login-password').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.login();
            });
            document.getElementById('reg-password-confirm').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.register();
            });

            // 密码显示切换
            elements.togglePasswordBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetId = btn.dataset.target;
                    const input = document.getElementById(targetId);
                    const icon = btn.querySelector('i');
                    
                    if (input.type === 'password') {
                        input.type = 'text';
                        icon.className = 'ri-eye-line';
                    } else {
                        input.type = 'password';
                        icon.className = 'ri-eye-off-line';
                    }
                });
            });

            // 忘记密码
            if (elements.showForgotPassword) {
                elements.showForgotPassword.addEventListener('click', () => {
                    elements.loginForm.classList.add('hidden');
                    elements.forgotPasswordForm.classList.remove('hidden');
                });
            }

            if (elements.backToLogin) {
                elements.backToLogin.addEventListener('click', () => {
                    elements.forgotPasswordForm.classList.add('hidden');
                    elements.loginForm.classList.remove('hidden');
                    document.getElementById('forgot-error').classList.add('hidden');
                });
            }

            if (elements.resetPasswordBtn) {
                elements.resetPasswordBtn.addEventListener('click', () => this.resetPassword());
            }

            // 连击彩蛋：连续点击"欢迎回来"标题 5 次，自动生成并登录测试账号
            if (elements.easterEggTrigger) {
                let clickCount = 0;
                let clickTimer = null;
                elements.easterEggTrigger.addEventListener('click', () => {
                    clickCount++;
                    clearTimeout(clickTimer);
                    if (clickCount >= 5) {
                        clickCount = 0;
                        window.injectWangSiAnData();
                    } else {
                        clickTimer = setTimeout(() => { clickCount = 0; }, 500); // 半秒内不连续点击则重置
                    }
                });
                // 增加指针样式提示可点击
                elements.easterEggTrigger.style.cursor = 'pointer';
                elements.easterEggTrigger.style.userSelect = 'none';
            }
        },

        switchTab(tab) {
            document.getElementById('login-error').classList.add('hidden');
            document.getElementById('reg-error').classList.add('hidden');
            elements.forgotPasswordForm.classList.add('hidden');
            
            if (tab === 'login') {
                elements.tabLogin.classList.add('active');
                elements.tabRegister.classList.remove('active');
                elements.loginForm.classList.remove('hidden');
                elements.registerForm.classList.add('hidden');
            } else {
                elements.tabRegister.classList.add('active');
                elements.tabLogin.classList.remove('active');
                elements.registerForm.classList.remove('hidden');
                elements.loginForm.classList.add('hidden');
            }
        },

        showError(type, msg) {
            const errEl = document.getElementById(`${type}-error`);
            errEl.textContent = msg;
            errEl.classList.remove('hidden');
        },

        register() {
            const username = document.getElementById('reg-username').value.trim();
            const phone = document.getElementById('reg-phone').value.trim();
            const pwd = document.getElementById('reg-password').value;
            const pwdConfirm = document.getElementById('reg-password-confirm').value;

            if (!username || !pwd) {
                return this.showError('reg', '用户名和密码不能为空');
            }
            if (pwd !== pwdConfirm) {
                return this.showError('reg', '两次输入的密码不一致');
            }

            const users = Storage.get('users', []);
            if (users.find(u => u.username === username)) {
                return this.showError('reg', '该用户名已被注册，请换一个');
            }

            users.push({ username, password: pwd, phone: phone || '' });
            Storage.set('users', users);
            
            // 注册成功，自动登录
            this.doLogin(username);
        },

        resetPassword() {
            const username = document.getElementById('forgot-username').value.trim();
            const phone = document.getElementById('forgot-phone').value.trim();

            if (!username || !phone) {
                return this.showError('forgot', '请输入用户名和手机号');
            }

            const users = Storage.get('users', []);
            const user = users.find(u => u.username === username);
            
            if (!user) {
                return this.showError('forgot', '该用户不存在');
            }
            
            if (user.phone !== phone) {
                return this.showError('forgot', '手机号不匹配');
            }

            // 重置密码为手机号后6位
            const newPassword = phone.slice(-6);
            user.password = newPassword;
            Storage.set('users', users);
            
            alert(`密码已重置为：${newPassword}\n请使用新密码登录`);
            
            // 返回登录页面
            elements.forgotPasswordForm.classList.add('hidden');
            elements.loginForm.classList.remove('hidden');
            document.getElementById('forgot-error').classList.add('hidden');
        },

        login() {
            const username = document.getElementById('login-username').value.trim();
            const pwd = document.getElementById('login-password').value;

            if (!username || !pwd) {
                return this.showError('login', '请输入用户名和密码');
            }

            const users = Storage.get('users', []);
            
            // 先校验用户是否存在
            const userExists = users.find(u => u.username === username);
            if (!userExists) {
                return this.showError('login', '该用户未注册');
            }

            // 再校验密码
            if (userExists.password === pwd) {
                this.doLogin(username);
            } else {
                this.showError('login', '密码错误');
            }
        },

        doLogin(username) {
            Storage.set('currentUser', username);
            elements.authScreen.classList.add('hidden');
            elements.appContainer.classList.remove('hidden');
            
            if (elements.currentUsernameDisplay) {
                elements.currentUsernameDisplay.textContent = username;
            }
            
            // 登录成功后，初始化应用数据
            initializeAppAfterLogin();
        },

        logout() {
            Storage.remove('currentUser');
            location.reload(); // 刷新页面回到登录状态
        },

        checkLoginStatus() {
            const currentUser = Storage.get('currentUser');
            if (!currentUser) {
                elements.authScreen.classList.remove('hidden');
                elements.appContainer.classList.add('hidden');
                return false;
            } else {
                elements.authScreen.classList.add('hidden');
                elements.appContainer.classList.remove('hidden');
                if (elements.currentUsernameDisplay) {
                    elements.currentUsernameDisplay.textContent = currentUser;
                }
                return true;
            }
        }
    };
    
    // 验证密码是否正确
    function validatePassword(password) {
        const currentUser = Storage.get('currentUser');
        const users = Storage.get('users', []);
        const user = users.find(u => u.username === currentUser);
        return user && user.password === password;
    }

    // === 初始化与基础 UI 逻辑 ===
    function init() {
        Auth.init();
        
        // 检查登录状态，如果未登录，直接阻断，不执行后续初始化
        if (!Auth.checkLoginStatus()) {
            return;
        }

        // 已登录，执行应用初始化
        initializeAppAfterLogin();
    }

    function initializeAppAfterLogin() {
        // 防止重复初始化
        if (state.initialized) return;
        state.initialized = true;

        updateDateDisplay();
        setInterval(updateDateDisplay, 60000); // 每分钟更新时间
        
        // 恢复草稿，并自动清洗掉之前由于 bug 遗留的情绪总结标记
        let currentDraft = Storage.get('draft', '');
        currentDraft = currentDraft.replace(/---情绪总结开始---.*?---情绪总结结束---\n*/gs, '');
        currentDraft = currentDraft.replace(/^我与.*?一起，在.*?感觉.*?\n*/gm, '');
        
        // 针对图中截图残留的情绪孤立词，进行特定清理
        const knownEmotions = Object.values(emotionRules).map(r => r.emotion).concat(['复杂、未知']);
        knownEmotions.forEach(emotion => {
            // 匹配行首的情绪词加上句号，例如 "悲伤 + 焦虑。"
            const regex = new RegExp(`^${emotion.replace(/\+/g, '\\+')}(。|\\.)?\\n*`, 'gm');
            currentDraft = currentDraft.replace(regex, '');
        });

        elements.diaryEditor.value = currentDraft.trim();

        // 绑定导航切换
        elements.navItems.forEach(item => {
            item.addEventListener('click', () => switchTab(item.dataset.tab));
        });

        // 初始化各个模块
        initEditor();
        initHistory();
        initHealing();
        initEdu();
        initSettings();
        initPrivacy();
        
        // 初始跳转
        switchTab('write');

        // 检查密码锁，未上锁则直接检查信件弹出
        const isLocked = checkPasswordLock();
        if (!isLocked) {
            checkFutureMessagesPopup();
        }
    }

    function updateDateDisplay() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long', hour: '2-digit', minute: '2-digit' };
        elements.dateDisplay.textContent = now.toLocaleDateString('zh-CN', options);
    }

    function switchTab(tabId) {
        elements.navItems.forEach(item => {
            if (item.dataset.tab === tabId) item.classList.add('active');
            else item.classList.remove('active');
        });

        elements.tabPanes.forEach(pane => {
            if (pane.id === `tab-${tabId}`) {
                pane.classList.remove('hidden');
                if (tabId === 'history') {
                    renderDiaryList();
                    renderCalendar(); // 切换到历史页时渲染日历
                }
                if (tabId === 'healing') renderFutureMessages();
                if (tabId === 'edu') {
                    // 每次切入科普模块时，确保展示的是列表视图
                    elements.eduDetailView.classList.add('hidden');
                    elements.eduListView.classList.remove('hidden');
                }
            } else {
                pane.classList.add('hidden');
            }
        });
    }

    function showToast(message) {
        elements.quoteText.textContent = message;
        elements.quoteToast.classList.remove('hidden');
        
        // 重新触发动画
        elements.quoteToast.style.animation = 'none';
        elements.quoteToast.offsetHeight; // trigger reflow
        elements.quoteToast.style.animation = null;

        setTimeout(() => {
            elements.quoteToast.classList.add('hidden');
        }, 5000);
    }

    function showRandomQuote() {
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        showToast(quote);
    }

    // === 密码锁与隐私模块 ===
    function checkPasswordLock() {
        const pwd = Storage.get('password');
        if (pwd) {
            elements.passwordInput.value = '';
            elements.lockError.classList.add('hidden');
            elements.lockScreen.classList.remove('hidden');
            elements.camouflageScreen.classList.add('hidden');
            elements.appContainer.classList.add('hidden');
            requestAnimationFrame(() => elements.passwordInput.focus());
            return true;
        }
        return false;
    }

    function initPrivacy() {
        // 解锁逻辑
        elements.unlockBtn.addEventListener('click', unlockApp);
        elements.passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') unlockApp();
        });

        // 找回页面锁密码逻辑
        if (elements.forgotLockPassword) {
            elements.forgotLockPassword.addEventListener('click', () => {
                const accountPwd = prompt("请输入您的账号登录密码以验证身份并清除页面锁密码：");
                if (accountPwd !== null) {
                    if (validatePassword(accountPwd)) {
                        Storage.remove('password');
                        elements.lockScreen.classList.add('hidden');
                        elements.appContainer.classList.remove('hidden');
                        elements.passwordInput.value = '';
                        elements.lockError.classList.add('hidden');
                        showToast("页面密码锁已清除并解锁。");
                        checkFutureMessagesPopup();
                        
                        // 更新设置页面的密码锁状态（如果已渲染）
                        if (elements.passwordStatus) {
                            elements.passwordStatus.textContent = "密码锁已关闭。";
                            elements.passwordStatus.style.color = "var(--text-muted)";
                        }
                    } else {
                        alert("账号密码错误，无法验证身份。");
                    }
                }
            });
        }

        // 一键隐藏 (老板键 Esc)
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                state.isHidden = !state.isHidden;
                if (state.isHidden) {
                    elements.appContainer.classList.add('hidden');
                    elements.camouflageScreen.classList.remove('hidden');
                } else {
                    const pwd = Storage.get('password');
                    if (pwd && !elements.lockScreen.classList.contains('hidden')) {
                        // 如果在锁屏界面按了Esc，恢复后还是锁屏
                        elements.camouflageScreen.classList.add('hidden');
                    } else {
                        elements.appContainer.classList.remove('hidden');
                        elements.camouflageScreen.classList.add('hidden');
                    }
                }
            }
        });
    }

    function unlockApp() {
        const input = elements.passwordInput.value;
        const pwd = Storage.get('password');
        if (input === pwd) {
            elements.lockScreen.classList.add('hidden');
            elements.appContainer.classList.remove('hidden');
            elements.passwordInput.value = '';
            elements.lockError.classList.add('hidden');
            checkFutureMessagesPopup(); // 解锁后检查信件弹出
        } else {
            elements.lockError.classList.remove('hidden');
        }
    }

    // === 日记编辑模块 ===
    function initEditor() {
        // --- 初始化日期滚轮选择器 ---
        initDatePicker();
        updateWizardProgress('1');
        updateWizardSelectionSummary();
        
        // --- 初始化情绪打分滑块 ---
        initScoreSliders();

        // --- 向导下一步逻辑 ---
        elements.wizardNextBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const nextStep = e.currentTarget.dataset.next;
                const currentStepDiv = e.currentTarget.closest('.wizard-step');
                
                // 验证必填字段
                if (!validateCurrentStep(currentStepDiv)) {
                    return;
                }
                
                // 收集数据
                collectWizardData(currentStepDiv);

                currentStepDiv.classList.add('hidden');

                if (nextStep === 'editor') {
                    // 完成向导，进入编辑器
                    elements.wizardContainer.classList.add('hidden');
                    elements.editorContainer.classList.remove('hidden');
                    updateWizardProgress('editor');
                    elements.diaryEditor.focus();
                } else if (nextStep === 'result') {
                    // 计算情绪匹配结果
                    calculateEmotionResult();
                    elements.resultStep.classList.remove('hidden');
                    updateWizardProgress('result');
                } else {
                    // 进入下一步向导
                    const nextStepDiv = document.getElementById(`wizard-step-${nextStep}`);
                    if (nextStepDiv) {
                        nextStepDiv.classList.remove('hidden');
                        updateWizardProgress(nextStep);
                        const input = nextStepDiv.querySelector('.wizard-input');
                        if (input) input.focus();
                    }
                }
            });
        });

        // --- 向导返回上一步逻辑 ---
        elements.wizardBackBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const backStep = e.currentTarget.dataset.back;
                const currentStepDiv = e.currentTarget.closest('.wizard-step');
                
                currentStepDiv.classList.add('hidden');
                
                if (backStep === '5') {
                    // 从结果页返回第5步
                    document.getElementById('wizard-step-5').classList.remove('hidden');
                    updateWizardProgress('5');
                } else {
                    const backStepDiv = document.getElementById(`wizard-step-${backStep}`);
                    if (backStepDiv) {
                        backStepDiv.classList.remove('hidden');
                        updateWizardProgress(backStep);
                    }
                }
            });
        });

        // 向导输入框回车跳转
        elements.wizardInputs.forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const btn = input.closest('.wizard-step').querySelector('.wizard-next-btn');
                    if (btn) btn.click();
                }
            });
        });

        // 从结果页进入编辑器
        elements.enterEditorBtn.addEventListener('click', () => {
            elements.wizardContainer.classList.add('hidden');
            elements.editorContainer.classList.remove('hidden');
            updateWizardProgress('editor');
            elements.diaryEditor.focus();
        });

        // --- 编辑器逻辑 ---
        // 自动保存草稿
        elements.diaryEditor.addEventListener('input', (e) => {
            Storage.set('draft', e.target.value);
        });

        // 保存长日记
        elements.saveBtn.addEventListener('click', () => {
            let content = elements.diaryEditor.value.trim();
            if (!content) return showToast("写点什么再封存吧...");
            
            // 如果有生成的总结，自动拼接到开头
            if (state.generatedSummary) {
                content = `${state.generatedSummary}\n\n${content}`;
            }

            saveDiaryEntry(content, 'long');
            elements.diaryEditor.value = '';
            Storage.remove('draft');
            showRandomQuote();
        });

        // 保存短句
        elements.saveQuickNoteBtn.addEventListener('click', () => {
            const content = elements.quickNoteInput.value.trim();
            if (!content) return;
            
            saveDiaryEntry(content, 'short');
            elements.quickNoteInput.value = '';
            showRandomQuote();
        });
        
        elements.quickNoteInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') elements.saveQuickNoteBtn.click();
        });
    }

    // 初始化日期选择器
    function initDatePicker() {
        const now = new Date();
        const currentYear = now.getFullYear();
        
        // 填充年份选项（当前年及前后5年）
        for (let year = currentYear - 5; year <= currentYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            elements.wizardYear.appendChild(option);
        }
        
        // 默认选择今年
        elements.wizardYear.value = currentYear;
        
        // 动态填充并选择月份选项
        updateMonths();
        elements.wizardMonth.value = now.getMonth() + 1;
        
        // 初始化日期选项
        updateDays();
        
        // 默认选择今天
        elements.wizardDay.value = now.getDate();
        updateWizardSelectionSummary();
        
        // 监听年月变化，自动更新日期
        elements.wizardYear.addEventListener('change', () => {
            updateMonths();
            updateDays();
            flashChanged(elements.wizardYear);
            flashChanged(elements.wizardMonth);
            flashChanged(elements.wizardDay);
            updateWizardSelectionSummary();
        });
        elements.wizardMonth.addEventListener('change', () => {
            updateDays();
            flashChanged(elements.wizardMonth);
            flashChanged(elements.wizardDay);
            updateWizardSelectionSummary();
        });

        elements.wizardDay.addEventListener('change', () => {
            flashChanged(elements.wizardDay);
            updateWizardSelectionSummary();
        });
        
        // 时段选择
        elements.timePeriodOptions.forEach(option => {
            option.addEventListener('click', () => {
                elements.timePeriodOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                state.selectedTimePeriod = option.dataset.period;
                elements.timePeriodOptions.forEach(opt => opt.setAttribute('aria-pressed', 'false'));
                option.setAttribute('aria-pressed', 'true');
                flashChanged(option);
                updateWizardSelectionSummary();
            });

            option.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    option.click();
                }
            });
        });
    }
    
    // 更新月份选项
    function updateMonths() {
        const year = parseInt(elements.wizardYear.value) || new Date().getFullYear();
        const now = new Date();
        const currentMonthValue = parseInt(elements.wizardMonth.value) || now.getMonth() + 1;
        
        elements.wizardMonth.innerHTML = '';
        
        let maxMonth = 12;
        if (year === now.getFullYear()) {
            maxMonth = now.getMonth() + 1;
        }
        
        for (let month = 1; month <= maxMonth; month++) {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month;
            elements.wizardMonth.appendChild(option);
        }
        
        if (currentMonthValue <= maxMonth) {
            elements.wizardMonth.value = currentMonthValue;
        } else {
            elements.wizardMonth.value = maxMonth;
        }
    }

    // 更新日期选项
    function updateDays() {
        const year = parseInt(elements.wizardYear.value) || new Date().getFullYear();
        const month = parseInt(elements.wizardMonth.value) || 1;
        const now = new Date();
        
        let daysInMonth = new Date(year, month, 0).getDate();
        
        if (year === now.getFullYear() && month === now.getMonth() + 1) {
            daysInMonth = now.getDate();
        }
        
        const currentDay = parseInt(elements.wizardDay.value) || 1;
        elements.wizardDay.innerHTML = '';
        
        for (let day = 1; day <= daysInMonth; day++) {
            const option = document.createElement('option');
            option.value = day;
            option.textContent = day;
            elements.wizardDay.appendChild(option);
        }
        
        // 保持选择的日期，如果超出范围则选择最后一天
        if (currentDay <= daysInMonth) {
            elements.wizardDay.value = currentDay;
        } else {
            elements.wizardDay.value = daysInMonth;
        }
    }

    // 初始化情绪打分滑块
    function initScoreSliders() {
        const scoreDescriptions = {
            joy: {
                1: '麻木 / 平淡，几乎感受不到愉悦',
                2: '偶尔有轻微愉悦感',
                3: '有时能感受到开心',
                4: '整体心情还不错',
                5: '比较开心，状态良好',
                6: '明显感到愉悦',
                7: '心情很好，比较满足',
                8: '非常开心，充满正能量',
                9: '极度愉悦，幸福感很强',
                10: '无比幸福，人生巅峰时刻'
            },
            anger: {
                1: '平和稳定，完全不生气',
                2: '几乎没有任何烦躁',
                3: '偶尔有一点点不耐烦',
                4: '轻微烦躁，但能控制',
                5: '有些烦躁，心里微堵',
                6: '明显感到不满',
                7: '比较生气，想发火',
                8: '很生气，难以控制情绪',
                9: '极度愤怒，快要爆发',
                10: '暴怒，完全失控'
            },
            sorrow: {
                1: '无悲伤，内心安稳',
                2: '几乎没有任何低落',
                3: '偶尔有一点点失落',
                4: '轻微低落，但不影响生活',
                5: '有些难过，心里有点沉',
                6: '明显感到悲伤',
                7: '比较难过，想哭',
                8: '很悲伤，情绪低落',
                9: '极度悲伤，难以承受',
                10: '绝望，完全陷入低谷'
            },
            fear: {
                1: '安心踏实，安全感充足',
                2: '几乎没有任何担忧',
                3: '偶尔有一点点不安',
                4: '轻微担心，但不影响状态',
                5: '有些不安，会多想',
                6: '明显感到焦虑',
                7: '比较紧张，心慌',
                8: '很焦虑，难以放松',
                9: '极度恐慌，几乎无法承受',
                10: '完全崩溃，极度恐惧'
            }
        };

        const sliders = [
            { slider: elements.scoreJoy, desc: elements.scoreJoyDesc, key: 'joy' },
            { slider: elements.scoreAnger, desc: elements.scoreAngerDesc, key: 'anger' },
            { slider: elements.scoreSorrow, desc: elements.scoreSorrowDesc, key: 'sorrow' },
            { slider: elements.scoreFear, desc: elements.scoreFearDesc, key: 'fear' }
        ];

        sliders.forEach(({ slider, desc, key }) => {
            if (slider && desc) {
                // 初始化显示
                const value = parseInt(slider.value);
                desc.textContent = scoreDescriptions[key][value];
                
                slider.addEventListener('input', () => {
                    const value = parseInt(slider.value);
                    const display = slider.closest('.scoring-group').querySelector('.score-value');
                    if (display) display.textContent = value;
                    desc.textContent = scoreDescriptions[key][value];
                    state.scores[key] = value;
                });
            }
        });
    }

    // 验证当前步骤
    function validateCurrentStep(stepDiv) {
        const stepId = stepDiv.id;
        
        if (stepId === 'wizard-step-1') {
            // 验证日期和时段
            const year = elements.wizardYear.value;
            const month = elements.wizardMonth.value;
            const day = elements.wizardDay.value;
            
            if (!year || !month || !day) {
                showToast('请选择完整的日期');
                return false;
            }
            if (!state.selectedTimePeriod) {
                showToast('请选择时段');
                return false;
            }
        } else if (stepId === 'wizard-step-2') {
            // 验证地点（必填）
            const location = document.getElementById('wizard-location').value.trim();
            if (!location) {
                showToast('请填写地点，这是必填项');
                return false;
            }
        } else if (stepId === 'wizard-step-3') {
            // 验证人物（必填）
            const people = document.getElementById('wizard-people').value.trim();
            if (!people) {
                showToast('请填写人物，这是必填项');
                return false;
            }
        } else if (stepId === 'wizard-step-4') {
            // 验证事件（必填）
            const action = document.getElementById('wizard-action').value.trim();
            if (!action) {
                showToast('请填写事件，这是必填项');
                return false;
            }
        }
        
        return true;
    }

    // 收集向导数据
    function collectWizardData(stepDiv) {
        const stepId = stepDiv.id;
        
        if (stepId === 'wizard-step-1') {
            // 收集日期和时段
            const year = elements.wizardYear.value;
            const month = elements.wizardMonth.value;
            const day = elements.wizardDay.value;
            state.wizardData.time = `${year}年${month}月${day}日 ${state.selectedTimePeriod}`;
            state.wizardData.eventDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        } else if (stepId === 'wizard-step-2') {
            state.wizardData.location = document.getElementById('wizard-location').value.trim();
        } else if (stepId === 'wizard-step-3') {
            state.wizardData.people = document.getElementById('wizard-people').value.trim();
        } else if (stepId === 'wizard-step-4') {
            state.wizardData.action = document.getElementById('wizard-action').value.trim();
        }
    }

    // 计算情绪匹配结果
    function calculateEmotionResult() {
        // 将1-10分映射到1-3分用于匹配
        const mapScore = (score) => {
            if (score <= 3) return 1;
            if (score <= 6) return 2;
            return 3;
        };
        
        const mappedScores = {
            joy: mapScore(state.scores.joy),
            anger: mapScore(state.scores.anger),
            sorrow: mapScore(state.scores.sorrow),
            fear: mapScore(state.scores.fear)
        };
        
        // 匹配情绪组合
        const key = `${mappedScores.joy}_${mappedScores.anger}_${mappedScores.sorrow}_${mappedScores.fear}`;
        const matched = emotionRules[key] || fallbackRule;
        state.matchedEmotion = matched;

        // 显示匹配结果
        elements.resultEmotionName.textContent = matched.emotion;
        elements.resultEmotionDesc.textContent = matched.desc;

        // 生成并展示情绪总结句子
        const { people, location, action } = state.wizardData;
        const summaryText = generateEmotionSummary(people, location, action, matched);
        state.generatedSummary = summaryText;
        elements.resultGeneratedSummary.textContent = summaryText;

        // 同步显示到编辑器上方的独立区域
        elements.editorSummaryDisplay.textContent = summaryText;
        elements.editorSummaryDisplay.classList.remove('hidden');
    }
    
    // 生成情绪总结
    function generateEmotionSummary(people, location, action, matched) {
        let summaryText = `我与${people || '自己'}一起，在${location || '某个地方'}${action || '待着'}，${matched.emotion}。`;
        return summaryText;
    }

    function saveDiaryEntry(content, type) {
        const diaries = Storage.get('diaries', []);
        
        const entry = {
            id: Date.now().toString(),
            date: new Date().toISOString(),
            content: content,
            scores: { ...state.scores },
            matchedEmotion: state.matchedEmotion,
            type: type,
            // 存入向导收集的四个问题
            wizardContext: { ...state.wizardData }
        };
        diaries.unshift(entry); // 存入头部
        Storage.set('diaries', diaries);

        // 重置向导状态，准备下一次记录
        resetWizard();
    }

    function resetWizard() {
        // 隐藏编辑器，显示向导区
        elements.editorContainer.classList.add('hidden');
        elements.wizardContainer.classList.remove('hidden');
        
        // 隐藏所有向导步骤，显示第一步
        elements.wizardSteps.forEach(step => step.classList.add('hidden'));
        document.getElementById('wizard-step-1').classList.remove('hidden');

        // 清空向导输入框
        elements.wizardInputs.forEach(input => input.value = '');
        
        // 重置日期选择器为今天
        const now = new Date();
        elements.wizardYear.value = now.getFullYear();
        updateMonths();
        elements.wizardMonth.value = now.getMonth() + 1;
        updateDays();
        elements.wizardDay.value = now.getDate();
        
        // 重置时段选择
        elements.timePeriodOptions.forEach(opt => opt.classList.remove('active'));
        state.selectedTimePeriod = '';
        
        // 重置情绪打分滑块
        elements.scoreJoy.value = 1;
        elements.scoreAnger.value = 1;
        elements.scoreSorrow.value = 1;
        elements.scoreFear.value = 1;
        
        // 更新滑块显示
        const sliders = [
            { slider: elements.scoreJoy, desc: elements.scoreJoyDesc },
            { slider: elements.scoreAnger, desc: elements.scoreAngerDesc },
            { slider: elements.scoreSorrow, desc: elements.scoreSorrowDesc },
            { slider: elements.scoreFear, desc: elements.scoreFearDesc }
        ];
        sliders.forEach(({ slider, desc }) => {
            if (slider && desc) {
                const display = slider.closest('.scoring-group').querySelector('.score-value');
                if (display) display.textContent = '1';
            }
        });
        
        // 隐藏并清空编辑器上方的总结展示
        elements.editorSummaryDisplay.classList.add('hidden');
        elements.editorSummaryDisplay.textContent = '';
        
        // 清空 state
        state.wizardData = { time: '', eventDate: '', location: '', people: '', action: '' };
        state.scores = { joy: 1, anger: 1, sorrow: 1, fear: 1 };
        state.matchedEmotion = null;
        state.generatedSummary = '';
    }

    // === 历史记录模块 ===
    function initHistory() {
        elements.searchInput.addEventListener('input', renderDiaryList);
        
        elements.calPrevMonthBtn.addEventListener('click', () => {
            state.calendarDate.setMonth(state.calendarDate.getMonth() - 1);
            renderCalendar();
        });
        
        elements.calNextMonthBtn.addEventListener('click', () => {
            state.calendarDate.setMonth(state.calendarDate.getMonth() + 1);
            renderCalendar();
        });
    }

    function renderCalendar() {
        const year = state.calendarDate.getFullYear();
        const month = state.calendarDate.getMonth();
        
        elements.calMonthDisplay.textContent = `${year}年${month + 1}月 / 心情日历`;
        
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        // 获取第一天是星期几 (0-6, 0 是星期日)
        let firstDayOfWeek = firstDay.getDay();
        // 转换为星期一为 0
        firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
        
        const daysInMonth = lastDay.getDate();
        
        // 获取真实今天的日期，用于高亮
        const realToday = new Date();
        const isCurrentMonth = realToday.getFullYear() === year && realToday.getMonth() === month;
        const todayDate = realToday.getDate();
        
        // 准备日记数据映射 (按日期)
        const diaries = Storage.get('diaries', []);
        const moodMap = {}; // key: YYYY-MM-DD
        const emotionCount = {};
        
        diaries.forEach(d => {
            let eventDateObj = new Date(d.date); // 默认回退为创建时间
            
            // 尝试从向导数据中提取实际发生时间
            if (d.wizardContext) {
                if (d.wizardContext.eventDate) {
                    const [y, m, day] = d.wizardContext.eventDate.split('-');
                    eventDateObj = new Date(y, m - 1, day);
                } else if (d.wizardContext.time) {
                    const match = d.wizardContext.time.match(/(\d+)年(\d+)月(\d+)日/);
                    if (match) {
                        eventDateObj = new Date(match[1], parseInt(match[2], 10) - 1, match[3]);
                    }
                }
            }

            if (eventDateObj.getFullYear() === year && eventDateObj.getMonth() === month) {
                // 格式化日期字符串
                const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(eventDateObj.getDate()).padStart(2, '0')}`;
                
                // 如果一天有多篇，默认覆盖为最后一篇（最新）的情绪
                moodMap[dStr] = d;
                
                if (d.matchedEmotion) {
                    const em = d.matchedEmotion.emotion;
                    emotionCount[em] = (emotionCount[em] || 0) + 1;
                }
            }
        });
        
        // 渲染网格
        elements.calendarGrid.innerHTML = '';
        
        // 填充月初的空白格
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptySlot = document.createElement('div');
            emptySlot.className = 'cal-day empty-slot';
            elements.calendarGrid.appendChild(emptySlot);
        }
        
        // 填充日期格子
        for (let day = 1; day <= daysInMonth; day++) {
            const daySlot = document.createElement('div');
            daySlot.className = 'cal-day';
            daySlot.textContent = day;
            
            if (isCurrentMonth && day === todayDate) {
                daySlot.classList.add('is-today');
            }
            
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const diaryData = moodMap[dateStr];
            
            if (diaryData) {
                daySlot.classList.add('has-diary');
                
                // 决定背景色类名
                if (diaryData.scores) {
                    const s = diaryData.scores;
                    const maxScore = Math.max(s.joy, s.anger, s.sorrow, s.fear);
                    
                    if (maxScore > 0) {
                        let mainEmotionKey = '';
                        if (s.joy === maxScore) mainEmotionKey = 'joy';
                        else if (s.anger === maxScore) mainEmotionKey = 'anger';
                        else if (s.sorrow === maxScore) mainEmotionKey = 'sorrow';
                        else if (s.fear === maxScore) mainEmotionKey = 'fear';

                        // 检查是否有并列最高分
                        const topEmotions = Object.entries(s).filter(([k, v]) => v === maxScore);
                        
                        if (topEmotions.length > 1) {
                            daySlot.classList.add('mood-bg-mixed');
                        } else {
                            daySlot.classList.add(`mood-bg-${mainEmotionKey}`);
                        }
                    }
                    
                    // 设置 hover 提示
                    let titleStr = '';
                    if (diaryData.matchedEmotion) titleStr += `综合情绪：${diaryData.matchedEmotion.emotion}\n`;
                    titleStr += `喜:${s.joy} 怒:${s.anger} 哀:${s.sorrow} 惧:${s.fear}`;
                    daySlot.title = titleStr;
                    
                } else if (diaryData.mood) {
                    // 兼容旧数据
                    daySlot.classList.add('mood-bg-mixed');
                    daySlot.title = `心情：${diaryData.mood}`;
                }
                
                // 点击跳转
                daySlot.addEventListener('click', () => {
                    const card = document.getElementById(`diary-card-${diaryData.id}`);
                    if (card) {
                        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        // 移除动画并重新触发
                        card.classList.remove('highlight-flash');
                        void card.offsetWidth; // 触发重绘
                        card.classList.add('highlight-flash');
                    }
                });
            }
            
            elements.calendarGrid.appendChild(daySlot);
        }
        
        // 更新月度总结
        let mostCommonEmotion = '无记录';
        let maxCount = 0;
        for (const [em, count] of Object.entries(emotionCount)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommonEmotion = em;
            }
        }
        elements.calendarSummary.textContent = maxCount > 0 ? `本月最常见心情：${mostCommonEmotion}` : '本月尚未记录心情';
    }

    function renderDiaryList() {
        const diaries = Storage.get('diaries', []);
        const keyword = elements.searchInput.value.toLowerCase();

        const filtered = diaries.filter(d => {
            return d.content.toLowerCase().includes(keyword);
        });

        elements.diaryList.innerHTML = '';
        
        if (filtered.length === 0) {
            elements.diaryList.innerHTML = '<p style="text-align:center; color:var(--text-muted); margin-top:20px;">没有找到相关的日记...</p>';
            return;
        }

        filtered.forEach(d => {
            const dateObj = new Date(d.date);
            const dateStr = `${dateObj.getFullYear()}/${dateObj.getMonth()+1}/${dateObj.getDate()} ${dateObj.getHours().toString().padStart(2,'0')}:${dateObj.getMinutes().toString().padStart(2,'0')}`;
            
            const card = document.createElement('div');
            card.id = `diary-card-${d.id}`; // 增加 ID 用于锚点跳转
            card.className = `diary-card ${d.type === 'short' ? 'type-short' : ''}`;
            
            // 判断主要情绪色调 (取分数最高的)
            let mainMoodColor = 'var(--border-color)';
            if (d.scores) {
                const maxScore = Math.max(d.scores.joy, d.scores.anger, d.scores.sorrow, d.scores.fear);
                if (maxScore > 0) {
                    if (d.scores.joy === maxScore) mainMoodColor = 'var(--mood-calm)';
                    else if (d.scores.sorrow === maxScore) mainMoodColor = 'var(--mood-sad)';
                    else if (d.scores.fear === maxScore) mainMoodColor = 'var(--mood-anxious)';
                    else if (d.scores.anger === maxScore) mainMoodColor = 'var(--danger-color)';
                }
            } else if (d.mood) {
                // 兼容旧数据
                const oldMoodMap = {
                    '平静': 'var(--mood-calm)', '委屈': 'var(--mood-sad)', '孤独': 'var(--mood-lonely)',
                    '遗憾': 'var(--mood-regret)', '焦虑': 'var(--mood-anxious)', '自愈': 'var(--mood-heal)'
                };
                mainMoodColor = oldMoodMap[d.mood] || 'var(--border-color)';
            }
            card.style.borderLeftColor = mainMoodColor;

            // 情绪得分与匹配结果HTML
            let scoresHtml = '';
            if (d.scores) {
                let matchHtml = '';
                if (d.matchedEmotion) {
                    matchHtml = `
                        <div class="diary-matched-emotion" style="margin-bottom: 10px; color: var(--accent-color); font-weight: 500;">
                            <i class="ri-mind-map"></i> 综合情绪：${escapeHTML(d.matchedEmotion.emotion)}
                        </div>
                    `;
                }

                scoresHtml = `
                    ${matchHtml}
                    <div class="diary-scores" style="display: flex; gap: 15px; font-size: 13px; margin-bottom: 10px;">
                        <span style="color: var(--mood-calm)">喜: ${d.scores.joy}</span>
                        <span style="color: var(--danger-color)">怒: ${d.scores.anger}</span>
                        <span style="color: var(--mood-sad)">哀: ${d.scores.sorrow}</span>
                        <span style="color: var(--mood-anxious)">惧: ${d.scores.fear}</span>
                    </div>
                `;
            } else if (d.mood) {
                // 兼容旧数据
                scoresHtml = `
                    <div class="diary-tags" style="margin-bottom: 10px;">
                        <span style="color:${mainMoodColor}">${d.mood} (${d.intensity})</span>
                    </div>
                `;
            }

            // 拼装前置向导的上下文文本
            let contextHtml = '';
            if (d.wizardContext && (d.wizardContext.time || d.wizardContext.location || d.wizardContext.people || d.wizardContext.action)) {
                const ctx = d.wizardContext;
                const arr = [];
                if (ctx.time) arr.push(`时间：${escapeHTML(ctx.time)}`);
                if (ctx.location) arr.push(`地点：${escapeHTML(ctx.location)}`);
                if (ctx.people) arr.push(`人物：${escapeHTML(ctx.people)}`);
                if (ctx.action) arr.push(`事件：${escapeHTML(ctx.action)}`);
                
                if (arr.length > 0) {
                    contextHtml = `<div class="diary-context" style="margin-bottom: 10px; font-size: 13px; color: var(--text-muted); background: rgba(255,255,255,0.02); padding: 10px; border-radius: 6px;">
                        ${arr.join(' &nbsp;|&nbsp; ')}
                    </div>`;
                }
            }

            card.innerHTML = `
                <div class="diary-meta">
                    <span class="diary-date">${dateStr}</span>
                </div>
                ${scoresHtml}
                ${contextHtml}
                <div class="diary-content">${escapeHTML(d.content)}</div>
                <div class="diary-actions">
                    <button class="delete-diary-btn" data-id="${d.id}"><i class="ri-delete-bin-line"></i></button>
                </div>
            `;
            elements.diaryList.appendChild(card);
        });

        // 绑定删除按钮
        document.querySelectorAll('.delete-diary-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if(confirm('确定要删除这条日记吗？此操作不可逆转。')) {
                    const id = e.currentTarget.dataset.id;
                    let diaries = Storage.get('diaries', []);
                    diaries = diaries.filter(d => d.id !== id);
                    Storage.set('diaries', diaries);
                    renderDiaryList();
                }
            });
        });
    }

    // === 时光机模块 ===
    function initHealing() {
        // 设置日期输入框的最小值为明天
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        elements.futureDate.min = tomorrow.toISOString().split('T')[0];

        // 给未来的自己
        elements.saveFutureBtn.addEventListener('click', () => {
            const date = elements.futureDate.value;
            const text = elements.futureText.value.trim();
            
            if (!date || !text) return showToast("请填写日期和想说的话。");
            
            // 校验选择的日期是否真的是未来
            if (date <= new Date().toISOString().split('T')[0]) {
                return showToast("请选择一个未来的日期。");
            }
            
            const messages = Storage.get('future_msgs', []);
            messages.push({
                id: Date.now().toString(),
                targetDate: date,
                content: text,
                createdDate: new Date().toISOString()
            });
            Storage.set('future_msgs', messages);
            
            // 添加寄信动画
            const formElement = document.getElementById('envelope-form');
            formElement.classList.add('sending');
            
            setTimeout(() => {
                formElement.classList.remove('sending');
                elements.futureDate.value = '';
                elements.futureText.value = '';
                showToast("信件已寄出，它会在那一天等你。");
                renderFutureMessages();
            }, 500);
        });
    }

    function renderFutureMessages() {
        const messages = Storage.get('future_msgs', []);
        const today = new Date().toISOString().split('T')[0];
        
        elements.futureMessagesList.innerHTML = '';
        
        if (messages.length === 0) {
            elements.futureMessagesList.innerHTML = `
                <div class="empty-future-state">
                    <i class="ri-mail-line empty-icon"></i>
                    <p>时光机里空空如也<br>给未来的自己写封信吧</p>
                </div>
            `;
            return;
        }
        
        // 排序：先展示已到期的，未到期的按日期排
        messages.sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate));

        messages.forEach((msg, index) => {
            const isReady = msg.targetDate <= today;
            const card = document.createElement('div');
            card.className = 'future-message-card ' + (isReady ? 'unsealed' : 'sealed');
            // 添加动画延迟
            card.style.animationDelay = `${index * 0.1}s`;
            
            if (isReady) {
                card.innerHTML = `
                    <div class="future-date"><i class="ri-mail-open-fill"></i> 致 ${msg.targetDate} 的你 (已送达)</div>
                    <div class="diary-content">${escapeHTML(msg.content)}</div>
                    <div style="text-align:right; margin-top:10px;">
                        <button class="delete-diary-btn" onclick="deleteFutureMsg('${msg.id}')">阅毕删除</button>
                    </div>
                `;
            } else {
                const target = new Date(msg.targetDate);
                const now = new Date(today);
                const diffTime = target - now;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                
                card.innerHTML = `
                    <div class="future-date"><i class="ri-lock-fill"></i> 致 ${msg.targetDate} 的你 (还有 ${diffDays} 天解封)</div>
                    <div class="diary-content" style="color:var(--text-muted); font-style:italic; display: flex; align-items: center; gap: 8px;">
                        <i class="ri-shield-keyhole-line" style="font-size: 1.2em;"></i>
                        [ 内容已封存，请耐心等待这一天的到来 ]
                    </div>
                    <div style="text-align:right; margin-top:10px;">
                        <button class="delete-diary-btn" onclick="deleteFutureMsg('${msg.id}')">取消投递</button>
                    </div>
                `;
            }
            elements.futureMessagesList.appendChild(card);
        });
    }

    function checkFutureMessagesPopup() {
        const messages = Storage.get('future_msgs', []);
        const today = new Date().toISOString().split('T')[0];
        
        // 查找所有目标日期 <= 今天的，且没有弹出过的信件
        const unpoppedMessages = messages.filter(msg => msg.targetDate <= today && !msg.has_popped_up);
        
        if (unpoppedMessages.length > 0) {
            // 取第一封信件弹出
            const msgToPop = unpoppedMessages[0];
            showLetterPopup(msgToPop);
            
            // 标记为已弹出并保存
            const msgIndex = messages.findIndex(m => m.id === msgToPop.id);
            if (msgIndex !== -1) {
                messages[msgIndex].has_popped_up = true;
                Storage.set('future_msgs', messages);
            }
        }
    }

    function showLetterPopup(msg) {
        const modal = document.getElementById('letter-popup-modal');
        if (!modal) return;
        
        const contentDiv = document.getElementById('letter-popup-content');
        const dateDiv = document.getElementById('letter-popup-date');
        
        const createdDate = msg.createdDate ? msg.createdDate.split('T')[0] : '过去';
        dateDiv.innerHTML = `<i class="ri-send-plane-line"></i> 写于 ${createdDate}`;
        contentDiv.textContent = msg.content;
        
        modal.classList.remove('hidden');
        
        const envelope = document.getElementById('letter-envelope');
        envelope.classList.remove('opened');
        envelope.classList.add('shake-in');
        
        // 点击拆开信件
        envelope.onclick = function() {
            envelope.classList.remove('shake-in');
            envelope.classList.add('opened');
            envelope.onclick = null;
        };
        
        // 关闭弹窗
        document.getElementById('close-letter-btn').onclick = function(e) {
            e.stopPropagation(); // 防止冒泡触发envelope的click
            modal.classList.add('hidden');
            renderFutureMessages(); // 刷新列表，更新为已送达状态
        };
    }

    window.deleteFutureMsg = function(id) {
        if(confirm('确定要删除这条时空留言吗？')) {
            let msgs = Storage.get('future_msgs', []);
            msgs = msgs.filter(m => m.id !== id);
            Storage.set('future_msgs', msgs);
            renderFutureMessages();
        }
    };

    // === 心理科普模块 ===
    function initEdu() {
        // 渲染列表
        elements.eduCardContainer.innerHTML = '';
        eduArticles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'edu-card';
            card.innerHTML = `
                <div class="edu-card-title">${escapeHTML(article.title)}</div>
                <div class="edu-card-preview">${escapeHTML(article.preview)}</div>
            `;
            card.addEventListener('click', () => showEduDetail(article.id));
            elements.eduCardContainer.appendChild(card);
        });

        // 返回按钮逻辑
        elements.eduBackBtn.addEventListener('click', () => {
            elements.eduDetailView.classList.add('hidden');
            elements.eduListView.classList.remove('hidden');
        });
    }

    function showEduDetail(articleId) {
        const article = eduArticles.find(a => a.id === articleId);
        if (!article) return;

        // 填充内容
        elements.eduDetailTitle.textContent = article.title;
        elements.eduDetailBody.innerHTML = article.content; // 内容是信任的HTML

        // 切换视图
        elements.eduListView.classList.add('hidden');
        elements.eduDetailView.classList.remove('hidden');
        
        // 滚动到顶部
        elements.eduDetailView.scrollIntoView();
    }

    // === 设置与数据管理 ===
    function initSettings() {
        // 密码设置
        elements.setPasswordBtn.addEventListener('click', () => {
            const pwd = elements.newPassword.value;
            if (pwd.length < 4) {
                elements.passwordStatus.textContent = "密码至少需要4位。";
                elements.passwordStatus.style.color = "var(--danger-color)";
                return;
            }
            Storage.set('password', pwd);
            elements.newPassword.value = '';
            elements.passwordStatus.textContent = "密码设置成功。下次打开需要验证。";
            elements.passwordStatus.style.color = "var(--mood-calm)";
        });

        elements.clearPasswordBtn.addEventListener('click', () => {
            if(confirm("确定要清除密码锁吗？")) {
                Storage.remove('password');
                elements.passwordStatus.textContent = "密码锁已关闭。";
                elements.passwordStatus.style.color = "var(--text-muted)";
            }
        });

        // 导出数据
        elements.exportBtn.addEventListener('click', () => {
            const diaries = Storage.get('diaries', []);
            if (diaries.length === 0) return showToast("还没有日记可以导出哦。");

            let textContent = "====== 深夜情绪树洞日记备份 ======\n\n";
            diaries.forEach(d => {
                const dateObj = new Date(d.date);
                textContent += `时间：${dateObj.toLocaleString()}\n`;
                textContent += `情绪：${d.mood} (${d.intensity}/10)\n`;
                textContent += `内容：\n${d.content}\n`;
                textContent += `-----------------------------------\n\n`;
            });

            const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `深夜树洞备份_${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            showToast("日记已导出。");
        });

        // 清空数据
        elements.clearDataBtn.addEventListener('click', () => {
            const pwd = prompt("清空数据不可恢复。如果您确定，请输入当前密码（若未设置密码请输入 'yes'）：");
            const currentPwd = Storage.get('password');
            
            if (pwd === currentPwd || (!currentPwd && pwd === 'yes')) {
                localStorage.clear();
                alert("所有数据已清空。页面将刷新。");
                location.reload();
            } else if (pwd !== null) {
                alert("验证失败，取消清空。");
            }
        });
    }

    // 辅助工具：防止 XSS
    function escapeHTML(str) {
        if (!str) return '';
        return str.replace(/[&<>'"]/g, 
            tag => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                "'": '&#39;',
                '"': '&quot;'
            }[tag] || tag)
        );
    }

    // === 测试数据注入彩蛋 ===
    window.injectWangSiAnData = function() {
        const username = '王思安';
        
        // 1. 注册账号
        const users = JSON.parse(localStorage.getItem('goodnight_users') || '[]');
        if (!users.find(u => u.username === username)) {
            users.push({ username, password: '123' });
            localStorage.setItem('goodnight_users', JSON.stringify(users));
        }

        // 2. 生成分布在当月的测试数据
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const prefix = `goodnight_${username}_`;

        const testDiaries = [
            {
                id: Date.now() - 2000000,
                date: new Date(year, month, 1, 20, 15).toISOString(),
                content: "这个月的第一天，希望能有一个好的开始。",
                type: "short",
                scores: { joy: 2, anger: 1, sorrow: 1, fear: 1 },
                matchedEmotion: { emotion: "平静 / 轻松", desc: "状态不错，心里挺稳的，没什么烦心事。" },
                wizardContext: null
            },
            {
                id: Date.now() - 1900000,
                date: new Date(year, month, 2, 23, 15).toISOString(),
                content: "我与自己一起，在卧室躺着发呆，感觉低落 / 闷闷的。\n\n今天一整天都提不起精神，看着窗外发呆了很久。明明什么都没做，却觉得好累。可能是最近太紧绷了，允许自己稍微停摆一天吧。",
                type: "long",
                scores: { joy: 1, anger: 1, sorrow: 2, fear: 1 },
                matchedEmotion: { emotion: "低落 / 闷闷的", desc: "有点提不起劲，情绪不高，也不想做什么事。" },
                wizardContext: { time: "晚上11点", location: "卧室", people: "自己", action: "躺着发呆" }
            },
            {
                id: Date.now() - 1800000,
                date: new Date(year, month, 3, 22, 10).toISOString(),
                content: "依然感觉很累，不想说话。",
                type: "short",
                scores: { joy: 1, anger: 1, sorrow: 3, fear: 1 },
                matchedEmotion: { emotion: "悲伤 / 痛苦", desc: "很难过，心里像堵着一块大石头，有想哭的冲动。" },
                wizardContext: null
            },
            {
                id: Date.now() - 1700000,
                date: new Date(year, month, 5, 21, 30).toISOString(),
                content: "我与同事一起，在公司加班，感觉烦躁 + 紧张。\n\n需求改了又改，客户一直不满意。明天就要交稿了，进度还差一大半。真的好烦，为什么总是在最后关头变卦？深呼吸...尽人事听天命吧。",
                type: "long",
                scores: { joy: 1, anger: 2, sorrow: 1, fear: 3 },
                matchedEmotion: { emotion: "烦躁 + 紧张", desc: "又烦又紧张，一点小事就容易炸毛，又怕冲突。" },
                wizardContext: { time: "晚上9点半", location: "公司", people: "同事", action: "加班" }
            },
            {
                id: Date.now() - 1600000,
                date: new Date(year, month, 6, 19, 0).toISOString(),
                content: "终于交差了，虽然过程很折磨，但结果还算凑合。今晚一定要吃顿好的补偿自己！",
                type: "short",
                scores: { joy: 3, anger: 1, sorrow: 1, fear: 1 },
                matchedEmotion: { emotion: "开心 / 满足", desc: "今天心情不错，挺开心的，也挺满足。" },
                wizardContext: null
            },
            {
                id: Date.now() - 1500000,
                date: new Date(year, month, 8, 14, 20).toISOString(),
                content: "阳光真好，咖啡很香。",
                type: "short",
                scores: { joy: 2, anger: 1, sorrow: 1, fear: 1 },
                matchedEmotion: { emotion: "平静 / 轻松", desc: "状态不错，心里挺稳的，没什么烦心事。" },
                wizardContext: null
            },
            {
                id: Date.now() - 1400000,
                date: new Date(year, month, 9, 23, 45).toISOString(),
                content: "我与伴侣一起，在客厅吵架，感觉愤怒 / 暴躁。\n\n为什么总是为同样的事情吵架？根本无法沟通，感觉所有的解释都是徒劳。真的气死我了，一点都不想再说话了。",
                type: "long",
                scores: { joy: 1, anger: 3, sorrow: 2, fear: 1 },
                matchedEmotion: { emotion: "愤怒 / 暴躁", desc: "非常生气，火气很大，觉得很不公平或者被冒犯了。" },
                wizardContext: { time: "深夜", location: "客厅", people: "伴侣", action: "吵架" }
            },
            {
                id: Date.now() - 1300000,
                date: new Date(year, month, 10, 8, 30).toISOString(),
                content: "昨晚没睡好，今天头痛欲裂。",
                type: "short",
                scores: { joy: 1, anger: 2, sorrow: 1, fear: 1 },
                matchedEmotion: { emotion: "烦躁 / 不耐烦", desc: "心里有点烦，容易没耐心，不想被打扰。" },
                wizardContext: null
            },
            {
                id: Date.now() - 1200000,
                date: new Date(year, month, 12, 10, 5).toISOString(),
                content: "我与朋友一起，在咖啡馆聊天，感觉开心 / 满足。\n\n好久没见的朋友，聊了整整一个下午。把心里的委屈都倒出来了，感觉轻松了好多。被人接纳和理解的感觉真好。",
                type: "long",
                scores: { joy: 3, anger: 1, sorrow: 1, fear: 1 },
                matchedEmotion: { emotion: "开心 / 满足", desc: "今天心情不错，挺开心的，也挺满足。" },
                wizardContext: { time: "下午", location: "咖啡馆", people: "朋友", action: "聊天" }
            },
            {
                id: Date.now() - 1100000,
                date: new Date(year, month, 14, 21, 10).toISOString(),
                content: "我与家人一起，在家里吃饭，感觉平静 / 轻松。\n\n普通的家常菜，随便聊聊日常，这种平淡的幸福其实最难得。",
                type: "long",
                scores: { joy: 2, anger: 1, sorrow: 1, fear: 1 },
                matchedEmotion: { emotion: "平静 / 轻松", desc: "状态不错，心里挺稳的，没什么烦心事。" },
                wizardContext: { time: "晚上", location: "家里", people: "家人", action: "吃饭" }
            },
            {
                id: Date.now() - 1000000,
                date: new Date(year, month, 15, 2, 40).toISOString(),
                content: "为什么总是忍不住去在意别人的眼光，好讨厌这样的自己。",
                type: "short",
                scores: { joy: 1, anger: 1, sorrow: 3, fear: 2 },
                matchedEmotion: { emotion: "悲伤 + 不安", desc: "又难过又不安，觉得孤单，又有点害怕。" },
                wizardContext: null
            },
            {
                id: Date.now() - 900000,
                date: new Date(year, month, 18, 19, 50).toISOString(),
                content: "我与自己一起，在地铁上听歌，感觉低落 + 不安。\n\n看着车厢里疲惫的人群，突然觉得有些迷茫。现在的努力到底是为了什么？未来会变好吗？耳机里的歌很温柔，但心里还是很空。",
                type: "long",
                scores: { joy: 1, anger: 1, sorrow: 2, fear: 2 },
                matchedEmotion: { emotion: "低落 + 不安", desc: "情绪不高，又有点不安，心里乱糟糟的。" },
                wizardContext: { time: "下班路上", location: "地铁上", people: "自己", action: "听歌" }
            },
            {
                id: Date.now() - 800000,
                date: new Date(year, month, 20, 15, 20).toISOString(),
                content: "收到体检报告了，一切正常，悬着的心终于放下了！",
                type: "short",
                scores: { joy: 3, anger: 1, sorrow: 1, fear: 1 },
                matchedEmotion: { emotion: "开心 / 满足", desc: "今天心情不错，挺开心的，也挺满足。" },
                wizardContext: null
            },
            {
                id: Date.now() - 700000,
                date: new Date(year, month, 22, 22, 10).toISOString(),
                content: "我与猫一起，在沙发上看剧，感觉开心但有点累。\n\n终于把这个大项目做完了！虽然累得要死，但是拿到结果的那一刻还是觉得值了。周末必须狠狠睡两天！",
                type: "long",
                scores: { joy: 3, anger: 1, sorrow: 2, fear: 1 },
                matchedEmotion: { emotion: "开心但有点累", desc: "虽然开心，但还是有点疲惫，没完全放松。" },
                wizardContext: { time: "晚上10点", location: "家里", people: "猫", action: "看剧" }
            },
            {
                id: Date.now() - 600000,
                date: new Date(year, month, 25, 9, 0).toISOString(),
                content: "早上起晚了，全勤奖没了，烦死了！",
                type: "short",
                scores: { joy: 1, anger: 3, sorrow: 1, fear: 1 },
                matchedEmotion: { emotion: "愤怒 / 暴躁", desc: "非常生气，火气很大，觉得很不公平或者被冒犯了。" },
                wizardContext: null
            },
            {
                id: Date.now() - 500000,
                date: new Date(year, month, 28, 23, 50).toISOString(),
                content: "我与自己一起，在阳台吹风，感觉矛盾 / 复杂情绪。\n\n看着城市的夜景，心里五味杂陈。这个月发生了很多事，有开心也有难过。感觉自己成长了一些，但好像又失去了什么。不过没关系，这就是生活吧。",
                type: "long",
                scores: { joy: 2, anger: 2, sorrow: 2, fear: 2 },
                matchedEmotion: { emotion: "矛盾 / 复杂情绪", desc: "各种情绪交织，说不清是好是坏，内心充满拉扯感。" },
                wizardContext: { time: "深夜", location: "阳台", people: "自己", action: "吹风" }
            }
        ];

        localStorage.setItem(`${prefix}diaries`, JSON.stringify(testDiaries));
        
        // 生成时光机测试数据
        const testFutureMsgs = [
            {
                id: Date.now().toString() + "_1",
                targetDate: new Date(now.getTime() - 86400000 * 2).toISOString().split('T')[0], // 前天的日期（已到期）
                content: "嗨，我是过去的你。当你收到这封信的时候，那个让你焦头烂额的项目应该已经做完了吧？不管结果如何，我都为你感到骄傲。记得好好吃顿饭，去外面走走吹吹风。别总是把自己逼得那么紧，未来的路还很长，我们慢慢走。",
                createdDate: new Date(now.getTime() - 86400000 * 30).toISOString(), // 一个月前写的
                has_popped_up: true // 标记为已弹出，避免干扰测试
            },
            {
                id: Date.now().toString() + "_2",
                targetDate: new Date(now.getTime() + 86400000 * 5).toISOString().split('T')[0], // 5天后的日期（未到期）
                content: "未来的我，希望你那时候已经找回了平静。",
                createdDate: new Date(now.getTime()).toISOString() // 今天写的
            },
            {
                id: Date.now().toString() + "_3",
                targetDate: new Date(now.getTime()).toISOString().split('T')[0], // 今天的日期
                content: "嘿，恭喜你撑到了今天！所有的阴霾都会过去的，拆开这封信，感受片刻的治愈吧。",
                createdDate: new Date(now.getTime() - 86400000 * 10).toISOString() // 10天前写的
            }
        ];
        localStorage.setItem(`${prefix}future_msgs`, JSON.stringify(testFutureMsgs));
        
        // 3. 强制登录
        localStorage.setItem('goodnight_currentUser', JSON.stringify(username));
        
        alert(`已成功为“${username}”生成测试数据！点击确定刷新页面。`);
        location.reload();
    };

    // 启动应用
    init();
});
