export type Point = { x: number; y: number };
export type BranchOrigin = "tip" | "trunk";
export type BranchOrientation = "left" | "right" | "center";

// Is this branch config? or tree config?
export type BranchConfig = {
  depth: number;
  size: number;
  rawDepth: number;
};
