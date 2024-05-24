# 🦙 Obsidian Ollama Chat

This plugin allows you to ask your local LLM about your own notes.

Ollama plugin link: https://obsidian.md/plugins?id=ollama-chat

## Requirements:

This branch tries to do indexing in JS/Node. This means that the plugin is bit slow to startup
since the index is created on startup and file cache is not implemented yet, but you do not need
to run a python server and you can just use ollama directly from your app.

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
