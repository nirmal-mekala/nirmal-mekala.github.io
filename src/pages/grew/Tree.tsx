import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

type Point = { x: number; y: number };

const convertY = (y: number, height: number): number => {
  return height - y;
};

// TODO these ought to be consolidated in some fashion
const branchWidth = (
  size: number,
  currentDepth: number,
  mode: "widen" | "narrow",
) => {
  // TODO rename
  const trapezoidalAdjustment = (currentDepth: number, size: number) => {
    //    if (currentDepth > 2) {
    //      return 0;
    //    }
    const ADJUSTMENT = 3;
    return mode === "widen" ? ADJUSTMENT : -ADJUSTMENT;
  };
  const adjustment = trapezoidalAdjustment(currentDepth, size);
  const baseSize = size / 4 - currentDepth * 7;
  if (baseSize < 0) {
    return 0.5;
  }

  return baseSize + adjustment;
};

// TODO probably need a funciton that goes from a cartesian Point or Array<Point>
//      to an SVG ready string

const Limb = (props: {
  point1: Point;
  point2: Point;
  containerHeight: number;
  currentDepth: number;
  size: number;
  treeDepth: number;
}) => {
  const { point1, point2, containerHeight, currentDepth, size, treeDepth } =
    props;
  const angleVal = angle(point1, point2);
  if (point1.x === point2.x && point1.y === point2.y) {
    return null;
  }
  const trapezoidPoints = [
    newPoint(
      point1,
      // TODO also this isnt dry
      angleVal + Math.PI / 2,
      // TODO also this isnt dry
      branchWidth(size, currentDepth, "widen"),
    ),
    newPoint(
      point1,
      angleVal - Math.PI / 2,
      branchWidth(size, currentDepth, "widen"),
    ),
    newPoint(
      point2,
      angleVal - Math.PI / 2,
      branchWidth(size, currentDepth, "narrow"),
    ),
    newPoint(
      point2,
      angleVal + Math.PI / 2,
      branchWidth(size, currentDepth, "narrow"),
    ),
  ];
  const trapezoidPointsString = trapezoidPoints
    .map((p: Point) => {
      return p.x + "," + convertY(p.y, containerHeight);
    })
    .join(" ");

  return (
    <>
      <polygon
        points={trapezoidPointsString}
        fill="saddlebrown"
        stroke="black"
      />
    </>
  );
};

// Is this branch config? or tree config?
type BranchConfig = {
  depth: number;
  size: number;
  rawDepth: number;
  // branchCount: number;
  //  trunkHeight: number;
  //  trunkWidth: number;
  //  angleSpread: number;
};

const getBranchConfig = (size: number): BranchConfig => {
  const rawDepth = size / 20;
  return {
    depth: Math.floor(rawDepth),
    rawDepth,
    size: size,
    // branchCount: Math.min(5, Math.floor(size / 30)),
    //    trunkHeight: size * 0.4,
    //    trunkWidth: size * 0.1,
    //    angleSpread: 30, // degrees of total angle to spread child branches
  };
};

const length = (point1: Point, point2: Point): number => {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2),
  );
};

const angle = (point1: Point, point2: Point): number => {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x);
};

const newPoint = (
  originalPoint: Point,
  angle: number,
  length: number,
): Point => {
  return {
    x: originalPoint.x + length * Math.cos(angle),
    y: originalPoint.y + length * Math.sin(angle),
  };
};

// TODO MAKING BRANCHES GROW AT VARYING RATES IS KEY - like a SLOWING factor based on size or something
// TODO ALSO STAGGERING THEM MORE

const nextLimbPoints = (
  point1: Point,
  point2: Point,
  // TODO unrelated but astro-ish refactor of redirect
  // TODO - consider sending the obj again, this is verbose...
  depth: BranchConfig["depth"],
  size: BranchConfig["size"],
  rawDepth: BranchConfig["rawDepth"],
  currentDepth: number,
): Array<Array<Point>> => {
  // TODO consider explaining these values
  const BASE_ANGLE_SPREAD = Math.PI / 6;
  const ANGLE_SPREAD_OFFSET_MAX = Math.PI / 6;

  const prevLimbAngle = angle(point1, point2);
  const prevLimbLength = length(point1, point2);
  const halfwayPoint = newPoint(point1, prevLimbAngle, prevLimbLength / 2);
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
  }> = [
    {
      angle: prevLimbAngle - newBranchAngleSpread,
      basePoint: point2,
      length: newTipLimbLength,
    },
    { angle: prevLimbAngle, basePoint: point2, length: newLimbLengthBase },
    {
      angle: prevLimbAngle + newBranchAngleSpread,
      basePoint: point2,
      length: newTipLimbLength,
    },
    {
      angle: prevLimbAngle - newBranchAngleSpread,
      basePoint: halfwayPoint,
      length: newMiddleLimbLength,
      includeOnlyForDepths: [0],
    },
    {
      angle: prevLimbAngle + newBranchAngleSpread,
      basePoint: halfwayPoint,
      length: newMiddleLimbLength,
      includeOnlyForDepths: [0],
    },
  ];

  const newLimbs = newLimbParams
    .map(({ angle, basePoint, length, includeOnlyForDepths }) => {
      const renderBranch =
        includeOnlyForDepths === undefined ||
        includeOnlyForDepths?.includes(currentDepth);
      return renderBranch
        ? [basePoint, newPoint(basePoint, angle, length)]
        : null;
    })
    .filter((v) => v !== null);

  return newLimbs;
};

// TODO consider a better solution for containerHeight
// TODO consider rotate 180 on the svg and dodge containerHeight and convertY entirely

