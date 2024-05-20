import fs from 'node:fs/promises';
import { Ollama, OllamaEmbedding, Settings } from "llamaindex";

import {
  Document,
  MetadataMode,
  NodeWithScore,
  VectorStoreIndex,
} from "llamaindex";


Settings.llm = new Ollama({
  model: "mistral",
  config: {
    temperature: 0.1,
    host: 'http://localhost:11434',
  }
});

Settings.embedModel = new OllamaEmbedding({
  model: "mxbai-embed-large",
  config: {
    host: 'http://192.168.1.4:11434',
  }
});

async function main() {
  const path = "/home/levente/Documents/obsidian-ollama-chat/node_modules/llamaindex/examples/abramov.txt";

  const essay = await fs.readFile(path, "utf-8");


  // TODO:
  // implement saving the document store and the index store:
  // https://github.com/run-llama/LlamaIndexTS/blob/aa0f586330789fc732225d29875bd78787d753fe/packages/core/src/storage/kvStore/SimpleKVStore.ts
  //
  // Then we can use: https://docs.obsidian.md/Reference/TypeScript+API/FileSystemAdapter/write


  // Create Document object with essay
  const document = new Document({ text: essay, id_: path });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Query the index
  const queryEngine = index.asQueryEngine();
  const { response, sourceNodes } = await queryEngine.query({
    query: "What did the author do in college?",
  });

  // Output response with sources
  console.log(response);

  if (sourceNodes) {
    sourceNodes.forEach((source: NodeWithScore, index: number) => {
      console.log(
        `\n${index}: Score: ${source.score} - ${source.node.getContent(MetadataMode.NONE).substring(0, 50)}...\n`,
      );
    });
  }
}

export default main;
