class MinimalReporter {
    onRunComplete(_, results) {
        console.log(); // empty line
        results.testResults.forEach(result => {
            console.log(passFail(result.numFailingTests === 0), result.testFilePath.replace(__dirname + '/', ''));
            result.testResults.forEach(testResult => {
                console.log('    ', passFail(testResult.status === 'passed'), testResult.fullName);
            });
        });
        if (results.numFailedTests > 0) {
            console.log("Failed tests:", results.numFailedTests);
            process.exit(1);
        } else {
            console.log("All tests passed");
            process.exit(0);
        }
    }
}

function passFail(b) {
    return b ? "✓" : "✗";
}
module.exports = MinimalReporter;