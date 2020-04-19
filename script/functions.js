import lang from "./language.js";
import layout from "./layout.js";

function init() {
    const elemMain = document.createElement("main");
    const elemHeader = document.createElement("h1");
    const elemParagraph = document.createElement("p");
    const elemArticle = document.createElement("article");
    const elemTextarea = document.createElement("textarea");
    const elemDiv = document.createElement("div");
  
    const layoutLang = localStorage.getItem("layoutLang");
  
    elemMain.classList.add("fixed_container");
  
    elemHeader.classList.add("main_header");
    elemHeader.innerHTML = "Virtual Keyboard";
  
    elemParagraph.classList.add("main_paragraph");
    elemParagraph.innerHTML = "OS - Windows 10. Google Chrome. HotKey for change language - Left Shift + Left Alt";
  
    elemArticle.classList.add("main_workspace");
    
    elemTextarea.classList.add("workspace_textarea");
    elemTextarea.setAttribute("placeholder", "You will type here :)");
    elemTextarea.setAttribute("cols", "50");
    elemTextarea.setAttribute("rows", "5");
  
    elemDiv.classList.add("workspace_keyboard");
  
    document.body.appendChild(elemMain);
    elemMain.appendChild(elemHeader);
    elemMain.appendChild(elemParagraph);
    elemMain.appendChild(elemArticle);
    elemArticle.appendChild(elemTextarea);
    elemArticle.appendChild(elemDiv);
      
    createKeyboard(layoutLang);

    elemTextarea.focus();
    
    document.addEventListener("keydown", eventHandler);
    document.addEventListener("keyup", eventHandler);
    document.getElementsByClassName("workspace_keyboard")[0].addEventListener("mouseup", eventHandler);
    document.getElementsByClassName("workspace_keyboard")[0].addEventListener("mousedown", eventHandler); 
  }

  function eventHandler(event) {
    const e = event.type.match(/\b(mouse)/) ? { code: event.target.closest(".keyboard_key").getAttribute("Id"), type: event.type } : event;
    const activeButton = document.getElementById(e.code);
    const textarea = document.getElementsByTagName("textarea")[0];
    let layoutLang = localStorage.getItem("layoutLang");

    if (e.stopPropagation) e.stopPropagation();

    if (e.type.match(/\b(keydown|mousedown)/)) {
        if(e.type.match(/\b(key)/)) e.preventDefault();
        activeButton.setAttribute("isActiveKey", "1");

        if (e.code === "CapsLock") {
            document.isCapsLockActive = !document.isCapsLockActive;
            changeKeyboardLayout();
        }
        
        if (e.code === "AltLeft") document.isAltLeftActive = true;

        if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
            if(e.code === "ShiftLeft") document.isShiftLeftActive = true;
            if(e.code === "ShiftRight" || !document.isAltLeftActive) {
                document.isShiftActive = true;
                changeKeyboardLayout();
            }
        }

        if (document.isShiftLeftActive && document.isAltLeftActive) {            
            localStorage.setItem("layoutLang", layoutLang === "ru" ? "en" : "ru");

            changeKeyboardLayout();
        }

        textareaTrasform(activeButton, textarea, layoutLang);        
    }
    if (e.type.match(/\b(keyup|mouseup)/)) {
        if (e.code !== "CapsLock" || document.isCapsLockActive === false) activeButton.setAttribute("isActiveKey", "0");

        if (e.code === "ShiftLeft") document.isShiftLeftActive = false;
        if (e.code === "AltLeft") document.isAltLeftActive = false;

        if (e.code === "ShiftLeft" || e.code === "ShiftRight") {
            document.isShiftActive = false;
            changeKeyboardLayout();
        }
    }
  }

  function textareaTrasform(key, textarea, layoutLang) {
    const text = textarea.value;
    const keyObj = lang[layoutLang].find(x => x.code === key.id);
    let coursorPosition = textarea.selectionStart;

    const preText = text.slice(0, coursorPosition);
    const postText = text.slice(coursorPosition);

    if (key.getAttribute("isFuncKey") === "0") {
        const keyActiveValue = activeValueFinder(key);
        textarea.value = preText + keyActiveValue + postText;
        coursorPosition++;
    }
    else {
        switch (keyObj.code) {
            case "Tab":
                textarea.value = `${preText}\t${postText}`;
                coursorPosition++;
                break;
            case "Space":
                textarea.value = `${preText} ${postText}`;
                coursorPosition++;
                break;
            case "Enter":
                textarea.value = `${preText}\n${postText}`;
                coursorPosition++;
                break;
            case "Backspace":
                textarea.value = `${preText.slice(0, -1)}${postText}`;
                coursorPosition--;
                break;
            case "Delete":
                textarea.value = `${preText}${postText.slice(1)}`;
                break;
            case "ArrowLeft":
                coursorPosition > 0 ? coursorPosition-- : 0;
                break;
            case "ArrowRight":
                coursorPosition < textarea.value.length ? coursorPosition++ : textarea.value.length;
                break;
            case "ArrowUp":
                const preTextLastEnter = preText.lastIndexOf("\n") > -1 ? preText.lastIndexOf("\n") : 0;
                const preTextRowCount_KeyUp = !preText.match(/(\n)./g) ? 1 : preText.match(/(\n)./g).length + 1;
                const preTextInRowLength_KeyUp = preTextRowCount_KeyUp === 1 ? preText.length : preText.match(/(\n).*$/g)[0].length - 1;
                coursorPosition = preTextRowCount_KeyUp === 1 ? 0 : preText.lastIndexOf("\n", preText.length - (preTextInRowLength_KeyUp + 2)) + preTextInRowLength_KeyUp + 1;
                coursorPosition = coursorPosition > preTextLastEnter ? preTextLastEnter : coursorPosition;
                break;
            case "ArrowDown":
                const afterPreTextFirstEnterIndex = postText.indexOf("\n") > -1 ? preText.length + postText.indexOf("\n") : text.length;
                const afterPreTextSecondEnterIndex = text.slice(afterPreTextFirstEnterIndex + 1).indexOf("\n") > -1 ? afterPreTextFirstEnterIndex + text.slice(afterPreTextFirstEnterIndex + 1).indexOf("\n") + 1 : text.length;
                const textRowCount_KeyDown = !text.match(/(\n)./g) ? 1 : text.match(/(\n)./g).length + 1;
                const preTextRowCount_KeyDown = !preText.match(/(\n)./g) ? 1 : preText.match(/(\n)./g).length + 1;
                const preTextInRowLength_KeyDown = preTextRowCount_KeyDown === 1 ? preText.length : preText.match(/(\n).*$/g)[0].length - 1;
                
                coursorPosition = preTextRowCount_KeyDown === textRowCount_KeyDown ? text.length : preText.length + postText.indexOf("\n") + preTextInRowLength_KeyDown + 1;
                coursorPosition = coursorPosition > afterPreTextSecondEnterIndex ? afterPreTextSecondEnterIndex : coursorPosition;
                break;
        }
    }

    textarea.setSelectionRange(coursorPosition, coursorPosition);
  }

  function activeValueFinder(key) {
      const keyValues = key.children;

      for (let i = 0; i < keyValues.length; i++)
        if (keyValues[i].getAttribute("isActiveKeyValue"))
            return keyValues[i].innerText;
  }

  function changeKeyboardLayout() {
    const layoutLang = localStorage.getItem("layoutLang");
    const keyboardKeys = document.getElementsByClassName("keyboard_key");

    removeKeyValues();
    removeAdditionalKeyClasses();
    addKeyValues(keyboardKeys, layoutLang);
  }

  function removeKeyValues() {
      const keyValues = document.getElementsByClassName("keyboard_key_value");
      
      while (keyValues.length > 0) {
        keyValues[0].remove();
      }
  }

  function removeAdditionalKeyClasses() {
    const keys = document.getElementsByClassName("keyboard_key");

    for (let i = 0; i < keys.length; i++) keys[i].className = 'keyboard_key';
  }

  function addKeyValues (keysList, layoutLang) {
    for (let i = 0; i < keysList.length; i++) {
        const keyObj = lang[layoutLang].find(x => x.code === keysList[i].getAttribute("Id"));
        let keyValues = [];
        keyValues = buildKey(keyObj, keysList[i]);
        keyValues.forEach(x => keysList[i].appendChild(x));
    }
  }
  
  function createKeyboard(layoutLang) {
  
    layout.forEach(x => {
      const elemDivRow = document.createElement("div");
      const elemDivKeys = [];
      elemDivRow.classList.add("keyboard_row");
  
      document.getElementsByClassName("workspace_keyboard")[0].appendChild(elemDivRow);
  
      x.forEach(key => {
        const elemDivKey = document.createElement("div");
        elemDivKey.setAttribute("id", `${key}`);

        elemDivKeys.push(elemDivKey);
      });
      
      addKeyValues (elemDivKeys, layoutLang);
      elemDivKeys.forEach(x => elemDivRow.appendChild(x));
    });
  }
  
  function buildKey(keyObj, elemDivKey) {
    const elemDivKeyValues = [];
    const isShiftActive = document.isShiftActive || false;
    const isCapsLockActive = document.isCapsLockActive || false;

    elemDivKey.classList.add("keyboard_key");

    switch (keyObj.code) {
        case "Tab":
        case "Delete":
        case "ShiftRight":
        case "ControlLeft":
        case "ControlRight":
        case "AltLeft":
        case "AltRight":
        case "MetaLeft":
        case "ArrowUp":
        case "ArrowRight":
        case "ArrowDown":
        case "ArrowLeft":
        elemDivKey.classList.add("keyboard_key_width_4_75rem");
        break;
        case "CapsLock":
        elemDivKey.classList.add("keyboard_key_width_7rem");
        break;
        case "Backspace":
        elemDivKey.classList.add("keyboard_key_width_9_7rem");
        break;
        case "Enter":
        elemDivKey.classList.add("keyboard_key_width_9_9rem");
        break;
        case "ShiftLeft":
        elemDivKey.classList.add("keyboard_key_width_10_9rem");
        break;
        case "Space":
        elemDivKey.classList.add("keyboard_key_width_18_2rem");
        break;
    }

    if (keyObj.lower.match(/^[ёа-яa-z]$/)) {
        const letter = document.createElement("span");

        elemDivKey.classList.add("keyboard_key_content_center");
        letter.classList.add("keyboard_key_value_center", "keyboard_key_value");
        letter.setAttribute("isActiveKeyValue", "1");
        elemDivKey.setAttribute("isLetter", "1");
        elemDivKey.setAttribute("isFuncKey", "0");
        
        letter.innerHTML = ( isCapsLockActive === isShiftActive ) ? keyObj.lower : keyObj.upper;
        
        elemDivKeyValues.push(letter);
      }
      else if (keyObj.upper != undefined) {
        const lowerValue = document.createElement("span");
        const upperValue = document.createElement("span");

        elemDivKey.classList.add("keyboard_key_content_justify");
        lowerValue.classList.add("keyboard_key_value_down", "keyboard_key_value");
        upperValue.classList.add("keyboard_key_value_up", "keyboard_key_value");

        elemDivKey.setAttribute("isFuncKey", "0");
        isShiftActive ? upperValue.setAttribute("isActiveKeyValue", "1") : lowerValue.setAttribute("isActiveKeyValue", "1");

        upperValue.innerHTML = keyObj.upper;
        lowerValue.innerHTML = keyObj.lower;

        elemDivKeyValues.push(upperValue, lowerValue);
      }
      else {
        const buttonName = document.createElement("span");
        elemDivKey.setAttribute("isFuncKey", "1");

        if (keyObj.code.match(/\b(Tab|CapsLock|ShiftLeft)/)) {
          elemDivKey.classList.add("keyboard_key_content_left");
        }
        else if (keyObj.code.match(/\b(Backspace|Enter|Del|ShiftRight)/)) {
          elemDivKey.classList.add("keyboard_key_content_right");
        }
        else elemDivKey.classList.add("keyboard_key_content_center");
        
        buttonName.classList.add("keyboard_key_value_center", "keyboard_key_value");
        buttonName.setAttribute("isActiveKeyValue", "1");

        buttonName.innerHTML = keyObj.lower;
        
        elemDivKeyValues.push(buttonName);
      }

      return elemDivKeyValues;
  }

  export { init };