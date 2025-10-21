import { Leaf } from './Leaf.tsx';
import { Limb } from './Limb.tsx';
import type { BranchConfig, BranchOrientation, BranchOrigin, Point } from './types.ts';
import { angle, buildPoint, length } from './utils.ts';

/*
 * TODO - this code could use a refactor. look out for middle men,
 * magical numbers, duplication
 */

const nextLimbPoints = (
  point1: Point,
  point2: Point,
  depth: BranchConfig['depth'],
  size: BranchConfig['size'],
  rawDepth: BranchConfig['rawDepth'],
  currentDepth: number,
): Array<{
  points: Array<Point>;
  branchOrigin: BranchOrigin;
  branchOrientation: BranchOrientation;
}> => {
  const BASE_ANGLE_SPREAD = Math.PI / 6;
  const ANGLE_SPREAD_OFFSET_MAX = Math.PI / 6;
  const MAX_SIZE = 120;
  const SIZE_THRESHOLD = 105;

  const prevLimbAngle = angle(point1, point2);
  const prevLimbLength = length(point1, point2);
  const halfwayPoint = buildPoint(point1, prevLimbAngle, prevLimbLength / 2);
  const progressToNextDepth = rawDepth - depth;

  const angleSpreadOffset = () => {
    const angleOffset = ANGLE_SPREAD_OFFSET_MAX * progressToNextDepth;
    if (currentDepth === depth - 2) {
      return angleOffset;
    }
    return ANGLE_SPREAD_OFFSET_MAX;
  };
  const newBranchAngleSpread = BASE_ANGLE_SPREAD + angleSpreadOffset();

  const lengthMultiplier = () => {
    let max: number;
    if (currentDepth === 1) {
      max = 0.75;
    } else {
      max = 0.5;
    }

    if (currentDepth === depth - 2) {
      return max * progressToNextDepth;
    }
    return max;
  };
  const newLimbLengthBase = prevLimbLength * lengthMultiplier();

  const MIDDLE_LIMB_LENGTH_MULTIPLIER = 0.85;

  const middleLimbLength = (sizeThreshold: number) => {
    return (
      MIDDLE_LIMB_LENGTH_MULTIPLIER *
      Math.abs((newLimbLengthBase * (size - sizeThreshold + 1)) / (MAX_SIZE - sizeThreshold))
    );
  };

  const newTipLimbLength = (newLimbLengthBase * size * 0.95) / MAX_SIZE;

  const newLimbParams: Array<{
    angle: number;
    basePoint: Point;
    length: number;
    includeOnlyForDepths?: Array<number>;
    branchOrigin: BranchOrigin;
    branchOrientation: BranchOrientation;
    sizeThreshold?: number;
  }> = [
    {
      angle: prevLimbAngle,
      basePoint: point2,
      length: newLimbLengthBase,
      branchOrigin: 'tip',
      branchOrientation: 'center',
    },
    {
      angle: prevLimbAngle - newBranchAngleSpread,
      basePoint: point2,
      length: newTipLimbLength,
      branchOrigin: 'tip',
      branchOrientation: 'right',
    },
    {
      angle: prevLimbAngle + newBranchAngleSpread,
      basePoint: point2,
      length: newTipLimbLength,
      branchOrigin: 'tip',
      branchOrientation: 'left',
    },
    {
      angle: prevLimbAngle - newBranchAngleSpread,
      basePoint: halfwayPoint,
      length: middleLimbLength(SIZE_THRESHOLD),
      includeOnlyForDepths: [0],
      branchOrigin: 'trunk',
      branchOrientation: 'right',
      sizeThreshold: SIZE_THRESHOLD,
    },
    {
      angle: prevLimbAngle + newBranchAngleSpread,
      basePoint: halfwayPoint,
      length: middleLimbLength(SIZE_THRESHOLD),
      includeOnlyForDepths: [0],
      branchOrigin: 'trunk',
      branchOrientation: 'left',
      sizeThreshold: SIZE_THRESHOLD,
    },
  ];

  const newLimbs = newLimbParams
    .map(({ angle, basePoint, length, includeOnlyForDepths, branchOrientation, branchOrigin, sizeThreshold }) => {
      const includedAtThisLength = includeOnlyForDepths === undefined || includeOnlyForDepths?.includes(currentDepth);
      const includedAtThisSize = sizeThreshold === undefined || size >= sizeThreshold;
      const shouldRender = includedAtThisLength && includedAtThisSize;
      return shouldRender
        ? {
            branchOrigin,
            branchOrientation,
            points: [basePoint, buildPoint(basePoint, angle, length)],
          }
        : null;
    })
    .filter((v) => v !== null);
  return newLimbs;
};

const getBranchConfig = (size: number): BranchConfig => {
  const rawDepth = size / 20;
  return {
    depth: Math.floor(rawDepth),
    rawDepth,
    size: size,
  };
};

export const Branch = (props: {
  currentDepth: number;
  branchNumber: number;
  parentPoints: Point[];
  point1: Point;
  point2: Point;
  branchOrientation: BranchOrientation;
  branchOrigin: BranchOrigin;
  treeSize: number;
}) => {
  const { currentDepth, branchNumber, point1, point2, parentPoints, branchOrientation, branchOrigin, treeSize } = props;

  const { depth, size, rawDepth } = getBranchConfig(treeSize);
  const treeDepth = depth;

  if (currentDepth >= treeDepth) {
    return null;
  }

  const pointData = nextLimbPoints(point1, point2, treeDepth, size, rawDepth, currentDepth);

  return (
    <>
      <Limb
        size={size}
        currentDepth={currentDepth}
        treeDepth={treeDepth}
        point1={point1}
        point2={point2}
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
            treeSize={treeSize}
            branchOrigin={nextLimbPointData.branchOrigin}
            branchOrientation={nextLimbPointData.branchOrientation}
          />
        );
      })}

      {currentDepth >= treeDepth - 1 && (
        <Leaf size={size} parentAngle={angle(parentPoints[0], parentPoints[1])} point1={point1} point2={point2} />
      )}
    </>
  );
};
