// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import {DataProvider} from './data-provider';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	const config  = vscode.workspace.getConfiguration('ansible-container');
	const containerTaskPath = config.get("containerPath") as string|| ".devcontainer/tasks";
	const ansibleCommand = config.get("ansibleCommand") as string|| "ansible-playbook";

	let currentPath = "";
	if(vscode.workspace.workspaceFolders !== undefined) {
		currentPath = vscode.workspace.workspaceFolders[0].uri.fsPath ;
	} 
	else {
		const message = "YOUR-EXTENSION: Working folder not found, open a folder an try again" ;
		vscode.window.showErrorMessage(message);
	}
	const tasksFiles = fs.readdirSync(path.join(currentPath,containerTaskPath));
	const tasks = tasksFiles.map(t => {
		return {
			name: t,
			path: path.join(currentPath,containerTaskPath,t)
		};
	});

	vscode.window.registerTreeDataProvider(
		'ansible-container-task',
		new DataProvider(currentPath, tasks)
	);
	vscode.window.createTreeView('ansible-container-task', {
		treeDataProvider: new DataProvider(currentPath, tasks)
	});
	const dataProvider = new DataProvider(currentPath, tasks);
	vscode.window.registerTreeDataProvider('ansible-container-task', dataProvider);
	vscode.commands.registerCommand('ansible-container-task.refreshEntry', () =>
		dataProvider.refresh()
	);


	const shellExecute = (name:string)=> {
		const taskDefinition = tasks.find(t => t.name == name);
		vscode.window.showInformationMessage(taskDefinition?.path || "Path not found");
		const ext = path.extname(name);
		let exec = `${ansibleCommand} ${taskDefinition?.path}`;
		if (ext.trim() === ".sh"){
			exec = `/bin/bash ${taskDefinition?.path}` as string;
		}
		const terminal = vscode.window.createTerminal(taskDefinition?.name);
		terminal.show();
		terminal.sendText(exec);
	};

	let taskExecutorDisposable = vscode.commands.registerCommand('ansible-container-task.execute',() => {
		vscode.window.showQuickPick(tasks.map(t => t.name),{
			canPickMany: false,
			title: "Select a task to be executed"
		}).then(d => {
			shellExecute(d as string);
		});
	});

	let disposable = vscode.commands.registerCommand('ansible-container-task.executeTask',(data) => {
		shellExecute(data.label);
		vscode.window.showInformationMessage(`Executing task ${data.contextValue}`);
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(taskExecutorDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
