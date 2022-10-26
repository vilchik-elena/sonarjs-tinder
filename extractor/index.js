import "dotenv/config"

import { make_api } from "./api.js"
import { sample_issues } from "./sampling.js"

const { log } = console

async function main() {
	const { TOKEN } = process.env

	const rule = "javascript:S125" // commented code

	const api = make_api({ token: TOKEN })

	let issues = await sample_issues(api, rule)

	log(JSON.stringify({issues}))
}

main()
