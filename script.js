"use strict";

const products = {
  study: {
    title: "Foldable Study Table",
    description: "A compact work surface for focused study or remote work, designed to fold away and free up floor space between sessions."
  },
  shoe: {
    title: "Wall-Mounted Shoe Rack",
    description: "A wall-mounted storage concept that keeps shoes organised and helps a narrow entryway feel more open."
  },
  wall: {
    title: "Foldable Wall Table",
    description: "A flexible surface for meals, projects or everyday tasks that can fold flat when you want the room back."
  },
  corner: {
    title: "Compact L-Shaped Table",
    description: "An L-shaped workspace concept for making productive use of a corner while keeping the main floor area clear."
  },
  custom: {
    title: "Custom Space-Saving Furniture",
    description: "A made-to-fit concept shaped around your room, the dimensions you provide and the way you want to use the space."
  }
};

const menuToggle = document.querySelector(".menu-toggle");
const primaryNav = document.querySelector("#primary-nav");

menuToggle.addEventListener("click", () => {
  const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
  menuToggle.setAttribute("aria-expanded", String(!isOpen));
  menuToggle.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
  primaryNav.classList.toggle("is-open", !isOpen);
});

primaryNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    primaryNav.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation");
  });
});

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const roomImageInput = document.querySelector("#room-image");
const uploadArea = document.querySelector("#upload-area");
const uploadPlaceholder = document.querySelector("#upload-placeholder");
const roomPreview = document.querySelector("#room-preview");
const removeImageButton = document.querySelector("#remove-image");
const cameraPreview = document.querySelector("#camera-preview");
const cameraStatus = document.querySelector("#camera-status");
const startCameraButton = document.querySelector("#start-camera");
const capturePhotoButton = document.querySelector("#capture-photo");
const stopCameraButton = document.querySelector("#stop-camera");
let previewUrl = null;
let cameraStream = null;

document.querySelector("#choose-image").addEventListener("click", () => roomImageInput.click());

function showImage(file) {
  if (!file || !file.type.startsWith("image/")) {
    cameraStatus.textContent = file ? "Choose a valid image file." : "";
    return;
  }
  stopCamera();
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  previewUrl = URL.createObjectURL(file);
  roomPreview.src = previewUrl;
  roomPreview.hidden = false;
  uploadPlaceholder.hidden = true;
  removeImageButton.hidden = false;
  cameraStatus.textContent = "Photo ready on this device.";
}

roomImageInput.addEventListener("change", () => {
  const [file] = roomImageInput.files;
  if (file) showImage(file);
});

["dragenter", "dragover"].forEach((eventName) => {
  uploadArea.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadArea.classList.add("is-dragging");
  });
});
["dragleave", "drop"].forEach((eventName) => {
  uploadArea.addEventListener(eventName, (event) => {
    event.preventDefault();
    uploadArea.classList.remove("is-dragging");
  });
});
uploadArea.addEventListener("drop", (event) => {
  const [file] = event.dataTransfer.files;
  if (file) showImage(file);
});

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  cameraPreview.srcObject = null;
  cameraPreview.hidden = true;
  capturePhotoButton.hidden = true;
  stopCameraButton.hidden = true;
  startCameraButton.hidden = false;
}

startCameraButton.addEventListener("click", async () => {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    cameraStatus.textContent = "Camera is unavailable here. Upload a photo instead.";
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    cameraPreview.srcObject = cameraStream;
    cameraPreview.hidden = false;
    startCameraButton.hidden = true;
    capturePhotoButton.hidden = false;
    stopCameraButton.hidden = false;
    cameraStatus.textContent = "Camera on. Your photo is not sent anywhere.";
  } catch (error) {
    cameraStatus.textContent = error.name === "NotAllowedError"
      ? "Camera permission was declined. You can upload a photo instead."
      : "Could not start the camera. You can upload a photo instead.";
  }
});

capturePhotoButton.addEventListener("click", () => {
  if (!cameraStream || !cameraPreview.videoWidth) {
    cameraStatus.textContent = "Camera is still starting. Try again in a moment.";
    return;
  }
  const canvas = document.createElement("canvas");
  canvas.width = cameraPreview.videoWidth;
  canvas.height = cameraPreview.videoHeight;
  canvas.getContext("2d").drawImage(cameraPreview, 0, 0);
  canvas.toBlob((blob) => {
    if (!blob) {
      cameraStatus.textContent = "Could not capture that photo. Please try again or upload an image.";
      return;
    }
    showImage(new File([blob], "room-photo.jpg", { type: "image/jpeg" }));
    stopCamera();
  }, "image/jpeg", 0.9);
});

