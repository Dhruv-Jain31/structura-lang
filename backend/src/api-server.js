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

// Temporary file path to store playground code
const tempFilePath = path.join(__dirname, 'temp.struct');

// Function to write the incoming code to the temporary file
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
    // Command: run cli.js with the "lexer" argument
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
    // Command: run cli.js with the "parse" argument
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
    // Command: run cli.js with the "ir" argument
    const command = `node ${path.join(__dirname, 'cli.js')} ir ${tempFilePath}`;
    const output = await runCommand(command);
    res.json({ output });
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Endpoint for full execution (run the complete pipeline)
app.post('/api/run', async (req, res) => {
  const { code } = req.body;
  try {
    saveCodeToFile(code);
    // Command: run index.js which processes the complete pipeline
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
