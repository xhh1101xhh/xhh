# 《禹推开的，是天下》Remotion 工程

## 一键渲染预览（开头 + 第一节，约 52.6 秒）

```bash
cd video
npm install
npm run render:preview        # = 节拍分析 → 字幕回填帧号/字体 → 合成音效混音 → 渲染 out/preview.mp4
npm run check                 # 每 2 秒抽帧 + 字幕区亮度 + 右侧禁字区 + 卡点偏差 + 响度
```

只想看画面、不重做音频：`npx remotion render src/index.ts Preview out/preview.mp4`
调画面：`npm run studio`；批量看单帧：`node scripts/stills.mjs 100 236 560`

## 数据流（所有时间都从两个数据文件来）

| 文件 | 作用 | 谁写 |
|---|---|---|
| `public/bgm/bgm.mp3` | 原始 BGM | 你 |
| `public/bgm/sections.json` | 段落人工命名（可删，删了就自动检测） | 你/自动 |
| `src/data/beats.ts` / `beats.json` | BPM、每拍/小节头帧号、段落起止帧、重拍、爆点、安静拍、终止重音，`frameOf()`/`snapToBeat()` | `scripts/analyze_beats.py` |
| `src/data/subtitles.json` | 字幕定稿：每屏拍点标签、文字、重点词+强调色、显示方式（bottom/slam/inscene/blank）、场景、人物表情/服装、动作拍点、音效拍点；`startFrame/endFrame/cueFrames/sfxFrames` 自动回填 | 你改文字；帧号由 `scripts/sync_timeline.py` 回填 |
| `public/audio/mix_preview.wav` | BGM + 代码合成音效，-14 LUFS / ≤-1 dBTP | `scripts/build_audio.py` |

## 换 BGM

1. 用新曲替换 `public/bgm/bgm.mp3`
2. 删掉或改写 `public/bgm/sections.json`（段落名要和字幕里的标签一致：INT/A/BRK/BLD/DRP1/DRP2/OUT）
3. `npm run render:preview`（会自动重跑分析 → 回填帧号 → 重新混音 → 渲染）

字幕、转场、砸屏、人物动作、音效都写的是“段落:小节.拍”标签，所以会自动卡到新曲的拍点上。
标签在新曲里不存在时，`sync_timeline.py` 会直接报错并指出是哪一屏。
需要截断或循环：`python3 scripts/analyze_beats.py --end 60` / `--loop-to 240`（输出 `public/bgm/bgm_cut.wav`）。

## 只改字幕

改 `src/data/subtitles.json` 里的 `text` / `emphasis` / `display` / `start` 标签，然后 `npm run sync`。
阅读速度超过每秒 5 字、超过 16 字、砸屏时刻不在本屏内，都会报 WARN。

## 组件结构

- `src/lacquer/`：漆艺材质（漆层倒角+高光+厚漆投影滤镜、刷痕、高光带、描金、戗金、剔红、螺钿、断纹、金粉、犀皮漆旋纹、祥云、描金山脊）
- `src/components/puppet/`：矢量漆绘人偶（骨骼：头/躯干/上臂/前臂/大腿/小腿；表情 expression 与服装 outfit 可切换，spring 插值；随机眨眼；呼吸与重心晃动；头发/发带/袍袖/衣角次级跟随慢半拍；整组描金外轮廓，关节不断线）
- `src/components/XuanGui.tsx`：贯穿物件玄圭（石胚→成形、夏后纹戗金刻出、断纹/描金修补、碎裂飞散）
- `src/components/Camera.tsx`：舞台 + 视差层（前/中/背景，景深模糊）+ 相机关键帧（推拉摇移旋，叠加微漂移）
- `src/components/Transitions.tsx`：14 种转场（漆滴晕开、硬切推入、推光扫换、焦点拉移、穿越圭面、碎圭化水、剔红剥层、甩镜横摇、墨晕吞景、绳索横扫、斜雨划变、光缝展开、升空俯冲、圭形匹配）
- `src/components/Text.tsx`：底部字幕、砸屏大字、左上主题、右上水印、左侧地名牌/印章
- `src/components/SandTable.tsx`：沙盘/地图；`Props.tsx`：耒、茅屋、高台、篝火、天平、结绳、黑陶、旗、特写手等
- `src/sections/Section0.tsx`、`Section1.tsx`：每节一个文件，每个场景一个组件