stopCameraButton.addEventListener("click", () => {
  stopCamera();
  cameraStatus.textContent = "Camera stopped.";
});

function clearImage() {
  stopCamera();
  if (previewUrl) {
    URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }
  roomPreview.removeAttribute("src");
  roomPreview.hidden = true;
  uploadPlaceholder.hidden = false;
  removeImageButton.hidden = true;
  roomImageInput.value = "";
  cameraStatus.textContent = "";
}

removeImageButton.addEventListener("click", clearImage);
window.addEventListener("pagehide", () => {
  stopCamera();
  if (previewUrl) URL.revokeObjectURL(previewUrl);
});

const designerForm = document.querySelector("#designer-form");
const designerError = document.querySelector("#designer-error");
const analysisResult = document.querySelector("#analysis-result");
const analysisLoading = document.querySelector("#analysis-loading");
const recommendationList = document.querySelector("#recommendation-list");
const analyzeButton = document.querySelector("#analyze-button");
const unitFactors = { cm: 1, m: 100, in: 2.54, ft: 30.48 };
const furnitureOptions = {
  table: {
    name: "Compact Table", widthCm: 80, heightCm: 74, depthCm: 45, minimumWidthCm: 45,
    why: "A compact rectangular surface can suit a clear wall span without occupying a full room-sized footprint.",
    benefit: "Small footprint; can be paired with a folding chair and positioned close to the wall.",
    customization: "Ask about a narrower top, shallow depth or a fold-away version."
  },
  chair: {
    name: "Space-Saving Chair", widthCm: 45, heightCm: 82, depthCm: 46, minimumWidthCm: 35,
    why: "A single compact seat needs less clear wall width than a multi-seat option.",
    benefit: "Lightweight, movable seating keeps floor space flexible between uses.",
    customization: "Ask about stackable, armless or fold-flat styles."
  },
  study: {
    name: "Compact Study Table", widthCm: 90, heightCm: 74, depthCm: 45, minimumWidthCm: 50,
    why: "The measured span can guide a narrower study surface; for a small wall, a foldable top is a practical alternative.",
    benefit: "A shallow or fold-away worktop can free up floor area after study time.",
    customization: "Ask about cable routing, shelves, a reduced depth or a foldable wall-mounted top."
  },
  "shoe-rack": {
    name: "Wall-Mounted Shoe Rack", widthCm: 75, heightCm: 60, depthCm: 25, minimumWidthCm: 35,
    why: "A wall-mounted rack uses vertical wall space and can suit a narrow entry if the wall and door swing are clear.",
    benefit: "Keeps storage off the floor and helps maintain a clearer walkway.",
    customization: "Ask about a narrower layout, number of shelves and mounting position."
  },
  foldable: {
    name: "Foldable Table", widthCm: 85, heightCm: 74, depthCm: 40, minimumWidthCm: 45,
    why: "A folding surface can fit a usable wall span and tuck away when it is not needed.",
    benefit: "Opens up floor space between meals, projects or work sessions.",
    customization: "Ask about wall-mounted or freestanding construction and folded depth."
  },
  "l-shaped": {
    name: "Compact L-Shaped Table", widthCm: 100, heightCm: 74, depthCm: 60, minimumWidthCm: 75,
    why: "An L-shaped surface can make a corner useful when both adjoining wall runs and the floor depth are clear.",
    benefit: "Uses corner area for a work zone while keeping the centre of the room more open.",
    customization: "Ask about left/right orientation, both wall spans and a reduced return depth."
  },
  custom: {
    name: "Custom Space-Saving Furniture", widthCm: 70, heightCm: 74, depthCm: 40, minimumWidthCm: 1,
    why: "A made-to-fit concept can be planned around the width you measured and any room constraints you share.",
    benefit: "Can be tailored to awkward corners, storage needs and limited floor area.",
    customization: "Share wall, height and depth measurements plus your preferred materials and storage needs."
  }
};
const furnitureVisuals = {
  table: '<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M20 38h60l-5 8H25l-5-8Z" fill="currentColor" opacity=".8"/><path d="M29 46v34m42-34v34M24 80h52" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M35 32h30" stroke="currentColor" stroke-width="2" opacity=".5"/></svg>',
  chair: '<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M34 22v35h39V28a6 6 0 0 0-6-6H34Z" stroke="currentColor" stroke-width="4"/><path d="M25 57h55l-5 8H30l-5-8Zm10 8v17m34-17v17" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>',
  study: '<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M17 37h66l-5 9H22l-5-9Z" fill="currentColor" opacity=".8"/><path d="M27 46v34m46-34v34M22 80h56" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M38 26h24v10H38z" stroke="currentColor" stroke-width="2" opacity=".55"/></svg>',
  "shoe-rack": '<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M26 20v61m48-61v61M26 37h48M26 55h48M26 73h48" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M34 32h18m8 18h8m-31 18h18" stroke="currentColor" stroke-width="5" stroke-linecap="round" opacity=".7"/></svg>',
  foldable: '<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M18 37h64l-5 9H23l-5-9Z" fill="currentColor" opacity=".8"/><path d="M30 46v31m40-31v31M25 77h50" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M50 46v28" stroke="currentColor" stroke-width="2" stroke-dasharray="3 4" opacity=".7"/></svg>',
  "l-shaped": '<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M20 33h58v11H20V33Zm0 11v37h10V44m48 0v37h-9V44M30 71h48" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><path d="M30 44h39v9H30z" fill="currentColor" opacity=".35"/></svg>',
  custom: '<svg viewBox="0 0 100 100" fill="none" aria-hidden="true"><path d="M24 25h52v52H24z" stroke="currentColor" stroke-width="3" stroke-dasharray="5 5"/><path d="M34 61h32l-4 7H38l-4-7Zm7 7v11m18-11v11" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M50 34v16m-8-8h16" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>'
};

