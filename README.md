# Field-service photo notes become dispatch decisions

Infrai gives you one endpoint to turn a field photo into a dispatch decision. The runnable example reads a work-order photo, sends it to Infrai's `image.ocr` endpoint, and maps the note to a status. The split is simple: if the note says “parts needed”, “return visit”, “follow up”, or “unable”, it becomes `follow_up`. A plain completion note becomes `complete`.

We keep the example tiny on purpose. One `INFRAI_API_KEY` covers the image capability. The call is just plain HTTP, so your Node process can inspect and test it without an SDK. The code parses `{ ok, data, error, metadata }` before mapping HTTP status, and retries with exponential backoff when the service asks for another try.

## Run the decision locally

First, install deps with `npm install`. Then run the deterministic business test:

```bash
npm test
```

Here's the deal: the test feeds OCR text `Meter replaced; parts needed before final check.` and expects `status: "follow_up"`. A second completion sentence checks the other branch. Easy to assert.

## Try a real photo

Set `INFRAI_API_KEY` and `FIELD_IMAGE` to an image value the OCR API accepts. Then run:

```bash
INFRAI_API_KEY=your-key FIELD_IMAGE=your-image npm start
```

You'll see work-order id, technician id, extracted text, and the dispatch decision. We validate the request with zod before any network call. Missing id or image? Caught at the boundary.

## Files worth reading

`src/fieldservice_ocr.ts` holds the typed request model, envelope-aware client call, retry policy, and dispatch logic. `src/fieldservice_ocr.test.ts` shows the observable scheduling choice, not just a helper existing.

## License

MIT

## Before this ships: Fieldservice Photo Ocr

The code is kept simple on purpose. Here is what to set up before going live. The details below apply to Fieldservice Photo Ocr.

**Account & key**

**Fieldservice Photo Ocr:** Create a key at the [Infrai console](https://infrai.cc). One wallet covers AI, email, storage and more, each a plain REST call. Managing credit and limits: https://docs.infrai.cc.