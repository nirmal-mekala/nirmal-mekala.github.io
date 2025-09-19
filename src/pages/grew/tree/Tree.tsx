import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import type { BranchConfig } from "./types.ts";
import { Branch } from "./Branch.tsx";

// TODO these ought to be consolidated in some fashion

// TODO probably need a funciton that goes from a cartesian Point or Array<Point>
//      to an SVG ready string

// TODO ALSO STAGGERING THEM MORE

const getBranchConfig = (size: number): BranchConfig => {
  const rawDepth = size / 20;
  return {
    depth: Math.floor(rawDepth),
    rawDepth,
    size: size,
  };
};

export const Tree = () => {
  const [size, setSize] = useState(100);
  const [config, setConfig] = useState(getBranchConfig(size));
  const containerHeight = 768;
  // TODO cursed - i think this is minus x padding
  const width = 702;

  useEffect(() => {
    const v = getBranchConfig(size);
    setConfig(v);
  }, [size]);

  // TODO rename
  const myVal = (containerHeight: number, size: number) => {
    return (size * containerHeight) / width;
  };

  // TODO --> consider if React/ChangeEvent shoudl be imported a different way
  // TODO --> improve typing around setters from useState fns
  const handleSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
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
        className="rotate-180"
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
          branchOrigin={"trunk"}
          branchOrientation={"center"}
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
