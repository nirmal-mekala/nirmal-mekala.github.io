import { useCallback, useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Branch } from './Branch.tsx';
import { Copy } from './Copy.tsx';

export const TREE_STARTING_SIZE = 41;
export const TREE_FINAL_SIZE = 119;
export const TREE_SVG_SIZE = 500;
export const TREE_SVG_CENTER_X = TREE_SVG_SIZE / 2;

export const Tree = () => {
  const basePoint = { x: TREE_SVG_CENTER_X, y: 0 };
  const [treeSize, setTreeSize] = useState<number>(TREE_STARTING_SIZE);
  const treeSizeRef = useRef<number>(TREE_STARTING_SIZE);
  const scrollableHeight = useRef<number | null>(null);

  useEffect(() => {
    treeSizeRef.current = treeSize;
  }, [treeSize]);

  useEffect(() => {
    const calculateScrollableHeight = () => {
      const docHeight = document.documentElement.scrollHeight;
      const winHeight = window.innerHeight;
      const scrollable = docHeight - winHeight;
      scrollableHeight.current = scrollable;
    };

    calculateScrollableHeight();

    window.addEventListener('resize', calculateScrollableHeight);

    return () => {
      window.removeEventListener('resize', calculateScrollableHeight);
    };
  }, []);

  const getScrollProgress = useCallback((): number => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const sh = scrollableHeight.current;
    if (!sh) return 0;
    const scrollProgress = Math.min(1, scrollTop / sh);
    return scrollProgress;
  }, []);

  const handleScroll = useCallback(() => {
    const scrollProgress = getScrollProgress();
    const calculatedTreeSize = scrollProgressToTreeSize(scrollProgress);
    if (calculatedTreeSize !== treeSizeRef.current) {
      setTreeSize(calculatedTreeSize);
    }
  }, [getScrollProgress]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div className="px-8 h-[800vh] relative flex justify-center flex-nowrap ">
      <svg
        viewBox={`0 0 ${TREE_SVG_SIZE} ${TREE_SVG_SIZE}`}
        preserveAspectRatio="xMinYMin meet"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          backgroundColor: 'transparent',
          width: `min(${TREE_SVG_SIZE}px, 100%)`,
        }}
        className="rotate-180 fixed top-0 -z-10"
      >
        <title>animation of a tree growing</title>
        <Branch
          currentDepth={0}
          key={uuidv4()}
          branchNumber={0}
          point1={basePoint}
          point2={{ x: TREE_SVG_CENTER_X, y: treeHeight(treeSize) }}
          treeSize={treeSize}
          branchOrigin={'trunk'}
          branchOrientation={'center'}
          parentPoints={[basePoint, basePoint]}
        />
      </svg>
      <Copy treeSize={treeSize} />
    </div>
  );
};

const treeHeight = (size: number) => {
  return (size * TREE_SVG_SIZE * 1.75) / TREE_SVG_SIZE;
};

const scrollProgressToTreeSize = (ratio: number): number => {
  /*
   * Convert a scroll progress float to a tree size float
   * Rounding here is crucial to conserve renders
   * (tree size doesnt change for small progress changes)
   */
  const rawSize = (TREE_FINAL_SIZE - TREE_STARTING_SIZE) * ratio + TREE_STARTING_SIZE;
  const size = Math.ceil(3 * rawSize) / 3;
  return size;
};
