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

// Example usage
const operations = [
    { operation: 'add', args: [8, 5], expected: '13' },
    { operation: 'subtract', args: [8, 5], expected: '3' },
    { operation: 'multiply', args: [8, 5], expected: '40' },
    { operation: 'divide', args: [8, 5], expected: '1.6' },
];

operations.forEach(test => {
    runCalculator(test.operation, test.args, result => {
        console.log(`Operation: ${test.operation}(${test.args.join(', ')})`);
        console.log(`Expected: ${test.expected}`);
        console.log(`Result: ${result}`);
        console.log(`Test ${result === test.expected ? 'Passed' : 'Failed'}`);
        console.log('---');
    });
});
