"use strict";

const parentContainer = document.querySelector(".parent_container");
const showInput = document.getElementById("show_of_words");
const displayInput = document.getElementById("display_of_words");
const hideInput = document.getElementById("hide_of_words");
const numberOfWords = document.getElementById("numberOfWords");

parentContainer.addEventListener("focusout", function (e) {
  let input = e.target;
  if (input.tagName !== "INPUT") return;

  const val = Number(input.value);

  if (input.id === "numberOfWords") {
    const errorMsg = input.nextElementSibling;
    if (input.value !== "" && (val <= 0 || val > 20)) {
      input.style.borderColor = "#B05564";
      errorMsg.style.display = "block";
    } else {
      resetStyle(input, errorMsg);
      if (input.value !== "") generateWordInputs(val);
    }
    return;
  }

  validateAllDurations();
});

function validateAllDurations() {
  const showVal = showInput.value === "" ? null : Number(showInput.value);
  const displayVal =
    displayInput.value === "" ? null : Number(displayInput.value);
  const hideVal = hideInput.value === "" ? null : Number(hideInput.value);
  const numberWords =
    numberOfWords.value === "" ? null : Number(numberOfWords.value);

  if (
    (displayVal !== null || hideVal !== null) &&
    (numberWords === null || showVal === null)
  ) {
    applyError(
      numberOfWords,
      "يجب أن يكون عدد الكلمات عددًا صحيحًا من 1 إلى 20",
    );
    applyError(showInput, "يجب أن تكون مدة العرض أكبر من صفر");

    applyError(
      displayInput,
      "يجب أن تكون مدة الظهور صفر أو أكثر وأقل من مدة عرض الكلمة",
    );
    applyError(
      hideInput,
      "يجب أن تكون مدة الاختفاء صفر أو أكثر، وأقل من مدة عرض الكلمة",
    );

    return;
  }

  if (showVal !== null && showVal <= 0) {
    applyError(showInput, "يجب أن تكون مدة العرض أكبر من صفر");
    applyError(
      displayInput,
      "يجب أن تكون مدة الظهور صفر أو أكثر وأقل من مدة عرض الكلمة",
    );
    applyError(
      hideInput,
      "يجب أن تكون مدة الاختفاء صفر أو أكثر، وأقل من مدة عرض الكلمة",
    );
    if (numberWords <= 0) {
      applyError(
        numberOfWords,
        "يجب أن يكون عدد الكلمات عددًا صحيحًا من 1 إلى 20",
      );
    }
  } else {
    resetStyle(showInput, showInput.nextElementSibling);

    if (displayVal !== null) {
      if (displayVal < 0 || (showVal !== null && displayVal > showVal)) {
        applyError(
          displayInput,
          "يجب أن تكون مدة الظهور صفر أو أكثر وأقل من مدة عرض الكلمة",
        );
      } else {
        resetStyle(displayInput, displayInput.nextElementSibling);
      }
    }

    if (hideVal !== null) {
      if (showVal !== null && displayVal !== null && showVal === displayVal) {
        if (hideVal > 0) {
          applyError(
            hideInput,
            "بما أن مدتا الظهور والعرض متساويتان، فمدة الاختفاء لا يمكن أن تزيد عن الصفر",
          );
        } else {
          resetStyle(hideInput, hideInput.nextElementSibling);
        }
      } else if (hideVal < 0 || (showVal !== null && hideVal >= showVal)) {
        applyError(
          hideInput,
          "يجب أن تكون مدة الاختفاء صفر أو أكثر، وأقل من مدة عرض الكلمة",
        );
      } else {
        resetStyle(hideInput, hideInput.nextElementSibling);
      }
    }
  }
}

function applyError(input, message) {
  const errorMsg = input.nextElementSibling;
  input.style.borderColor = "#B05564";
  errorMsg.style.display = "block";
  errorMsg.innerText = message;
}

function resetStyle(input, errorMsg) {
  input.style.borderColor = "#ffffff";
  errorMsg.style.display = "none";
}

