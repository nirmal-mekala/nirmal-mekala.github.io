type PolygonPoints = Array<{ x: number; y: number }>;

const Polygon = (props: {
  points: PolygonPoints;
  width: number;
  height: number;
}) => {
  const { points, width, height } = props;
  const convertY = (y: number): number => {
    return height - y;
  };

  const convertPoints = (points: PolygonPoints): string => {
    return points
      .map((point) => {
        return `${point.x},${convertY(point.y)}`;
      })
      .join(" ");
  };

  return (
    <polygon
      points={convertPoints(points)}
      fill="var(--fg-color-2)"
      stroke="var(--fg-color-2)"
    />
  );
};

type TreeConfig = {
  depth: number;
  branchCount: number;
  //  trunkHeight: number;
  //  trunkWidth: number;
  //  angleSpread: number;
};

const getTreeConfig = (size: number): TreeConfig => {
  return {
    depth: Math.floor(size / 20),
    branchCount: Math.min(5, Math.floor(size / 30)),
    //    trunkHeight: size * 0.4,
    //    trunkWidth: size * 0.1,
    //    angleSpread: 30, // degrees of total angle to spread child branches
  };
};

export const Tree = () => {
  const height = 200;
  const width = 250;
  const size = 75;

  type Branch = {
    depth: number;
  };

  const config = getTreeConfig(size);

  // TODO --> path?

  const Branch = (props: { depth: number; branchNumber: number }) => {
    const { depth, branchNumber } = props;

    if (depth >= config.depth) {
      return (
        <div className="bg-green-500 h-[50px] w-[100px] text-black">LEAF</div>
      );
    }
    return (
      <div className="flex justify-center">
        <div className="bg-blue-500 text-black w-[100px] text-center">
          *{/* SELF */}
          <div className="flex justify-center">
            {/* CHILDREN */}
            {Array.from({ length: 2 }).map((_, index) => {
              return <Branch depth={depth + 1} branchNumber={index} />;
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="px-8 border border-fuchsia-500">
      {Array.from({ length: config.branchCount }).map((_, index) => {
        return <Branch depth={0} key={index} branchNumber={index} />;
      })}
      {/*
      <svg
        width={width}
        height={height}
        xmlns="http://www.w3.org/2000/svg"
        style={{ backgroundColor: "var(--bg-color-2)" }}
      >
        <Polygon
          points={[
            { x: 120, y: 0 },
            { x: 122, y: 100 },
            { x: 128, y: 100 },
            { x: 130, y: 0 },
          ]}
          width={width}
          height={height}
        />
      </svg>
      */}
    </div>
  );
};
