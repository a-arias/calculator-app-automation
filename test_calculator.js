const { exec } = require('child_process');

function runCalculator(operation, args, callback) {
    const command = `docker run --rm public.ecr.aws/l4q9w4c5/loanpro-calculator-cli ${operation} ${args.join(' ')}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            callback(`Error: ${error.message}`);
        } else if (stderr) {
            callback(`Stderr: ${stderr}`);
        } else {
            callback(stdout.trim());
        }
    });
}

// Helper function to log test results
function logTestResult(operation, args, expected, result) {
    console.log(`Operation: ${operation}(${args.join(', ')})`);
    console.log(`Expected: ${expected}`);
    console.log(`Result: ${result}`);
    const passed = result === expected || (expected === 'Error' && result.includes('Error'));
    console.log(`Test ${passed ? 'Passed' : 'Failed'}`);
    console.log('---');
}

// Test cases
const testCases = [
    // Valid operations
    { operation: 'add', args: [8, 5], expected: '13' },
    { operation: 'subtract', args: [8, 5], expected: '3' },
    { operation: 'multiply', args: [8, 5], expected: '40' },
    { operation: 'divide', args: [8, 5], expected: '1.6' },

    // Edge cases
    { operation: 'add', args: [9999999999999999, 1], expected: '10000000000000000' }, //1.0E16 instead of 1E16 or 10000000000000000
    { operation: 'subtract', args: [-9999999999999999, 1], expected: '-10000000000000000' },// -1.0E16 -1E16 or -10000000000000000
    { operation: 'multiply', args: [1e10, 1e10], expected: '1e+20' }, //1.0E20 instead of 1e+20
    { operation: 'divide', args: [1e-10, 1e10], expected: '1e-20' }, //this is failing because is putting 1.000000000000000 (15 zeros plus) 
 
    // Testing very large numbers
    { operation: 'add', args: [1e308, 1e308], expected: 'Infinity' },
    { operation: 'multiply', args: [1e154, 1e154], expected: '1e308' },

    // Testing very small numbers
    { operation: 'subtract', args: [1e-308, 1e-308], expected: '0' },
    { operation: 'divide', args: [1e-308, 1e308], expected: '0' },

    // Precision edge cases
    { operation: 'add', args: [1.000000000000001, 1.000000000000001], expected: '2.000000000000002' },
    { operation: 'add', args: [1.0000000000000001, 1.0000000000000001], expected: '2' },

    // Negative numbers
    { operation: 'add', args: [-8, -5], expected: '-13' },
    { operation: 'subtract', args: [-8, 5], expected: '-13' },
    { operation: 'multiply', args: [-8, -5], expected: '40' },
    { operation: 'divide', args: [-8, -4], expected: '2' },

    // Mixed integer and floating-point numbers
    { operation: 'add', args: [8, 5.5], expected: '13.5' },
    { operation: 'subtract', args: [8.5, 5], expected: '3.5' },
    { operation: 'multiply', args: [8, 0.5], expected: '4' },
    { operation: 'divide', args: [8.5, 4], expected: '2.125' },

    // Special characters or non-numeric inputs (expected to handle errors gracefully)
    { operation: 'add', args: ['a', 'b'], expected: 'Error' },
    { operation: 'subtract', args: ['!', '@'], expected: 'Error' },
    { operation: 'multiply', args: [null, undefined], expected: 'Error' },
    { operation: 'divide', args: ['%', '^'], expected: 'Error' }
];

// Execute test cases
testCases.forEach(test => {
    runCalculator(test.operation, test.args, result => {
        // Handling expected 'Error' cases
        if (test.expected === 'Error') {
            if (result.startsWith('Error') || result.startsWith('Stderr')) {
                logTestResult(test.operation, test.args, test.expected, 'Error');
            } else {
                logTestResult(test.operation, test.args, test.expected, result);
            }
        } else {
            logTestResult(test.operation, test.args, test.expected, result);
        }
    });
});
