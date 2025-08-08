const subjectSelect = document.getElementById('subjects');
const checkboxes = document.querySelectorAll('.checkboxes input[type="checkbox"]');
const startTime = document.getElementById('startTime');
const endTime = document.getElementById('endTime');
const note = document.getElementById('note');
const addButton = document.getElementById('addButton');
const cancelButton = document.getElementById('cancelButton');
const subjectsList = document.getElementById('subjectsList');
const generateButton = document.getElementById('generateButton');
const result = document.getElementById('result');
const saveButton = document.getElementById('saveButton');
const search = document.getElementById('search');

let subjectsData = [];
let editIndex = null;

function getSelectedDays() {
    return Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);
}

function getSelectedSubjects() {
    return Array.from(subjectSelect.selectedOptions).map(opt => opt.value);
}

function clearForm() {
    subjectSelect.selectedIndex = -1;
    checkboxes.forEach(cb => cb.checked = false);
    startTime.value = '';
    endTime.value = '';
    note.value = '';
    addButton.textContent = 'Adicionar Matéria';
    cancelButton.style.display = 'none';
    editIndex = null;
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
      <button onclick="editSubject(${index})">Editar</button> 
      <button onclick="deleteSubject(${index})">Excluir</button>`;
        subjectsList.appendChild(div);
    });
}

function addSubject() {
    const selectedDays = getSelectedDays();
    const selectedSubjects = getSelectedSubjects();

    if (selectedSubjects.length === 0) return alert('Selecione pelo menos uma matéria.');
    if (selectedDays.length === 0) return alert('Selecione pelo menos um dia.');
    if (!startTime.value || !endTime.value) return alert('Preencha os horários.');
    if (startTime.value >= endTime.value) return alert('Horário de início deve ser antes do fim.');

    if (editIndex !== null) {
        subjectsData[editIndex] = {
            subject: selectedSubjects[0],
            days: selectedDays,
            start: startTime.value,
            end: endTime.value,
            note: note.value
        };
    } else {
        selectedSubjects.forEach(sub => {
            subjectsData.push({
                subject: sub,
                days: selectedDays,
                start: startTime.value,
                end: endTime.value,
                note: note.value
            });
        });
    }

    clearForm();
    renderSubjects();
}

function editSubject(index) {
    const s = subjectsData[index];
    for (let i = 0; i < subjectSelect.options.length; i++) {
        subjectSelect.options[i].selected = subjectSelect.options[i].value === s.subject;
    }
    checkboxes.forEach(cb => cb.checked = s.days.includes(cb.value));
    startTime.value = s.start;
    endTime.value = s.end;
    note.value = s.note;
    addButton.textContent = 'Salvar Alteração';
    cancelButton.style.display = 'inline-block';
    editIndex = index;
}

function deleteSubject(index) {
    if (confirm('Tem certeza?')) {
        subjectsData.splice(index, 1);
        renderSubjects();
    }
}

function generateTable() {
    if (subjectsData.length === 0) return alert('Adicione pelo menos uma matéria.');

    const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];

    let timeSlots = new Set();
    subjectsData.forEach(s => {
        timeSlots.add(`${s.start}|${s.end}`);
    });
    timeSlots = Array.from(timeSlots).sort((a, b) => {
        const [startA] = a.split('|');
        const [startB] = b.split('|');
        return startA.localeCompare(startB);
    });

    const tableData = {};
    timeSlots.forEach(slot => {
        tableData[slot] = {};
        days.forEach(day => {
            tableData[slot][day] = [];
        });
    });

    subjectsData.forEach(s => {
        s.days.forEach(day => {
            const key = `${s.start}|${s.end}`;
            if (tableData[key] && tableData[key][day]) {
                tableData[key][day].push({subject: s.subject, note: s.note});
            }
        });
    });

    let html = '<table class="schedule-table">';
    html += '<thead><tr><th>Horário</th>';
    days.forEach(day => {
        html += `<th>${day}</th>`;
    });
    html += '</tr></thead><tbody>';

    timeSlots.forEach(slot => {
        const [start, end] = slot.split('|');
        html += `<tr><td class="time-cell"><strong>${start} até ${end}</strong></td>`;

        days.forEach(day => {
            const subjects = tableData[slot][day];
            if (subjects.length === 0) {
                html += '<td class="empty-cell">-</td>';
            } else {
                html += '<td class="subjects-cell">';
                subjects.forEach(s => {
                    html += `<div class="subject-block"><strong>${s.subject}</strong>`;
                    if (s.note) html += `<br><em>${s.note}</em>`;
                    html += '</div>';
                });
                html += '</td>';
            }
        });

        html += '</tr>';
    });

    html += '</tbody></table>';

    result.innerHTML = html;
    saveButton.style.display = 'inline-block';
}

function saveAsImage() {
    if (!window.html2canvas) {
        alert('Biblioteca html2canvas não carregada.');
        return;
    }
    html2canvas(result).then(canvas => {
        const link = document.createElement('a');
        link.download = 'grade.png';
        link.href = canvas.toDataURL();
        link.click();
    });
}

addButton.onclick = addSubject;
generateButton.onclick = generateTable;
search.oninput = renderSubjects;
saveButton.onclick = saveAsImage;
cancelButton.onclick = clearForm;

renderSubjects();