function generateWordInputs(count) {
  let boxOfValue = "";
  for (let i = 1; i <= count; i++) {
    boxOfValue += `
        <div class="container_input_word">
            <label class="label_of_word">الكلمة : #${i < 10 ? "0" + i : i}</label>
            <input class="input_word" type="text" dir="rtl" />
        </div>`;
  }
  document.getElementById("finalResult").innerHTML = boxOfValue;
  checkFormValidity();
}

function generateKeyframes(words, show, hold, hide) {
  let totalTime = words.length * (show + hold + hide);
  let currentTime = 0;
  let frames = `0% {content: "";}\n`;

  words.forEach((word) => {
    let step = show / word.length;

    let text = "";
    for (let i = 0; i < word.length; i++) {
      text += word[i];
      currentTime += step;
      let percent = ((currentTime / totalTime) * 100).toFixed(4);
      frames += `${percent}% {content: "${text}";}\n`;
    }

    currentTime += hold;
    let percentHold = ((currentTime / totalTime) * 100).toFixed(4);
    frames += `${percentHold}% {content: "${word}";}\n`;

    let deleteStep = hide / word.length;
    for (let i = word.length - 1; i >= 0; i--) {
      text = word.substring(0, i);
      currentTime += deleteStep;
      let percent = ((currentTime / totalTime) * 100).toFixed(4);
      frames += `${percent}% {content: "${text}";}\n`;
    }
  });

  frames += `100% {content: "";}`;
  return frames;
}

function generateCSS(words, show, hold, hide) {
  let totalTime = words.length * (show + hold + hide);

  let keyframes = generateKeyframes(words, show, hold, hide);

  return `
.test::after {
  content: "";
  animation: typing ${totalTime}s linear infinite;
}

@keyframes typing {
  0% {content: "";}
  ${keyframes}
}
`;
}

function getWords() {
  let inputs = document.querySelectorAll(".input_word");
  let words = [];

  inputs.forEach((input) => {
    let value = input.value.trim();
    if (value) words.push(value);
  });

  return words;
}

document.getElementById("generate-code").addEventListener("click", () => {
  let words = getWords();

  let show = Number(showInput.value);
  let display = Number(displayInput.value);
  let hide = Number(hideInput.value);

  let css = generateCSS(words, show, display, hide);

  document.getElementById("result").textContent = css;
  applyPreview(css);
});

function applyPreview(css) {
  let styleTag = document.getElementById("preview-style");

  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "preview-style";
    document.head.appendChild(styleTag);
  }
  document.querySelector(".preview_text").innerHTML = "";
  styleTag.innerHTML = css;
}

document.getElementById("copy").addEventListener("click", () => {
  let text = document.getElementById("result").textContent;

  navigator.clipboard.writeText(text);

  let copyBtn = document.querySelector("#copy");
  let doneBtn = document.querySelector(".btn_done_copy");

  copyBtn.classList.add("d-none");
  doneBtn.classList.remove("d-none");

  setTimeout(() => {
    doneBtn.classList.add("d-none");
    copyBtn.classList.remove("d-none");
  }, 1000);
});

function checkFormValidity() {
  const showValue = showInput.value === "" ? null : Number(showInput.value);
  const hideValue = hideInput.value === "" ? null : Number(hideInput.value);
  const displayValue =
    displayInput.value === "" ? null : Number(displayInput.value);
  const numberWordsValue =
    numberOfWords.value === "" ? null : Number(numberOfWords.value);

  const btn = document.getElementById("generate-code");

  if (
    numberWordsValue === null ||
    numberWordsValue <= 0 ||
    numberWordsValue > 20 ||
    showValue === null ||
    showValue <= 0 ||
    displayValue === null ||
    displayValue < 0 ||
    displayValue > showValue ||
    hideValue === null ||
    hideValue < 0 ||
    hideValue >= showValue
  ) {
    btn.disabled = true;
    return;
  }

  const words = document.querySelectorAll(".input_word");

  if (words.length === 0) {
    btn.disabled = true;
    return;
  }

  let allFilled = true;

  words.forEach((input) => {
    if (input.value.trim() === "") {
      allFilled = false;
    }
  });
  btn.disabled = !allFilled;
}

parentContainer.addEventListener("input", checkFormValidity);
