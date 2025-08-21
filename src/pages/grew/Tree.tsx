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
      style={{ stroke: "var(--fg-color-2)", strokeWidth: 2 }}
    ></line>
  );
};

type TreeConfig = {
  depth: number;
  branchCount: number;
  //  trunkHeight: number;
  //  trunkWidth: number;
  //  angleSpread: number;
};

/*

let point1 = { x: 0, y: 0 };
let fortyFiveDegreePpoint = {x: 1, y: 1};
let sixtyDegreePoint = {x: 1, y: Math.sqrt(3)};

// x2 + y2 = (2x)2
// x^2 + y^2 = 4 * x^2
// y^2 = 3 * x^2
// y = sqrt(3 * x^2)



let fourtyFiveDegreeAngle = Math.atan2(fortyFiveDegreePpoint.y - point1.y, fortyFiveDegreePpoint.x - point1.x);
let sixtyDegreeAngle = Math.atan2(sixtyDegreePoint.y - point1.y, sixtyDegreePoint.x - point1.x);
console.log(fourtyFiveDegreeAngle/Math.PI, sixtyDegreeAngle/Math.PI);

angle = (point) => {
  return Math.atan2(point.y - point1.y, point.x - point1.x)/Math.PI;
}

let fourThirty = {x: 1, y: -1};
let sevenThirty = {x: -1, y: -1};
let tenThirty = {x: -1, y: 1};

console.log(angle(fourThirty), angle(sevenThirty), angle(tenThirty));

*/

const getTreeConfig = (size: number): TreeConfig => {
  return {
    depth: Math.floor(size / 20),
    branchCount: Math.min(5, Math.floor(size / 30)),
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

const nextPointsTrig = (point1: Point, point2: Point): Array<Point> => {
  const angleVal = angle(point1, point2);
  const angleSpread = Math.PI / 6; // 30 degrees
  const length = getLength(point1, point2);
  const lengthDivisor = 1.75;
  const newLength = length / lengthDivisor;
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

const nextPointsAlg = (point1: Point, point2: Point): Array<Point> => {
  const getDirection = (
    point1: Point,
    point2: Point,
  ): "n" | "e" | "s" | "w" => {
    if (point1.x > point2.x) {
      return "w";
    }
    if (point1.x < point2.x) {
      return "e";
    }
    if (point1.y > point2.y) {
      return "s";
    }
    return "n";
  };

  const direction = getDirection(point1, point2);
  const length = getLength(point1, point2);
  const lengthDivisor = 2;
  switch (direction) {
    case "n":
      return [
        { x: point2.x - length / lengthDivisor, y: point2.y },
        { x: point2.x + length / lengthDivisor, y: point2.y },
        { x: point2.x, y: point2.y + length / lengthDivisor },
      ];
    case "s":
      return [
        { x: point2.x - length / lengthDivisor, y: point2.y },
        { x: point2.x + length / lengthDivisor, y: point2.y },
        { x: point2.x, y: point2.y - length / lengthDivisor },
      ];
    case "e":
      return [
        { x: point2.x, y: point2.y - length / lengthDivisor },
        { x: point2.x, y: point2.y + length / lengthDivisor },
        { x: point2.x + length / lengthDivisor, y: point2.y },
      ];
    case "w":
      return [
        { x: point2.x, y: point2.y - length / lengthDivisor },
        { x: point2.x, y: point2.y + length / lengthDivisor },
        { x: point2.x - length / lengthDivisor, y: point2.y },
      ];
  }
};

const Branch = (props: {
  depth: number;
  branchNumber: number;
  point1: Point;
  point2: Point;
  config: TreeConfig;
  containerHeight: number;
}) => {
  const { depth, branchNumber, point1, point2, config, containerHeight } =
    props;

  if (depth >= config.depth) {
    const points = [
      [point1.x, point1.y],
      [point1.x, point1.y + 5],
      [point1.x + 5, point1.y + 5],
      [point1.x + 5, point1.y],
    ]
      .map((v) => [v[0], convertY(v[1], containerHeight)].join(","))
      .join(" ");
    return <polygon points={points} fill="blue" stroke="blue" />;
  }
  const nextPoints = nextPointsTrig;

  return (
    <>
      <Line point1={point1} point2={point2} containerHeight={containerHeight} />
      {nextPoints(point1, point2).map((nextPoint, index) => {
        return (
          <Branch
            key={`${depth}-${branchNumber}-${index}`}
            point1={point2}
            point2={nextPoint}
            depth={depth + 1}
            branchNumber={index}
            config={config}
            containerHeight={containerHeight}
          />
        );
      })}
    </>
  );
};

// TODO break components out into own file

export const Tree = () => {
  const containerHeight = 500;
  const width = 500;
  const size = 100;

  const config = getTreeConfig(size);

  // TODO --> path?

  return (
    <div className="px-8 border border-fuchsia-500">
      <svg
        width={width}
        height={containerHeight}
        xmlns="http://www.w3.org/2000/svg"
        style={{ backgroundColor: "var(--bg-color-2)" }}
      >
        <Branch
          depth={0}
          key={`0`}
          branchNumber={0}
          point1={{ x: width / 2, y: 0 }}
          point2={{ x: width / 2, y: containerHeight / 3 }}
          config={config}
          containerHeight={containerHeight}
        />
      </svg>
    </div>
  );
};
