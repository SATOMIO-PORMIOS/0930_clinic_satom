(() => {
  const form = document.getElementById('reservation-form');
  const department = document.getElementById('department');
  const visitTypeInputs = [...document.querySelectorAll('input[name="visitType"]')];
  const patientNumberField = document.getElementById('patient-number-field');
  const vaccinationField = document.getElementById('vaccination-field');
  const checkupField = document.getElementById('checkup-field');
  const date1 = document.getElementById('date1');
  const date2 = document.getElementById('date2');
  const time1 = document.getElementById('time1');
  const time2 = document.getElementById('time2');
  const message = document.getElementById('message');
  const messageCount = document.getElementById('message-count');
  const confirmationPanel = document.getElementById('confirmation-panel');
  const confirmationContent = document.getElementById('confirmation-content');
  const completionPanel = document.getElementById('completion-panel');
  const backButton = document.getElementById('back-button');
  const completeButton = document.getElementById('complete-button');
  const steps = [...document.querySelectorAll('.step-list li')];

  const today = new Date();
  const todayString = [today.getFullYear(), String(today.getMonth() + 1).padStart(2, '0'), String(today.getDate()).padStart(2, '0')].join('-');
  date1.min = todayString;
  date2.min = todayString;

  const setStep = (index) => {
    steps.forEach((step, i) => step.classList.toggle('is-active', i === index));
  };

  const showConditionalFields = () => {
    vaccinationField.hidden = department.value !== '予防接種';
    checkupField.hidden = department.value !== '健康診断';
  };
  department.addEventListener('change', showConditionalFields);

  const showPatientNumber = () => {
    const selected = form.querySelector('input[name="visitType"]:checked');
    patientNumberField.hidden = !selected || selected.value !== '再診';
  };
  visitTypeInputs.forEach((input) => input.addEventListener('change', showPatientNumber));

  message.addEventListener('input', () => {
    messageCount.textContent = `${message.value.length} / 500`;
  });

  const allTimeSlots = [
    '9:00〜10:00',
    '10:00〜11:00',
    '11:00〜12:00',
    '13:00〜14:00',
    '14:00〜15:00',
    '15:00〜16:00',
    '16:00〜17:00',
    '17:00〜18:00'
  ];

  const updateTimeOptions = (dateInput, timeSelect) => {
    const currentValue = timeSelect.value;
    let availableSlots = allTimeSlots;

    if (dateInput.value) {
      const selectedDate = new Date(`${dateInput.value}T00:00:00`);
      if (selectedDate.getDay() === 6) {
        availableSlots = allTimeSlots.slice(0, 3);
      }
    }

    timeSelect.innerHTML = '<option value="">選択してください</option>' +
      availableSlots.map((slot) => `<option value="${slot}">${slot}</option>`).join('');

    if (availableSlots.includes(currentValue)) {
      timeSelect.value = currentValue;
    }
  };

  const validateClinicDate = (input, timeSelect) => {
    if (!input.value) return true;
    const date = new Date(`${input.value}T00:00:00`);
    const day = date.getDay();
    if (day === 0 || day === 4) {
      input.setCustomValidity('木曜・日曜は休診日のため選択できません。');
      return false;
    }
    input.setCustomValidity('');
    if (timeSelect) timeSelect.setCustomValidity('');
    return true;
  };

  date1.addEventListener('change', () => {
    updateTimeOptions(date1, time1);
    validateClinicDate(date1, time1);
  });

  date2.addEventListener('change', () => {
    updateTimeOptions(date2, time2);
    validateClinicDate(date2, time2);
  });

  [time1, time2].forEach((element) => {
    element.addEventListener('change', () => {
      validateClinicDate(date1, time1);
      validateClinicDate(date2, time2);
    });
  });

  updateTimeOptions(date1, time1);
  updateTimeOptions(date2, time2);

  const setError = (fieldName, messageText) => {
    const target = document.querySelector(`[data-error-for="${fieldName}"]`);
    if (target) target.textContent = messageText;
  };

  const clearErrors = () => {
    document.querySelectorAll('.field-error').forEach((element) => { element.textContent = ''; });
    form.querySelectorAll('[aria-invalid="true"]').forEach((element) => element.removeAttribute('aria-invalid'));
  };

  const validateForm = () => {
    clearErrors();
    validateClinicDate(date1, time1);
    validateClinicDate(date2, time2);
    let valid = true;

    const radio = form.querySelector('input[name="visitType"]:checked');
    if (!radio) {
      setError('visitType', '初診または再診を選択してください。');
      valid = false;
    }

    const requiredFields = ['department', 'name', 'kana', 'birthdate', 'phone', 'email', 'date1', 'time1', 'consent'];
    requiredFields.forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      if (!field.checkValidity()) {
        const messageText = field.validationMessage || '入力内容をご確認ください。';
        setError(name, messageText);
        if (field.setAttribute) field.setAttribute('aria-invalid', 'true');
        valid = false;
      }
    });

    [date2, time2].forEach((field) => {
      if (!field.checkValidity()) {
        setError(field.name, field.validationMessage);
        field.setAttribute('aria-invalid', 'true');
        valid = false;
      }
    });

    return valid;
  };

  const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

  const buildConfirmation = () => {
    const data = new FormData(form);
    const detail = department.value === '予防接種' ? data.get('vaccination') : department.value === '健康診断' ? data.get('checkup') : '';
    const rows = [
      ['受診区分', data.get('visitType')],
      ...(data.get('visitType') === '再診' && data.get('patientNumber') ? [['診察券番号', data.get('patientNumber')]] : []),
      ['診療内容', data.get('department')],
      ...(detail ? [['内容詳細', detail]] : []),
      ['お名前', data.get('name')],
      ['ふりがな', data.get('kana')],
      ['生年月日', data.get('birthdate')],
      ['電話番号', data.get('phone')],
      ['メールアドレス', data.get('email')],
      ['第1希望', `${data.get('date1')} ${data.get('time1')}`],
      ['第2希望', data.get('date2') ? `${data.get('date2')} ${data.get('time2') || ''}` : '—'],
      ['症状・ご相談内容', data.get('message') || '—']
    ];

    confirmationContent.innerHTML = `<table class="confirmation-table"><tbody>${rows.map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value).replace(/\n/g, '<br>')}</td></tr>`).join('')}</tbody></table>`;
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!validateForm()) {
      const firstInvalid = form.querySelector('[aria-invalid="true"]') || form.querySelector('input[name="visitType"]');
      firstInvalid?.focus();
      return;
    }
    buildConfirmation();
    form.hidden = true;
    confirmationPanel.hidden = false;
    completionPanel.hidden = true;
    setStep(1);
    confirmationPanel.scrollIntoView({behavior:'smooth',block:'start'});
  });

  backButton.addEventListener('click', () => {
    confirmationPanel.hidden = true;
    form.hidden = false;
    setStep(0);
    form.scrollIntoView({behavior:'smooth',block:'start'});
  });

  completeButton.addEventListener('click', () => {
    confirmationPanel.hidden = true;
    completionPanel.hidden = false;
    setStep(2);
    completionPanel.scrollIntoView({behavior:'smooth',block:'start'});
  });
})();
