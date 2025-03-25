// src/api-server.js
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Ensure the temporary file is created inside the examples folder
// __dirname is backend/src; so go one level up then into examples.
const tempFilePath = path.join(__dirname, '..', 'examples', 'temp.struct');

// Debug: log the resolved temp file path to verify extension
console.log('Temporary file will be saved as:', tempFilePath);

// Write incoming code to the temporary file (overwriting previous content)
function saveCodeToFile(code) {
  fs.writeFileSync(tempFilePath, code, 'utf8');
}

// Generic function to run a shell command and return its output as a promise
function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(stderr || error.message);
      }
      resolve(stdout);
    });
  });
}

// Endpoint to get lex tokens only
app.post('/api/lexer', async (req, res) => {
  const { code } = req.body;
  try {
    saveCodeToFile(code);
    // Run cli.js with "lexer" argument, ensuring the file passed has a .struct extension.
    const command = `node ${path.join(__dirname, 'cli.js')} lexer ${tempFilePath}`;
    const output = await runCommand(command);
    res.json({ output });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Endpoint to get parse tree only
app.post('/api/parser', async (req, res) => {
  const { code } = req.body;
  try {
    saveCodeToFile(code);
    const command = `node ${path.join(__dirname, 'cli.js')} parse ${tempFilePath}`;
    const output = await runCommand(command);
    res.json({ output });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Endpoint to get IR generation only
app.post('/api/ir', async (req, res) => {
  const { code } = req.body;
  try {
    saveCodeToFile(code);
    const command = `node ${path.join(__dirname, 'cli.js')} ir ${tempFilePath}`;
    const output = await runCommand(command);
    res.json({ output });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Endpoint for full execution: run the complete pipeline (using index.js)
app.post('/api/run', async (req, res) => {
  const { code } = req.body;
  try {
    saveCodeToFile(code);
    const command = `node ${path.join(__dirname, 'index.js')} ${tempFilePath}`;
    const output = await runCommand(command);
    res.json({ output });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Start the API server
app.listen(port, () => {
  console.log(`Backend API server is running on port ${port}`);
});
