import { Plugin, TAbstractFile } from "obsidian";
import { OllamaSettingTab } from "OllamaSettingTab";
import { DEFAULT_SETTINGS } from "data/defaultSettings";
import { OllamaSettings } from "model/OllamaSettings";
import { ChatModal } from "modal/ChatModal";
import LangChainPlugin from 'service/LangChainPlugin';

export class Ollama extends Plugin {
  settings: OllamaSettings;

  async onload() {
    await this.loadSettings();
    this.addPromptCommands();
    this.addSettingTab(new OllamaSettingTab(this.app, this));
    this.registerEvents();
  }

  private registerEvents() {
    this.registerEvent(this.app.vault.on('create', this.createEvent));
    this.app.workspace.onLayoutReady(() => {
      this.registerEvent(this.app.vault.on('delete', this.deleteEvent));
      this.registerEvent(this.app.vault.on('modify', this.modifyEvent));
      this.registerEvent(this.app.vault.on('rename', this.renameEvent));
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

  onunload() {}

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  private async createEvent(file: TAbstractFile) {
    LangChainPlugin.indexFile(file.path);
  }

 private async deleteEvent(file: TAbstractFile) {
    LangChainPlugin.deleteIndex(file.path);
  }

 private async modifyEvent(file: TAbstractFile) {
    LangChainPlugin.indexFile(file.path);
  }

 private async renameEvent(file: TAbstractFile, oldPath: string) {
    LangChainPlugin.indexFile(file.path);
    LangChainPlugin.deleteIndex(oldPath);
  }

}
