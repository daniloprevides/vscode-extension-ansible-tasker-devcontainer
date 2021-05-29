import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export class DataProvider implements vscode.TreeDataProvider<Dependency> {
  constructor(private workspaceRoot: string, private tasks:Array<{name:string, path:string}>) {}

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Thenable<Dependency[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage('No tasks in workspace');
      return Promise.resolve([]);
    }
		const config  = vscode.workspace.getConfiguration('ansible-container');
		const containerTaskPath = config.get("containerPath") as string|| ".devcontainer/tasks";
    
    const tasksFiles = fs.readdirSync(path.join(this.workspaceRoot,containerTaskPath));
		const tasks = tasksFiles.map(t => {
			return {
        label: t,
        id: t,
        description: t,
        contextValue: path.join(this.workspaceRoot,containerTaskPath,t)
			} as Dependency;
		});

    return Promise.resolve(tasks);

  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }

  private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | null | void> = new vscode.EventEmitter<Dependency | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
}

class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
  }

  iconPath = {
    light: path.join(__filename, '..','media', 'task-icon.svg'),
    dark: path.join(__filename,'..', 'media', 'task-icon.svg')
  };
}