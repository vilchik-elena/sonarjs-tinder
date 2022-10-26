const { log } = console

export function make_api(opts) {
	const {
		token,
		page_size = 3,
		org = "gabriel-vivas-sonarsource",
		lang = "js,ts",
		root = "https://sonarcloud.io",
	} = opts;

	return bind_api({ token, org, root }, [
		[
		  "projects",
		  () => `/api/projects/search?ps=${page_size}`,
		  (body) => body.components.map(pick("name", "key")),
		],

		[
		  "issues",
		  (proj, rule) => {
				let rules = rule ? `&rules=${rule}` : ""
				return `/api/issues/search?asc=false&languages=${lang}&projects=${proj}&ps=${page_size}${rules}`
		  },
		  (body) => {
				return body.issues.map(issue => {
				  let data = pick("rule", "message", "component", "project", "textRange", "key")(issue)
				  let { key, project } = data

				  // URL looks like this:
				  // https://sonarcloud.io/project/issues?id=gabriel-vivas-sonarsource_mattermost-webapp&open=AYQPlHph1-xIBffSlXEn

				  return {
				  	...data,
				  	url: `${root}/project/issues?id=${project}&open=${key}`
				  }
				})
		  },
		],

		[
		  "sources",
		  (key, from, to) => `/api/sources/show?key=${key}&from=${from}&to=${to}`,
		  (body) => {
				// this endpoint returns syntax highlighted code,
				// so we strip html in a very fragile way
				// https://stackoverflow.com/a/5002161/1585841
				return body
				  .sources
				  .map(([line, text]) => text.replace(/<\/?[^>]+(>|$)/g, ""))
				  .join('\n')
			  },
		],
	])
}

function pick(...keys) {
  return (input) => {
    return keys.reduce((output, key) => {
      return { ...output, [key]: input[key] }
    }, {})
  }
}

function bind_api({ token, org, root }, definition) {
  let creds = basic_auth(token)
  let api = {}

  for (let [name, endpoint, parse] of definition) {
	api[name] = async (...args) => {
	  let path = endpoint(...args)
	  let sep = path.includes("?") ? "&" : "?"
	  let uri = `${root}${path}${sep}organization=${org}`

	  let body = await safe_fetch(uri, creds)
	  return safe_parse(body, parse)
	}
  }

  return api
}

async function safe_parse(body, parse) {
  if (body === null) return body
  try {
	return parse(body)
  } catch (e) {
	log("parse failed", e)
	return null
  }
}

async function safe_fetch(url, headers) {
  try {
	let res = await fetch(url, { headers })
	if (res.ok === false) {
	  let { errors } = await res.json()
	  throw new Error(`${res.status} ${errors.shift().msg}`)
	}
	return await res.json()
  } catch (e) {
	log(e)
	return null
  }
}

function basic_auth(user, token = "") {
  let creds = Buffer.from(`${user}:${token}`).toString("base64")
  return { Authorization: `Basic ${creds}` }
}
