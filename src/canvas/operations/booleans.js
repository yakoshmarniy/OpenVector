import paper from 'paper';

// Group / ungroup and the four boolean path operations (Paper.js does these
// natively). Booleans run on Path/CompoundPath only — text groups and plain
// groups are ignored.

export function groupItems(items) {
  if (!items || items.length < 2) return null;
  return new paper.Group(items.slice()); // reparents items into the group
}

export function ungroupItems(group) {
  if (!group || group.className !== 'Group' || (group.data && group.data.isText)) return null;
  const layer = group.parent;
  const at = group.index;
  const kids = group.removeChildren();
  layer.insertChildren(at, kids);
  group.remove();
  return kids;
}

const BOOL_OPS = ['unite', 'subtract', 'intersect', 'exclude'];

export function booleanOp(items, op) {
  if (!BOOL_OPS.includes(op)) return null;
  const paths = (items || []).filter(
    (it) => it.className === 'Path' || it.className === 'CompoundPath',
  );
  if (paths.length < 2) return null;

  // Bottom-to-top in z-order so "subtract" removes the upper shapes from the
  // bottom-most one (Illustrator's Minus Front).
  paths.sort((a, b) => a.index - b.index);

  let acc = paths[0].clone({ insert: true });
  for (let i = 1; i < paths.length; i += 1) {
    const next = acc[op](paths[i]);
    acc.remove();
    acc = next;
  }
  paths.forEach((p) => p.remove());
  return acc;
}
