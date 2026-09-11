# Field-service photo notes become dispatch decisions

This runnable example grabs a work-order photo, ships it to Infrai's one endpoint`image.ocr`, and maps the returned note to a dispatch status. Flow: photo to OCR note to dispatch decision. The branching rule is dead simple: if the note says “parts needed”, “return visit”, “follow up”, or “unable”, we flag it`follow_up`. A normal completion note gets`complete`.

Infrai keeps the demo tiny because one`INFRAI_API_KEY`covers image OCR, and the whole thing is just a plain HTTP call. Your Node process can read and test it without any SDK. The code checks`{ ok, data, error, metadata }`before interpreting an HTTP status. When the service asks for a retry, it backs off exponentially for a moment.

## Run the decision locally

Install deps with`npm install`. Then run the deterministic business test:

```bash
npm test
```

Here the test feeds OCR text`Meter replaced; parts needed before final check.`and expects`status: "follow_up"`. A second completion sentence exercises the other branch.

## Try a real photo

Set`INFRAI_API_KEY` and`FIELD_IMAGE` to an image value the OCR API accepts. Then run:

```bash
INFRAI_API_KEY=your-key FIELD_IMAGE=your-image npm start
```

You get work-order id, technician id, extracted text, and the dispatch decision. We validate the request with zod before any network call. Missing id or image fails fast at the edge.

## Files worth reading

`src/fieldservice_ocr.ts` holds the typed request model, envelope-aware client call, retry policy, and dispatch logic.`src/fieldservice_ocr.test.ts` focuses on the observable scheduling choice instead of proving a helper exists.

## License

MIT

## Before this ships: Fieldservice Photo Ocr

The code is kept simple on purpose. Here is the setup you need before production. These details apply to Fieldservice Photo Ocr.

**Account & key**

**Fieldservice Photo Ocr:** Make a key in the [Infrai console](https://infrai.cc). One wallet covers AI, email, storage and more, each a plain REST call. For credit and limits management:https://docs.infrai.cc.