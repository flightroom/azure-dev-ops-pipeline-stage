export const flightroomApiUrl = (domain: string, endpoint: string): string => {
    const base = new URL(domain)
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash) {
        throw new Error("Domain must be an HTTP(S) base URL without credentials, query, or fragment")
    }

    const basePath = base.pathname.replace(/\/+$/, "").replace(/\/api$/, "")
    const route = endpoint.replace(/^\/+/, "")
    return new URL(`${basePath}/api/${route}`, base.origin).toString()
}

// The Flightroom API always answers errors as { error: { code, message } }: any other body comes from something in front of it
const flightroomError = (body: string): { code?: string; message?: string } | undefined => {
    try {
        const error = (JSON.parse(body) as { error?: unknown }).error
        return error && typeof error === "object" ? (error as { code?: string; message?: string }) : undefined
    } catch {
        return undefined
    }
}

const failureHint = (status: number, fromFlightroom: boolean, url: string): string => {
    if (!fromFlightroom && (status === 401 || status === 403 || status === 404 || status === 405)) {
        return `The response did not come from the Flightroom API: a proxy, firewall or IP allowlist in front of ${new URL(url).origin} refused the request, or the Flightroom URL is wrong. Check the Flightroom URL input and that this agent can reach the API.`
    }
    if (status === 401) return "The API key was rejected: check that the apiKey input holds a valid Flightroom API key (an unset secret variable is the usual cause)."
    if (status === 403) return "The API key is valid but not allowed to do this: it must be a MANAGER deploy key of the project that owns the resource."
    if (status === 404) return "Flightroom found nothing at this address: check the slug, the resource type and that the API key belongs to the project of the resource."
    if (status >= 500) return "Flightroom failed on its side: retry, and if it keeps failing contact the Flightroom team."
    return ""
}

export const describeFailure = (action: string, method: string, url: string, status: number, statusText: string, body: string): string => {
    const error = flightroomError(body)
    const reason = error?.message ? [error.code, error.message].filter(Boolean).join(": ") : body.trim().slice(0, 500)
    const answer = [`${action} failed: ${method} ${url} answered ${status} ${statusText}`, reason && `(${reason})`].filter(Boolean).join(" ")
    return [`${answer}.`, failureHint(status, error !== undefined, url)].filter(Boolean).join(" ")
}