const Leaf = (props: {
  parentAngle: number;
  point1: Point;
  point2: Point;
  containerHeight: number;
  size: number;
}) => {
  const { point1, point2, containerHeight, parentAngle, size } = props;

  const leafLength = (size / 120) * 50;
  const leafWidth = (size / 120) * 25;

  const leafAngle = angle(point1, point2);
  const effectiveAngle = leafAngle === 0 ? parentAngle : leafAngle;
  const midPoint = point2;

  // Build points for Bezier leaf shape (in local coordinates)
  const top = newPoint(midPoint, effectiveAngle, leafLength / 2);
  const bottom = newPoint(midPoint, effectiveAngle + Math.PI, leafLength / 2);
  const leftControl = newPoint(
    midPoint,
    effectiveAngle - Math.PI / 2,
    leafWidth,
  );
  const rightControl = newPoint(
    midPoint,
    effectiveAngle + Math.PI / 2,
    leafWidth,
  );

  const topY = convertY(top.y, containerHeight);
  const bottomY = convertY(bottom.y, containerHeight);
  const leftControlY = convertY(leftControl.y, containerHeight);
  const rightControlY = convertY(rightControl.y, containerHeight);

  const pathData = `
    M ${bottom.x},${bottomY}
    C ${leftControl.x},${leftControlY} ${leftControl.x},${leftControlY} ${top.x},${topY}
    C ${rightControl.x},${rightControlY} ${rightControl.x},${rightControlY} ${bottom.x},${bottomY}
    Z
  `;

  return <path d={pathData} fill="green" stroke="black" />;
};

// const Leaf = (props: {
//   point1: Point;
//   point2: Point;
//   containerHeight: number;
// }) => {
//   const { point1, point2, containerHeight } = props;
//   const angleResult = angle(point1, point2);
//   const length = 5;
//
//   const points: Array<Array<number>> = [
//     angleResult,
//     angleResult + Math.PI / 2,
//     angleResult + Math.PI,
//     angleResult + (3 * Math.PI) / 2,
//   ]
//     .map((angle) => {
//       return newPoint(point2, angle, length);
//     })
//     .map((v) => [v.x, v.y]);
//
//   const pointsString = points
//     .map((v) => [v[0], convertY(v[1], containerHeight)].join(","))
//     .join(" ");
//
//   return <polygon points={pointsString} fill="fuchsia" stroke="fuchsia" />;
// };

const Branch = (props: {
  currentDepth: number;
  branchNumber: number;
  parentPoints: Point[];
  point1: Point;
  point2: Point;
  treeDepth: BranchConfig["depth"];
  size: BranchConfig["size"];
  rawDepth: BranchConfig["rawDepth"];
  containerHeight: number;
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
  } = props;

  // TODO little weird that we never hit treeDepth. always one less...
  if (currentDepth >= treeDepth) {
    return null;
  }

  const points: Array<Array<Point>> = nextLimbPoints(
    point1,
    point2,
    treeDepth,
    size,
    rawDepth,
    currentDepth,
  );

  // TODO rename Line --> Limb? Or maybe like BranchPolygon
  return (
    <>
      <Limb
        size={size}
        currentDepth={currentDepth}
        treeDepth={treeDepth}
        point1={point1}
        point2={{ ...point2 }}
        containerHeight={containerHeight}
      />
      {points.map((nextLimbPoints, index) => {
        return (
          <Branch
            key={`${currentDepth}-${branchNumber}-${index}`}
            parentPoints={[point1, point2]}
            point1={nextLimbPoints[0]}
            point2={nextLimbPoints[1]}
            currentDepth={currentDepth + 1}
            branchNumber={index}
            treeDepth={treeDepth}
            size={size}
            rawDepth={rawDepth}
            containerHeight={containerHeight}
          />
        );
      })}
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

// TODO break utils out into own file
// TODO break components out into own file

export const Tree = () => {
  const [size, setSize] = useState(100);
  const [config, setConfig] = useState(getBranchConfig(size));
  const containerHeight = 768;
  // cursed
  const width = 702;

  useEffect(() => {
    const v = getBranchConfig(size);
    setConfig(v);
  }, [size]);

  // TODO rename
  const myVal = (containerHeight: number, size: number) => {
    return (size * containerHeight) / width;
  };

  //  const config = getBranchConfig(size);

  // TODO --> path?
  // TODO --> consider if React/ChangeEvent shoudl be imported a different way
  // TODO --> improve typing around set functions etc
  // TODO figure out whats going on with x offset...
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSize(Number(e.target.value));
  };

  return (
    <div className="px-8 border border-[var(--fg-color-2)]">
      <label>
        size
        <input
          style={{ marginLeft: "10px" }}
          id="size"
          type="number"
          min={20}
          max={120}
          value={size}
          onChange={handleSizeChange}
        />
      </label>
      <p>{size}</p>
      <svg
        width={width}
        height={containerHeight}
        xmlns="http://www.w3.org/2000/svg"
        style={{ backgroundColor: "var(--bg-color-2)" }}
      >
        <Branch
          currentDepth={0}
          key={uuidv4()}
          branchNumber={0}
          point1={{ x: width / 2, y: 0 }}
          point2={{ x: width / 2, y: myVal(size, containerHeight) * 2 }}
          treeDepth={config.depth}
          size={config.size}
          rawDepth={config.rawDepth}
          containerHeight={containerHeight}
          parentPoints={[
            { x: width / 2, y: 0 },
            { x: width / 2, y: 0 },
          ]}
        />
      </svg>
    </div>
  );
  // TODO ^^ containerHeight function of size
};
