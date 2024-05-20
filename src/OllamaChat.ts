import { Notice, Plugin, requestUrl, TAbstractFile } from "obsidian";
import { OllamaSettingTab } from "OllamaSettingTab";
import { DEFAULT_SETTINGS } from "data/defaultSettings";
import { OllamaSettings } from "model/OllamaSettings";
import { ChatModal } from "modal/ChatModal";
import llm from './llm';

export class OllamaChat extends Plugin {
  settings: OllamaSettings;

  async onload() {
    llm();
    await this.loadSettings();
    this.runStartupIndexing();
    this.registerEvents();
    this.addPromptCommands();
    this.addSettingTab(new OllamaSettingTab(this.app, this));
  }

  private registerEvents() {
    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(this.app.vault.on("create", this.createEvent.bind(this)));
      this.registerEvent(this.app.vault.on("delete", this.deleteEvent.bind(this)));
      this.registerEvent(this.app.vault.on("modify", this.modifyEvent.bind(this)));
      this.registerEvent(this.app.vault.on("rename", this.renameEvent.bind(this)));
    });
  }

  private addPromptCommands() {
    this.addCommand({
      id: "ask-your-ai",
      name: "AI Chat",
      callback: () => {
        new ChatModal(this.app, this.settings.llamaIndexUrl).open();
      },
    });
    this.addCommand({
      id: "ask-your-ai-test",
      name: "Node test",
      callback: () => {
        llm();
      },
    });
  }

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private async requestIndexing(
    method: "POST" | "PATCH" | "DELETE",
    filePath: string,
  ) {
    requestUrl({
      method,
      headers: {
        "Content-Type": "application/json",
      },
      url: `${this.settings.llamaIndexUrl}/indexing`,
      body: JSON.stringify({
        path: filePath,
      }),
    })
      .then((response) => new Notice(`Ollama indexing: ${response.text}`))
      .catch((error) => {
        new Notice(`Error while indexing the store ${error}`);
      });
  }

  private async runStartupIndexing() {
    this.requestIndexing("POST", "");
  }

  private async createEvent(file: TAbstractFile) {
    this.requestIndexing("PATCH", file.path);
  }

  private async deleteEvent(file: TAbstractFile) {
    this.requestIndexing("DELETE", file.path);
  }

  private async modifyEvent(file: TAbstractFile) {
    this.requestIndexing("PATCH", file.path);
  }

  private async renameEvent(file: TAbstractFile, oldPath: string) {
    this.requestIndexing("PATCH", file.path);
    this.requestIndexing("DELETE", oldPath);
  }
}
