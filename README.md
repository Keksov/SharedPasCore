# SharedPasCore

Target location for shared Pascal units used across products.

Only genuinely shared infrastructure belongs here, for example logging and JSONL helpers.
Product-specific protocols and device helpers stay with the owning product.

Current canonical shared units:

- `LogCore.pas`
- `JsonLogWriter.pas`
- `JsonLineProtocol.pas`
