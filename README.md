# 《独处能力》· 守灯人篇（Remotion）

釉彩剪纸·金缮风格的横屏知识短视频。所有画面由代码绘制，音效由代码合成，BGM 由脚本分析卡点。

## 目录
| 路径 | 内容 |
|---|---|
| `docs/ep-solitude-plan.md` | 方案（差异卡、结构、视觉） |
| `docs/ep-solitude-script.md` | 字幕定稿（表格版） |
| `bgm.config.json` | BGM 源文件、目标时长、剪辑方式（auto / manual / none） |
| `scripts/analyze_beats.py` | 节拍 / 段落 / 能量 / 安静点分析，输出 `src/data/beats.ts` 和剪好的 `public/bgm/bgm_edit.wav` |
| `scripts/synth_sfx.py` | 代码合成全部音效 → `public/sfx/*.wav`（F 小调五声音阶） |
| `scripts/make_textures.py` | 纸纹颗粒贴图（固定随机种子） |
| `scripts/qc.ts` | 静态质检：读速、断行、孤字、右侧禁字区、所有拍点偏差 → `out/qc_report.md` |
| `scripts/render.sh` | 渲染 + 母带（-14 LUFS，≤ -1 dBTP） |
| `src/data/beats.ts` | **自动生成**的节拍数据 + `snapToBeat` / `beatLabelFrame` |
| `src/data/subtitles.ts` | **字幕定稿数据**：每屏的拍点、文字、重点词颜色、显示方式、场景、人物表情/服装、动作和音效拍点 |
| `src/lib/timing.ts` | 拍点标签 → 帧（换 BGM 时按段落比例重映射） |
| `src/scenes/` | 每节一个组件：S0Hook、S1aRoom、S1bUniverses、S2Memory、S3Ember、S4Shell、S5Open、S6Ending |
| `src/components/transitions/` | 转场库：剪纸层层钻入、快速竖摇、横推、拱形遮罩、虹膜开、镜面翻转、甩镜、纸张撕裂、光点闪光、斜向光切、金光虹膜收 |
| `src/components/` | 复用组件：人物骨骼与表情、提灯、剪纸纸片、镜头、转场、字幕、砸屏、主题、水印 |

## 命令
```bash
npm install
pip install librosa soundfile pyloudnorm scipy pillow
npm run analyze      # 分析 BGM，生成 beats.ts + 剪辑版 BGM
npm run sfx          # 合成音效
npm run textures     # 纸纹
npm run qc           # 质检（加 -- --until B1:9.1 只查预览范围）
npm run render:preview   # → out/preview.mp4（开头 + 第一节）
bash scripts/render.sh Full out/full.mp4
npm run studio       # 交互预览
```

## 改字幕 / 换 BGM
- 改字幕：只改 `src/data/subtitles.ts`。时间都写成拍点标签（如 `B1:2.3`，意思是 B1 段第 2 小节第 3 拍），画面、转场、砸屏、音效都从这里取时间。
- 换 BGM：把音频放进 `public/bgm/`，改 `bgm.config.json` 的 `source`，并把 `edit.mode` 改成 `auto`，然后运行 `npm run analyze`。脚本会重新检测拍点和小节相位，把段落归成 INTRO / B1 / D / A2 / B2 / C / B3 / OUT 这几个角色，按 `targetSeconds` 自动在和声对得上的小节头剪短或循环（12 ms 交叉淡化），然后重写 `beats.ts`。全片按段落标签自动重新卡点；新曲某段小节数不同时，按比例映射。跑一遍 `npm run qc` 确认没有偏拍。
