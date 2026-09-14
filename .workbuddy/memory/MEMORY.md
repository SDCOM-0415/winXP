# 项目长期记忆 — winXP

## 待办：3D 弹球（3D Pinball Space Cadet）完整移植

状态：**未开始，计划中的未来工作**。用户 2026-09-14 明确要求先把这项记下来，等基础设施做完再动。

**背景**：来源站点 Reborn XP 有 3D 弹球，本项目的开始菜单里 `所有程序 → 游戏 → 3D 弹球` 入口**已经存在**（`src/WinXP/Footer/FooterMenuData.js` 已 import `Pinball.svg`），但点击会落到 ErrorBox。

**要做什么**：
- 目标应用名 `pinball`，放在 `src/WinXP/apps/Pinball/`
- 需要自建 2D 物理引擎（建议 `matter.js`）实现：重力、球体与档板的碰撞与反弹、左右档板（Z / / 键）、弹簧发射器、多球、计分与排行
- 参照真实 Space Cadet 的三张台面与任务系统，可先做单张台面

**可用素材**：
- `assets/windowsIcons/svg/Pinball.svg`（开始菜单图标，已有）
- 来源站点可用的媒体文件（**只取媒体，不要取代码**）：
  `~/Downloads/xp.quenq.com/res/sites/pinball/` 下的 `bg.mp3`（2.8 MB，背景音乐）与 `splash.png`（启动图）
- `assets/ui/` 下暂无弹球专用位图，如需台面贴图要另行准备

**明确禁止**：
- ❌ 不要引入 `res/sites/pinball/3DPinballSpaceCadet.js` —— 那是 Reborn XP 的专有实现，本项目是 MIT 且公开部署

**接入方式**（按项目既有约定）：
1. 建 `apps/Pinball/index.js` + `dropDownData.js`
2. 在 `apps/index.js` 注册 `appSettings.Pinball` 并加桌面图标
3. 在 `WinXP/index.js` 的 `onClickMenuItem` 加分支，菜单文本必须与 `FooterMenuData.js` 里**完全一致**（是 `3D 弹球`）

---

## 项目关键约定（后续开发必读）

- **应用注册 6 步**：建目录 → 写 `index.js`（收 `{ onClose, injectProps }`）+ `dropDownData.js` → `apps/index.js` 注册（`defaultIconState` + `appSettings` + export）→ `WinXP/index.js` 的 `onClickMenuItem` 加 if 分支
- **图标零配置**：往 `src/assets/fileIcons/` 丢 PNG 即可，`vfs/index.js` 用 `require.context` 自动收集，无需改代码
- **右键菜单必须用 `data-*` + 原生监听**：右键菜单由全局处理器 `cloneNode` 生成后挂到容器上，**克隆节点会丢失 React 的 onClick**。可用属性：`data-action`（show-desktop/open/refresh/close/minimize/maximize/restore）、`data-vfs`（open/new-folder/new-file/rename/delete，配合 `data-drive`/`data-path`/`data-name`）、`data-app`、`data-win-id`
- **菜单文本要按原文精确匹配**：`WindowDropDown` 回传 `item.text` 原文，带省略号的（`打开...`、`另存为...`）必须连省略号一起匹配
- **中文化口径**：品牌名保留英文（Internet Explorer / Winamp / Windows Media Player），`Administrator` 账号名也保留（与真实中文 XP 一致）
- **验证原则**：不要跑长时间构建（`npm run build` 约 2-3 分钟、`vue-tsc` 类全量检查更久）。用秒级静态核对（babel 语法检查、导入路径存在性校验）即可，真正的端到端验证交给实际构建流水线
