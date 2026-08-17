import { xdr } from "@stellar/stellar-sdk";
import { simulateContractCall } from "../lib/stellar";

export class EventNotFoundError extends Error {
  constructor(public readonly eventId: number) {
    super(`event ${eventId} not found`);
    this.name = "EventNotFoundError";
  }
}

export async function getEventById(eventId: number): Promise<unknown> {
  try {
    return await simulateContractCall("get_event", xdr.ScVal.scvU32(eventId));
  } catch (err) {
    if (err instanceof Error && err.message.includes("event not found")) {
      throw new EventNotFoundError(eventId);
    }
    throw err;
  }
}
