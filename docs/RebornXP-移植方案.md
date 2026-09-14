# Reborn XP → winXP 移植方案

> 来源：`xp.quenq.com`（Reborn XP，闭源）
> 目标：`/Volumes/Data/Develop/Code/winXP`（winXP，React 16 + styled-components，MIT）
> 日期：2026-09-14

---

## 0. 一句话结论

**"搬代码"是死路，"搬素材 + 抄清单 + 自己实现"是活路。**

而且调研下来有一个关键发现：**你项目的骨架其实比你以为的完整得多**——

- 你的 69 个 `fileIcons/` 里，有 **41 个与 Reborn XP 的 `res/icons/` 同名，抽查 6 个全部字节完全一致**，说明两边用的是同一套 XP 图标源。图标迁移已经完成了约 90%。
- 你的开始菜单 `FooterMenuData.js` 里**已经写好了 57 条中文菜单项**，覆盖录音机、音量控制、Windows Media Player、纸牌、3D 弹球、MSN、Outlook Express……图标也全部 import 好了。**它们只是没有后端组件，点了会跳到"找不到应用程序"错误框。**
- 音效你已经有 8 个（含 XP 启动/关机/注销/错误），对方只有 3 个 —— **音效这一项你反而更全，无需移植。**

所以真正的工作量不在"搬"，而在**给已有菜单项接上真实应用**，以及**补齐少数高价值素材**。

---

## 1. 两侧现状

### 1.1 你的项目 winXP

| 维度 | 现状 |
|---|---|
| 技术栈 | React 16.8 + styled-components 4 + `react-app-rewired`（CRA） |
| 状态管理 | `WinXP/index.js` 里**单个 `useReducer`**，action 定义在 `constants/actions.js`（13 个 action） |
| 窗口系统 | `WinXP/Windows/index.js`（拖拽/缩放/最小化/最大化/zIndex）+ `HeaderButtons.js` |
| 任务栏 | `WinXP/Footer/index.js`（开始按钮、窗口按钮、时钟、托盘假图标） |
| 应用注册 | `WinXP/apps/index.js` → `defaultIconState`（桌面图标）+ `appSettings`（窗口配置） |
| 菜单栏 | `components/WindowDropDowns` + 每个应用自己的 `dropDownData.js` |
| 右键菜单 | 原生 `<contextmenu>` 标签，由 `WinXP/index.js` 的全局 handler 克隆渲染 |
| 音效 | `preloadSound` / `playSystemSound` 已实现并预加载 |
| VFS | **只读 JSON 树**（`MyComputer/vfs/drive_c_system.json` + `drive_e_goodies.json`），无写入、无持久化 |
| 图标解析 | `vfs/index.js` 用 `require.context('assets/fileIcons')` **自动 glob** —— 往目录丢 PNG 即被识别，无需改代码 |
| 字体 | `font.css` 引入 Google Fonts 的 **Noto Sans TC（繁体！）**，`index.css` 用 Noto Sans；CSS 写的 `Tahoma` 无字体文件，实际回退 |
| 壁纸 | ❌ **外链** `https://blog.sdcom.top/upload/Zk6TR5k.jpg` —— 单点依赖，图挂了桌面就空 |
| 已实现应用 | 我的电脑、IE、记事本、扫雷、画图、Winamp、更新日志、关于 Windows（8 个） |
| 主题 | 无主题系统，Luna 蓝色硬编码在 styled-components 里 |

### 1.2 来源站点 Reborn XP

