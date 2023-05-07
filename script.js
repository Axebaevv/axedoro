'use strict';

const timerPomodoro = document.querySelector('.timer-pomodoro');
const timerShortBreak = document.querySelector('.timer-short-break');
const timerLongBreak = document.querySelector('.timer-long-break');
const timerShortBreakAnchor = document.querySelector('.timer-short-break a');
const timerLongBreakAnchor = document.querySelector('.timer-long-break a');
const timerCountdown = document.querySelector('.timer-countdown');
const timerSkip = document.querySelector('.timer-skip');

const soundAudio = document.querySelector('.sound-audio');
const soundAlarm = document.querySelector('.sound-alarm');

const cycleMessage = document.querySelector('.cycle-message');
const body = document.querySelector('body');

const btnStart = document.querySelector('.btn-start');

// add task
const addTaskWrapper = document.querySelector('.add-task-wrapper');
const btnAddTask = document.querySelector('.add-task-button');

const addTaskTextArea = document.querySelector('#add-task-text-area');
const btnAddNote = document.querySelector('.add-note');
const btnAddProject = document.querySelector('.add-project');

const btnCancel = document.querySelector('.btn-cancel');
const btnSave = document.querySelector('.btn-save');

const addTaskInput = document.querySelector('#add-task-input');
const addTaskText = document.querySelector('#add-task-title');
const btnIncrease = document.querySelector('.add-task-up');
const btnDecrease = document.querySelector('.add-task-down');

// task items
const taskItems = document.querySelector('.task-items');

let playStatus = false,
  pomodoroCycle = 0,
  currentPomodoro = 0,
  startedAt = [0, 0];

// time tracker
let timer = [1500, 300, 600];
let times = [...timer];
let countdownInterval;

// working with database
let database = [];

// style
const colors = ['#453C67', '#735F32', '#6D67E4'];
// const colors = ['#874C62', '#54BAB9', '#8FBDD3'];

// start functions
const minSec = time => {
  const min = Math.floor(time / 60);
  const sec = Math.floor(time % 60);

  return [min, sec];
};

const timerShow = (min, sec) =>
  (timerCountdown.textContent = `${min < 10 ? '0' : ''}${min}:${
    sec < 10 ? '0' : ''
  }${sec}`);

const countdown = t => {
  let pomodoro = times[t];
  let [min, sec] = minSec(pomodoro);
  if (pomodoro >= 0) {
    times[t]--;
    timerShow(min, sec);
  } else {
    playStatus = false;
    clearInterval(countdownInterval);
    countdownInterval = null;

    times = [...timer];
    // if it the cycle more then 2 we will move to the long break

    const [minr, secr] = minSec(times[t]);
    timerShow(minr, secr);
    let pomodoroCycleCount = (pomodoroCycle + 1) % 3;

    if (
      currentPomodoro === 0 &&
      pomodoroCycleCount === 0 &&
      pomodoroCycle !== 0
    ) {
      timerRegulatorWithoutListiener(
        timerLongBreak,
        '#397097',
        2,
        'Time for a break!'
      );
      currentPomodoro = 1;
      pomodoroCycle++;
      console.log(currentPomodoro);
      taskPomodoroCompletion();
    } else if (currentPomodoro === 1) {
      timerRegulatorWithoutListiener(timerPomodoro, '#ba4949', 0);
      console.log('short');
      soundAlarm.pause();
    } else if (currentPomodoro === 2) {
      timerRegulatorWithoutListiener(timerPomodoro, '#ba4949', 0);
      console.log('long');
      soundAlarm.pause();
    } else {
      timerRegulatorWithoutListiener(
        timerShortBreak,
        '#38858a',
        1,
        'Time for a break!'
      );
      pomodoroCycle++;
      taskPomodoroCompletion();
      soundAlarm.play();
    }

    btnStart.textContent = 'START';
    btnStart.classList.remove('active');
    timerSkip.classList.add('inactive');
    soundAudio.play();
  }
};

const toggleChecked = function (e) {
  e.currentTarget.classList.toggle('checked');
};

