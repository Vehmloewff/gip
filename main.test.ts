import { asserts, dtils } from './deps.ts'

const oldReadme = `# old\n\nhere\n`
const testRepo = 'Vehmloewff/custom-format'
const testRepoReadmeText = 'custom-format'
const command = `deno run --allow-run --allow-env --allow-write --allow-read ../main.ts ${testRepo}`

const setup = async (path: string) => {
	await clean(path)
	await Deno.mkdir(path, { recursive: true })
}

const clean = async (path: string) => {
	if (await dtils.exists(path)) await Deno.remove(path, { recursive: true })
}

Deno.test(`gip clones ${testRepo}`, async () => {
	const path = 'fixture'

	await setup(path)
	await dtils.shIgnore(command, { cwd: path, env: Deno.env.toObject() })

	const newReadme = await dtils.readText(`${path}/README.md`)
	asserts.assert(newReadme.includes(testRepoReadmeText), `Readme is not new:\n\n${newReadme}`)

	await clean(path)
})

Deno.test('gip doesn\'t overwrite the existing files with the --no flag', async () => {
	const path = 'fixture'

	// --no
	{
		await setup(path)
		await dtils.writeText(`${path}/README.md`, oldReadme)

		await dtils.shIgnore(`${command} --no`, { cwd: path, env: Deno.env.toObject() })

		const newReadme = await dtils.readText(`${path}/README.md`)

		asserts.assertEquals(newReadme, oldReadme)
	}

	// -n (shorthand)
	{
		await setup(path)
		await dtils.writeText(`${path}/README.md`, oldReadme)

		await dtils.shIgnore(`${command} -n`, { cwd: path, env: Deno.env.toObject() })

		const newReadme = await dtils.readText(`${path}/README.md`)

		asserts.assertEquals(newReadme, oldReadme)
	}

	await clean(path)
})

Deno.test('gip overwrites existing files with the --yes flag', async () => {
	const path = 'fixture'

	// --yes
	{
		await setup(path)
		await dtils.writeText(`${path}/README.md`, oldReadme)

		await dtils.shIgnore(`${command} --yes`, { cwd: path, env: Deno.env.toObject() })

		const newReadme = await dtils.readText(`${path}/README.md`)

		asserts.assert(newReadme.includes(testRepoReadmeText), `Readme is not new:\n\n${newReadme}`)
	}

	// -y (shorthand)
	{
		await setup(path)
		await dtils.writeText(`${path}/README.md`, oldReadme)

		await dtils.shIgnore(`${command} -y`, { cwd: path, env: Deno.env.toObject() })

		const newReadme = await dtils.readText(`${path}/README.md`)

		asserts.assert(newReadme.includes(testRepoReadmeText), `Readme is not new:\n\n${newReadme}`)
	}

	await clean(path)
})
