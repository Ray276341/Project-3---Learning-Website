const axios = require("axios");

// Các test case
const testCases = [
    { input: "2 3", expectedOutput: "5\n" },
    { input: "10 20", expectedOutput: "30\n" },
    { input: "-5 5", expectedOutput: "0\n" }
];

const userCode = `
    const x = readInt();
    const y = readInt();

    function sum(a, b) {
        return a + b;
    }

    console.log(sum(x, y));
    `;

async function executeCode(language, version, code, input = "") {
    const data = {
        language: language,
        version: version,
        files: [
            {
                name: "main",
                content: code
            }
        ],
        stdin: input
    };

    try {
        const response = await axios.post("https://emkc.org/api/v2/piston/execute", data, {
            headers: { "Content-Type": "application/json" }
        });
        return response.data.run.stdout;
    } catch (error) {
        console.error("Lỗi:", error.response ? error.response.data : error.message);
        return error.response ? error.response.data : error.message;
    }
}

async function runTests() {
    let score = 0;

    for (const [index, test] of testCases.entries()) {

        const output = await executeCode("javascript", "18.15.0", userCode, test.input);
        
        if (output == test.expectedOutput) {
            console.log(`Testcase ${index + 1}: Đúng`);
            score++;
        } else {
            console.log(`Testcase ${index + 1}: Sai (Đầu ra: ${output}, Kỳ vọng: ${test.expectedOutput})`);
        }
    }

    console.log(`\nKết quả: ${score}/${testCases.length} testcase đúng`);
}

// Gọi hàm chạy test
runTests();
