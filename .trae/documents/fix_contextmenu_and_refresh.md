# 计划：补齐刷新功能 + 修正任务栏/开始按钮右键菜单

## 一、当前状态分析

### 刷新功能
- 桌面右键菜单中"刷新"条目存在，但 `onClick` 未绑定任何处理器（元素未添加 `onClick`）
- `FOCUS_DESKTOP` action 会重置所有图标焦点，可复用为"刷新"的视觉效果（无文件系统，重新聚焦桌面即可）

### 任务栏任务按钮（FooterWindowWithMenu）右键菜单
**当前实现**：所有菜单项都是 `className="disabled"`，没有任何可操作项。  
**参考网站**：还原、最小化、最大化、关闭均可点击，且根据窗口当前状态动态 disable（如已最小化则"最小化"禁用，已最大化则"最大化"禁用）。  
`FooterWindowWithMenu` 只接收 `id/icon/title/onMouseDown/isFocus`，缺少操作窗口所需的回调（`onClose/onMinimize/onMaximize/onRestore`）。

### 任务栏空白区域右键菜单
**当前实现**：位于 `footer__items right`（系统托盘区域），菜单项全部 `disabled`。  
**参考网站**：`taskarea`（任务按钮区域）上才有任务栏右键菜单，"显示桌面"可点击。

### 开始按钮右键菜单
**当前实现**：打开、资源管理器、搜索... 全部 `disabled`。  
**参考网站**：仅"探索"、"搜索"、"Share on" 以及 "Open All Users"/"Explore All Users" 是 disabled，**Properties（属性）** 可点击（打开开始菜单属性）。本项目无 startprops 应用，该项保持 disabled 即可，其余结构需与参考网站对齐。

---

## 二、需要修改的文件和具体内容

### 1. `src/WinXP/index.js` — 桌面刷新

**修改位置**：`<contextmenu data-desktop-menu>` 中的"刷新" `<li>`

**修改内容**：给"刷新"条目添加 `onClick`，执行 `dispatch({ type: FOCUS_DESKTOP })`（重置图标焦点状态，与参考网站的 `setupDesktop()` 效果等价）：

```jsx
// 修改前
<li className="disabled">刷新</li>

// 修改后
<li onClick={() => dispatch({ type: FOCUS_DESKTOP })}>刷新</li>
```

---

### 2. `src/WinXP/Footer/index.js` — 任务栏三处修改

#### 2a. `FooterWindowWithMenu` 组件 — 任务按钮右键菜单功能化

**修改内容**：
- 组件接收额外 props：`onClose`、`onMinimize`、`onMaximize`、`minimized`、`maximized`
- 右键菜单根据窗口状态动态 disable：
  - `minimized=true` → "最小化"禁用，"还原"可点击
  - `maximized=true` → "最大化"禁用，"还原"可点击
  - 否则 → "还原"禁用，"最小化"/"最大化"可点击
  - "关闭"始终可点击

```jsx
function FooterWindowWithMenu({ id, icon, title, onMouseDown, isFocus,
  onClose, onMinimize, onMaximize, minimized, maximized }) {
  return (
    <div data-contextmenu>
      <contextmenu>
        <ul>
          <li className={!minimized && !maximized ? 'disabled' : ''}
            onClick={() => !minimized && !maximized ? null : onMaximize(id)}>还原</li>
          <li className="disabled">移动</li>
          <li className="disabled">大小</li>
          <li className={minimized ? 'disabled' : ''} onClick={() => !minimized && onMinimize(id)}>最小化</li>
          <li className={maximized ? 'disabled' : ''} onClick={() => !maximized && onMaximize(id)}>最大化</li>
          <li className="divider" />
          <li onClick={() => onClose(id)}>关闭</li>
        </ul>
      </contextmenu>
      <div onMouseDown={_onMouseDown} className={`footer__window ${isFocus ? 'focus' : 'cover'}`}>
        <img className="footer__icon" src={icon} alt={title} />
        <div className="footer__text">{title}</div>
      </div>
    </div>
  );
}
```

#### 2b. `Footer` 组件 — 向 `FooterWindowWithMenu` 传递操作回调

`Footer` 组件本身没有 `onClose/onMinimize/onMaximize` 回调，需要从外部 props 传入。

**Footer 新增 props**：`onCloseApp`、`onMinimizeApp`、`onMaximizeApp`