const checkToDoList = function () {
  const tasks = document.querySelectorAll('.task-check');

  tasks.forEach(task => {
    task.removeEventListener('click', toggleChecked);
    task.addEventListener('click', toggleChecked);
  });
};

// display all do to list
const updateToDoList = function () {
  if (database.length > 0) {
    for (const [i, data] of database.entries()) {
      const html = `<li class="task-item active">
                  <div class="task-item-header">
                    <svg
                      class="task-check"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      class="w-6 h-6"
                      data-check=${i}
                    >
                      <path
                        fill-rule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <p class="task-to-do">${data.title}</p>
                    <span class="task-cycle">
                      <span class="task-cycle-counter">0</span>/${
                        data.pomodoroNumber
                      }
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      data-index=${i}
                      fill="black"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="btn-edit task-header-edit task-item-edit"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                      />
                    </svg>
                  </div>
                  <p class="task-items-notice ${data.note ? '' : 'inactive'}">${
        data.note
      }</p>
                </li>`;

      if (!data.displayed) {
        taskItems.insertAdjacentHTML('beforeend', html);
        data.displayed = true;
      }
      console.log('database');
    }
  } else {
    taskItems.innerHTML = '';
  }
};

const timerSwitcher = (tag, color, t, message = 'Time to focus!') => {
  if (!playStatus) {
    body.style.backgroundColor = color;
    btnStart.style.color = color;

    timerShortBreak.classList.remove('active');
    timerLongBreak.classList.remove('active');
    timerPomodoro.classList.remove('active');
    tag.classList.add('active');

    currentPomodoro = t;

    cycleMessage.textContent = message;
    const [min, sec] = minSec(timer[t]);
    timerCountdown.textContent = timerShow(min, sec);
  } else alert('You can not switch in the process');
};

const timerRegulator = (tag, color, t, message = 'Time to focus!') => {
  tag.addEventListener(
    'click',
    timerSwitcher.bind(null, tag, color, t, message)
  );
};

const timerRegulatorWithoutListiener = (
  tag,
  color,
  t,
  message = 'Time to focus!'
) => {
  timerSwitcher(tag, color, t, message);
};

// info bar in the bottom
const taskPomodoroCompletion = () => {
  const taskTotal = document.querySelector('.task-total');
  const taskFinished = document.querySelector('.task-finished');
  const taskPomodoroInfo = document.querySelector('.task-pomodoro-info');
  // const taskFinishAt = document.querySelector('.task-finish-at');

  // task pomodoro info
  const totalPomodoroToFinish = database
    .map(data => data.pomodoroNumber)
    .reduce((acc, data) => acc + data, 0);

  taskTotal.textContent = totalPomodoroToFinish;
  taskFinished.textContent = pomodoroCycle;

  if (totalPomodoroToFinish > 0) {
    taskPomodoroInfo.classList.remove('inactive');
  }
};

const btnActionTaskFunction = (listener, wrapper, action = 'add') => {
  listener.addEventListener('click', e => {
    e.preventDefault();
    if (action === 'add') {
      wrapper.classList.add('active');
      listener.classList.add('inactive');
    } else {
      wrapper.classList.remove('active');
      listener.classList.remove('inactive');
    }
  });
};

// end function
// initialization
const [minI, secI] = minSec(timer[0]);
timerShow(minI, secI);

timerRegulator(timerPomodoro, colors[0], 0);
timerRegulator(timerShortBreak, colors[1], 1, 'Time for a break!');
timerRegulator(timerLongBreak, colors[2], 2, 'Time for a break!');

btnStart.addEventListener('click', () => {
  if (!countdownInterval) {
    countdownInterval = setInterval(countdown, 1000, currentPomodoro);
    btnStart.textContent = 'PAUSE';
    btnStart.classList.add('active');
    timerSkip.classList.remove('inactive');

    playStatus = true;
  } else {
    clearInterval(countdownInterval);
    countdownInterval = null;
    btnStart.textContent = 'START';
    btnStart.classList.remove('active');
    timerSkip.classList.add('inactive');
  }
  soundAudio.play();
});

