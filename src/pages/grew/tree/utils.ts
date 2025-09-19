import type { Point } from "./types.ts";

export const length = (point1: Point, point2: Point): number => {
  return Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2),
  );
};

export const angle = (point1: Point, point2: Point): number => {
  return Math.atan2(point2.y - point1.y, point2.x - point1.x);
};

export const buildPoint = (
  originalPoint: Point,
  angle: number,
  length: number,
): Point => {
  return {
    x: originalPoint.x + length * Math.cos(angle),
    y: originalPoint.y + length * Math.sin(angle),
  };
};

export const pointsToSvgPolygonString = (points: Array<Point>) => {
  return points
    .map((p: Point) => {
      return p.x + "," + p.y;
    })
    .join(" ");
};
