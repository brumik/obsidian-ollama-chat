# Problem with this branch

I trasported the buisness logic of indexing into the plugin, but reading the file
or using a Faiss vector store (which can handle ids too) needs a node environmnet.

Obsidian plugins are running in "browser" environment (electron) therefore this is
not usable. 

# 🦙 Obsidian Ollama Chat

This plugin allows you to ask your local LLM about your own notes.

## Requirements:

Indexing is slow and hard to do in JS. Therefore you will need to run a lightweight
python server to do the indexing for you next to your ollama.

For more information about progress and install see: https://github.com/brumik/ollama-obsidian-indexer

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
