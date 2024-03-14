module.exports = {
  proseWrap: 'never',
  endOfLine: 'auto',
  printWidth: 120, // Newline string threshold, this will conflict with vue’s max-attributes-per-line
  tabWidth: 2, // Set the number of spaces for each horizontal indentation of the tool
  useTabs: false,
  semi: true, // Whether to add a semicolon at the end of the sentence
  vueIndentScriptAndStyle: false,
  singleQuote: true, // Use single quotes
  trailingComma: 'all', // Add comma to the last object element
  bracketSpacing: true, // Object, array plus spaces
  jsxBracketSameLine: false, // jsx > Whether to start a new line
  arrowParens: 'always', // (x) => {} whether to have parentheses
  requirePragma: false, // No need to write @prettier at the beginning of the file
  insertPragma: false, // No need to automatically insert @prettier at the beginning of the file
};
  