import { Plugin } from "obsidian";
import { OllamaSettingTab } from "OllamaSettingTab";
import { DEFAULT_SETTINGS } from "data/defaultSettings";
import { OllamaSettings } from "model/OllamaSettings";
import { ChatModal } from "modal/ChatModal";
import queryEngine from "QueryEngine";

export class OllamaChat extends Plugin {
  settings: OllamaSettings;

  async onload() {
    await this.loadSettings();
    this.registerEvents();
    this.addPromptCommands();
    this.addSettingTab(new OllamaSettingTab(this.app, this));
  }

  private registerEvents() {
    this.app.workspace.onLayoutReady(() => {
      queryEngine.init(this.settings, this.app, this.manifest.dir);
      this.registerEvent(this.app.vault.on("create", queryEngine.onCreate));
      this.registerEvent(this.app.vault.on("delete", queryEngine.onDelete));
      this.registerEvent(this.app.vault.on("modify", queryEngine.onModify));
      this.registerEvent(this.app.vault.on("rename", queryEngine.onRename));
    });
  }

  private addPromptCommands() {
    this.addCommand({
      id: "ask-your-ai",
      name: "AI Chat",
      callback: () => {
        new ChatModal(this.app).open();
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
}
