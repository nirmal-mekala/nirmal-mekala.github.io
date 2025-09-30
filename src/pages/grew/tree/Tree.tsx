import { useState, useEffect } from "react";
import type { ChangeEvent } from "react";
import { v4 as uuidv4 } from "uuid";
import type { BranchConfig } from "./types.ts";
import { Branch } from "./Branch.tsx";

// TODO these ought to be consolidated in some fashion

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
  //  const containerHeight = 768;
  const containerHeight = 700;
  // TODO cursed - i think this is minus x padding
  const width = 702;

  useEffect(() => {
    const v = getBranchConfig(size);
    setConfig(v);
  }, [size]);

  const treeHeight = (containerHeight: number, size: number) => {
    return (size * containerHeight * 2) / width;
  };

  // TODO --> improve typing around setters from useState fns
  const handleSizeChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSize(Number(e.target.value));
  };

  // TODO think about how to manage
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollableHeight = docHeight - winHeight;
      const scrollPercent = (scrollTop / scrollableHeight) * 100;
      console.log(`Scrolled: ${scrollPercent.toFixed(2)}%`);
      // TODO manage this 120 /119 #
      // TODO manage better
      setSize((114 * scrollPercent) / 100 + 5);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="px-8 h-[400vh]">
      <svg
        width={width}
        height={containerHeight}
        xmlns="http://www.w3.org/2000/svg"
        style={{
          backgroundColor: "var(--bg-color-2)",
          border: "1px solid var(--fg-color-2)",
        }}
        className="rotate-180 fixed"
      >
        <Branch
          currentDepth={0}
          key={uuidv4()}
          branchNumber={0}
          point1={{ x: width / 2, y: 0 }}
          point2={{ x: width / 2, y: treeHeight(size, containerHeight) }}
          treeDepth={config.depth}
          size={config.size}
          rawDepth={config.rawDepth}
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
};