| 维度 | 现状 |
|---|---|
| 技术栈 | **原生 JS + ES module，无框架**，全局 `window.shell` / `window.dialogHandler` |
| 体积 | 19 MB；`res/` 230 个文件（16 MB） |
| 核心模块 | `shell.js`（33 个方法：setup / logonUser / logoffUser / reboot / runOobe / showBSOD / enterStandby / setColorDepth …）、`wm.js`（窗口管理）、`DiskManager.js`（VFS 后端）、`StateSnapper.js`（状态快照）、`themehandler.js`（主题）、`screensave.js`、`dialoghandler.js` |
| 应用数 | **19 个**，与你的重合 3 个（IE / 记事本 / 扫雷），**你缺 16 个** |
| 额外能力 | 可写 VFS + 持久化、Luna ↔ 经典双主题、屏保、休眠/待机、色深切换、OOBE 首次开机向导、多用户配置文件、应用商店 |
| 素材 | 56 个顶层图标 + `start/` 8 个 + `tray/` 55 个；Luna/经典窗口按钮位图；资源管理器工具栏；WMP 精灵图；Outlook 启动图；MSN 素材；Bliss 壁纸；开机动画 gif；字体 6 个；系统音效 |
| 许可 | **闭源，无 license 声明**，JS 未混淆但为专有代码 |

### 1.3 关键发现（决定方案走向）

1. **图标两套同源** —— 41 个同名 + 抽样 6 个字节一致 → 图标只需补 15 个。
2. **开始菜单已备好 57 条中文菜单项** → 缺的是组件，不是 UI。
3. **音效你更全** → 无需移植。
4. **字体有雷** → 见 §2.4，`Tahoma.ttf` 是微软正版商用字体，**不能分发**。
5. **外链壁纸是隐性风险** → 顺手用本地图替掉。

---

## 2. 素材移植清单（可直接搬）

### 2.1 图标 —— 已完成 90%，只需补 15 个 ✅ 建议搬

对方 `res/icons/*.png`（56 个）中，已有 41 个和你完全相同。**你缺的 15 个**：

```
calc.png        diskclean.png   empty.png       font.png        gif.png
gonnacry.png    imgviewer.png   mines.png       repl.png        sndvol.png
solitaire.png   spider.png      theme.png       winupdate.png   wordpad.png
```

另外还有两套小尺寸图标集，你现在完全没有：

| 源 | 数量 | 用途 |
|---|---|---|
| `res/icons/start/` | 8 | 开始菜单左侧竖条小图标（控制面板/帮助/注销/搜索/运行/关机…） |
| `res/icons/tray/` | 55 | 16×16 小图标：托盘、右键菜单、列表视图、`install.png` / `programgroup.png` / `users.png` / `tasks.png` / `rundll.png` 等 |

**目标路径**：`src/assets/fileIcons/`（自动 glob，丢进去即生效）
> ⚠️ 其中 `appstore.png`、`repl.png`、`gonnacry.png` 疑似 **Reborn XP 自制图标**（非微软原始素材），建议单独放 `src/assets/fileIcons/reborn/` 或不用。`tray/` 里也有 `appstore.png`。

**你独有、对方没有的 27 个**：`batchxp bmp default downloadedprograms folderprops fonts go hlp install mediafile mplay32 msdos offlinepages opentype programgroup question "recycler full" rundll startmenu systemprops tasks timedate twunk users win winhelp winhlp32` —— 保留即可，不要反向覆盖。

### 2.2 光标 —— 只差 1 个 ✅ 建议搬

| 项 | 你 | 对方 | 结论 |
|---|---|---|---|
| `.cur` 文件 | 7 个 | 8 个 | **补 `background.cur`（桌面/背景态光标）** |
| 其余 7 个 | `beam / default / link / resize_nesw / resize_ns / resize_nwse / resize_we` | 同名 | 已覆盖，比对后无需替换 |

**目标路径**：`src/assets/cursors/`

### 2.3 音效 —— 无需移植 ❌ 跳过

| 对方 | 你 | 结论 |
|---|---|---|
| `res/sounds/startup.wav`(416K) | `sounds/startup.wav`(424K) | ✅ 已有 |
| `res/sounds/startup.wav` | `sounds/start.wav` | ✅ 已有 |
| `vfs/C/WINDOWS/Media/Windows XP Error.wav` | `sounds/error.wav` | ✅ 已有 |
| — | `sounds/balloon / critical_stop / logoff / logon / shutdown` | **你多 5 个** |

**唯一可考虑补充**：`Windows XP Start.wav`（注销/登录短音），价值不大。

### 2.4 字体 —— ⚠️ 有法律雷区，需分类处理

解析字体名称表后的结论：

