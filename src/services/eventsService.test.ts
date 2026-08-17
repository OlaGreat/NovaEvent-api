import { describe, it, expect, vi, beforeEach } from "vitest";
import { simulateContractCall } from "../lib/stellar";
import { getEventById, EventNotFoundError } from "./eventsService";

vi.mock("../lib/stellar", () => ({
  simulateContractCall: vi.fn(),
}));

describe("getEventById", () => {
  beforeEach(() => {
    vi.mocked(simulateContractCall).mockReset();
  });

  it("returns the event when the contract call succeeds", async () => {
    const fakeEvent = { organizer: "GABC", name: "Stellar Summit" };
    vi.mocked(simulateContractCall).mockResolvedValue(fakeEvent);

    const result = await getEventById(0);

    expect(result).toBe(fakeEvent);
    expect(simulateContractCall).toHaveBeenCalledWith("get_event", expect.anything());
  });

  it("throws EventNotFoundError when the contract reports the event does not exist", async () => {
    vi.mocked(simulateContractCall).mockRejectedValue(new Error("event not found"));

    await expect(getEventById(999)).rejects.toBeInstanceOf(EventNotFoundError);
  });

  it("preserves the requested event id on EventNotFoundError", async () => {
    vi.mocked(simulateContractCall).mockRejectedValue(new Error("event not found"));

    await expect(getEventById(42)).rejects.toMatchObject({ eventId: 42 });
  });

  it("rethrows unrelated errors instead of swallowing them", async () => {
    const rpcFailure = new Error("RPC request timed out");
    vi.mocked(simulateContractCall).mockRejectedValue(rpcFailure);

    await expect(getEventById(0)).rejects.toBe(rpcFailure);
  });
});
