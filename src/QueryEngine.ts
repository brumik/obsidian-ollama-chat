import {
  MarkdownReader,
  Ollama,
  OllamaEmbedding,
  Settings,
  Document,
  VectorStoreIndex,
  QueryEngine as LamaQueryEngine,
} from "llamaindex";
import { OllamaSettings } from 'model/OllamaSettings';
import { App, TAbstractFile, TFile } from 'obsidian';

class QueryEngine {
  private app: App;
  // private storePath = '';
  private documents: Document[] = [];
  private index: VectorStoreIndex;
  private queryEngine: LamaQueryEngine;

  public async init(settings: OllamaSettings, app: App, rootDir?: string) {
    if (!rootDir) throw Error('plugin has for some reason no root directory');

    this.app = app;
    // this.storePath = rootDir + '/indexStorage';

    Settings.llm = new Ollama({
      model: settings.defaultModel,
      config: {
        temperature: 0.1,
        host: settings.ollamaUrl
      }
    });

    Settings.embedModel = new OllamaEmbedding({
      model: settings.defaultEmbedModel,
      config: {
        host: settings.ollamaUrl
      }
    });
   
    for (const file of app.vault.getMarkdownFiles()) {
      const results = await this.markdownToDocument(file);
      this.documents = [
        ...this.documents,
        ...results
      ];
    };

    this.index = await VectorStoreIndex.fromDocuments(this.documents);

    this.queryEngine = this.index.asQueryEngine();
  }

  private async markdownToDocument(file: TFile): Promise<Document[]> {
    const reader = new MarkdownReader(false, true);
    const content = await this.app.vault.read(file);

    // Stolen from the LLamaindex so I can use the inbuild reader.
    // https://github.com/run-llama/LlamaIndexTS/blob/cea664f1e7b349c19855a0e749761a47b2f6899d/packages/core/src/readers/MarkdownReader.ts#L92
    const tups = reader.parseTups(content);
    const results: Document[] = [];
    let counter = 0;
    for (const [header, value] of tups) {
      const id_ = `${file.path}_${counter}`;
      if (header) {
        const text = `\n\n${header}\n${value}`;
        results.push(new Document({ text, id_ }));
      } else {
        results.push(new Document({ text: value, id_ }));
      }
      counter += 1;
    }
    return results;
  }

  public async onCreate(file: TAbstractFile) {};
  public async onDelete(file: TAbstractFile) {};
  public async onModify(file: TAbstractFile) {};
  public async onRename(file: TAbstractFile, olPath: string) {
    // Create and then delete?
  };

  public async query(query: string): Promise<string> {
    if (!this.queryEngine) return Promise.reject('not initialized yet');

    const { response } = await this.queryEngine.query({
      query,
    });

    return response;
  }
};

const queryEngine = new QueryEngine();

export default queryEngine;
