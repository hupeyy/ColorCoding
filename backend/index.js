const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 3000;
const fsPromises = fs.promises;

const tempDir = path.join(__dirname, 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

app.use(cors());
app.use(express.json());

app.post('/execute', async (req, res) => {
    const { code, language, testCases } = req.body;

    console.log("Received code: ", code);
    console.log("Received language: ", language);
    console.log("Received test cases: ", testCases);

    try {
        const result = await executeCode(code, language, testCases);
        res.json(result);
    } catch (error) {
        res.status(500).send(error.toString());
    }
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})

function getFileExtension(language) {
    switch (language) {
      case 'javascript': return 'js';
      case 'python': return 'py';
      case 'java': return 'java';
      case 'cpp': return 'cpp';
      default: throw new Error('Unsupported language');
    }
}

function runCode(filePath, language) {
    return new Promise((resolve, reject) => {
        let command;
        const quotedPath = `"${filePath}"`;

        switch (language) {
            case 'python':
                command = `python ${quotedPath}`;
                break;
            default:
                reject(new Error('Unsupported language'));
                return;
        }

        console.log(`Executing command: ${command}`);
        exec(command, { timeout: 5000, cwd: path.dirname(filePath) }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Execution error: ${error.message}`);
                reject(error);
            } else {
                console.log(`Executtion output: ${stdout}`);
                const result = parseExecutionResult(stdout);
                resolve(result);
            }
        });
    });
}

function parseExecutionResult(output) {
    const lines = output.split('\n');
    const summaryLine = lines.find(line => line.startsWith('SUMMARY:'));
    if (summaryLine) {
        const [passed, total] = summaryLine.match(/(\d+)\/(\d+)/)[0].split('/').map(Number);
        return {
            output: output,
            passed: passed,
            total: total
        };
    }
    return { output: output, passed: 0, total: 0 };
}

function gradeCode(code, language, testCases) {
    let fullCode = code.trim() + '\n\n';

    switch(language) {
        case 'python':
            fullCode += `
import json

def main():
    test_cases = ${JSON.stringify(testCases, null, 2).replace(/\n/g, '\n    ')}
    passed_count = 0
    total_count = len(test_cases)
    
    for i, test_case in enumerate(test_cases):
        inputs = test_case['input']
        expected = test_case['output']
        result = solution(*inputs)
        passed = result == expected
        if passed:
            passed_count += 1
        print(f"Test case {i + 1}: {'Passed' if passed else 'Failed'}")
        print(f"  Input: {inputs}")
        print(f"  Expected: {expected}")
        print(f"  Actual: {result}")
        print()
    
    print(f"SUMMARY: {passed_count}/{total_count} tests passed")

if __name__ == "__main__":
    main()
`.trimStart();
            break;

        default:
            throw new Error("Unsupported language");
    }

    return fullCode;
}

async function executeCode(code, language, testCases) {
    const fileName = `temp_${Date.now()}.${getFileExtension(language)}`;
    const filePath = path.join(__dirname, 'temp', fileName);

    try {
        const fullCode = gradeCode(code, language, testCases);
        await fsPromises.writeFile(filePath, fullCode);
        const result = await runCode(filePath, language);
        return result;
    } finally {
        try {
            await fsPromises.unlink(filePath);
        } catch (unlinkError) {
            console.error("Error deleting temporary file:", unlinkError);
        }
    }
}