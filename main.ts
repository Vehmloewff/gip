import { colors, dtils, flags, pathUtils } from './deps.ts'
import helpText from './help.ts'

await main()

async function main() {
	const { _: args, yes, no, help } = flags.parse(Deno.args, {
		boolean: ['yes', 'no', 'help'],
		alias: { no: 'n', yes: 'y', help: 'h' },
	})

	if (help) return console.log(helpText)

	const repo = args[0]
	if (!repo) throw new Error('Expected a repository as a first argument')

	if (typeof repo === 'number') throw new Error('Repository cannot be a number')

	const defaultingConfirm = (text: string) => {
		if (no) return false
		if (yes) return true

		return confirm(text)
	}

	const url = getUrl(repo)

	const tempDir = await Deno.makeTempDir()

	await dtils.execIgnore(['git', 'clone', url, tempDir])
	await Deno.remove(pathUtils.join(tempDir, '.git'), { recursive: true })

	const files = await dtils.recursiveReadDir(tempDir)

	for (const file of files) {
		const localFile = removeRoot(tempDir, file)

		const newText = await dtils.readText(file)
		const oldText = await dtils.readText(localFile)

		// We won't write if the files are identical
		if (oldText === newText) {
			console.log(colors.gray('Identical'), localFile)
			continue
		}

		// We write the file if it doesn't exist already
		if (!oldText) {
			await dtils.writeText(localFile, newText)
			console.log(colors.green('Added'), localFile)

			continue
		}

		// Otherwise we will ask the use for permission to overwrite it
		const response = defaultingConfirm(`A newer version of ${colors.blue(localFile)} is available. Would you like to use it?`)
		if (!response) {
			console.log(colors.gray('Ignored'), localFile)
			continue
		}

		await dtils.writeText(localFile, newText)
		console.log(colors.green('Updated'), localFile)
	}

	await Deno.remove(tempDir, { recursive: true })
}

function getUrl(text: string) {
	const userAndRepo = text.split('/')
	if (userAndRepo.length === 2) return `https://github.com/${userAndRepo.join('/')}`

	return text
}

function removeRoot(root: string, file: string) {
	if (!file.startsWith(root)) throw new Error('`file` does not start with `root`')

	const strippedFile = file.slice(root.length)
	if (strippedFile.startsWith('/')) return strippedFile.slice(1)

	return strippedFile
}
