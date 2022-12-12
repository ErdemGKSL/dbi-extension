// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const { exec } = require('child_process');
const fs = require('fs/promises');
const path = require('path');
const { request } = require('https');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "dbi" is now active!');

	vscode.SnippetTextEdit

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

			exec('npm i', { cwd: current_path }, (err) => {
				if (!err) {
					vscode.window.showInformationMessage("done");
				} else {
					throw Error("400");
				}
			});

		} catch (error) {
			vscode.window.showInformationMessage("Something went wrong, please open a workspace if you didn't already.");
			vscode.window.showInformationMessage(error.toString());
		}
	});

	context.subscriptions.push(disposable);
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