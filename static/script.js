const grid = document.getElementById('grid');
const addModal = document.getElementById('addModal');
const clearModal = document.getElementById('clearModal');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const refreshBtn = document.getElementById('refreshBtn');
const addForm = document.getElementById('addForm');
const confirmClear = document.getElementById('confirmClear');
const cancelClear = document.getElementById('cancelClear');
const closes = document.getElementsByClassName('close');

function toggleMainButtons(disabled) {
  const buttons = document.querySelectorAll('.controls button, .item button');
  buttons.forEach(button => button.disabled = disabled);
}

async function loadItems() {
  const response = await fetch('/api/workplaces');
  const items = await response.json();
  renderItems(items);
}

for (let close of closes) {
  close.onclick = function() {
    addModal.style.display = 'none';
    clearModal.style.display = 'none';
    toggleMainButtons(false);
  };
}

window.onclick = function(event) {
  if (event.target === addModal || event.target === clearModal) {
    addModal.style.display = 'none';
    clearModal.style.display = 'none';
    toggleMainButtons(false);
  }
};

addBtn.onclick = function() {
  addModal.style.display = 'block';
  toggleMainButtons(true);
};

addForm.onsubmit = async function(event) {
  event.preventDefault();
  const company = document.getElementById('company').value;
  const term = document.getElementById('term').value;
  const response = await fetch('/api/workplaces', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ company, term })
  });
  if (response.ok) {
    addModal.style.display = 'none';
    toggleMainButtons(false);
    addForm.reset();
    await loadItems();
  }
};

clearBtn.onclick = function() {
  clearModal.style.display = 'block';
  toggleMainButtons(true);
};

confirmClear.onclick = async function() {
  const response = await fetch('/api/workplaces', { method: 'DELETE' });
  if (response.ok) {
    clearModal.style.display = 'none';
    toggleMainButtons(false);
    await loadItems();
  }
};

cancelClear.onclick = function() {
  clearModal.style.display = 'none';
  toggleMainButtons(false);
};

refreshBtn.onclick = async function() {
  await loadItems();
};

function renderItems(items) {
  grid.innerHTML = '';
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = 'item';
    div.innerHTML = `
      <div class="item-top">
        <p class="term">Срок: ${item.term} мес.</p>
        <button class="delete-btn" data-id="${item.id}">Удалить</button>
      </div>
      <div class="company-box">
        <p class="company">${item.company}</p>
      </div>
    `;
    grid.appendChild(div);
  });

  document.querySelectorAll('.delete-btn').forEach(button => {
    button.onclick = async () => {
      const id = button.dataset.id;
      await deleteItem(id);
    };
  });
}

async function deleteItem(id) {
  const response = await fetch(`/api/workplaces/${id}`, { method: 'DELETE' });
  if (response.ok) {
    await loadItems();
  }
}

window.onload = loadItems;