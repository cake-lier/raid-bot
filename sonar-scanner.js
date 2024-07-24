const scanner = require('sonarqube-scanner');

void scanner(
    {
        options: {
            "sonar.sources": "src/main",
            "sonar.tests": "src/test",
        },
    },
    () => process.exit()
);