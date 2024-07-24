const scanner = require("sonarqube-scanner").default;

scanner(
    {
        options: {
            "sonar.sources": "src/main",
            "sonar.tests": "src/test",
            "sonar.organization": "cake-lier",
            "sonar.projectKey": "cake-lier_raid-bot",
        },
    },
    (error) => {
        if (error) {
            console.error(error);
        }
        process.exit();
    },
);
