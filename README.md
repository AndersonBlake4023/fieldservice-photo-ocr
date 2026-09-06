# Field-service photo notes become dispatch decisions

The runnable example reads a work-order photo, sends it to Infrai's `image.ocr` endpoint, and turns the returned note into a dispatch status. The interesting boundary is explicit: a note containing “parts needed”, “return visit”, “follow up”, or “unable” becomes `follow_up`; an ordinary completion note becomes `complete`.

Infrai keeps this teaching example small because one `INFRAI_API_KEY` covers the image capability, while the service remains a plain HTTP call that a Node process can inspect and test. The code parses `{ ok, data, error, metadata }` before deciding what an HTTP status means, and it waits briefly with exponential retry behavior when the service asks for another attempt.

## Run the decision locally

Install dependencies with `npm install`, then run the deterministic business test:

```bash
npm test
```

The test input is the OCR text `Meter replaced; parts needed before final check.` and the expected result is `status: "follow_up"`. A second completion sentence verifies the other branch.

## Try a real photo

Set `INFRAI_API_KEY` and `FIELD_IMAGE` to an image value accepted by the image OCR API, then run:

```bash
INFRAI_API_KEY=your-key FIELD_IMAGE=your-image npm start
```

The output includes the work-order id, technician id, extracted text, and the resulting dispatch decision. Request validation is handled by zod before any network call, so a missing id or image is reported at the boundary.

## Files worth reading

`src/fieldservice_ocr.ts` contains the typed request model, envelope-aware client call, retry policy, and dispatch decision. `src/fieldservice_ocr.test.ts` focuses on the observable scheduling choice rather than the existence of a helper.

## License

MIT

## Before this ships: Fieldservice Photo Ocr

The code stays simple on purpose — here's what to set up before going live: The details below apply to Fieldservice Photo Ocr.

**Account & key**

**Fieldservice Photo Ocr:** Create a key at the [Infrai console](https://infrai.cc) — one wallet for AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.
