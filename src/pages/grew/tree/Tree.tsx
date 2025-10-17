import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { Branch } from "./Branch.tsx";

// TODO stagger it a bit more. relationship between scroll and size
// maybe should not be linear, should be on some curve

export const Tree = () => {
  // TODO consider screaming snake case...
  const TREE_STARTING_SIZE = 41;
  const TREE_FINAL_SIZE = 119;
  const TREE_SVG_SIZE = 600;
  const TREE_SVG_CENTER_X = TREE_SVG_SIZE / 2;

  const basePoint = { x: TREE_SVG_CENTER_X, y: 0 };
  const [treeSize, setTreeSize] = useState<number>(TREE_STARTING_SIZE);
  const treeSizeRef = useRef<number>(TREE_STARTING_SIZE);
  const scrollableHeight = useRef<number | null>(null);

  const treeHeight = (size: number) => {
    return (size * TREE_SVG_SIZE * 2) / TREE_SVG_SIZE;
  };

  const scrollProgressToTreeSize = (ratio: number): number => {
    /*
     * Convert a scroll progress float to a tree size float
     * Rounding here is crucial to conserve renders
     * (tree size doesnt change for small progress changes)
     */
    const rawSize =
      (TREE_FINAL_SIZE - TREE_STARTING_SIZE) * ratio + TREE_STARTING_SIZE;
    const size = Math.ceil(3 * rawSize) / 3;
    return size;
  };

  const treeSizeToScrollProgress = (size: number): number => {
    /*
     * Infer our progress from the current tree size
     */
    const treeSizeRange = TREE_FINAL_SIZE - TREE_STARTING_SIZE;
    const currentSizeDelta = size - TREE_STARTING_SIZE;
    return currentSizeDelta / treeSizeRange;
  };

  useEffect(() => {
    treeSizeRef.current = treeSize;
  }, [treeSize]);

  useEffect(() => {
    const docHeight = document.documentElement.scrollHeight;
    const winHeight = window.innerHeight;
    const scrollable = docHeight - winHeight;
    scrollableHeight.current = scrollable;
  }, []);

  const getScrollProgress = (): number => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const sh = scrollableHeight.current;
    if (!sh) return 0;
    const scrollProgress = Math.min(1, scrollTop / sh);
    return scrollProgress;
  };

  const handleScroll = () => {
    const scrollProgress = getScrollProgress();
    const calculatedTreeSize = scrollProgressToTreeSize(scrollProgress);
    if (calculatedTreeSize !== treeSizeRef.current) {
      setTreeSize(calculatedTreeSize);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // TODO MOVE ALL OF THIS TO IS OWN COMP
  // =====================================

  const messages: Array<{ msg: string; progressTrigger: number }> = [
    {
      msg: "hello",
      progressTrigger: 0.15,
    },
    {
      msg: "message 2",
      progressTrigger: 0.5,
    },
    {
      msg: "message 3",
      progressTrigger: 0.75,
    },
  ];

  // =====================================

  return (
    <div className="px-8 h-[800vh] relative flex justify-center flex-nowrap">
      <svg
        viewBox={`0 0 ${TREE_SVG_SIZE} ${TREE_SVG_SIZE}`}
        preserveAspectRatio="xMinYMin meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          backgroundColor: "transparent",
          width: `min(${TREE_SVG_SIZE}px, 100%)`,
        }}
        className="rotate-180 fixed top-0 border border-fuchsia-500"
      >
        <Branch
          currentDepth={0}
          key={uuidv4()}
          branchNumber={0}
          point1={basePoint}
          point2={{ x: TREE_SVG_CENTER_X, y: treeHeight(treeSize) }}
          treeSize={treeSize}
          branchOrigin={"trunk"}
          branchOrientation={"center"}
          parentPoints={[basePoint, basePoint]}
        />
      </svg>
      <div className={`fixed w-[600px]  top-[600px]`}>
        <ol>
          {messages.map(({ msg, progressTrigger }) => {
            return (
              treeSizeToScrollProgress(treeSize) > progressTrigger && (
                <li>{msg}</li>
              )
            );
          })}
        </ol>
      </div>
    </div>
  );
};
