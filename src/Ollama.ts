import { Notice, Plugin, requestUrl, TAbstractFile, TFolder } from "obsidian";
import { OllamaSettingTab } from "OllamaSettingTab";
import { DEFAULT_SETTINGS } from "data/defaultSettings";
import { OllamaSettings } from "model/OllamaSettings";
import { ChatModal } from "modal/ChatModal";

export class Ollama extends Plugin {
  settings: OllamaSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new OllamaSettingTab(this.app, this));

    // Check if url can be reached
    if (await this.healthcheck()) {
      this.runStartupIndexing();
      this.registerEvents();
      this.addPromptCommands();
    } else {
      new Notice(`The ${this.settings.llamaIndexUrl} is unreachable or not healthy. Skipping initialization.`);
      new Notice(`When you fix this, you need to reload the plugin or restart obsidian.`);
    }
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
  }

  onunload() { }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private async requestIndexing(
    method: "GET" | "POST" | "PATCH" | "DELETE",
    filePath?: string,
  ): Promise<boolean> {
    try {
      const response = await requestUrl({
        method,
        headers: {
          "Content-Type": "application/json",
        },
        url: `${this.settings.llamaIndexUrl}/indexing`,
        body: JSON.stringify({
          path: filePath,
        }),
      })

      if (response.status !== 200) {
        throw Error(response.text)
      }

      if (this.settings.allowSuccessNotifications)
        new Notice(`Ollama indexing: ${response.text}`)

      return true;
    } catch (error) {
      new Notice(`Error while indexing the store ${error}`);
      return false;
    };
  }

  private async healthcheck(): Promise<boolean> {
    return await this.requestIndexing("GET")
  }

  private async runStartupIndexing() {
    this.requestIndexing("POST", "");
  }

  private async createEvent(file: TAbstractFile) {
    // Makes no sense to index an empty folder.
    if (file instanceof TFolder) {
      return;
    }
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
