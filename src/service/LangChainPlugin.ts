import { PromptTemplate } from "langchain/prompts";
import { Ollama } from "langchain/llms/ollama";
import {
  RunnableSequence,
  RunnablePassthrough,
} from "langchain/schema/runnable";
import { StringOutputParser } from "langchain/schema/output_parser";
import { formatDocumentsAsString } from "langchain/util/document";
import { FaissStore } from "langchain/vectorstores/faiss";
import { OllamaEmbeddings } from "langchain/embeddings/ollama";
import { TextLoader } from "langchain/document_loaders/fs/text";
import {
  RecursiveCharacterTextSplitter,
} from "langchain/text_splitter";

const llmParams = {
  model: "mistral",
  temperature: 0.1,
};

// Set up the recommended template for mistral query
const template = `
<s>[INST]
You are a helpful assistant, you will use the provided context to answer user questions.
Read the given context before answering questions and think step by step. If you can not answer a user question based on 
the provided context, inform the user. Do not use any other information for answering user. Provide a detailed answer to the question.

Context: {context}
User: {query}
[/INST]
`;

class LangChainPlugin {
  private ids = [] as string[];

  private vectorStore = new FaissStore(new OllamaEmbeddings(llmParams), {});

  private splitter: RecursiveCharacterTextSplitter; 

  // Set up the llm from local mistral
  private model = new Ollama(llmParams);

  constructor() {
    this.splitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
      chunkSize: 1024,
      chunkOverlap: 20,
    });

    // TODO: Read in vectorStore from file
  }

  private async readFile(filename: string, skipIfExists = false) {
    const chunkName = filename + '-';

    const loader = new TextLoader(filename);
    const docs = await loader.loadAndSplit(this.splitter);

    const newIds = docs.map((_, idx) => chunkName + idx);

    if (this.ids.some(i => i.startsWith(chunkName))) {
      // Early quit if we wanna save time and not recreating the document.
      if (skipIfExists) return;

      await this.deleteIndex(filename);
    }

    const idsReturned = await this.vectorStore.addDocuments(docs, { ids: newIds });
    this.ids = [...this.ids, ...idsReturned];
  }


  public indexFile(filename: string) { 
    this.readFile(filename, false);
  }

  public async deleteIndex(filename: string) {
    // Find the ids that start with the same file
    // TODO: This can be problematic if another filename starts with `filename + '-'`. 
    const chunkName = filename + '-';

    const idsToDelete = this.ids.filter(i => i.startsWith(chunkName));
    await this.vectorStore.delete({ ids: idsToDelete });

    // Reverse filter out from the ids the removed ids.
    this.ids = this.ids.filter(i => !i.startsWith(chunkName))
  }

  public async query(query: string) {
    const retriever = this.vectorStore.asRetriever();
    const chain = RunnableSequence.from([
      {
        context: retriever.pipe(formatDocumentsAsString),
        query: new RunnablePassthrough(),
      },
      PromptTemplate.fromTemplate(template),
      this.model,
      new StringOutputParser(),
    ]);

    const result = await chain.invoke(query);
    return result;
  }
}

export default new LangChainPlugin();
