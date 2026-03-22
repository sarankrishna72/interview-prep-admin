(function () {
  const formData = window.questionFormData || {
    questionType: 'mcq',
    options: [],
    correctIndex: [],
    code: ''
  };

  const questionTypeEl = document.getElementById('question_type');
  const optionsWrap = document.getElementById('optionsWrap');
  const addOptionBtn = document.getElementById('addOptionBtn');
  const correctIndexEl = document.getElementById('correctIndex');
  const categoryEl = document.getElementById('category');
  const codeTextarea = document.getElementById('code');
  const editor = document.getElementById("editor");

  (function updateCodeValOnLoad() {
    setTimeout(() => {
      editor.innerHTML = detectLanguage(formData.code);
    }, 1)
   
  })();

  function detectLanguage(text) {
    let highlighted;
    if (categoryEl.value == "html") {
      highlighted = Prism.highlight(
        text,
        Prism.languages.markup,
        'markup'
      );
    } else  if (categoryEl.value == "css") {
      highlighted = Prism.highlight(
        text,
        Prism.languages.css,
        'css'
      );
    } else {
      highlighted = Prism.highlight(
        text,
        Prism.languages.javascript,
        'javascript'
      );
    }
    return highlighted;
  }

  function insertTextAtCursor(text) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  function insertLineBreak() {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    range.deleteContents();

    const br = document.createElement('br');
    const zwsp = document.createTextNode('\u200B'); // keeps caret on same line properly

    range.insertNode(zwsp);
    range.insertNode(br);

    range.setStartAfter(zwsp);
    range.setEndAfter(zwsp);

    selection.removeAllRanges();
    selection.addRange(range);
  }



  function getCursorOffset(container) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return 0;

    const range = selection.getRangeAt(0);
    const preCaretRange = range.cloneRange();

    preCaretRange.selectNodeContents(container);
    preCaretRange.setEnd(range.endContainer, range.endOffset);

    return preCaretRange.toString().length;
  }

  function setCursorOffset(container, offset) {
    const selection = window.getSelection();
    const range = document.createRange();

    let currentOffset = 0;
    let found = false;

    function walk(node) {
      if (found) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const nextOffset = currentOffset + node.nodeValue.length;

        if (offset <= nextOffset) {
          range.setStart(node, offset - currentOffset);
          range.collapse(true);
          found = true;
          return;
        }

        currentOffset = nextOffset;
        return;
      }

      for (let child of node.childNodes) {
        walk(child);
        if (found) return;
      }
    }

    walk(container);

    if (!found) {
        range.selectNodeContents(container);
        range.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(range);
  }

  function updateHighlight(e) {
    const cursorOffset = getCursorOffset(editor);
    const text = editor.innerText;
    if (text === '\n') {
        editor.innerHTML = '';
        return;
    }
    codeTextarea.value = text;
    editor.innerHTML = detectLanguage(text);
    setCursorOffset(editor, cursorOffset);
  }

  editor.addEventListener("input", (event) => updateHighlight(event));
  editor.addEventListener('keydown', function (e) {
      if (e.key === 'Tab') {
          e.preventDefault();
          insertTextAtCursor('    '); // 4 spaces
          return;
      }

      if (e.key === 'Enter') {
          e.preventDefault();
          insertLineBreak();
          return;
      }
  });




  if (!questionTypeEl || !optionsWrap || !addOptionBtn || !correctIndexEl) return;
  

  function getOptionItems() {
    return Array.from(document.querySelectorAll('.option-item'));
  }

  function updateCorrectIndexes() {
    const checkedBoxes = Array.from(document.querySelectorAll('.option-correct:checked'));
    const indexes = checkedBoxes.map((checkbox) => Number(checkbox.dataset.index));
    correctIndexEl.value = JSON.stringify(indexes);
  }

  function reIndexOptions() {
    const items = getOptionItems();

    items.forEach((item, index) => {
      const label = item.querySelector('.option-label');
      const input = item.querySelector('.option-input');
      const checkbox = item.querySelector('.option-correct');

      if (label) label.textContent = `Option ${index + 1}`;
      if (input) input.name = 'options[]';
      if (checkbox) checkbox.dataset.index = index;
    });

    updateCorrectIndexes();
  }

  function handleCorrectSelection(changedCheckbox) {
    const allCheckboxes = Array.from(document.querySelectorAll('.option-correct'));

    if (questionTypeEl.value === 'mcq' || questionTypeEl.value === 'boolean') {
      allCheckboxes.forEach((checkbox) => {
        if (checkbox !== changedCheckbox) {
          checkbox.checked = false;
        }
      });
    }

    updateCorrectIndexes();
  }

  function bindOptionEvents(optionItem) {
    const checkbox = optionItem.querySelector('.option-correct');
    const removeBtn = optionItem.querySelector('.remove-option-btn');

    if (checkbox) {
      checkbox.addEventListener('change', function () {
        handleCorrectSelection(this);
      });
    }

    if (removeBtn) {
      removeBtn.addEventListener('click', function () {
        maxOptError.innerHTML = '';
        optionItem.remove();
        reIndexOptions();
      });
    }
  }

  function createOption({
    value = '',
    checked = false,
    removable = true,
    readOnly = false
  } = {}) {
    const index = getOptionItems().length;

    const optionItem = document.createElement('div');
    optionItem.className = 'option-item';

    optionItem.innerHTML = `
      <div class="option-top">
        <label class="option-label">Option ${index + 1}</label>
        ${
          removable
            ? `<button type="button" class="btn btn-danger btn-sm remove-option-btn">Remove</button>`
            : ''
        }
      </div>

      <div class="option-row form-group d-flex align-items-center justify-between gap-12px">
        <input
          type="text"
          name="options[]"
          class="option-input"
          placeholder="Enter option..."
          value="${escapeHtml(value)}"
          ${readOnly ? 'disabled' : ''}
          ${readOnly ? 'readonly' : ''}
          required
        />
        <label class="checkbox-label d-flex">
          <input
            type="checkbox"
            class="option-correct"
            data-index="${index}"
            ${checked ? 'checked' : ''}
          />
          Correct
        </label>
      </div>
    `;

    optionsWrap.appendChild(optionItem);
    bindOptionEvents(optionItem);
  }

  function renderBooleanOptions(correctIndexes = []) {
    optionsWrap.innerHTML = '';

    createOption({
      value: 'True',
      checked: correctIndexes.includes(0),
      removable: false,
      readOnly: true
    });

    createOption({
      value: 'False',
      checked: correctIndexes.includes(1),
      removable: false,
      readOnly: true
    });

    addOptionBtn.style.display = 'none';
    reIndexOptions();
  }

  function renderNormalOptions(options = [], correctIndexes = []) {
    optionsWrap.innerHTML = '';

    if (options.length) {
      options.forEach((option, index) => {
        createOption({
          value: option,
          checked: correctIndexes.includes(index),
          removable: true,
          readOnly: false
        });
      });
    } else {
      createOption({
        value: '',
        checked: false,
        removable: true,
        readOnly: false
      });
    }

    addOptionBtn.style.display = 'inline-flex';
    reIndexOptions();
  }


  function renderByType() {
    const type = questionTypeEl.value;

    if (type === 'boolean') {
      renderBooleanOptions(formData.correctIndex || []);
      return;
    }

    renderNormalOptions(formData.options || [], formData.correctIndex || []);
  }

  function resetDataForTypeChange() {
    formData.options = [];
    formData.correctIndex = [];
  }

  questionTypeEl.addEventListener('change', function () {
    resetDataForTypeChange();

    if (this.value === 'boolean') {
      renderBooleanOptions([]);
    } else {
      renderNormalOptions([], []);
    }
  });

  addOptionBtn.addEventListener('click', function () {
    maxOptError.innerHTML = '';
    if (getOptionItems().length >= 4) {
      maxOptError.innerHTML = "Can't add more than 4 options";
      return;
    }
    createOption({
      value: '',
      checked: false,
      removable: true,
      readOnly: false
    });
    reIndexOptions();
  });

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  questionTypeEl.value = formData.questionType || 'mcq';
  renderByType();
})();