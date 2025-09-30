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
  const ADJUSTMENT = 3;
  let adjustment: number;
  switch (mode) {
    case "widen":
      adjustment = ADJUSTMENT;
      break;
    case "narrow":
    default:
      adjustment = -ADJUSTMENT;
      break;
  }

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

  const trapezoidPoints = [
    { point: point1, angle: anglePlus90, length: widthWideSide },
    { point: point1, angle: angleMinus90, length: widthWideSide },
    { point: point2, angle: angleMinus90, length: widthNarrowSide },
    { point: point2, angle: anglePlus90, length: widthNarrowSide },
  ].map(({ point, angle, length }) => buildPoint(point, angle, length));

  // TODO consider how to make this cleaner. the offset calculated afterward is weird

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
    trapezoidPoints[0],
    angle(trapezoidPoints[0], trapezoidPoints[3]),
    offsetFactor("left") * length(trapezoidPoints[0], trapezoidPoints[3]),
  );
  const offsetBorderClockwiseSide = buildPoint(
    trapezoidPoints[1],
    angle(trapezoidPoints[1], trapezoidPoints[2]),
    offsetFactor("right") * length(trapezoidPoints[1], trapezoidPoints[2]),
  );

  return (
    <>
      <polygon points={trapezoidPointsString} fill="var(--bg-color-2)" />
      <line
        x1={offsetBorderCounterClockwiseSide.x}
        y1={offsetBorderCounterClockwiseSide.y}
        x2={trapezoidPoints[3].x}
        y2={trapezoidPoints[3].y}
        stroke="var(--fg-color-2)"
      />
      <line
        x1={offsetBorderClockwiseSide.x}
        y1={offsetBorderClockwiseSide.y}
        x2={trapezoidPoints[2].x}
        y2={trapezoidPoints[2].y}
        stroke="var(--fg-color-2)"
      />
      {currentDepth === 0 && (
        <line
          x1={trapezoidPoints[0].x}
          y1={trapezoidPoints[0].y}
          x2={trapezoidPoints[1].x}
          y2={trapezoidPoints[1].y}
          stroke="var(--fg-color-2)"
        />
      )}
    </>
  );
};
