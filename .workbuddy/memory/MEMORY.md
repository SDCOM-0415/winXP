# 项目长期记忆 — winXP

## 待办：三维弹球（3D Pinball Space Cadet）

状态：**未开始**。用户 2026-09-14 要求记为未来工作，2026-09-15 再次要求"完整引入参考站"。

**背景**：开始菜单 `所有程序 → 游戏 → 三维弹球` 入口**已经存在**
（`src/WinXP/Footer/FooterMenuData.js` 已 import `Pinball.svg`），但点击会落到 ErrorBox。

### ⚠️ 关键事实：参考站的弹球不是他们自己写的（2026-09-15 查清）

`~/Downloads/xp.quenq.com/res/sites/pinball/3DPinballSpaceCadet.js` 是
**9.4MB 的单行文本**（无换行符），开头为：

```
var WASM_FILE = "data:application/wasm;base64,AGFzbQEAAAA...
```

`AGFzbQEAAAA` 是 WASM 二进制的 base64 头 —— 这是 **Emscripten 编译产物，不是源码**。

从 WASM 二进制里提取到的可读字符串（确凿证据）：

| 字符串 | 含义 |
|---|---|
| `Project home: https://github.com/k4zmu2a/SpaceCadetPinball` | 上游开源项目 |
| `Original game by Cinematronics, Microsoft` | 原版游戏版权方 |
| `/home/alula/opt/emsdk/upstream/emscripten/...` | 构建者环境，`alula` 是网页版作者 |
| `The .dat file is missing` | 运行还需要 `pinball.dat` 游戏数据 |
| `GPL` | 该作品属 GPL 家族许可 |

**结论**：它是社区开源项目 **SpaceCadetPinball**（微软原版 3D 弹球的反编译重写）
经 `alula` 做成网页版、再用 Emscripten 编译出的 WASM。**不是参考站的原创代码。**

参考站自己的部分只是一个 9.7KB 的接入壳（`js/apps/pinball.js`）
+ 一个独立页面（`index-xxxx.html`，内含 `<canvas id="canvas">` 与 Emscripten 的
`Module` 对象，还把 `c` 键映射成 `/`、`r` 键映射成 `F2`）。

### 引入它的三个实际代价（已告知用户，等其拍板）
1. **GPL 传染**：本项目是 MIT 且公开部署。把 GPL 产物打进构建输出，
   整个分发物就应按 GPL 走，`LICENSE` 会变得不准确
2. **产物 +9.4MB**：且它是内联 data URL，会直接进 JS bundle，
   对 EdgeOne 的构建与分发有实际成本（本项目已被 187MB SVG 拖累过）
3. 还需要 `pinball.dat` 数据文件，参考站只带了 JS + `bg.mp3` + `splash.png`，
   数据是否内嵌在 WASM 里尚未确认

### 三条可选路线（等用户选择）
- **A. 原样引入那 9.4MB WASM**：最省事、最"原汁原味"，但要接受上面三个代价
- **B. 自己实现**（原计划）：单张台面 + 档板 + 发射器 + 多球 + 计分。
  MIT 干净、体积可控，但工作量大且不会 100% 一致
- **C. iframe 外链上游公开构建**：不把第三方代码放进仓库，
  但依赖外部服务、离线不可用

**可用的媒体素材**（取用无代码授权问题，已确认存在）：
- `res/sites/pinball/bg.mp3`（2.8MB 背景音乐）、`splash.png`（33KB 启动图）
- `assets/fileIcons/pinball.png`（14KB，**优先用这个小图标**，别用 >500KB 的 `windowsIcons/svg/Pinball.svg`）
- `assets/ui/tray/pinball.png`

**接入方式**（按项目既有约定）：
1. 建 `apps/Pinball/index.js`（需要菜单栏再加 `dropDownData.js`）
2. 在 `apps/index.js` 注册 `appSettings.Pinball`
3. 在 `WinXP/index.js` 的 `onClickMenuItem` 加分支，
   菜单文本必须与 `FooterMenuData.js` 里**完全一致**（是 `三维弹球`）

---

## 项目关键约定（后续开发必读）

