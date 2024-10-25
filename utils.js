// 提取选中的 HTML 元素的 className
export function extractClassFromSelection(htmlText) {
  const classRegex = /class=['"]([^'"]+)['"]/g;
  const classNames = [];
  let match;
  while ((match = classRegex.exec(htmlText)) !== null) {
    classNames.push(...match[1].split(' ').filter(Boolean));
  }
  return classNames;
}

// 提取包含选中 class 的元素下的所有嵌套 class
export function extractNestedClasses(htmlText, selectedClasses) {
  const classStructure = {};

  // 查找 class 的 HTML 结构
  const classRegex = /<(\w+)([^>]*class=['"]([^'"]+)['"][^>]*)?>/g;
  let match;
  
  while ((match = classRegex.exec(htmlText)) !== null) {
    const currentClassList = match[3]?.split(' ').filter(Boolean) || [];
    
    // 判断是否是我们要找的 class
    if (currentClassList.some(cls => selectedClasses.includes(cls))) {
      let currentLevel = classStructure;

      currentClassList.forEach((cls) => {
        if (!currentLevel[cls]) {
          currentLevel[cls] = {};
        }
        currentLevel = currentLevel[cls];
      });
    }
  }
  
  return classStructure;
}

// 生成嵌套的 CSS 结构
export function generateNestedCSS(classStructure, indent = 0) {
  let css = '';
  const indentStr = '  '.repeat(indent);

  for (const className in classStructure) {
    css += `${indentStr}.${className} {\n`;
    css += generateNestedCSS(classStructure[className], indent + 1);
    css += `${indentStr}}\n`;
  }

  return css;
}

// 插入 style 标签到 HTML 中
export function insertStyleTag(vscode, editor, cssText) {
  const document = editor.document;
  const position = new vscode.Position(0, 0); // 插入到文件顶部

  editor.edit((editBuilder) => {
    editBuilder.insert(position, `<style>\n${cssText}</style>\n`);
  });
}