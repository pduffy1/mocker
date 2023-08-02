function showProgress(progress, text = "") {
  // Remember to print a newline once finished
  const textWidth = 20;
  const percentageWidth = 6;
  const progressPlaceholder = progress
    .toFixed(0)
    .padStart(percentageWidth, " ");
  const donePlaceholder = (
    progress === 100 ? "\x1b[32mDone\x1b[0m" : ""
  ).padEnd(4, " ");

  process.stdout.cursorTo(0);
  process.stdout.write(
    `${text.padEnd(
      textWidth,
      " "
    )} ${progressPlaceholder}%    ${donePlaceholder}`
  );
}

module.exports = { showProgress };
