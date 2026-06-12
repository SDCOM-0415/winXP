import driveC from './drive_c_system.json';
import driveE from './drive_e_goodies.json';

const iconContext = require.context('assets/fileIcons', false, /\.(png|svg)$/);

const iconMap = iconContext.keys().reduce((acc, key) => {
  const name = key.replace(/^\.\//, '');
  acc[name] = iconContext(key);
  return acc;
}, {});

export function resolveIcon(iconName, type) {
  if (iconName && iconMap[iconName]) return iconMap[iconName];
  if (type === 'directory') return iconMap['folder.png'];
  if (type === 'drive') return iconMap['drive.png'] || iconMap['folder.png'];
  return iconMap['default.png'] || iconMap['folder.png'];
}

export const drives = [
  {
    id: 'C:',
    label: '本地磁盘 (C:)',
    type: 'drive',
    fileSystem: 'NTFS',
    free: '10.5 GB',
    total: '40.0 GB',
    root: driveC,
  },
  {
    id: 'E:',
    label: 'XP Goodies (E:)',
    type: 'drive',
    fileSystem: 'CDFS',
    root: driveE,
  },
];

export function getDriveById(id) {
  return drives.find(d => d.id === id);
}

export function getNodeByPath(driveId, segments) {
  const drive = getDriveById(driveId);
  if (!drive) return null;
  let node = drive.root;
  for (const seg of segments) {
    if (!node || node.type !== 'directory' || !node.contents) return null;
    node = node.contents[seg];
  }
  return node;
}

export function listChildren(node) {
  if (!node || node.type !== 'directory' || !node.contents) return [];
  return Object.keys(node.contents)
    .map(name => ({
      name,
      node: node.contents[name],
    }))
    .sort((a, b) => {
      const ad = a.node.type === 'directory' ? 0 : 1;
      const bd = b.node.type === 'directory' ? 0 : 1;
      if (ad !== bd) return ad - bd;
      return a.name.localeCompare(b.name);
    });
}
