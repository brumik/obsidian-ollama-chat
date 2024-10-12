# 🦙 Obsidian Ollama Chat

This plugin allows you to ask your local LLM about your own notes.

Ollama plugin link: https://obsidian.md/plugins?id=ollama-chat

## Requirements:

Indexing is slow and hard to do in JS. Therefore you will need to run a lightweight
python server to do the indexing for you next to your ollama.

For more information about progress and install see: https://github.com/brumik/ollama-obsidian-indexer

The https://github.com/brumik/obsidian-ollama-chat/tree/move-llama-inhouse branch does not need the above server to run
but it is slower and less developed in general. If you cannot run the python server though you might find it useful.

To install the branch you need to build the plugin with `npm run build` and copy it to your obsidian install manually.

## Features:

- Run your own model locally. Set the URL to this model and you roll
- Index your files on startup and on file modification
- Open a modal by shortcut or command to ask your question

## Future plans:

- Text streaming when queriing to the LLM
- Chat window for chat style communication insdead of query.
- Add commands for useful queries to quick ask them like:
	- Summarize note
	- Summarize topic

Any feature recommendation is welcome. 

## Relase process

- Create a new commit containing:
    - updated version in `package.json`
    - updated `versions.json` file
- Create a new git tag matchig the version (`git tag 0.1.5`)
- Push with tags (`git push --tag`)
