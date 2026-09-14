/**
 * 虚拟文件系统 —— 持久化
 *
 * 用 localStorage 保存整棵 VFS 树。数据量不大（初始两棵树约 180KB），
 * 序列化足够快；后续若要存大文件再换 IndexedDB。
 *
 * 带版本号：结构变更时 bump VFS_VERSION，老数据自动丢弃重建。
 */

import driveC from './drive_c_system.json';
import driveE from './drive_e_goodies.json';
import { cloneTree } from './tree';

export const VFS_STORAGE_KEY = 'winxp.vfs';
export const VFS_VERSION = 1;

/** 磁盘元信息（磁盘标签、容量等展示用数据，不参与持久化） */
export const DRIVES = [
  {
    id: 'C:',
    label: '本地磁盘 (C:)',
    type: 'drive',
    fileSystem: 'NTFS',
    free: '10.5 GB',
    total: '40.0 GB',
  },
  {
    id: 'E:',
    label: 'XP Goodies (E:)',
    type: 'drive',
    fileSystem: 'CDFS',
  },
];

export function getDriveMeta(id) {
  return DRIVES.find(d => d.id === id);
}

/** 从未修改的初始状态构造 VFS */
export function createInitialVfs() {
  return {
    version: VFS_VERSION,
    drives: {
      'C:': cloneTree(driveC),
      'E:': cloneTree(driveE),
    },
  };
}

export function loadVfs() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return createInitialVfs();
  }
  try {
    const raw = window.localStorage.getItem(VFS_STORAGE_KEY);
    if (!raw) return createInitialVfs();
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      parsed.version !== VFS_VERSION ||
      !parsed.drives ||
      !parsed.drives['C:']
    ) {
      return createInitialVfs();
    }
    return parsed;
  } catch (e) {
    return createInitialVfs();
  }
}

export function saveVfs(vfs) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(VFS_STORAGE_KEY, JSON.stringify(vfs));
  } catch (e) {
    // 配额溢出等异常不应影响使用，静默失败
  }
}

export function clearVfs() {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.removeItem(VFS_STORAGE_KEY);
  } catch (e) {
    /* ignore */
  }
}
