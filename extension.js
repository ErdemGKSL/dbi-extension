// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { exec } = require('child_process');
const execAsync = require('util').promisify(exec);
const fs = require('fs/promises');
const path = require('path');
const { request } = require('https');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
const registerElements = ["ChatInput"]
/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// let disposable2 = vscode.languages.registerCompletionItemProvider("javascript", {
	// 	resolveCompletionItem(item, token) {
	// 		return item;
	// 	},

	// 	provideCompletionItems(document, position, token, context) {
	// 		vscode.window.showInformationMessage("test");
	// 		const linePrefix = document.lineAt(position).text.substring(0, position.character);
	// 		let registerLine = -1;
	// 		let registerCharPosition = -1;
	// 		for (let i = 0; i < document.lineCount; i++) {
	// 			if (document.lineAt(i).text.includes(".register({")) {
	// 				registerLine = i;
	// 				registerCharPosition = document.lineAt(i).text.indexOf(".register({") + 11;
	// 				break;
	// 			}
	// 		}
	// 		vscode.window.showInformationMessage(registerLine.toString());
	// 		if (registerLine == -1) {
	// 			return undefined;
	// 		}

	// 		const registerElement = registerElements.find((element) => linePrefix.endsWith(`${element.toLowerCase()}`));
	// 		vscode.window.showInformationMessage(registerElement);
	// 		if (!registerElement) {
	// 			return undefined;
	// 		}
	// 		let myitem = (text) => {
	// 			let item = new vscode.CompletionItem(text, vscode.CompletionItemKind.Variable);
	// 			if (!document.lineAt(registerLine).text.includes(registerElement))
	// 				item.additionalTextEdits = [
	// 					new vscode.TextEdit(
	// 						new vscode.Range(
	// 							new vscode.Position(registerLine, registerCharPosition),
	// 							new vscode.Position(registerLine, registerCharPosition)
	// 						),
	// 						` ${registerElement}`
	// 					)
	// 				];
	// 			return item;
	// 		}
	// 		return [
	// 			myitem(registerElement),
	// 		];
	// 	}
	// })
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('dbi.setup', async function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user

		try {
			const current_path = vscode.workspace.workspaceFolders[0].uri.fsPath;
			const BASE_URL = "https://raw.githubusercontent.com/ErdemGKSL/dbi-template/main/";
			await fs.mkdir(path.resolve(current_path, "./src"), { recursive: true });

			for (
				let arr = ["package.json", "index.js", "types.js", "dbi.js", "config.json", "bundler.js", ".gitignore"],
				i = 0; i < arr.length; i++
			) {
				const nURL = BASE_URL + arr[i];
				const nPath = path.resolve(current_path, "./" + arr[i]);
				await fs.writeFile(nPath, await fetch(nURL), 'utf-8');
			}

			await execAsync('npm i', { cwd: current_path });
			await execAsync('npm i @mostfeatured/dbi@latest discord.js@latest', { cwd: current_path });

			vscode.window.showInformationMessage("DBI: Setup completed successfully!");

		} catch (error) {
			vscode.window.showInformationMessage("DBI: Something went wrong, please open a workspace if you didn't already.");
			vscode.window.showErrorMessage(error.toString());
		}
	});

	context.subscriptions.push(disposable);
	// context.subscriptions.push(disposable2);
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}

function fetch(params, postData) {
	return new Promise(function (resolve, reject) {
		var req = request(params, function (res) {
			// reject on bad status
			if (res.statusCode < 200 || res.statusCode >= 300) {
				return reject(new Error('statusCode=' + res.statusCode));
			}
			// cumulate data
			var body = [];
			res.on('data', function (chunk) {
				body.push(chunk);
			});
			// resolve on end
			res.on('end', function () {
				try {
					body = body.join("");
				} catch (e) {
					reject(e);
				}
				resolve(body);
			});
		});
		// reject on request error
		req.on('error', function (err) {
			// This is not a "Second reject", just a different sort of failure
			reject(err);
		});
		if (postData) {
			req.write(postData);
		}
		// IMPORTANT
		req.end();
	});
}