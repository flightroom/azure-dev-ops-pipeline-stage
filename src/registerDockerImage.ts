import * as tl from "azure-pipelines-task-lib/task"
import fetch from "node-fetch"
import { describeFailure, flightroomApiUrl } from "./flightroomApi.js"

export async function run(): Promise<void> {
    try {
        const apiKey = tl.getInput("apiKey", true)!
        const domain = tl.getInput("domain", true)!
        const resourceType = tl.getInput("resourceType", true)!
        if (resourceType !== "backend" && resourceType !== "frontend") {
            throw new Error(`Unsupported resource type: ${resourceType}`)
        }
        const slug = tl.getInput("slug", true)!
        const version = tl.getInput("version", true)!
        const image = tl.getInput("image", true)!
        const digest = tl.getInput("digest")
        const commitSha = tl.getInput("commitSha")
        const collection = resourceType === "frontend" ? "frontends" : "backends"
        const endpoint = `${collection}/by-slug/${encodeURIComponent(slug)}/versions/${encodeURIComponent(version)}`
        const url = flightroomApiUrl(domain, endpoint)
        const pinnedImage = digest ? `${image}@${digest}` : image
        console.log(`📝 Registering ${resourceType} "${slug}" version "${version}" with image ${pinnedImage}`)
        console.log(`➡️ POST ${url}`)
        const response = await fetch(url, {
            method: "POST",
            headers: { "api-key": apiKey, "content-type": "application/json", Accept: "application/json" },
            body: JSON.stringify({
                image,
                ...(digest && { digest }),
                ...(commitSha && { commitSha })
            })
        })

        if (!response.ok) {
            throw new Error(describeFailure("Image registration", "POST", url, response.status, response.statusText, await response.text()))
        }

        tl.setResult(tl.TaskResult.Succeeded, `✅ Docker image registered for ${resourceType} "${slug}"`)
    } catch (error) {
        tl.setResult(tl.TaskResult.Failed, `❌ ${error instanceof Error ? error.message : String(error)}`)
    }
}

void run()
