// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const htmlparser2 = require('htmlparser2');
// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "ex-nested-classes" is now active!');

	// 生成嵌套的 CSS 结构
	const nestedCssDisposable = vscode.commands.registerCommand('exNestedClasses.nestedCssDisposable', function () {
		// The code you place here will be executed every time your command is executed
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor found!');
			return;
		}
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('No text selected.');
			return;
		}

		// 提取 className 并生成嵌套 CSS
		const cssText = extractClassNamesAndGenerateCSS(selectedText);

		// 插入或更新 style 标签
		insertOrUpdateStyleTag(editor, cssText);

	});
	// 扁平化 CSS 结构
	const flattenCssDisposable = vscode.commands.registerCommand('exNestedClasses.flattenCssDisposable', function () {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor found!');
			return;
		}
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('No text selected.');
			return;
		}

		// 提取 className 并生成嵌套 CSS
		let cssText = extractClassNamesAndGenerateCSS(selectedText);
		cssText = flattenCssLine(cssText);
		// 插入或更新 style 标签
		insertOrUpdateStyleTag(editor, cssText);

	});
	// 包裹的 SASS 结构
	const wrapInCssDisposable = vscode.commands.registerCommand('exNestedClasses.wrapInCssDisposable', function () {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor found!');
			return;
		}
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('No text selected.');
			return;
		}
		// 提取 className 并生成嵌套 CSS
		let cssText = extractClassNamesAndGenerateCSS(selectedText);
		cssText = cssToSass(cssText);
		// 插入或更新 style 标签
		insertOrUpdateStyleTag(editor, cssText);
	});
	// 单层包裹的 CSS 结构
	const wrapInSingleCssDisposable = vscode.commands.registerCommand('exNestedClasses.wrapInSingleCssDisposable', function () {
		const editor = vscode.window.activeTextEditor;
		if (!editor) {
			vscode.window.showInformationMessage('No active editor found!');
			return;
		}
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);

		if (!selectedText) {
			vscode.window.showErrorMessage('No text selected.');
			return;
		}

		// 提取 className 并生成嵌套 CSS
		let cssText = extractClassNamesAndGenerateCSS(selectedText);
		cssText = cssToFirstAndLastLayerSass(cssText);
		// 插入或更新 style 标签
		insertOrUpdateStyleTag(editor, cssText);
	});


	context.subscriptions.push(nestedCssDisposable);
	context.subscriptions.push(flattenCssDisposable);
	context.subscriptions.push(wrapInCssDisposable);
	context.subscriptions.push(wrapInSingleCssDisposable);

	
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}

// 另一个版本的插入 style 标签到 HTML 中
// 递归解析 HTML 并生成嵌套样式
function parseHTMLAndGenerateCSS(node, parentClasses = []) {
	if (!node.attribs || !node.attribs.class) return '';


	const currentClass = node.attribs.class.split(/\s+/).filter(Boolean).join('.');
	const combinedClass = parentClasses.concat(`.${currentClass}`).join(' ');

	let cssResult = `${combinedClass} { }\n`;

	if (node.children && node.children.length) {
		node.children.forEach((child) => {
			cssResult += parseHTMLAndGenerateCSS(child, parentClasses.concat(`.${currentClass}`));
		});
	}

	return cssResult;
}

// 提取 className 并生成嵌套 CSS
function extractClassNamesAndGenerateCSS(htmlContent) {
	const root = htmlparser2.parseDocument(htmlContent);
	let cssText = '';
	htmlparser2.DomUtils.getChildren(root).forEach((node) => {
		cssText += parseHTMLAndGenerateCSS(node);
	});

	return cssText;
}

// 插入或更新 style 标签
function insertOrUpdateStyleTag(editor, cssText) {
	const document = editor.document;
	const text = document.getText();

	const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/i;
	const styleTagMatch = text.match(styleTagRegex);

	editor.edit((editBuilder) => {
		if (styleTagMatch) {
			// 如果找到现有的 <style> 标签，则追加内容
			const styleStart = document.positionAt(styleTagMatch.index + styleTagMatch[0].indexOf('>') + 1);
			const styleEnd = document.positionAt(styleTagMatch.index + styleTagMatch[0].lastIndexOf('</style>'));

			const existingStyles = styleTagMatch[1].trim();
			const updatedStyles = existingStyles ? `${existingStyles}\n${cssText}` : cssText;

			// 替换现有的 <style> 标签中的内容
			editBuilder.replace(new vscode.Range(styleStart, styleEnd), `\n${updatedStyles}\n`);
		} else {
			// 如果没有找到 <style> 标签，则插入到文档底部
			const lastLine = document.lineAt(document.lineCount - 1);
			const position = new vscode.Position(lastLine.range.end.line + 1, 0);

			editBuilder.insert(position, `<style>\n${cssText}\n</style>\n`);
		}
	});
}

// 扁平化 CSS 结构
function flattenCssLine(cssText) {
	let ts = cssText.replaceAll('{ }', '').split(".");
	let res = ''
	let sets = new Set()
	for (let i = 0; i < ts.length; i++) {
		if (ts[i].trim() !== '') {
			sets.add(ts[i].trim())
		}
	}
	for (let item of sets) {
		res += `.${item} { }\n`
	}
	return res;
}

// css to sass
function cssToSass(cssText) {
	// 将 CSS 规则按换行分割
	const lines = cssText.split('\n').map(line => line.trim()).filter(Boolean);

	const tree = {}; // 用于存储嵌套结构的对象

	lines.forEach(line => {
		const selector = line.split(' {')[0]; // 提取选择器部分
		const parts = selector.split(' ');   // 按空格分割选择器部分，构建层次

		let current = tree; // 当前层级指针
		parts.forEach(part => {
			if (!current[part]) {
				current[part] = {}; // 构建子层级
			}
			current = current[part]; // 指针指向下一级
		});
	});

	// 递归生成嵌套的 SASS 结构
	function convertToSass(obj, depth = 0) {
		let sass = '';
		const indent = '  '.repeat(depth); // 缩进

		for (const key in obj) {
			sass += `${indent}${key} {\n`;
			sass += convertToSass(obj[key], depth + 1); // 递归处理子选择器
			sass += `${indent}}\n`;
		}

		return sass;
	}

	return convertToSass(tree).trim();
}
// css to sass 单层包裹
function cssToFirstAndLastLayerSass(cssText) {
  // 将 CSS 规则按行分割
  const lines = cssText.split('\n').map(line => line.trim()).filter(Boolean);

  const tree = {}; // 用于存储嵌套结构的对象

  lines.forEach(line => {
    const selector = line.split(' {')[0]; // 提取选择器部分
    const parts = selector.split(' ');   // 按空格分割选择器部分

    if (parts.length > 1) {
      // 只保留第一层和最后一层
      const first = parts[0]; // 第一层选择器
      const last = parts[parts.length - 1]; // 最后一层选择器

      if (!tree[first]) {
        tree[first] = {};
      }
      tree[first][last] = null;
    } else {
      tree[parts[0]] = null;
    }
  });

  // 递归生成 SASS 结构
  function convertToSass(obj, depth = 0) {
    let sass = '';
    const indent = '  '.repeat(depth); // 缩进

    for (const key in obj) {
      sass += `${indent}${key} {\n`;
      if (obj[key]) {
        sass += convertToSass(obj[key], depth + 1); // 递归处理子选择器
      }
      sass += `${indent}}\n`;
    }

    return sass;
  }

  return convertToSass(tree).trim();
}