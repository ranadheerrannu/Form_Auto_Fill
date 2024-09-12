document.getElementById("fill").addEventListener("click", () => {
  // Randomly select a data set
  const randomIndex = Math.floor(Math.random() * predefinedDataSets.length);
  const selectedDataSet = predefinedDataSets[randomIndex];

  // Send message to content script to fill the form
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: fillFormsAndRichTextEditors,
      args: [selectedDataSet],
    });
  });
});

function fillFormsAndRichTextEditors(data) {
  // function to trigger events of html elements
  function triggerAllEvents(field, value) {
    // Step 2: Create and dispatch common events in sequence
    const events = [
      "input",
      "change",
      "blur",
      "focus",
      "keydown",
      "keyup",
      "keypress",
    ];

    events.forEach((eventType) => {
      const event = new Event(eventType, {
        bubbles: true, // allow event to bubble up through the DOM
        cancelable: true, // allow event to be canceled
      });

      field.dispatchEvent(event); // dispatch the event for each event type
    });
  }

  // Function to fill rich text editor fields
  function fillRichTextEditors(data) {
    // Example 1: TinyMCE (iframe-based editor)
    const tinyMCEIframes = document.querySelectorAll('iframe[id^="mce_"]');
    tinyMCEIframes.forEach((iframe) => {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;
      const body = iframeDocument.querySelector("body");
      if (body) {
        body.innerHTML = data.description; // Insert the description as rich text
      }
    });

    // Example 2: CKEditor (iframe-based editor)
    const ckeditorIframes = document.querySelectorAll(
      "iframe.cke_wysiwyg_frame"
    );
    ckeditorIframes.forEach((iframe) => {
      const iframeDocument =
        iframe.contentDocument || iframe.contentWindow.document;
      const body = iframeDocument.querySelector("body");
      if (body) {
        body.innerHTML = data.description;
      }
    });

    // Example 3: Quill or any editor using contentEditable
    const quillEditors = document.querySelectorAll(
      'div[contenteditable="true"]'
    );
    quillEditors.forEach((editor) => {
      editor.innerHTML = data.description; // Set the rich text content
    });
  }

  function fillFormOnPage(data) {
    document.querySelectorAll("input, select, textarea").forEach((input) => {
      let fieldType = input.type || input.tagName.toLowerCase();
      let fieldName = input.name;
      if (fieldType === "select" || fieldType === "select-one") {
        if (input.options && input.options.length > 0) {
          const randomIndex = Math.floor(Math.random() * input.options.length);
          input.selectedIndex = randomIndex;
        }
      } else if (fieldType === "checkbox" || fieldType === "radio") {
        input.checked = true;
      } else if (data[fieldName]) {
        input.value = data[fieldName];
      } else if (data[fieldType]) {
        input.value = data[fieldType];
      } else {
        input.value = data.text;
      }
      triggerAllEvents(input);
    });
  }
  fillFormOnPage(data);
  fillRichTextEditors(data);
}
