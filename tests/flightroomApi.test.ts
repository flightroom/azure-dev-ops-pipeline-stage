import assert from "node:assert/strict"
import { describe, it } from "node:test"
import { describeFailure, flightroomApiUrl } from "../src/flightroomApi.js"

describe("flightroomApiUrl", () => {
    it("adds the API path and normalizes an existing /api suffix", () => {
        assert.equal(
            flightroomApiUrl("https://console.flightroom.dev/api/", "backends/by-slug/orders-api/versions/1.2.0"),
            "https://console.flightroom.dev/api/backends/by-slug/orders-api/versions/1.2.0"
        )
    })

    it("keeps an application base path", () => {
        assert.equal(flightroomApiUrl("https://example.com/flightroom", "frontends/by-slug/cart/versions/v1"), "https://example.com/flightroom/api/frontends/by-slug/cart/versions/v1")
    })

    it("rejects URLs that could leak credentials or use an unsafe protocol", () => {
        assert.throws(() => flightroomApiUrl("file:///tmp", "backends"), /HTTP\(S\)/)
        assert.throws(() => flightroomApiUrl("https://user:pass@example.com", "backends"), /HTTP\(S\)/)
    })
})

describe("describeFailure", () => {
    const url = "https://console.flightroom.dev/api/backends/by-slug/orders-api/versions/1.2.0"

    it("blames what stands in front of Flightroom when the body is not a Flightroom error", () => {
        const message = describeFailure("Image registration", "POST", url, 403, "Forbidden", "Forbidden")
        assert.match(message, /^Image registration failed: POST https:\/\/console\.flightroom\.dev\/api\/backends\/by-slug\/orders-api\/versions\/1\.2\.0 answered 403 Forbidden \(Forbidden\)\./)
        assert.match(message, /did not come from the Flightroom API/)
    })

    it("reports the Flightroom error code and the role to use", () => {
        const body = JSON.stringify({ success: false, error: { code: "BACKEND_VERSION_FORBIDDEN", message: "Registering a version requires an API key with the MANAGER role" } })
        const message = describeFailure("Image registration", "POST", url, 403, "Forbidden", body)
        assert.match(message, /\(BACKEND_VERSION_FORBIDDEN: Registering a version requires an API key with the MANAGER role\)/)
        assert.match(message, /MANAGER deploy key/)
    })
})
