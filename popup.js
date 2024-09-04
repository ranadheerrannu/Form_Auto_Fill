document.getElementById("fill").addEventListener("click", () => {
  // Randomly select a data set
  const randomIndex = Math.floor(Math.random() * predefinedDataSets.length);
  const selectedDataSet = predefinedDataSets[randomIndex];

  // Send message to content script to fill the form
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: fillFormOnPage,
      args: [selectedDataSet],
    });
  });
});

function fillFormOnPage(data) {
  document.querySelectorAll("input, select, textarea").forEach((input) => {
    console.log(input);
    let fieldType = input.type || input.tagName.toLowerCase();
    let fieldName = input.name;

    if (fieldType === "select" || fieldType === "select-one") {
      input.selectedIndex = 0;
    } else if (fieldType === "checkbox" || fieldType === "radio") {
      input.checked = true;
    } else if (data[fieldName]) {
      input.value = data[fieldName];
    } else if (data[fieldType]) {
      input.value = data[fieldType];
    } else {
      input.value = data.text;
    }
  });
}
