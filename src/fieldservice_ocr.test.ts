import assert from "node:assert/strict";
import { dispatchDecision } from "./fieldservice_ocr.js";

assert.deepEqual(dispatchDecision("Meter replaced; parts needed before final check."), {
  status: "follow_up",
  note: "Schedule a technician follow-up from the photo note."
});
assert.equal(dispatchDecision("Job complete, customer signed.").status, "complete");
console.log("dispatch decision test passed");
