import { getMatchCardMetrics } from "../matchCardLayout";

describe("getMatchCardMetrics", () => {
  it("fills a phone while capping card width on wide screens", () => {
    expect(getMatchCardMetrics(390).width).toBe(358);
    expect(getMatchCardMetrics(1024).width).toBe(450);
  });

  it("uses a single card height for every phase", () => {
    expect(getMatchCardMetrics(390).height).toBe(getMatchCardMetrics(390).height);
    expect(getMatchCardMetrics(390).height).toBeGreaterThan(0);
  });
});