timerSkip.addEventListener('click', e => {
  clearInterval(countdownInterval);
  countdownInterval = null;
  btnStart.textContent = 'START';
  btnStart.classList.remove('active');
  timerSkip.classList.add('inactive');
  playStatus = false;

  const [min, sec] = minSec(timer[currentPomodoro]);
  times = [...timer];
  timerCountdown.textContent = timerShow(min, sec);
  soundAudio.play();
});

btnActionTaskFunction(btnAddTask, addTaskWrapper);
btnActionTaskFunction(btnCancel, addTaskWrapper, 'remove');

btnAddNote.addEventListener('click', e => {
  document.querySelector('.add-note-text-toggle').textContent =
    btnAddNote.textContent.trim() === 'Add Note' ? 'Close Note' : 'Add Note';
  addTaskTextArea.classList.toggle('active');
  btnAddNote.classList.toggle('active');
});

// Pomodoro amount
btnIncrease.addEventListener('click', e => {
  addTaskInput.value = Number(addTaskInput.value) + 1;
});

btnDecrease.addEventListener('click', e => {
  if (Number(addTaskInput.value) > 0) {
    addTaskInput.value = Number(addTaskInput.value) + -1;
  }
});

// store into the database
btnSave.addEventListener('click', e => {
  e.preventDefault();

  addTaskWrapper.classList.remove('active');
  btnAddTask.classList.remove('inactive');

  let title = addTaskText.value.trim();
  let pomodoroNumber = Number(addTaskInput.value);
  let note = addTaskTextArea.value.trim();

  if (title.length === 0) {
    alert('title can not be empty');
  } else {
    const data = {
      title,
      pomodoroNumber: pomodoroNumber === 0 ? 1 : pomodoroNumber,
      pomodoroNumberFinished: 0,
      note: note ? note : '',
      finished: false,
      displayed: false,
    };

    database.push(data);
    updateToDoList();
    checkToDoList();

    // resetting
    addTaskText.value = addTaskInput.value = addTaskTextArea.value = '';
    taskPomodoroCompletion();
  }
});

btnCancel.addEventListener('click', e => {
  addTaskWrapper.classList.remove('active');
  btnAddTask.classList.remove('inactive');

  addTaskText.value = addTaskInput.value = addTaskTextArea.value = '';
});

