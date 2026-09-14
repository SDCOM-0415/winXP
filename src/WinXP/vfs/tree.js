/**
 * 虚拟文件系统 —— 纯函数树操作
 *
 * 节点结构：
 *   directory: { type: 'directory', icon?, metadata?, contents: { [name]: node } }
 *   file:      { type: 'file', icon?, contents: string | object, modified? }
 *
 * 所有写操作都是不可变的：返回新树，不改原树。
 * 这样 reducer 可以直接做 state 替换，配合 localStorage 持久化。
 */

export function cloneTree(node) {
  return JSON.parse(JSON.stringify(node));
}

/** 按路径段取节点；segments 为空数组时返回根节点 */
export function getNode(root, segments = []) {
  let node = root;
  for (const seg of segments) {
    if (!node || node.type !== 'directory' || !node.contents) return null;
    node = node.contents[seg];
    if (!node) return null;
  }
  return node;
}

/**
 * 在指定路径上做不可变更新。
 * segments 指向要修改的那个目录；updater(dirNode) 返回新的目录节点。
 */
export function updateNodeAt(root, segments, updater) {
  if (!segments.length) return updater(root);
  const [head, ...rest] = segments;
  if (!root || !root.contents || !(head in root.contents)) return root;
  return {
    ...root,
    contents: {
      ...root.contents,
      [head]: updateNodeAt(root.contents[head], rest, updater),
    },
  };
}

/** 目录直接子项列表，文件夹在前，然后按名称排序 */
export function listChildren(node) {
  if (!node || node.type !== 'directory' || !node.contents) return [];
  return Object.keys(node.contents)
    .map(name => ({ name, node: node.contents[name] }))
    .sort((a, b) => {
      const ad = a.node.type === 'directory' ? 0 : 1;
      const bd = b.node.type === 'directory' ? 0 : 1;
      if (ad !== bd) return ad - bd;
      return a.name.localeCompare(b.name, 'zh-Hans-CN');
    });
}

/** 文件名是否已存在（Windows 同目录不区分大小写） */
export function nameExists(node, name) {
  if (!node || !node.contents) return false;
  const lower = String(name).toLowerCase();
  return Object.keys(node.contents).some(k => k.toLowerCase() === lower);
}

/**
 * 生成不冲突的文件名。
 * base='新建文件夹' → 新建文件夹 (2) / (3) ...
 * 带扩展名时编号插在扩展名之前。
 */
export function uniqueName(node, base, ext = '') {
  const build = n => `${base}${n > 1 ? ` (${n})` : ''}${ext}`;
  if (!nameExists(node, build(1))) return build(1);
  let n = 2;
  while (nameExists(node, build(n)) && n < 10000) n += 1;
  return build(n);
}

/** 新建文件夹 */
export function createFolder(root, segments, name) {
  return updateNodeAt(root, segments, dir => ({
    ...dir,
    contents: {
      ...dir.contents,
      [name]: { type: 'directory', icon: 'folder.png', contents: {} },
    },
  }));
}

/** 新建文件（默认空文本文档） */
export function createFile(
  root,
  segments,
  name,
  { content = '', icon = 'text.png' } = {},
) {
  return updateNodeAt(root, segments, dir => ({
    ...dir,
    contents: {
      ...dir.contents,
      [name]: { type: 'file', icon, contents: content, modified: Date.now() },
    },
  }));
}

/** 写入/覆盖文件内容；文件不存在则创建 */
export function writeFile(root, segments, name, content) {
  return updateNodeAt(root, segments, dir => {
    const existing = dir.contents?.[name];
    return {
      ...dir,
      contents: {
        ...dir.contents,
        [name]: existing
          ? { ...existing, contents: content, modified: Date.now() }
          : {
              type: 'file',
              icon: 'text.png',
              contents: content,
              modified: Date.now(),
            },
      },
    };
  });
}

/** 删除条目 */
export function deleteEntry(root, segments, name) {
  return updateNodeAt(root, segments, dir => {
    if (!dir.contents || !(name in dir.contents)) return dir;
    const contents = { ...dir.contents };
    delete contents[name];
    return { ...dir, contents };
  });
}

/** 重命名条目 */
export function renameEntry(root, segments, oldName, newName) {
  return updateNodeAt(root, segments, dir => {
    if (!dir.contents || !(oldName in dir.contents)) return dir;
    const contents = {};
    Object.keys(dir.contents).forEach(key => {
      contents[key === oldName ? newName : key] = dir.contents[key];
    });
    return { ...dir, contents };
  });
}

/** 判断文件内容是否是可编辑的纯文本（对象型 contents 是历史遗留的 action 脚本，不可编辑） */
export function isEditableText(node) {
  return !!node && node.type === 'file' && typeof node.contents === 'string';
}

/** 人类可读的大小，用于"详细信息"面板 */
export function nodeSize(node) {
  if (!node) return '';
  if (node.type === 'directory') {
    return `${Object.keys(node.contents || {}).length} 个项目`;
  }
  const raw = typeof node.contents === 'string' ? node.contents : '';
  const bytes = raw.length;
  if (bytes < 1024) return `${bytes} 字节`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

/** 按文件扩展名推测图标名（兜底 default.png） */
const EXT_ICON = {
  txt: 'text.png',
  log: 'text.png',
  ini: 'config.png',
  exe: 'defaultapp.png',
  dll: 'dll.png',
  lnk: 'shortcut.png',
  jpg: 'jpg.png',
  jpeg: 'jpg.png',
  png: 'jpg.png',
  bmp: 'bmp.png',
  gif: 'gif.png',
  zip: 'zip.png',
  hlp: 'help.png',
};

export function iconForFileName(name) {
  const dot = String(name).lastIndexOf('.');
  if (dot < 0) return null;
  return EXT_ICON[name.slice(dot + 1).toLowerCase()] || null;
}

/** 格式化修改时间 */
export function formatDate(ts) {
  const d = ts ? new Date(ts) : new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}/${p(d.getMonth() + 1)}/${p(d.getDate())} ${p(
    d.getHours(),
  )}:${p(d.getMinutes())}`;
}
