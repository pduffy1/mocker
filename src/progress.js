function showProgress(progress, text = "") {
  process.stdout.cursorTo(0);
  process.stdout.write(
    `${text}... ${
      progress === 100 ? "\x1b[32mCompleted\x1b[0m" : `${progress.toFixed(0)}%`
    }`
  );
}

module.exports = { showProgress };
