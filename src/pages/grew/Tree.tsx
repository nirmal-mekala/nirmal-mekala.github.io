import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

type Point = { x: number; y: number };

const convertY = (y: number, height: number): number => {
  return height - y;
};

const Line = (props: {
  point1: Point;
  point2: Point;
  containerHeight: number;
}) => {
  const { point1, point2, containerHeight } = props;
  return (
    <line
      x1={point1.x}
      x2={point2.x}
      y1={convertY(point1.y, containerHeight)}
      y2={convertY(point2.y, containerHeight)}
      style={{ stroke: "var(--fg-color-1)", strokeWidth: 2 }}
    ></line>
  );
};

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
const getLength = (point1: Point, point2: Point): number => {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2),
  );
};

const angle = (point1: Point, point2: Point): number => {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x);
};

const nextPoints = (
  point1: Point,
  point2: Point,
  // TODO unrelated but astro-ish refactor of redirect
  // TODO - consider sending the obj again, this is verbose...
  depth: BranchConfig["depth"],
  size: BranchConfig["size"],
  rawDepth: BranchConfig["rawDepth"],
  currentDepth: number,
): Array<Point> => {
  const angleVal = angle(point1, point2);
  const angleSpread = Math.PI / 6;
  const length = getLength(point1, point2);
  // TODO this is very grug; refactor
  const progressToNextDepth = rawDepth - depth;
  const lengthMultiplier = () => {
    if (currentDepth === depth - 2) {
      return 0.5 * progressToNextDepth;
    }
    return 0.5;
  };
  const newLength = length * lengthMultiplier();

  const result = [angleVal - angleSpread, angleVal, angleVal + angleSpread].map(
    (angle) => {
      const xDiff = newLength * Math.cos(angle);
      const yDiff = newLength * Math.sin(angle);
      return {
        x: point2.x + xDiff,
        y: point2.y + yDiff,
      };
    },
  );
  return result;
};

const Branch = (props: {
  currentDepth: number;
  branchNumber: number;
  point1: Point;
  point2: Point;
  depth: BranchConfig["depth"];
  size: BranchConfig["size"];
  rawDepth: BranchConfig["rawDepth"];
  containerHeight: number;
}) => {
  const {
    currentDepth,
    branchNumber,
    point1,
    point2,
    depth,
    size,
    rawDepth,
    containerHeight,
  } = props;

  if (currentDepth >= depth) {
    const points = [
      [point1.x, point1.y],
      [point1.x, point1.y + 5],
      [point1.x + 5, point1.y + 5],
      [point1.x + 5, point1.y],
    ]
      .map((v) => [v[0], convertY(v[1], containerHeight)].join(","))
      .join(" ");
    return (
      <polygon
        points={points}
        fill="var(--fg-color-2)"
        stroke="var(--fg-color-2)"
      />
    );
  }

  const np = nextPoints(point1, point2, depth, size, rawDepth, currentDepth);

  return (
    <>
      <Line
        point1={{ ...point1 }}
        point2={{ ...point2 }}
        containerHeight={containerHeight}
      />
      {np.map((nextPoint, index) => {
        return (
          <Branch
            key={`${currentDepth}-${branchNumber}-${index}`}
            point1={point2}
            point2={nextPoint}
            currentDepth={currentDepth + 1}
            branchNumber={index}
            depth={depth}
            size={size}
            rawDepth={rawDepth}
            containerHeight={containerHeight}
          />
        );
      })}
    </>
  );
};

// TODO break components out into own file

export const Tree = () => {
  const [size, setSize] = useState(100);
  const [config, setConfig] = useState(getBranchConfig(size));
  const containerHeight = 500;
  const width = 500;
  //  const size = 100;
  //
  useEffect(() => {
    const v = getBranchConfig(size);
    setConfig(Object.assign({}, v));
  }, [size]);

  //  const config = getBranchConfig(size);

  // TODO --> path?
  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSize(Number(e.target.value));
  };

  return (
    <div className="px-8 border border-fuchsia-500">
      <label>
        size
        <input
          style={{ marginLeft: "10px" }}
          id="size"
          type="number"
          min={20}
          max={145}
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
          point2={{ x: width / 2, y: (size * containerHeight) / 300 }}
          depth={config.depth}
          size={config.size}
          rawDepth={config.rawDepth}
          containerHeight={containerHeight}
        />
        <Branch
          currentDepth={0}
          key={uuidv4()}
          branchNumber={1}
          point1={{ x: width / 2, y: 0 }}
          point2={{
            x: width / 2 + (size * containerHeight) / 600,
            y: (size * containerHeight) / 600,
          }}
          depth={config.depth}
          size={config.size}
          rawDepth={config.rawDepth}
          containerHeight={containerHeight}
        />
        <Branch
          currentDepth={0}
          key={uuidv4()}
          branchNumber={1}
          point1={{ x: width / 2, y: 0 }}
          point2={{
            x: width / 2 - (size * containerHeight) / 600,
            y: (size * containerHeight) / 600,
          }}
          depth={config.depth}
          size={config.size}
          rawDepth={config.rawDepth}
          containerHeight={containerHeight}
        />
      </svg>
    </div>
  );
  // TODO ^^ containerHeight function of size
};