| 文件 | 名称表信息 | 性质 | 建议 |
|---|---|---|---|
| `Tahoma.ttf` | `© 2004 Microsoft Corporation. All rights reserved.` Version 3.15 | **微软正版商用字体** | ❌ **不要打包进仓库**。公开部署等于分发微软字体，风险最高的一项 |
| `MSSansSerif 8pt.ttf` / `MSSansSerif Bold 8pt.ttf` | 版权字段 `Anonymous` / `MicrosoftKonsti` | 爱好者重制版（非微软原版） | ⚠️ 用前先查作者授权；署名 Konsti 的请去确认 |
| `Tahoma 8pt 11-2.ttf` / `Tahoma 8pt 11-2 Bold.ttf` | `MicrosoftKonsti`，家族名 `Tahoma8pt103` / `TahomaBold` | 同上，爱好者重制 | ⚠️ 同上 |
| `lucon.woff` | 名称表为空（webfont 子集） | Lucida Console 是微软品牌字体 | ⚠️ 谨慎 |
| `Web437_IBM_VGA_8x14.woff` | Web437 系列 | **VileR 的 "Ultimate Oldschool PC Font Pack"，CC BY-SA 4.0** | ✅ **可自由使用**，适合 BSOD 屏幕 |

**推荐做法**（既提升观感又干净）：

1. **Tahoma 替代方案**：用度量兼容的自由字体 `Wine Tahoma`（LGPL）或保留系统 Tahoma 栈 —— 你的 CSS 已经写了 `Tahoma, 'Noto Sans'`，在 Windows 上会命中真 Tahoma，非 Windows 上回退 Noto Sans。**不加字体文件其实已经够用**。
2. 想要更还原的 8pt 位图观感：优先用 `Web437_IBM_VGA_8x14.woff`（CC BY-SA，需在 README 注明来源与许可）。
3. 顺便修掉一个现存问题：**`font.css` 引的是 `Noto Sans TC`（繁体字库）**，中文界面用繁体字形，应改成 `Noto Sans SC` 或改用系统字体栈。

**目标路径**（若采用第 2 条）：`src/assets/fonts/Web437_IBM_VGA_8x14.woff` + 在 `font.css` 加 `@font-face` 并在 README 补许可声明。

### 2.5 壁纸 —— ✅ 强烈建议搬（顺带解掉外链）

| 项 | 说明 |
|---|---|
| 源 | `res/background/stock-wallpapers/Bliss.jpg` |
| 现状 | 你的 `.winxp-container` 背景是**远程 URL**（`blog.sdcom.top/upload/Zk6TR5k.jpg`），对方挂了桌面就白 |
| 目标 | `src/assets/wallpapers/bliss.jpg`，CSS 改成 `url(../assets/wallpapers/bliss.jpg)` |
| 附加 | 可顺手支持多壁纸 + 切换项（配合 §4.2 主题系统一起做） |

> Bliss 是微软版权照片，但你项目 README 已有"仅供学习交流、与微软无关联"的免责声明，与现有素材口径一致。

### 2.6 窗口装饰位图 —— ✅ 高价值，建议搬

这是对方**最能提升还原度**的一批素材，你现在全是 CSS 手绘的：

| 源路径 | 内容 | 用途 |
|---|---|---|
| `res/ui/luna/blue/start.png` / `start_hover.png` / `start_press.png` | **开始按钮三态** | 替换你现在用的 `windowsIcons/start.png` 单图 |
| `res/ui/luna/close.png` / `maximize.png` / `minimize.png` | Luna 窗口按钮 | 让标题栏按钮精确对齐 |
| `res/ui/luna/blue/scroll_up/down/left/right.png` | 滚动条箭头 | 滚动条还原 |
| `res/ui/luna/blue/scrollgrip_*.png` | 滚动条滑块三态 | |
| `res/ui/luna/grabber.png`、`startarrow.png` / `startarrow_press.png` | 拖拽柄、开始菜单箭头 | |
| `res/ui/classic/close|maximize|minimize|restore_classic.png` | **经典主题窗口按钮** | 做经典主题的必备件 |
| `res/ui/nav/`（11 个） | 资源管理器工具栏：`back forward up search folders favorites go home refresh stop views` | 我的电脑/IE 工具栏 |
| `res/ui/minesweeper/minesweeper_sprites.png` | 扫雷精灵图 | 你现有 `assets/minesweeper/` 是拆散的单图，可对照补齐 |
| `res/ui/wmp/`（12 个） | WMP8 皮肤精灵：`play pause stop rewind mute changetrack skinmode topbuttons navtoggle_grip wmp8_sprites xplogo_big/small` | 做 WMP 应用的核心素材 |
| `res/ui/outlook/splash.png` | Outlook 启动图 | |
| `res/ui/imgviewer.png`、`migwiz.png`、`ntbackup.png`、`screensave.png`、`side.png`、`logonlogo.png`、`browserflag.png` | 各应用标题图 | |

