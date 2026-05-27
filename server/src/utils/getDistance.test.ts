import { describe, expect, it } from "@jest/globals";
import { getDistance } from "./getDistance";

describe("getDistance", () => {
  it("returns 0 when both points are identical", () => {
    expect(getDistance({ lat: 48.8566, lng: 2.3522 }, { lat: 48.8566, lng: 2.3522 })).toBe(0);
  });

  it("returns an approximate distance between Paris and Lyon", () => {
    const paris = { lat: 48.8566, lng: 2.3522 };
    const lyon = { lat: 45.764, lng: 4.8357 };

    expect(getDistance(paris, lyon)).toBeGreaterThan(390);
    expect(getDistance(paris, lyon)).toBeLessThan(400);
  });
});