- **应用注册 6 步**：建目录 → 写 `index.js`（收 `{ onClose, injectProps }`）+ `dropDownData.js` → `apps/index.js` 注册（`defaultIconState` + `appSettings` + export）→ `WinXP/index.js` 的 `onClickMenuItem` 加 if 分支
- **图标零配置**：往 `src/assets/fileIcons/` 丢 PNG 即可，`vfs/index.js` 用 `require.context` 自动收集，无需改代码
- **右键菜单必须用 `data-*` + 原生监听**：右键菜单由全局处理器 `cloneNode` 生成后挂到容器上，**克隆节点会丢失 React 的 onClick**。可用属性：`data-action`（show-desktop/open/refresh/close/minimize/maximize/restore）、`data-vfs`（open/new-folder/new-file/rename/delete，配合 `data-drive`/`data-path`/`data-name`）、`data-app`、`data-win-id`
- **菜单文本要按原文精确匹配**：`WindowDropDown` 回传 `item.text` 原文，带省略号的（`打开...`、`另存为...`）必须连省略号一起匹配
- **中文化口径**：品牌名保留英文（Internet Explorer / Winamp / Windows Media Player），`Administrator` 账号名也保留（与真实中文 XP 一致）
- **验证原则**：不要跑长时间构建（`npm run build` 约 2-3 分钟、`vue-tsc` 类全量检查更久）。用秒级静态核对（babel 语法检查、导入路径存在性校验）即可，真正的端到端验证交给实际构建流水线

---

## 交付前自检清单（每次改完必做，否则流水线必挂）

构建环境是 `process.env.CI = true`，**CRA 会把 ESLint 告警升级成编译错误**。
历史上一共因为这类问题挂过两次，按下面顺序自检，各 1-10 秒：

1. **格式化**（最容易踩）：
   `node_modules/.bin/prettier --write <改动文件>`
   然后 `node_modules/.bin/prettier --check <改动文件>` 确认输出 `All matched files use Prettier code style!`
   注意 `~/.npmrc` 是 zsh 环境，**多行 shell 变量不会自动分词**，prettier 要直接传文件名，别塞进变量。
2. **未使用变量/导入**：CI 的 `no-unused-vars` 是硬错误。
   重点检查：解构出来的变量、写了一半又改方案留下的函数、加了但没用的 action 常量导入。
3. **导入引用存在性**：改过 `assets/` 路径后必查，尤其图标名要区分
   `assets/fileIcons/*.png`（小图标，自动 glob）与 `assets/windowsIcons/svg/*.svg`。

**踩过的坑**：
- `assets/windowsIcons/svg/` 有 **187 MB**、135 个文件超过 500KB（最大 1 MB+），
  构建时会刷一屏 `[BABEL] ... exceeds the max of 500KB`。这些是提示不是错误，
  但**引入新图标时优先用 `fileIcons/` 里的小 PNG**，别用这些巨型 SVG（已踩过一次）。
- `WindowDropDown` 回传的是 `item.text` 原文，带省略号的必须连省略号匹配（`打开...`）。
- 右键菜单项由全局处理器 `cloneNode` 生成，**React onClick 会丢**，必须用 `data-*` + 原生监听。

## 对照基准（Reborn XP）做视觉对齐的方法

**基准站的结构**（爬取副本在 `~/Downloads/xp.quenq.com`，19MB）：
- `xp.quenq.com` **顶层打开会跳走**（index.html 内联脚本，仅 localhost / iframe 内放行），
  且**爬取副本跑不起来**（`window.shell` 未初始化，`js/shell.js` 等 ESM 模块没加载）。
  真实模拟器只活在 `quenq.com/apps/reborn-xp` 的**跨域 iframe** 里，脚本注入不进去，
  还会停在它自己的 OOBE 引导页 → **不要指望用界面自动化做比对**
- 正确做法：**把它的 CSS/HTML 当规格书读**，提取精确色值/尺寸再在自研代码里实现

**它的 CSS 是分层写的，对齐时必须两边都看**：
| 文件 | 作用 |
|---|---|
| `css/{luna,classic}/modules.css` | 布局与几何（尺寸、边距、圆角、字体） |
| `css/{luna,classic}/blue.css` 等主题文件 | 该主题的**配色覆盖** |
| `css/applayouts.css`（55KB） | 各应用的内部布局 |
| `css/{luna,classic}/controls.css` | 控件（滚动条、按钮、对话框、气泡） |
| `css/scenes.css` | 开机/关机/登录等场景 |
| `css/colors.css` | 调色板变量 |

选择器是**自定义元素名**（`taskbar` / `taskbar startbtn` / `taskbar taskarea task` /
`taskbar trayarea` / `startmenu`），**没有点号前缀**。
注意 `modules.css` 的默认主题其实是 **metallic 银灰**，蓝色是 `blue.css` 覆盖上去的。

已对齐：任务栏背景、托盘区、任务栏按钮（含几何）。
待对齐：窗口标题栏/边框、开始菜单、我的电脑/资源管理器、控件、各应用布局。

