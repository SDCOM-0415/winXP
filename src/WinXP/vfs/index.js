/**
 * 虚拟文件系统 —— 统一入口
 *
 * 对外暴露：
 *   - 树操作纯函数（tree.js）
 *   - 持久化（storage.js）
 *   - resolveIcon：把节点上的 icon 文件名解析成可用的图片 URL
 *   - VfsContext / useVfs：让各个应用读写 VFS，不必层层传 props
 */

import React, { createContext, useContext } from 'react';

export * from './tree';
export * from './storage';

// fileIcons 是扁平目录，用 require.context 自动收集，新增图标无需改代码
const iconContext = require.context(
  'assets/fileIcons',
  false,
  /\.(png|svg|jpg|jpeg|gif|ico)$/,
);

const iconMap = iconContext.keys().reduce((acc, key) => {
  const name = key.replace(/^\.\//, '');
  acc[name] = iconContext(key);
  return acc;
}, {});

export function getIcon(name) {
  return name ? iconMap[name] : undefined;
}

export function resolveIcon(iconName, type) {
  if (iconName && iconMap[iconName]) return iconMap[iconName];
  if (type === 'directory') return iconMap['folder.png'];
  if (type === 'drive') return iconMap['drive.png'] || iconMap['folder.png'];
  return iconMap['default.png'] || iconMap['folder.png'];
}

/**
 * 图片资源。VFS 里的图片节点把资源路径存在 contents 上
 * （例如 "res/pictures/bluehills.jpg" 或 "vfs/E/xxx/a.jpg"），
 * 但 webpack 生成的 URL 带内容哈希、无法写死在 JSON 里，
 * 所以同样用 require.context 建表，运行时按路径反查。
 * 递归收集，新增图片目录无需改代码。
 */
const pictureContext = require.context(
  'assets/pictures',
  true,
  /\.(png|svg|jpg|jpeg|gif|bmp|webp|ico)$/,
);

const pictureMap = pictureContext.keys().reduce((acc, key) => {
  const rel = key.replace(/^\.\//, '');
  acc[rel] = pictureContext(key);
  return acc;
}, {});

/** 按文件名（不含目录）建索引，用于路径写法与存储写法不一致时的兜底匹配 */
const pictureByName = Object.keys(pictureMap).reduce((acc, rel) => {
  const base = rel.slice(rel.lastIndexOf('/') + 1).toLowerCase();
  if (!acc[base]) acc[base] = pictureMap[rel];
  return acc;
}, {});

const IMAGE_EXT = /\.(png|svg|jpg|jpeg|gif|bmp|webp|ico)$/i;

/** 判断某个文件名是不是图片（用于决定用图片查看器还是记事本打开） */
export function isImageName(name) {
  return IMAGE_EXT.test(String(name || ''));
}

/**
 * 把 VFS 节点上的 contents 解析成可用的图片 URL。
 * 支持三种写法：data: URL、http(s) 绝对地址、项目内资源路径。
 * 解析不到时返回 null，交由调用方显示占位提示，不伪造图片。
 */
export function resolvePicture(contents) {
  if (typeof contents !== 'string' || !contents) return null;
  if (/^(data:|https?:)/i.test(contents)) return contents;

  const normalized = contents.replace(/\\/g, '/').replace(/^\.?\//, '');
  if (pictureMap[normalized]) return pictureMap[normalized];

  // 存储路径可能带 res/pictures、vfs/E 之类的前缀，按文件名兜底
  const base = normalized.slice(normalized.lastIndexOf('/') + 1).toLowerCase();
  return pictureByName[base] || null;
}

/** 列出图片表里所有的相对路径（用于图片查看器的"浏览全部"） */
export function listPictures() {
  return Object.keys(pictureMap).map(rel => ({
    path: rel,
    name: rel.slice(rel.lastIndexOf('/') + 1),
    url: pictureMap[rel],
  }));
}

export const VfsContext = createContext(null);

export function VfsProvider({ value, children }) {
  return <VfsContext.Provider value={value}>{children}</VfsContext.Provider>;
}

/**
 * 在应用组件里取 VFS。
 * 返回 { vfs, driveRoot, actions }，由 WinXP/index.js 注入。
 */
export function useVfs() {
  const ctx = useContext(VfsContext);
  if (!ctx) {
    throw new Error('useVfs 必须在 <VfsProvider> 内使用');
  }
  return ctx;
}
