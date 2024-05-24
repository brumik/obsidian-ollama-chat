import queryEngine from "QueryEngine";
import { MarkdownRenderer, Notice, Modal, App, MarkdownView } from "obsidian";

export class ChatModal extends Modal {
  result: string;
  baseUrl: string;
  responseContainer: HTMLDivElement;
  input: HTMLInputElement;
  isLoading: boolean;

  constructor(app: App) {
    super(app);
    this.onClickHandler = this.onClickHandler.bind(this);
    this.isLoading = false;
  }

  onClickHandler(): void {
    if (this.isLoading) return;

    this.isLoading = true;
    this.responseContainer.empty();
    this.responseContainer.createDiv({ cls: "loader" });
    this.input.disabled = true;
    const view = this.app.workspace.getActiveViewOfType(
			MarkdownView
		) as MarkdownView;

    queryEngine.query(this.input.value.trim())
    .then(response => {
      this.responseContainer.empty();
      MarkdownRenderer.render(this.app, response, this.responseContainer, '/', view)
      this.input.value = "";
    })
    .catch((error) => {
      new Notice(`Error while doing the query: ${error}`);
    }).finally(() => {
      this.isLoading = false;
      this.input.disabled = false;
      this.input.focus();
    })
  }

  async onOpen() {
    const container = this.contentEl;
    container.addClass("chatModal");
    container.createEl("h1", { text: "Ollama AI Chat" });
    const wrapper = container.createDiv({ cls: "chatModal__wrapper"});
    this.responseContainer = wrapper.createDiv();

    const inputContainer = wrapper.createEl('div');
    this.input = inputContainer.createEl('input', { placeholder: 'Your question my Lord?' });
    this.input.addEventListener("keypress", (e) => { e.key === "Enter" && this.onClickHandler() });

    const button = inputContainer.createEl('button', { text: 'Submit' });
    button.addEventListener("click", this.onClickHandler);
  }

  async onClose() {}
}
