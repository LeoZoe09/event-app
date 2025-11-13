{
  "default": {
    "require": [
      "features/step_definitions/**/*.ts"
    ],
    "requireModule": [
      "ts-node/register"
    ],
    "format": [
      "html:reports/cucumber-report.html",
      "json:reports/cucumber-report.json",
      "progress-bar"
    ],
    "formatOptions": {
      "snippetInterface": "async-await"
    }
  }
}
