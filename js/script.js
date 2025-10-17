const subjectSelect = document.getElementById('subjects');
const checkboxes = document.querySelectorAll('.checkboxes input[type="checkbox"]');
const selectTimesButton = document.getElementById('selectTimesButton');
const subjectTimesContainer = document.getElementById('subjectTimesContainer');
const addButton = document.getElementById('addButton');
const cancelButton = document.getElementById('cancelButton');
const subjectsList = document.getElementById('subjectsList');
const generateButton = document.getElementById('generateButton');
const result = document.getElementById('result');
const saveButton = document.getElementById('saveButton');
const search = document.getElementById('search');

let subjectsData = [];

const horarios = [
  { label: "Aula 1: 07:30 — 08:20", start: "07:30", end: "08:20" },
  { label: "Aula 2: 08:20 — 09:10", start: "08:20", end: "09:10" },
  { label: "Aula 3: 09:10 — 10:00", start: "09:10", end: "10:00" },
  { label: "Aula 4: 10:15 — 11:05", start: "10:15", end: "11:05" },
  { label: "Aula 5: 11:05 — 11:55", start: "11:05", end: "11:55" },
  { label: "Aula 6: 11:55 — 12:45", start: "11:55", end: "12:45" },
  { label: "Aula 7: 13:45 — 14:35", start: "13:45", end: "14:35" },
  { label: "Aula 8: 14:35 — 15:25", start: "14:35", end: "15:25" },
  { label: "Aula 9: 15:40 — 16:30", start: "15:40", end: "16:30" }
];

function getSelectedDays() {
  return Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.value);
}

function getSelectedSubjects() {
  return Array.from(subjectSelect.selectedOptions).map(opt => opt.value);
}

function renderSubjects() {
  subjectsList.innerHTML = '';
  const filter = search.value.toLowerCase();
  const filtered = subjectsData.filter(s => s.subject.toLowerCase().includes(filter));

  if (filtered.length === 0) {
    subjectsList.textContent = 'Nenhuma matéria adicionada.';
    return;
  }

  filtered.forEach((s, index) => {
    const div = document.createElement('div');
    div.className = 'subject-item';
    div.innerHTML = `<strong>${s.subject}</strong> | ${s.days.join(', ')} | ${s.start} - ${s.end} | ${s.note || ''}
      <button onclick="deleteSubject(${index})">Excluir</button>`;
    subjectsList.appendChild(div);
  });
}

function deleteSubject(index) {
  if (confirm('Tem certeza?')) {
    subjectsData.splice(index, 1);
    renderSubjects();
  }
}

function createSubjectRow(subjectName) {
  const div = document.createElement('div');
  div.className = 'subject-item';
  div.dataset.subject = subjectName;

  div.innerHTML = `
    <strong>${subjectName}</strong><br>
    <label>Horário:
      <select class="timeSelect">
        ${horarios.map(h => `<option value="${h.start}|${h.end}">${h.label}</option>`).join('')}
      </select>
    </label>
    <label>Anotação:
      <input type="text" class="noteInput" placeholder="Opcional">
    </label>
    <button type="button" class="duplicateButton">Adicionar outra vez</button>
    <hr>
  `;

  div.querySelector('.duplicateButton').onclick = () => {
    const newRow = createSubjectRow(subjectName);
    subjectTimesContainer.insertBefore(newRow, div.nextSibling);
  };

  return div;
}

function generateScheduleSelectors() {
  const selectedSubjects = getSelectedSubjects();
  const selectedDays = getSelectedDays();

  if (selectedSubjects.length === 0) return alert('Selecione pelo menos uma matéria.');
  if (selectedDays.length === 0) return alert('Selecione pelo menos um dia.');

  subjectTimesContainer.innerHTML = '';
  subjectTimesContainer.style.display = 'block';
  addButton.style.display = 'inline-block';
  cancelButton.style.display = 'inline-block';

  selectedSubjects.forEach(sub => {
    const row = createSubjectRow(sub);
    subjectTimesContainer.appendChild(row);
  });
}

function addSubjectsToList() {
  const selectedDays = getSelectedDays();
  const timeSelectors = subjectTimesContainer.querySelectorAll('.timeSelect');
  const noteInputs = subjectTimesContainer.querySelectorAll('.noteInput');
  const subjects = subjectTimesContainer.querySelectorAll('.subject-item');

  subjects.forEach((div, i) => {
    const subject = div.dataset.subject;
    const [start, end] = timeSelectors[i].value.split('|');
    const note = noteInputs[i].value;

    subjectsData.push({ subject, days: selectedDays, start, end, note });
  });

  subjectTimesContainer.style.display = 'none';
  addButton.style.display = 'none';
  cancelButton.style.display = 'none';
  renderSubjects();
}

function cancelSelection() {
  subjectTimesContainer.style.display = 'none';
  addButton.style.display = 'none';
  cancelButton.style.display = 'none';
}

function generateTable() {
  if (subjectsData.length === 0) return alert('Adicione pelo menos uma matéria.');

  const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

  let timeSlots = new Set(subjectsData.map(s => `${s.start}|${s.end}`));
  timeSlots = Array.from(timeSlots).sort((a, b) => a.localeCompare(b));

  const tableData = {};
  timeSlots.forEach(slot => {
    tableData[slot] = {};
    days.forEach(day => (tableData[slot][day] = []));
  });

  subjectsData.forEach(s => {
    s.days.forEach(day => {
      const key = `${s.start}|${s.end}`;
      if (tableData[key] && tableData[key][day]) {
        tableData[key][day].push({ subject: s.subject, note: s.note });
      }
    });
  });

  let html = '<table class="schedule-table">';
  html += '<thead><tr><th>Horário</th>';
  days.forEach(day => (html += `<th>${day}</th>`));
  html += '</tr></thead><tbody>';

  timeSlots.forEach(slot => {
    const [start, end] = slot.split('|');
    html += `<tr><td class="time-cell"><strong>${start} até ${end}</strong></td>`;

    days.forEach(day => {
      const subjects = tableData[slot][day];
      html += '<td>';
      if (subjects.length === 0) {
        html += '-';
      } else {
        subjects.forEach(s => {
          html += `<div class="subject-block"><strong>${s.subject}</strong>${s.note ? `<br><em>${s.note}</em>` : ''}</div>`;
        });
      }
      html += '</td>';
    });
    html += '</tr>';
  });

  html += '</tbody></table>';
  result.innerHTML = html;
  saveButton.style.display = 'inline-block';
}

function saveAsImage() {
  html2canvas(result).then(canvas => {
    const link = document.createElement('a');
    link.download = 'grade.png';
    link.href = canvas.toDataURL();
    link.click();
  });
}

// Event listeners
selectTimesButton.onclick = generateScheduleSelectors;
addButton.onclick = addSubjectsToList;
cancelButton.onclick = cancelSelection;
generateButton.onclick = generateTable;
saveButton.onclick = saveAsImage;
search.oninput = renderSubjects;

renderSubjects();