```jsx
function Footer({ ..., onCloseApp, onMinimizeApp, onMaximizeApp }) {
  // 渲染时传入
  <FooterWindowWithMenu
    ...
    onClose={onCloseApp}
    onMinimize={onMinimizeApp}
    onMaximize={onMaximizeApp}
    minimized={app.minimized}
    maximized={app.maximized}
  />
}
```

#### 2c. 任务栏右键菜单区域移动 + "显示桌面"功能化

**当前问题**：右键菜单挂在 `footer__items right`（托盘区域），参考网站挂在 `taskarea`（任务按钮区域）。

**修改内容**：
- 把 `data-contextmenu` 从 `footer__items right` 移到 `footer__items left`（任务按钮区）
- `footer__items right` 的 `data-contextmenu` 保留，但将"显示桌面"改为可点击（通过 postMessage 或直接 dispatch）
- "显示桌面"：最小化所有已打开的窗口 → 需要从 Footer 外部传入 `onShowDesktop` 回调

实际上参考网站 `taskarea` 对应本项目的 `footer__items left`（任务按钮所在区域），修改如下：

```jsx
// footer__items left 添加 data-contextmenu 和 contextmenu 标签
<div className="footer__items left" data-contextmenu>
  <contextmenu>
    <ul>
      <li className="submenuholder disabled">工具栏...</li>
      <li className="divider" />
      <li className="disabled">层叠窗口</li>
      <li className="disabled">横向平铺窗口</li>
      <li className="disabled">纵向平铺窗口</li>
      <li onClick={onShowDesktop}>显示桌面</li>
      <li className="divider" />
      <li className="disabled">任务管理器</li>
      <li className="divider" />
      <li className="disabled">锁定任务栏</li>
      <li className="disabled">属性</li>
    </ul>
  </contextmenu>
  ...
```

#### 2d. 开始按钮右键菜单对齐参考网站

**修改内容**：与参考网站结构一致，增加"Open All Users"/"Explore All Users"两项（disabled）：

```jsx
<contextmenu>
  <ul>
    <li className="disabled">打开</li>
    <li className="disabled">资源管理器</li>
    <li className="disabled">搜索...</li>
    <li className="divider" />
    <li className="disabled">属性</li>
    <li className="divider" />
    <li className="disabled">打开所有用户</li>
    <li className="disabled">资源管理器（所有用户）</li>
  </ul>
</contextmenu>
```

---

### 3. `src/WinXP/index.js` — 向 Footer 传递新回调

Footer 新增了 `onCloseApp`、`onMinimizeApp`、`onMaximizeApp`、`onShowDesktop` 四个 props，需要在 `WinXP/index.js` 的 `<Footer>` 调用处补充：

```jsx
<Footer
  ...
  onCloseApp={onCloseApp}          // 已有
  onMinimizeApp={onMinimizeWindow} // 已有
  onMaximizeApp={onMaximizeWindow} // 已有
  onShowDesktop={() => dispatch({ type: MINIMIZE_ALL })} // 新增（或复用已有逻辑）
/>
```

> **注意**：需确认 `onCloseApp`/`onMinimizeWindow`/`onMaximizeWindow` 在 `index.js` 中的实际函数名。探索结果显示为 `onCloseApp`、`onMinimizeWindow`、`onMaximizeWindow`，与此一致。

---

## 三、假设与决策

| 项目 | 决策 |
|---|---|
| "刷新"的效果 | 只做 `dispatch(FOCUS_DESKTOP)`，重置图标焦点，无文件系统刷新 |
| "还原"的行为 | 对已最大化窗口：调用 `onMaximize`（toggle）；对已最小化：调用 `onMinimize`（toggle） |
| "显示桌面" | 最小化所有打开窗口，复用现有 `onMinimizeWindow` 批量调用 |
| startprops | 本项目无此应用，"属性"保持 disabled |
| 任务栏中"工具栏" | 全部 disabled，与参考网站未实现项一致 |

---

## 四、验证步骤

1. `npm run build` — 0 错误 0 警告
2. 右键桌面空白区 → 点击"刷新" → 桌面图标焦点清除
3. 右键任务栏任务按钮 → "最小化"/"关闭"可点击正常工作
4. 右键任务栏左侧空白 → 菜单出现，"显示桌面"可点击
5. 右键开始按钮 → 显示包含"打开所有用户"/"资源管理器（所有用户）"的菜单
