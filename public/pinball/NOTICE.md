# 三维弹球 — 第三方组件说明

本目录下的 `3DPinballSpaceCadet.js` **不是本项目（winXP）的代码**，
而是第三方开源项目的编译产物。特此说明来源与许可，以符合其署名要求。

## 上游

| 项 | 内容 |
|---|---|
| 项目 | **SpaceCadetPinball** |
| 仓库 | https://github.com/k4zmu2a/SpaceCadetPinball |
| 性质 | 微软《3D Pinball for Windows - Space Cadet》的**反编译重写** |
| 网页版 | 由 **alula** 用 Emscripten 编译为 WebAssembly |
| 原版版权 | Original game by Cinematronics, Microsoft |

从该 WASM 二进制中可直接读出的相关字符串（用于核对来源）：

```
Project home: https://github.com/k4zmu2a/SpaceCadetPinball
Original game by Cinematronics, Microsoft
3D Pinball for Windows - Space Cadet
```

## 许可

上游项目属 **GPL 家族许可**，与本项目主体的 MIT 许可**不一致**。

本目录中的该文件按「独立组件」对待：

- 它是一份完整、未经修改的上游编译产物，作为静态资源独立分发
- 本项目的 MIT 许可**不覆盖**该文件；该文件的许可条款以其上游为准
- 若你需要以其它方式再分发本项目，请自行确认该组件的合规性

## 文件构成

`3DPinballSpaceCadet.js` 约 9.4MB，内容为：

1. `WASM_FILE` — Emscripten 编译出的 WebAssembly，以 base64 data URL 内联（解码后约 4.33MB）
2. `DATA_FILE` — 游戏音频数据，同样以 base64 内联
3. Emscripten 加载器代码，加载完毕后自动执行 `run()`

**它是自包含的**：游戏数据（`PINBALL.DAT`）由 Emscripten `--preload-file` 打入，
运行时不需再下载额外文件。

## 本目录中属于本项目的文件

| 文件 | 来源 |
|---|---|
| `index.html` | **本项目自己写的宿主页面**，只使用 Emscripten 的标准 `Module` 约定 |
| `splash.png` | 启动图（取自参考实现，媒体素材） |
| `bg.mp3` | 背景音乐（取自参考实现，媒体素材） |

## 为什么放在 `public/` 而不是 `src/assets/`

CRA 会把 `public/` 下的文件原样拷贝进构建产物、**不参与打包**。
这样这 9.4MB 只在用户真正打开三维弹球时才被请求，
不会进主 JS bundle、不影响首屏。