// edit after saving
document.addEventListener('click', e => {
  const a = e.target.className.animVal;
  if (a?.includes('task-item-edit')) {
    const index = e.target.dataset.index;
    const taskList = document.querySelectorAll('.task-item')[index];
    const data = database[index];
    const htmlForm = `<li>
      <form class="add-task-wrapper add-task-wrapper-edit active">
          <div class="task-input-wrapper">
            <input
              type="text"
              name="add-task-title"
              id="add-task-title"
              class="add-task-title-edit"
              placeholder="What are you working on?"
              value='${data.title}'
            />
          </div>
          <h4>Act/EST Pomodoros</h4>
          <div class="task-input-wrapper task-input-wrapper-amount" >
            <input
              type="number"
              name="add-task-input"
              class="add-task-input-cycle-edit"
              placeholder="0"
              value="${
                data.pomodoroNumberFinished > 0
                  ? data.pomodoroNumberFinished
                  : ''
              }"
              min="0"
            />
            <span class="task-slash">/</span>
            <input
              type="number"
              name="add-task-input"
              id="add-task-input"
              class="add-task-input-edit"
              placeholder="0"
              value="${data.pomodoroNumber}"
              min="0"
            />
            <div class="add-task-input-btn">
              <svg
                class="add-task-down"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                />
              </svg>
              <svg
                class="add-task-up"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="w-6 h-6"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4.5 15.75l7.5-7.5 7.5 7.5"
                />
              </svg>
              </div>
          </div>
          <div class="add-task-actions-wrapper">
            <span class="add-note add-note-edit ${data.note ? 'active' : ''}">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-6 h-6"
              >
                <path
                  fill-rule="evenodd"
                  d="M12 5.25a.75.75 0 01.75.75v5.25H18a.75.75 0 010 1.5h-5.25V18a.75.75 0 01-1.5 0v-5.25H6a.75.75 0 010-1.5h5.25V6a.75.75 0 01.75-.75z"
                  clip-rule="evenodd"
                />
              </svg>
              <span class="add-note-text-toggle-edit"> Add Note</span>
            </span>
            <span class="add-project">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                class="w-6 h-6"
              >
                <path
                  fill-rule="evenodd"
                  d="M12 5.25a.75.75 0 01.75.75v5.25H18a.75.75 0 010 1.5h-5.25V18a.75.75 0 01-1.5 0v-5.25H6a.75.75 0 010-1.5h5.25V6a.75.75 0 01.75-.75z"
                  clip-rule="evenodd"
                />
              </svg>

              Add Project</span
            >
          </div>
          <textarea
            name="add-task-text-area"
            class="${data.note ? 'active' : ''} add-task-text-area-edit"
            id="add-task-text-area"
            cols="30"
            rows="10"
            placeholder="Some notes..."
          >${data.note ? data.note : ''}</textarea>
          <div class="add-task-btn-wrapper">
            <button class="btn-cancel btn-cancel-edit">Cancel</button>
            <button class="btn-save btn-save-edit">Save</button>
          </div>
        </form> </li>
      `;
    const taskExist = document.querySelector('.add-task-wrapper-edit');

    const addTaskWrapperOr = document.querySelector(
      '.add-task-wrapper-original.active'
    );

    if (!taskExist && !addTaskWrapperOr) {
      taskList.insertAdjacentHTML('afterend', htmlForm);
      taskList.classList.add('inactive');

      const textAreaEdit = document.querySelector('.add-task-text-area-edit');
      const btnCancelEdit = document.querySelector('.btn-cancel-edit');
      const btnSaveEdit = document.querySelector('.btn-save-edit');

      const btnAddNoteEdit = document.querySelector('.add-note-edit');
      // function
      const deleteEditor = () => {
        const addTaskWrapperEdit = document.querySelector(
          '.add-task-wrapper-edit'
        );

        addTaskWrapperEdit.classList.remove('active');
        addTaskWrapperEdit.parentElement.remove();
        addTaskWrapperEdit.parentElement.remove();
        taskList.classList.remove('inactive');
      };

      btnAddNoteEdit.addEventListener('click', e => {
        e.preventDefault();
        const addNoteToggleEdit = document.querySelector(
          '.add-note-text-toggle-edit'
        );

        addNoteToggleEdit.textContent =
          btnAddNoteEdit.textContent.trim() === 'Add Note'
            ? 'Close Note'
            : 'Add Note';
        console.log(textAreaEdit, btnAddNoteEdit);
        textAreaEdit.classList.toggle('active');
        btnAddNoteEdit.classList.toggle('active');
      });

      btnSaveEdit.addEventListener('click', e => {
        e.preventDefault();
        const taskTitleEdit = document
          .querySelector('.add-task-title-edit')
          .value.trim();
        const cycleAmountFinished = +document.querySelector(
          '.add-task-input-cycle-edit'
        ).value;
        const cycleAmountToFinish = +document.querySelector(
          '.add-task-input-edit'
        ).value;
        const noteEdit = document
          .querySelector('.add-task-text-area-edit')
          .value.trim();

        if (taskTitleEdit.length === 0) {
          alert('title can not be empty');
        } else {
          const dataEdited = {
            title: taskTitleEdit,
            pomodoroNumber: cycleAmountToFinish === 0 ? 1 : cycleAmountToFinish,
            pomodoroNumberFinished:
              cycleAmountFinished >= cycleAmountToFinish
                ? cycleAmountToFinish
                : cycleAmountFinished,
            note: noteEdit ? noteEdit : '',
            finished: false,
            displayed: true,
          };
          const updatedData = (database[index] = dataEdited);
          const toDoLists = document.querySelectorAll('.task-item');
          const htmlUpdated = `
                  <div class="task-item-header">
                    <svg
                      class="task-check"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        fill-rule="evenodd"
                        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                        clip-rule="evenodd"
                      />
                    </svg>
                    <p class="task-to-do">${updatedData.title}</p>
                    <span class="task-cycle">
                      <span class="task-cycle-counter">${
                        updatedData.pomodoroNumberFinished
                      }</span>/${updatedData.pomodoroNumber}
                    </span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      data-index=${index}
                      fill="black"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      class="btn-edit task-header-edit task-item-edit"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
                      />
                    </svg>
                  </div>
                  <p class="task-items-notice ${
                    updatedData.note ? '' : 'inactive'
                  }">${updatedData.note}</p>
                `;
          toDoLists[index].innerHTML = htmlUpdated;

          taskPomodoroCompletion();
          deleteEditor();
          checkToDoList();
        }
      });

      btnCancelEdit.addEventListener('click', e => {
        e.preventDefault();
        deleteEditor();
      });
    }
  }
});