**目标路径**：新建 `src/assets/ui/{luna,classic,nav,wmp,outlook,minesweeper}/`

### 2.7 系统符号与开机动画 —— ✅ 建议搬

| 源 | 内容 | 用途 |
|---|---|---|
| `res/symbols/`（10 个） | `shutdown logoff restart standby hide menu`(png) + `crt fullscreen rotate upload`(svg) | 关机对话框的图标按钮。你现在 `Modal` 里的按钮图标是缺的 |
| `res/anim/boot.gif`（124K） | 开机动画 | 对照你现在用的 `assets/windowsIcons/boot.gif`，可能更高清 |
| `res/users/chess.bmp` / `guest.bmp` | 登录用户头像 | 登录界面头像 |

**目标路径**：`src/assets/symbols/`、`src/assets/users/`

### 2.8 VFS 内容 —— ✅ 建议搬（配合 §4.1 一起）

| 源 | 内容 |
|---|---|
| `vfs/C/WINDOWS/Media/*.wav` | 3 个系统音效（你已有同类） |
| `vfs/C/WINDOWS/system32/oobe/images/` | OOBE 引导图 |
| `vfs/E/` 下 | 若干示例文件（含 `microsoft_nostalgic/*.jpg` 4 张怀旧壁纸） |

**做法**：把这些作为**新的虚拟磁盘内容**，转成你 `drive_e_goodies.json` 同构的节点结构（见 §4.1）。

### 2.9 应用专属素材

| 源 | 内容 | 说明 |
|---|---|---|
| `res/sites/pinball/` | `3DPinballSpaceCadet.js` + `bg.mp3`(2.8M) + `splash.png` + `index.html` | ⚠️ **这是别人的 JS 移植实现，属专有代码，不要直接引入**。`bg.mp3` 和 `splash.png` 可用 |
| `res/sites/helpUI/` | 帮助中心的 HTML 页面 + `listarrow.png` + `search.js` | ⚠️ 结构和文案可参考，**HTML 不要照搬**，中文化重写 |
| `res/msn-messenger/` | `bots.json` + 头像 + 登录动画 + UI 图 | ✅ 素材可用；`bots.json` 可参考其数据结构 |

### 2.10 明确不要搬的东西 ❌

| 项 | 原因 |
|---|---|
| `js/*.js`（`shell.js` / `wm.js` / `DiskManager.js` / `explorer.js` / `apps/*.js` …） | 专有代码；且是原生 JS 全局架构，塞进 React 只会增加维护负担 |
| `css/*.css`（`luna/blue.css` / `applayouts.css` / `scenes.css` / `wmp8.css` …） | 专有样式表；且会和你 styled-components 打架。**可以读它来校准色值/尺寸，但不要引入文件** |
| `res/sites/*/*.html` | 专有页面 |
| `appstore.png` / `repl.png` / `gonnacry.png` | 疑似 Reborn XP 自制原创素材 |

---

## 3. 功能移植清单（16 个缺失应用）

> 好消息：开始菜单里**这 16 个的中文菜单项和图标基本都已存在**。工作内容 = 写组件 + 在 `apps/index.js` 注册 + 在 `onClickMenuItem` 里加分支。

### 3.1 分梯队

