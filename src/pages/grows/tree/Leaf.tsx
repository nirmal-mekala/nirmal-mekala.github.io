import type { Point } from './types.ts';
import { angle, buildPoint } from './utils.ts';

export const Leaf = (props: { parentAngle: number; point1: Point; point2: Point; size: number }) => {
  const { point1, point2, parentAngle, size } = props;

  const leafLength = (size / 120) * 50;
  const leafWidth = (size / 120) * 25;

  const leafAngle = angle(point1, point2);
  const effectiveAngle = leafAngle === 0 ? parentAngle : leafAngle;
  // TODO consider removing
  const midPoint = buildPoint(point2, effectiveAngle, leafLength / 3);

  const top = buildPoint(midPoint, effectiveAngle, leafLength / 2);
  const bottom = buildPoint(midPoint, effectiveAngle + Math.PI, leafLength / 2);
  const leftControl = buildPoint(midPoint, effectiveAngle - Math.PI / 2, leafWidth);
  const rightControl = buildPoint(midPoint, effectiveAngle + Math.PI / 2, leafWidth);

  const topY = top.y;
  const bottomY = bottom.y;
  const leftControlY = leftControl.y;
  const rightControlY = rightControl.y;

  const pathData = `
    M ${bottom.x},${bottomY}
    C ${leftControl.x},${leftControlY} ${leftControl.x},${leftControlY} ${top.x},${topY}
    C ${rightControl.x},${rightControlY} ${rightControl.x},${rightControlY} ${bottom.x},${bottomY}
    Z
  `;

  return <path d={pathData} fill="var(--fg-color-2)" stroke="var(--bg-color-1)" />;
};
