import type { Point, BranchOrigin, BranchOrientation } from "./types.ts";
import {
  angle,
  length,
  buildPoint,
  pointsToSvgPolygonString,
} from "./utils.ts";

const branchWidth = (
  size: number,
  currentDepth: number,
  mode: "widen" | "narrow",
) => {
  // TODO rename
  const trapezoidalAdjustment = () => {
    const ADJUSTMENT = 3;
    return mode === "widen" ? ADJUSTMENT : -ADJUSTMENT;
  };
  const adjustment = trapezoidalAdjustment();
  const baseSize = size / 4 - currentDepth * 7;
  if (baseSize < 0) {
    return 0.5;
  }
  return baseSize + adjustment;
};

export const Limb = (props: {
  point1: Point;
  point2: Point;
  currentDepth: number;
  size: number;
  treeDepth: number;
  branchOrigin: BranchOrigin;
  branchOrientation: BranchOrientation;
}) => {
  const {
    point1,
    point2,
    currentDepth,
    size,
    branchOrigin,
    branchOrientation,
  } = props;

  const angleVal = angle(point1, point2);
  if (point1.x === point2.x && point1.y === point2.y) {
    return null;
  }

  const widthWideSide = branchWidth(size, currentDepth, "widen");
  const widthNarrowSide = branchWidth(size, currentDepth, "narrow");
  const anglePlus90 = angleVal + Math.PI / 2;
  const angleMinus90 = angleVal - Math.PI / 2;

  const limbPoint1 = buildPoint(point1, anglePlus90, widthWideSide);
  const limbPoint2 = buildPoint(point1, angleMinus90, widthWideSide);
  const limbPoint3 = buildPoint(point2, angleMinus90, widthNarrowSide);
  const limbPoint4 = buildPoint(point2, anglePlus90, widthNarrowSide);

  const trapezoidPoints = [limbPoint1, limbPoint2, limbPoint3, limbPoint4];
  const trapezoidPointsString = pointsToSvgPolygonString(trapezoidPoints);

  const offsetFactor = (border: "left" | "right") => {
    const trunkFacing =
      (border === "left" && branchOrientation === "right") ||
      (border === "right" && branchOrientation === "left");

    if (currentDepth === 0) {
      return 0;
    }
    let offsetFactor = 0.3 - (0.25 * size) / 120;
    if (trunkFacing) {
      offsetFactor += 0.2;
    }
    if (branchOrigin === "trunk") {
      offsetFactor += 0.125;
    }
    return offsetFactor;
  };

  const offsetBorderCounterClockwiseSide = buildPoint(
    limbPoint1,
    angle(limbPoint1, limbPoint4),
    offsetFactor("left") * length(limbPoint1, limbPoint4),
  );
  const offsetBorderClockwiseSide = buildPoint(
    limbPoint2,
    angle(limbPoint2, limbPoint3),
    offsetFactor("right") * length(limbPoint2, limbPoint3),
  );

  return (
    <>
      <polygon points={trapezoidPointsString} fill="var(--bg-color-1)" />
      <line
        x1={offsetBorderCounterClockwiseSide.x}
        y1={offsetBorderCounterClockwiseSide.y}
        x2={limbPoint4.x}
        y2={limbPoint4.y}
        stroke="var(--fg-color-2)"
      />
      <line
        x1={offsetBorderClockwiseSide.x}
        y1={offsetBorderClockwiseSide.y}
        x2={limbPoint3.x}
        y2={limbPoint3.y}
        stroke="var(--fg-color-2)"
      />
    </>
  );
};
