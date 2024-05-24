import { App, PluginSettingTab, Setting } from "obsidian";
import { OllamaChat } from "OllamaChat";

export class OllamaSettingTab extends PluginSettingTab {
  plugin: OllamaChat;

  constructor(app: App, plugin: OllamaChat) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName("Ollama URL")
      .setDesc("URL of the Ollama server running (e.g. http://localhost:11434)")
      .addText((text) =>
        text
          .setPlaceholder("http://localhost:11434")
          .setValue(this.plugin.settings.ollamaUrl)
          .onChange(async (value) => {
            this.plugin.settings.ollamaUrl = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Default model")
      .setDesc("Name of the default ollama model to use for prompts")
      .addText((text) =>
        text
          .setPlaceholder("mistral")
          .setValue(this.plugin.settings.defaultModel)
          .onChange(async (value) => {
            this.plugin.settings.defaultModel = value;
            await this.plugin.saveSettings();
          })
      );


    new Setting(containerEl)
      .setName("Default embed model")
      .setDesc("Name of the default ollama model to use for calculating embedings")
      .addText((text) =>
        text
          .setPlaceholder("mxbai-embed-large")
          .setValue(this.plugin.settings.defaultEmbedModel)
          .onChange(async (value) => {
            this.plugin.settings.defaultEmbedModel = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
