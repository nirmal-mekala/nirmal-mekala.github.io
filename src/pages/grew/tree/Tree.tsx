import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import type { BranchConfig } from "./types.ts";
import { Branch } from "./Branch.tsx";

// TODO these ought to be consolidated in some fashion

// TODO stagger it a bit more. relationship between scroll and size
// maybe should not be linear, should be on some curve

export const Tree = () => {
  const TREE_STARTING_SIZE = 41;
  const TREE_FINAL_SIZE = 119;
  const CONTAINER_SIZE = 600;

  // basis for SVG dimensions, actual dimensions of (square shaped)
  // tree SVG are scaled
  const [treeSize, setTreeSize] = useState(TREE_STARTING_SIZE);
  //  const [config, setConfig] = useState(getBranchConfig(treeSize));
  //  const [scrollRatio, setScrollRatio] = useState(0);

  const treeHeight = (size: number) => {
    return (size * CONTAINER_SIZE * 2) / CONTAINER_SIZE;
  };

  const halve = (value: number): number => value / 2;

  // TODO --> improve typing around setters from useState fns

  const scrollRatioToTreeSize = (ratio: number): number => {
    const rawSize =
      (TREE_FINAL_SIZE - TREE_STARTING_SIZE) * ratio + TREE_STARTING_SIZE;
    const size = Math.ceil(rawSize);
    return size;
  };

  const getScrollRatio = (): number => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollableHeight = docHeight - winHeight;
    const scrollRatio = scrollTop / scrollableHeight;
    return scrollRatio;
  };

  const handleScrollRatioChange = (sr: number) => {
    const calculatedTreeSize = scrollRatioToTreeSize(sr);
    // TODO i think this calculation gets borked bc its in a listener
    if (calculatedTreeSize !== treeSize) {
      //      setConfig(getBranchConfig(calculatedTreeSize));
      setTreeSize(calculatedTreeSize);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // TODO dont do this every gd time
      const scrollRatio = getScrollRatio();
      handleScrollRatioChange(scrollRatio);
      //      setScrollRatio(scrollRatio);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="px-8 h-[800vh] relative flex justify-center">
      <svg
        viewBox={`0 0 ${CONTAINER_SIZE} ${CONTAINER_SIZE}`}
        preserveAspectRatio="xMinYMin meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          backgroundColor: "transparent",
          width: `min(${CONTAINER_SIZE}px, 100%)`,
        }}
        className="rotate-180 fixed top-0"
      >
        <Branch
          currentDepth={0}
          key={uuidv4()}
          branchNumber={0}
          point1={{ x: halve(CONTAINER_SIZE), y: 0 }}
          point2={{ x: halve(CONTAINER_SIZE), y: treeHeight(treeSize) }}
          treeSize={treeSize}
          branchOrigin={"trunk"}
          branchOrientation={"center"}
          parentPoints={[
            { x: halve(CONTAINER_SIZE), y: 0 },
            { x: halve(CONTAINER_SIZE), y: 0 },
          ]}
        />
      </svg>
    </div>
  );
};
