import { FileSystemAdapter, App } from "obsidian";

export const getFilesystemPath = (app: App, path: string = '/') => {
  const adapter = app.vault.adapter;
  if (adapter instanceof FileSystemAdapter) {
      return adapter.getBasePath() + path
  }
  return '';
}
