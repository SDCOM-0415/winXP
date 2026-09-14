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