## 新增校验：CSS 变量引用 ↔ 定义一致性

改过 `index.css` 的变量或组件里的 `var(--x)` 之后，**务必跑一次集合比对**：
提取 `index.css` 中所有 `--var:` 定义，与各组件里所有 `var(--var)` 引用做差集。
"引用了未定义变量"会让整片样式静默失效，是肉眼最难发现、也最容易被当成
"还原度不够"的一类问题（已踩过：标题栏高光变量）。

**注意：定义来源有两个，不能只看 index.css！**
有些变量的值必须由打包器生成（例如图片 URL `url(...)`），只能从 JS 以 inline style
注入到容器上。这类变量在 `WinXP/index.js` 里以 `'--xxx': value` 的字符串形式出现，
校验时**必须一并算作定义源**，否则会误报成"引用未定义"。
当前这类变量：`--winbtn-close-image` / `--winbtn-max-image` / `--winbtn-min-image`
（窗口按钮的图标位图，随 luna/classic 主题切换）。

## 新增一个应用的模板（6 步，已实践）

以命令提示符为例：
1. 建 `src/WinXP/apps/<Name>/index.js`，组件收 `{ onClose, injectProps }`
2. 需要菜单栏就加 `dropDownData.js`；XP 里没有菜单栏的应用（如 cmd）就不加
3. `apps/index.js` 里 import 组件 + 图标 → 加 `appSettings` 条目 → 加进末尾 export
4. `WinXP/index.js` 的 `onClickMenuItem` 加 `else if` 分支，
   **判断字符串必须与 `FooterMenuData.js` 里的 `text` 完全一致**
5. 窗口图标一律用 `assets/fileIcons/*.png`，**别用 `windowsIcons/svg/` 的巨型 SVG**
6. 要读写虚拟磁盘就 `const { driveRoot, dispatch } = useVfs()`，
   写操作 dispatch `VFS_*` action，数据会自动持久化

## npm 审计与依赖漏洞

- **本机 `npm audit` 不可用**：`~/.npmrc` 指向 `registry.npmmirror.com`，
  该镜像未实现 audit 接口，返回 `404 [NOT_IMPLEMENTED]`。`npm audit fix` 同样跑不了。
- 要审计必须显式换源并走代理（慢，约 4-5 分钟）：
  `env -u HTTPS_PROXY ... HTTPS_PROXY=http://127.0.0.1:<活端口> npm audit --registry=https://registry.npmjs.org`
- **绝对不要用 `npm audit fix --force`**。CRA 5 项目里它对无解的包会返回
  `fixAvailable: {name:"react-scripts", version:"0.0.0", isSemVerMajor:true}` ——
  `0.0.0` 是**不存在的版本**，`--force` 会据此乱装/降级（例如把 `react-app-rewired`
  从 2.2.1 降到 0.1.0），直接搞死构建。正确做法是用**不带 `--force`** 的 `npm audit fix`
  修 `fixAvailable: true` 的那批（本项目实测 56/73 个可这样修）。
- 本项目 73 个漏洞基本都在 react-scripts 5 的构建期依赖树里，不进生产产物；
  剩下 17 个要彻底解决只能迁移构建工具（Vite 等）。

## 推送注意事项

**⚠️ 最重要的约定：只在用户明确说"提交"时才 commit/push。**
项目部署在 EdgeOne，每次 push 都会触发一次构建，而 EdgeOne 有构建次数限制。
自动推送会白烧额度。所以：
- 改完代码留在工作区即可，**不要自动提交**
- 一轮任务做完就停下汇报，不要以"提交推送"收尾
- 用户会明确说"提交"/"推送"来批量处理累积的改动
- 这条**覆盖**项目早期"每次改完直接提交推送"的旧约定

补充技术细节：
- 仓库 `git config` 里写死的代理是 `127.0.0.1:7897`，**该端口会失效**（2026-09-14 当天下午就挂了，
  2026-09-15 晚上直连反而通了）。推送前先探测：
  `curl -s -o /dev/null -w "%{http_code}" -m 6 -x http://127.0.0.1:<port> https://github.com`
  直连有时也可用，可两种都试
- `git push` 报 `SSL_ERROR_SYSCALL` / `Error in the HTTP2 framing layer` /
  `Empty reply from server` **都不代表没推上去**，务必用
  `git ls-remote origin refs/heads/master` 核对远端实际 commit 再下结论
- 重试时加 `-c http.version=HTTP/1.1` 可绕过 HTTP/2 帧层问题