| 梯队 | 应用 | 难度 | 说明 |
|---|---|---|---|
| **一** | 音量控制 `sndvol32` | 低 | 托盘图标 + 混音器面板 + 静音。最容易出效果 |
| **一** | 图片查看器 `imgviewer` | 低 | 打开虚拟磁盘图片，缩放/旋转/上一张下一张 |
| **一** | 命令提示符 `cmd` | 中 | 自建迷你 shell：`dir cd type echo cls ver help exit` |
| **一** | 纸牌 `sol` | 中高 | 拖动 + 发牌规则 + 胜利动画，纯前端可做 |
| **一** | Windows Media Player `wmp` | 中 | `<audio>` + 播放列表 + 可视化；精灵图已在 §2.6 |
| **二** | 录音机 `sndrec32` | 中 | `MediaRecorder` API 录音 + 波形 |
| **二** | 帮助和支持中心 `help` | 低 | 中文化静态页 + 目录树 |
| **二** | 添加或删除程序 `appwiz` | 低 | 应用列表 + "卸载"（实际是移除桌面图标） |
| **二** | Outlook Express `outlook` | 中 | 三栏布局 + 本地假邮件数据 |
| **二** | MSN Messenger `msnmsgr` | 中 | 登录动画 + 好友列表 + 用 `bots.json` 思路做自动回复 |
| **三** | 3D 弹球 `pinball` | 极高 | 物理引擎（matter.js）+ 档板/碰撞。**建议排最后或做成简化版** |
| **三** | Windows XP 漫游 `xptour` | 低 | 幻灯片 + 音乐 |
| **三** | 备份或还原向导 `ntbackup` | 低 | 向导式 UI，无真实逻辑 |
| **三** | 文件和设置转移向导 `migwiz` | 低 | 同上 |
| — | 应用商店 `appstore` | — | **架构不匹配**：你的应用是编译期注册的，没法真装新应用。建议改做"桌面图标启用/停用"面板 |
| — | `tbd` | — | 未识别，待确认后再说 |

---

## 4. 基础设施改造（优先级高于单个应用）

### 4.1 可写 VFS + 持久化 🔴 P0

你现在是只读 JSON 树（`drive_c_system.json`），**记事本存不了盘、右键"新建文件夹"是灰的**。这是和对方差距最大的一块。

**改造点**：
1. 把 `drive_*.json` 提升到 `useReducer` 的 state（或独立 Context）
2. 新增 action：`VFS_CREATE` / `VFS_WRITE` / `VFS_DELETE` / `VFS_RENAME` / `VFS_MOVE`
3. 持久化到 `localStorage`（数据小）或 `IndexedDB`（要存文件内容）
4. 打通：记事本"另存为"、画图"保存"、右键"新建 → 文本文档/文件夹"、回收站

**收益**：一下子点亮记事本、画图、我的电脑、右键菜单四个模块。

### 4.2 主题系统 Luna ↔ 经典 🟠 P1

现在 Luna 蓝的色值硬编码在 styled-components 里。

**做法**：
1. 把 `--color-*` 抽成 CSS 变量，挂在 `.winxp-container` 上
2. 定义两套：`.theme-luna` / `.theme-classic`
3. 配合 §2.6 的 `classic/*.png` 窗口按钮
4. 入口：桌面右键 → 属性（你已有"属性"菜单项，现在跳错误框）

### 4.3 屏保 🟡 P2

对方有 `screensave.js` + `res/ui/screensave.png`。可实现"气球"或"字幕"屏保。

### 4.4 托盘区与时钟 🟠 P1

你现在托盘是**假图标**（`690(16x16).png` 音效 / `394(16x16).png` usb / `229(16x16).png` 风险），且**时钟是 12 小时 AM/PM 制**。

**改造**：托盘绑真实状态（音量 → §3.1 音量控制；网络 → 假连接状态）；时钟改 24 小时制（中文 Windows 默认）。

### 4.5 全局中文化扫尾 🟠 P1