const taskHeaderEdit = document.querySelector('.task-header-edit');
const taskHeaderActions = document.querySelector('.task-header-actions');
const taskAllDelete = document.querySelector('.task-all-delete');

// setting variable
const navSettings = document.querySelector('.nav-settings');
const settings = document.querySelector('.settings');
const layer = document.querySelector('.layer');
const settingClose = document.querySelector('.settings-close');
const btnSaveSetting = document.querySelector('.btn-save-setting');

const navSettingsToggle = (condition = 'add') => {
  if (condition === 'add') {
    settings.classList.add('active');
    layer.classList.add('active');
  } else {
    settings.classList.remove('active');
    layer.classList.remove('active');
  }
};

taskHeaderEdit.addEventListener('click', e => {
  taskHeaderActions.classList.toggle('active');
});

navSettings.addEventListener('click', e => {
  navSettingsToggle();
});

settingClose.addEventListener('click', e => {
  navSettingsToggle('remove');
});

layer.addEventListener('click', e => {
  navSettingsToggle('remove');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    navSettingsToggle('remove');
    taskHeaderActions.classList.remove('active');
  }
});

const settingReset = () => {
  const secToMin = 60;
  document.querySelector('.setting-pomodoro').value = timer[0] / secToMin;
  document.querySelector('.setting-short-break').value = timer[1] / secToMin;
  document.querySelector('.setting-long-break').value = timer[2] / secToMin;
};

settingReset();

btnSaveSetting.addEventListener('click', e => {
  const minToSec = 60;
  const settingPomodoro =
    +document.querySelector('.setting-pomodoro').value * minToSec;
  const settingShortBreak =
    +document.querySelector('.setting-short-break').value * minToSec;
  const settingLongBreak =
    +document.querySelector('.setting-long-break').value * minToSec;
  timer = [settingPomodoro, settingShortBreak, settingLongBreak];
  times = [...timer];

  navSettingsToggle('remove');
  const [min, sec] = minSec(timer[currentPomodoro]);
  timerShow(min, sec);
});

taskAllDelete.addEventListener('click', e => {
  console.log('sss');
  database = [];
  updateToDoList();
  taskHeaderActions.classList.remove('active');
});

const taskFinish = document.querySelector('.task-finish');

taskFinish.addEventListener('click', e => {
  const taskChecks = document.querySelectorAll('.task-check'); // checked

  taskChecks.forEach((task, i) => {
    if (task.classList.contains('checked')) {
      task.parentElement.parentElement.remove();
    }
    updateToDoList();
    taskHeaderActions.classList.remove('active');
  });
});

const taskAct = document.querySelector('.task-act');

taskAct.addEventListener('click', e => {
  pomodoroCycle = 0;
  taskHeaderActions.classList.remove('active');
  taskPomodoroCompletion();
});

const mq = window.matchMedia('(max-width: 460px)');

if (mq.matches) {
  // Screen width is less than or equal to 460px
  timerShortBreakAnchor.textContent = 'Short';
  timerLongBreakAnchor.textContent = 'Longs';
} else {
  // Screen width is greater than 460px
  timerShortBreakAnchor.textContent = 'Short Break';
  timerLongBreakAnchor.textContent = 'Longs Break';
}

// Listen for changes to the screen width
// mq.addListener(e => {
//   if (e.matches) {
//     // Screen width is less than or equal to 768px
//     document.getElementById('my-element').textContent = 'Small Screen Text';
//   } else {
//     // Screen width is greater than 768px
//     document.getElementById('my-element').textContent = 'Large Screen Text';
//   }
// });