function formatMeasurement(value, unit) {
  const rounded = Math.round(value * 10) / 10;
  return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)} ${unit}`;
}

function addDimension(label, value, unit) {
  const chip = document.createElement("div");
  chip.className = "dimension-chip";
  const caption = document.createElement("span");
  caption.textContent = label;
  const measurement = document.createElement("strong");
  measurement.textContent = formatMeasurement(value, unit);
  chip.append(caption, measurement);
  return chip;
}

function createRecommendationCard(type, details, dimensions, isCompact, unit) {
  const card = document.createElement("article");
  card.className = "recommendation-card";

  const top = document.createElement("div");
  top.className = "recommendation-card-top";
  const visual = document.createElement("div");
  visual.className = "recommendation-visual";
  visual.innerHTML = furnitureVisuals[type];
  const title = document.createElement("div");
  title.className = "recommendation-title";
  const label = document.createElement("small");
  label.textContent = isCompact ? "COMPACT / CUSTOM-SIZE IDEA" : "SIZE-BASED STARTING POINT";
  const heading = document.createElement("h4");
  heading.textContent = details.name;
  title.append(label, heading);
  top.append(visual, title);

  const body = document.createElement("div");
  body.className = "recommendation-card-body";
  const dimensionsList = document.createElement("div");
  dimensionsList.className = "recommendation-dimensions";
  dimensionsList.append(
    addDimension("Approx. width", dimensions.width, unit),
    addDimension("Approx. height", dimensions.height, unit),
    addDimension("Approx. depth", dimensions.depth, unit)
  );
  const suitability = document.createElement("p");
  suitability.className = "recommendation-copy";
  const suitabilityLabel = document.createElement("strong");
  suitabilityLabel.textContent = "Why it may suit: ";
  suitability.append(suitabilityLabel, document.createTextNode(details.why));
  const benefit = document.createElement("p");
  benefit.className = "recommendation-copy";
  const benefitLabel = document.createElement("strong");
  benefitLabel.textContent = "Space-saving benefit: ";
  benefit.append(benefitLabel, document.createTextNode(details.benefit));

  const actions = document.createElement("div");
  actions.className = "recommendation-actions";
  const customization = document.createElement("span");
  customization.className = "customization-note";
  customization.textContent = `Customise: ${details.customization}`;
  const requestButton = document.createElement("button");
  requestButton.className = "request-product-button";
  requestButton.type = "button";
  requestButton.dataset.requestProduct = heading.textContent;
  requestButton.dataset.requestDimensions =
    `W ${formatMeasurement(dimensions.width, unit)} × H ${formatMeasurement(dimensions.height, unit)} × D ${formatMeasurement(dimensions.depth, unit)}`;
  requestButton.textContent = "Request this furniture ↗";
  actions.append(customization, requestButton);
  body.append(dimensionsList, suitability, benefit, actions);
  card.append(top, body);
  return card;
}

designerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  designerError.textContent = "";
  const widthInput = document.querySelector("#wall-width");
  const inputWidth = Number(widthInput.value);
  const heightInput = document.querySelector("#room-height").value;
  const lengthInput = document.querySelector("#room-length").value;
  const unit = document.querySelector("#measurement-unit").value;
  const furnitureType = document.querySelector("#furniture-type").value;
  const selectedFile = roomImageInput.files[0];
  if (!selectedFile && !previewUrl) {
    designerError.textContent = "Add a room photo by uploading one or using your camera to continue.";
    return;
  }
  if (!Number.isFinite(inputWidth) || inputWidth <= 0 || inputWidth > 100000) {
    designerError.textContent = "Enter a width greater than zero and no more than 100,000 units.";
    widthInput.focus();
    return;
  }
  const optionalDimensions = [
    { input: document.querySelector("#room-height"), value: heightInput, label: "height" },
    { input: document.querySelector("#room-length"), value: lengthInput, label: "length / depth" }
  ];
  const invalidOptional = optionalDimensions.find(({ value }) => value !== "" && (!Number.isFinite(Number(value)) || Number(value) <= 0 || Number(value) > 100000));
  if (invalidOptional) {
    designerError.textContent = `Enter a valid ${invalidOptional.label} greater than zero, or leave it blank.`;
    invalidOptional.input.focus();
    return;
  }

  analyzeButton.disabled = true;
  analysisLoading.hidden = false;
  analysisResult.hidden = true;
  window.setTimeout(() => {
    const details = furnitureOptions[furnitureType];
    const availableWidthCm = inputWidth * unitFactors[unit];
    const widthCm = Math.min(details.widthCm, availableWidthCm * 0.8);
    const availableHeightCm = heightInput === "" ? null : Number(heightInput) * unitFactors[unit];
    const availableDepthCm = lengthInput === "" ? null : Number(lengthInput) * unitFactors[unit];
    const heightCm = availableHeightCm === null ? details.heightCm : Math.min(details.heightCm, availableHeightCm * 0.7);
    const depthLimitCm = availableDepthCm === null ? Infinity : availableDepthCm * 0.8;
    const depthCm = Math.min(details.depthCm, depthLimitCm);
    const isCompact = widthCm < details.minimumWidthCm;
    const dimensions = {
      width: widthCm / unitFactors[unit],
      height: heightCm / unitFactors[unit],
      depth: depthCm / unitFactors[unit]
    };

    document.querySelector("#result-title").textContent = isCompact
      ? "A narrower custom-size concept may be needed."
      : "A furniture idea shaped around your space.";
    document.querySelector("#result-summary").textContent =
      `Using your ${formatMeasurement(inputWidth, unit)} width${heightInput ? `, ${formatMeasurement(Number(heightInput), unit)} height` : ""}${lengthInput ? ` and ${formatMeasurement(Number(lengthInput), unit)} length / depth` : ""}, here is an approximate starting point. The photo is not measured or interpreted.`;
    recommendationList.replaceChildren(createRecommendationCard(
      furnitureType,
      details,
      dimensions,
      isCompact,
      unit
    ));
    analysisLoading.hidden = true;
    analysisResult.hidden = false;
    analyzeButton.disabled = false;
  }, 850);
});

document.querySelector("#edit-details").addEventListener("click", () => {
  analysisResult.hidden = true;
  designerForm.hidden = false;
  designerError.textContent = "";
});

document.querySelector("#recommendation-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-request-product]");
  if (!button) return;
  const productName = button.dataset.requestProduct;
  const dimensions = button.dataset.requestDimensions;
  document.querySelector("#request-product").value = productName;
  const requestMessage = document.querySelector("#request-message");
  requestMessage.value = `I'm interested in a ${productName} (demo estimate: ${dimensions}). Please contact me about custom dimensions and available options.`;
  document.querySelector("#request-feedback").textContent = "Recommendation added. Edit the request as needed, then validate the form below.";
  document.querySelector("#custom-request-form").scrollIntoView({ behavior: "smooth", block: "center" });
  requestMessage.focus({ preventScroll: true });
});