- `font.css` 的 `Noto Sans TC` → `Noto Sans SC`（现在是**繁体字形**）
- 残留英文：`Winamp` 窗口、IE 的 `dropDownData.js`
- 应用标题栏格式统一为「文件名 - 程序名」（如"无标题 - 记事本"），已有此规范，新应用要遵守

---

## 5. 新增一个应用的开发模板

照着这 6 步走即可，以「音量控制」为例：

**① 建目录** `src/WinXP/apps/VolumeControl/`

**② 写组件** `index.js`
```jsx
import React, { useState } from 'react';
import styled from 'styled-components';

export default function VolumeControl({ onClose, injectProps }) {
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  return (
    <Div>
      <div className="vc__title">音量</div>
      <input
        type="range" min="0" max="100"
        value={muted ? 0 : volume}
        onChange={e => setVolume(Number(e.target.value))}
      />
      <button onClick={() => setMuted(m => !m)}>{muted ? '取消静音' : '静音'}</button>
    </Div>
  );
}

const Div = styled.div`/* 用 Luna 变量，别硬编码色值 */`;
```

**③ 写菜单** `dropDownData.js`（Windows 风格应用必备）
```js
export default [{ text: '选项', items: [{ text: '属性' }, { text: '退出' }] }];
```

**④ 注册** `src/WinXP/apps/index.js`
```js
import VolumeControl from './VolumeControl';
import volumeIcon from 'assets/fileIcons/sndvol.png';

// 加到 defaultIconState（要桌面图标才加）
{ id: 7, icon: volumeIcon, title: '音量控制', component: VolumeControl, isFocus: false },

// 加到 appSettings（窗口尺寸/位置/是否可缩放/多实例）
VolumeControl: {
  header: { icon: volumeIcon, title: '音量控制' },
  component: VolumeControl,
  defaultSize: { width: 240, height: 320 },
  defaultOffset: { x: 900, y: 400 },
  resizable: false, minimized: false, maximized: false, multiInstance: false,
},

// 加到末尾 export
export { /* ...原有... */ VolumeControl };
```

**⑤ 接开始菜单** `src/WinXP/index.js` → `onClickMenuItem`
```js
} else if (o === '音量控制') {
  dispatch({ type: ADD_APP, payload: appSettings.VolumeControl });
}
```
> 菜单项 `text` 必须和 `FooterMenuData.js` 里的**完全一致**，否则匹配不上。

**⑥ 验证**：`npm start` → 开始菜单 → 所有程序 → 娱乐 → 音量控制

**约定**：
- 组件收 `{ onClose, injectProps }`
- 窗口内要右键菜单的容器加 `data-contextmenu` 属性，内嵌原生 `<contextmenu>`
- 图标丢 `src/assets/fileIcons/` 即被 `require.context` 自动识别，**无需改代码**

---

## 6. 分批路线图

| 批次 | 内容 | 产出 |
|---|---|---|
| **P0** | ① 补 15 个图标 + `start/` `tray/` 两套 ② `background.cur` ③ Bliss 壁纸并干掉外链 ④ 修 `Noto Sans TC` → `SC` | 观感立刻提升，零架构风险 |
| **P1** | ① 窗口装饰位图（luna/classic/nav）接入 HeaderButtons、开始按钮、滚动条 ② `res/symbols/` 接入关机对话框 ③ 时钟改 24 小时制 + 托盘真实化 | 还原度质变 |
| **P2** | ① 可写 VFS + localStorage（§4.1）② 音量控制 + 图片查看器（§3 一梯队） | 功能性突破 |
| **P3** | ① 命令提示符 ② 纸牌 ③ WMP ④ 主题系统（§4.2） | 可玩性 |
| **P4** | 录音机、帮助中心、添加删除程序、Outlook、MSN、XP 漫游、备份还原、转移向导 | 完整性 |
| **P5** | 3D 弹球、屏保 | 彩蛋 |

**验收标准**：每批次结束后，`npm start` 能正常进桌面、该批次涉及的应用能打开且不报错、右键菜单/开始菜单入口可点。

---

## 7. 风险与边界

