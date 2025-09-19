import type { Point } from "./types.ts";
import { angle, length, buildPoint } from "./utils.ts";
import type { BranchConfig, BranchOrigin, BranchOrientation } from "./types.ts";
import { Leaf } from "./Leaf.tsx";
import { Limb } from "./Limb.tsx";

const nextLimbPoints = (
  point1: Point,
  point2: Point,
  // TODO unrelated but astro-ish refactor of redirect
  // TODO - consider sending the obj again, this is verbose...
  depth: BranchConfig["depth"],
  size: BranchConfig["size"],
  rawDepth: BranchConfig["rawDepth"],
  currentDepth: number,
): Array<{
  points: Array<Point>;
  branchOrigin: BranchOrigin;
  branchOrientation: BranchOrientation;
}> => {
  // TODO consider explaining these values
  const BASE_ANGLE_SPREAD = Math.PI / 6;
  const ANGLE_SPREAD_OFFSET_MAX = Math.PI / 6;

  const prevLimbAngle = angle(point1, point2);
  const prevLimbLength = length(point1, point2);
  const halfwayPoint = buildPoint(point1, prevLimbAngle, prevLimbLength / 2);
  // TODO this is very grug; refactor
  const progressToNextDepth = rawDepth - depth;

  const angleSpreadOffset = () => {
    const angleOffset = ANGLE_SPREAD_OFFSET_MAX * progressToNextDepth;
    if (currentDepth === depth - 2) {
      return angleOffset;
    }
    return ANGLE_SPREAD_OFFSET_MAX;
  };
  const newBranchAngleSpread = BASE_ANGLE_SPREAD + angleSpreadOffset();

  // TODO refactor the length logic. ideally it will be dynamic based on many factors...
  //      dynamic here... just to be monkeyed with later is not ideal
  const lengthMultiplier = () => {
    let max: number;
    // TODO comment explaining...
    if (currentDepth === 1) {
      max = 0.75;
    } else {
      max = 0.5;
    }

    // TODO desserves a comment to explain depth minus 2
    //      also needs an explanation of 0.5
    //      also duplicated below
    if (currentDepth === depth - 2) {
      return max * progressToNextDepth;
    }
    return max;
  };
  const newLimbLengthBase = prevLimbLength * lengthMultiplier();
  // TODO magic #
  const newMiddleLimbLength =
    (newLimbLengthBase * 0.85 * Math.pow(size, 3)) / Math.pow(120, 3);
  const newTipLimbLength = (newLimbLengthBase * size * 0.95) / 120;

  const newLimbParams: Array<{
    angle: number;
    basePoint: Point;
    length: number;
    includeOnlyForDepths?: Array<number>;
    branchOrigin: BranchOrigin;
    branchOrientation: BranchOrientation;
  }> = [
    {
      angle: prevLimbAngle,
      basePoint: point2,
      length: newLimbLengthBase,
      branchOrigin: "tip",
      branchOrientation: "center",
    },
    {
      angle: prevLimbAngle - newBranchAngleSpread,
      basePoint: point2,
      length: newTipLimbLength,
      branchOrigin: "tip",
      branchOrientation: "right",
    },
    {
      angle: prevLimbAngle + newBranchAngleSpread,
      basePoint: point2,
      length: newTipLimbLength,
      branchOrigin: "tip",
      branchOrientation: "left",
    },
    {
      angle: prevLimbAngle - newBranchAngleSpread,
      basePoint: halfwayPoint,
      length: newMiddleLimbLength,
      includeOnlyForDepths: [0],
      branchOrigin: "trunk",
      branchOrientation: "right",
    },
    {
      angle: prevLimbAngle + newBranchAngleSpread,
      basePoint: halfwayPoint,
      length: newMiddleLimbLength,
      includeOnlyForDepths: [0],
      branchOrigin: "trunk",
      branchOrientation: "left",
    },
  ];

  const newLimbs = newLimbParams
    .map(
      ({
        angle,
        basePoint,
        length,
        includeOnlyForDepths,
        branchOrientation,
        branchOrigin,
      }) => {
        const renderBranch =
          includeOnlyForDepths === undefined ||
          includeOnlyForDepths?.includes(currentDepth);
        return renderBranch
          ? {
              branchOrigin,
              branchOrientation,
              points: [basePoint, buildPoint(basePoint, angle, length)],
            }
          : null;
      },
    )
    .filter((v) => v !== null);

  return newLimbs;
};

export const Branch = (props: {
  currentDepth: number;
  branchNumber: number;
  parentPoints: Point[];
  point1: Point;
  point2: Point;
  treeDepth: BranchConfig["depth"];
  size: BranchConfig["size"];
  rawDepth: BranchConfig["rawDepth"];
  containerHeight: number;
  branchOrientation: BranchOrientation;
  branchOrigin: BranchOrigin;
}) => {
  const {
    currentDepth,
    branchNumber,
    point1,
    point2,
    treeDepth,
    size,
    rawDepth,
    containerHeight,
    parentPoints,
    branchOrientation,
    branchOrigin,
  } = props;

  // TODO little weird that we never hit treeDepth. always one less...
  if (currentDepth >= treeDepth) {
    return null;
  }

  const pointData = nextLimbPoints(
    point1,
    point2,
    treeDepth,
    size,
    rawDepth,
    currentDepth,
  );

  return (
    <>
      <Limb
        size={size}
        currentDepth={currentDepth}
        treeDepth={treeDepth}
        point1={point1}
        point2={point2}
        containerHeight={containerHeight}
        branchOrigin={branchOrigin}
        branchOrientation={branchOrientation}
      />
      {pointData.map((nextLimbPointData, index) => {
        return (
          <Branch
            key={`${currentDepth}-${branchNumber}-${index}`}
            parentPoints={[point1, point2]}
            point1={nextLimbPointData.points[0]}
            point2={nextLimbPointData.points[1]}
            currentDepth={currentDepth + 1}
            branchNumber={index}
            treeDepth={treeDepth}
            branchOrigin={nextLimbPointData.branchOrigin}
            branchOrientation={nextLimbPointData.branchOrientation}
            size={size}
            rawDepth={rawDepth}
            containerHeight={containerHeight}
          />
        );
      })}

      {/* TODO greater than or equal to is weird */}
      {currentDepth >= treeDepth - 1 && (
        <Leaf
          size={size}
          parentAngle={angle(parentPoints[0], parentPoints[1])}
          point1={point1}
          point2={point2}
          containerHeight={containerHeight}
        />
      )}
    </>
  );
};
