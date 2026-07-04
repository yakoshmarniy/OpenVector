import paper from 'paper';
import { clearArrowheads } from './arrowheads.js';

// Compound Path Make / Release (Object > Compound Path). A compound path
// renders its children with one style and the even-odd rule, so fully
// enclosed sub-paths punch holes.

const isPathLike = (it) => it.className === 'Path' || it.className === 'CompoundPath';

/**
 * Combine the selected paths into one CompoundPath. Appearance comes from the
 * bottom-most path (Illustrator's rule); the compound lands where the
 * front-most one sat. Returns the compound, or null if fewer than two paths.
 */
export function makeCompoundPath(items) {
  const paths = (items || []).filter(isPathLike);
  if (paths.length < 2) return null;
  paths.sort((a, b) => a.index - b.index);
  const bottom = paths[0];
  const parent = paths[paths.length - 1].parent;
  const style = {
    fillColor: bottom.fillColor,
    strokeColor: bottom.strokeColor,
    strokeWidth: bottom.strokeWidth,
    strokeCap: bottom.strokeCap,
    strokeJoin: bottom.strokeJoin,
    dashArray: bottom.dashArray,
    opacity: bottom.opacity,
  };

  const kids = [];
  paths.forEach((p) => {
    clearArrowheads(p);
    p.data = {};
    if (p.className === 'CompoundPath') kids.push(...p.removeChildren());
    else kids.push(p);
  });

  const cp = new paper.CompoundPath({ children: kids, fillRule: 'evenodd' });
  cp.fillColor = style.fillColor;
  cp.strokeColor = style.strokeColor;
  cp.strokeWidth = style.strokeWidth;
  cp.strokeCap = style.strokeCap;
  cp.strokeJoin = style.strokeJoin;
  cp.dashArray = style.dashArray;
  cp.opacity = style.opacity;
  if (parent) parent.addChild(cp);

  // Emptied source compounds are husks now.
  paths.forEach((p) => {
    if (p.className === 'CompoundPath') p.remove();
  });
  return cp;
}

/**
 * Split a CompoundPath back into its member paths (each keeps the compound's
 * style, holes become plain filled shapes). Returns the paths, or null.
 */
export function releaseCompoundPath(item) {
  if (!item || item.className !== 'CompoundPath') return null;
  const parent = item.parent;
  const at = item.index;
  const style = {
    fillColor: item.fillColor,
    strokeColor: item.strokeColor,
    strokeWidth: item.strokeWidth,
    strokeCap: item.strokeCap,
    strokeJoin: item.strokeJoin,
    dashArray: item.dashArray,
    opacity: item.opacity,
  };
  const kids = item.removeChildren();
  kids.forEach((k) => {
    k.fillColor = style.fillColor;
    k.strokeColor = style.strokeColor;
    k.strokeWidth = style.strokeWidth;
    k.strokeCap = style.strokeCap;
    k.strokeJoin = style.strokeJoin;
    k.dashArray = style.dashArray;
    k.opacity = style.opacity;
  });
  parent.insertChildren(at, kids);
  item.remove();
  return kids;
}