| 风险 | 等级 | 处置 |
|---|---|---|
| Reborn XP 专有 JS/CSS 被复制进公开仓库 | 🔴 高 | **不引入**，只读它做规格参考。本项目 MIT + 公开部署，被追溯会很被动 |
| `Tahoma.ttf`（微软正版字体）被打包分发 | 🔴 高 | **不打包**，改用系统字体栈或 `Web437`（CC BY-SA） |
| 爱好者重制字体（Konsti 署名）授权不明 | 🟠 中 | 查清授权再用；宁可不用 |
| 疑似自制图标（`appstore` / `repl` / `gonnacry`） | 🟠 中 | 隔离存放或不使用 |
| 混入 vanilla JS 架构导致维护成本翻倍 | 🟠 中 | 一律用 React 原生重写，不搞桥接 |
| 3D 弹球工作量失控 | 🟡 低 | 排最后，或做简化版 |

**原则**：功能、交互、视觉规范这些"做法"不受版权保护 —— **照着做、自己写实现**完全合法。要避免的是**复制具体代码文件与该站点原创素材**。

---

## 附录 A：素材完整对照表

| 源路径 | 数量 | 目标路径 | 处置 |
|---|---|---|---|
| `res/icons/*.png`（顶层） | 56 | `src/assets/fileIcons/` | 41 个已有，补 15 个 |
| `res/icons/start/` | 8 | `src/assets/fileIcons/start/` | 全部新增 |
| `res/icons/tray/` | 55 | `src/assets/fileIcons/tray/` | 全部新增 |
| `res/ui/luna/` | 11 | `src/assets/ui/luna/` | 全部新增 |
| `res/ui/classic/` | 4 | `src/assets/ui/classic/` | 全部新增 |
| `res/ui/nav/` | 11 | `src/assets/ui/nav/` | 全部新增 |
| `res/ui/wmp/` | 12 | `src/assets/ui/wmp/` | 全部新增 |
| `res/ui/outlook/` | 1 | `src/assets/ui/outlook/` | 新增 |
| `res/ui/minesweeper/` | 1 | `src/assets/minesweeper/` | 对照补齐 |
| `res/ui/cursors/background.cur` | 1 | `src/assets/cursors/` | 补缺 |
| `res/ui/*.png`（散图 7 个） | 7 | `src/assets/ui/` | 新增 |
| `res/symbols/` | 10 | `src/assets/symbols/` | 新增 |
| `res/background/stock-wallpapers/Bliss.jpg` | 1 | `src/assets/wallpapers/` | 替换外链 |
| `res/anim/boot.gif` | 1 | 对照现值 | 择优 |
| `res/users/*.bmp` | 2 | `src/assets/users/` | 新增 |
| `res/fonts/Web437_IBM_VGA_8x14.woff` | 1 | `src/assets/fonts/` | 可选（CC BY-SA） |
| `res/fonts/Tahoma.ttf` 等 | 5 | — | ❌ 不搬 |
| `res/sounds/` | 3 | — | ❌ 已有更全 |
| `res/sites/pinball/bg.mp3`、`splash.png` | 2 | `src/assets/apps/pinball/` | 只取媒体，JS 不取 |
| `res/msn-messenger/` | 8 | `src/assets/apps/msn/` | 素材 + 数据结构参考 |
| `vfs/**` | 8 | 转 VFS JSON | 配合 §4.1 |
| `js/**`、`css/**`、`res/sites/*/*.html` | — | — | ❌ 不搬 |

## 附录 B：图标缺口清单（可直接执行）

```bash
SRC=/Users/sdcom/Downloads/xp.quenq.com/res/icons
DST=/Volumes/Data/Develop/Code/winXP/src/assets/fileIcons

for f in calc diskclean empty font gif gonnacry imgviewer mines repl \
         sndvol solitaire spider theme winupdate wordpad; do
  cp "$SRC/$f.png" "$DST/$f.png"
done

mkdir -p "$DST/start" "$DST/tray"
cp "$SRC/start/"* "$DST/start/"
cp "$SRC/tray/"*  "$DST/tray/"
```
> 执行前建议把 `appstore.png` / `repl.png` / `gonnacry.png` 先剔除或挪到 `fileIcons/reborn/`。
