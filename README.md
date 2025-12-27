# Env Browser

A VSCode extension that provides a Postman-like table view for `.env` files.

## Features

- Table view for environment variables
- Auto-formatting with quoted values on save
- One-click copy values
- Drag-and-drop reordering
- Add, edit, and delete variables
- Supports `.env`, `.env.example`, `.env.development`, etc.

## Development

1. Install dependencies:
```bash
npm install
```

2. Compile the extension:
```bash
npm run compile
```

3. Press `F5` in VSCode to launch a new Extension Development Host window.

4. In the new window, open a `.env` file (or create one) to see the table view.

The extension will automatically replace the default editor for `.env*` files with the custom table view.

