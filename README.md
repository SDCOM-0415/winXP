# WinXP

基于 Web 的 Windows XP 桌面复刻项目，使用 React 构建。

## 支持功能特性

- [x] 开机、关机、重启、用户选择界面
- [x] 窗口拖拽、缩放、最小化、最大化与层级管理
- [x] 通过桌面图标或开始菜单打开应用程序
- [x] 任务栏程序窗口按钮固定宽度与排版优化（对齐 Luna 经典版）
- [x] Windows XP右键菜单
- [x] 任务栏左侧及空白区右键菜单支持与显示桌面功能化
- [x] 扫雷
- [x] Internet Explorer
- [x] 我的电脑
- [x] 磁盘/C盘打开
- [x] 记事本
- [x] Winamp
- [x] 画图
- [x] 大包体积 Webamp 动态懒加载分包优化
- [x] 页面资源请求防缓存（自动追加构建时间戳）
- [x] 开始菜单和控制台报错防御
- [x] 经典 Windows XP 界面风格还原
- [x] 关于Windows
- [x] 右键菜单刷新功能
- [x] 右键新建文本/文件夹
- [x] 右键打开应用
- [x] 虚拟文件系统可写 + 刷新后持久化（新建 / 写入 / 删除 / 重命名）
- [x] 记事本读写虚拟磁盘（新建 / 打开 / 保存 / 另存为）
- [x] Luna ↔ Windows 经典双主题切换（桌面右键 → 属性）
- [x] 屏幕保护程序（三维星空 / 气泡 / 字幕）
- [x] 任务栏 24 小时制时钟与真实托盘（音量 / 网络 / 安全中心）
- [x] 壁纸本地化，去除外链依赖
- [ ] 任务管理器
- [ ] 右键排列图标
- [ ] 更多系统原生软件支持
- [ ] 3D 弹球（3D Pinball Space Cadet）

## 访问地址

👉 <https://winxp.sdcom.top>

[![演示](demo/demo.gif)](https://winxp.sdcom.top)

## 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm start

# 构建生产版本
npm run build
```

## 参与贡献

在提交 Pull Request 之前，请先创建 Issue 或在已有 Issue 中讨论。

## 许可声明

Windows XP 的名称、界面设计和商标均为 Microsoft 所有。本项目仅供学习交流使用，与 Microsoft 无关联，亦未经 Microsoft 认可或授权。

## 致谢

- [Webamp](https://github.com/captbaritone/webamp) — Winamp 2 的 Web 复刻，作者：[captbaritone](https://github.com/captbaritone)
- [JS Paint](https://github.com/1j01/jspaint) — 画图的 Web 复刻，作者：[1j01](https://github.com/1j01)