const customRequestForm = document.querySelector("#custom-request-form");
const requestFeedback = document.querySelector("#request-feedback");
customRequestForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!customRequestForm.reportValidity()) {
    requestFeedback.textContent = "Please check your name, email and request before continuing.";
    requestFeedback.classList.remove("is-success");
    return;
  }
  requestFeedback.textContent = "Your request is valid. This project demo does not send or store submissions; connect a trusted form service to receive them.";
  requestFeedback.classList.add("is-success");
});

const contactForm = document.querySelector("#contact-form");
const contactFeedback = document.querySelector("#contact-feedback");
contactForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!contactForm.reportValidity()) {
    contactFeedback.textContent = "Please check the highlighted fields and complete the form.";
    contactFeedback.classList.remove("is-success");
    return;
  }
  contactFeedback.textContent = "Thanks—your message is valid. This demo does not send or store it; connect a trusted form service to receive submissions.";
  contactFeedback.classList.add("is-success");
  contactForm.reset();
});

function setupVoiceInput(textareaId, controls) {
  const textarea = document.querySelector(`#${textareaId}`);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const language = document.createElement("select");
  language.setAttribute("aria-label", "Voice input language");
  language.innerHTML = '<option value="en-US">English</option><option value="hi-IN">हिन्दी</option>';

  const startButton = document.createElement("button");
  startButton.type = "button";
  startButton.className = "voice-button voice-start";
  startButton.innerHTML = '<span class="mic-icon" aria-hidden="true">🎙</span> Start listening';

  const stopButton = document.createElement("button");
  stopButton.type = "button";
  stopButton.className = "voice-button voice-stop";
  stopButton.innerHTML = '<span class="mic-icon" aria-hidden="true">■</span> Stop listening';
  stopButton.disabled = true;

  const status = document.createElement("span");
  status.className = "voice-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.textContent = "Uses your browser's speech service; microphone permission may be required.";
  controls.append(language, startButton, stopButton, status);

  if (!SpeechRecognition) {
    startButton.disabled = true;
    status.textContent = "Voice input is unsupported here. Please type your message.";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  let listening = false;

  function updateListeningState(isListening) {
    listening = isListening;
    controls.classList.toggle("is-listening", isListening);
    startButton.disabled = isListening;
    stopButton.disabled = !isListening;
    if (isListening) status.textContent = "Listening… speak now.";
  }

  recognition.onstart = () => updateListeningState(true);
  recognition.onresult = (event) => {
    let finalText = "";
    let interimText = "";
    for (let index = event.resultIndex; index < event.results.length; index += 1) {
      const transcript = event.results[index][0].transcript;
      if (event.results[index].isFinal) finalText += transcript;
      else interimText += transcript;
    }
    if (finalText) {
      const separator = textarea.value && !/\s$/.test(textarea.value) ? " " : "";
      textarea.value += `${separator}${finalText.trim()}`;
      textarea.dispatchEvent(new Event("input", { bubbles: true }));
    }
    status.textContent = interimText ? `Hearing: ${interimText}` : "Listening… speak now.";
  };
  recognition.onerror = (event) => {
    updateListeningState(false);
    const messages = {
      "not-allowed": "Microphone permission was denied. Allow it in your browser settings or type your message.",
      "service-not-allowed": "Speech recognition is blocked by the browser. You can type your message.",
      "audio-capture": "No microphone was found. Connect one or type your message.",
      "network": "Speech recognition needs a network connection. You can type your message."
    };
    status.textContent = messages[event.error] || "Voice input stopped. You can try again or type your message.";
  };
  recognition.onend = () => {
    const wasListening = listening;
    updateListeningState(false);
    if (wasListening) status.textContent = "Voice input stopped.";
  };

  language.addEventListener("change", () => {
    recognition.lang = language.value;
    if (listening) {
      recognition.stop();
      status.textContent = "Language changed. Start listening again.";
    }
  });
  recognition.lang = language.value;

  startButton.addEventListener("click", () => {
    recognition.lang = language.value;
    try {
      recognition.start();
    } catch (error) {
      status.textContent = error.name === "InvalidStateError"
        ? "Already listening. Use Stop listening before starting again."
        : "Could not start voice input. Check microphone permission or type your message.";
    }
  });
  stopButton.addEventListener("click", () => {
    if (listening) recognition.stop();
  });
}

document.querySelectorAll(".voice-controls[data-voice-controls]").forEach((controls) => {
  setupVoiceInput(controls.dataset.voiceControls, controls);
});

const productDialog = document.querySelector("#product-dialog");
document.querySelectorAll("[data-product]").forEach((button) => {
  button.addEventListener("click", () => {
    const product = products[button.dataset.product];
    if (!product) return;
    document.querySelector("#dialog-title").textContent = product.title;
    document.querySelector("#dialog-description").textContent = product.description;
    productDialog.showModal();
  });
});
document.querySelector("#dialog-close").addEventListener("click", () => productDialog.close());
document.querySelector("#dialog-contact").addEventListener("click", () => productDialog.close());
productDialog.addEventListener("click", (event) => {
  if (event.target === productDialog) productDialog.close();
});

document.querySelector("#current-year").textContent = new Date().getFullYear();
