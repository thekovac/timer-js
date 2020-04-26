function button(text, onClickHandler, style, children, id) {
  var button = document.createElement("button");
  if (children && children.length > 0) {
    appendChildrenToParent(button, children);
  }
  button.textContent = text;
  button.addEventListener("click", (event) => onClickHandler(event));
  button.style = style;
  if (id) {
    button.id = id;
  }
  return button;
}

function appendChildrenToParent(parent, children) {
  children.forEach((child) => {
    parent.appendChild(child);
  });
}
function removeChildrenFromParent(parent, children) {
  children.forEach((child) => {
    parent.removeChild(child);
  });
}
// carousel, onChange provides current index back to the caller
function carousel(carouselData, onChange) {
  var i = 0;
  function handleIndexChange(i) {
    firstItem.innerHTML =
      carouselData[(carouselData.length + i - 1) % carouselData.length];
    secondItem.innerHTML = carouselData[i];
    thirdItem.innerHTML = carouselData[(i + 1) % carouselData.length];
  }

  var carouselWrapper = document.createElement("div");
  carouselWrapper.className = "carousel-wrapper";
  carouselWrapper.style.display = "flex";
  carouselWrapper.style.flexDirection = "column";
  carouselWrapper.style.alignItems = "center";
  var firstItem = document.createElement("div");
  firstItem.className = "carousel-first-item";
  var secondItem = document.createElement("div");
  secondItem.className = "carousel-second-item";

  var thirdItem = document.createElement("div");
  thirdItem.className = "carousel-third-item";

  handleIndexChange(i);

  appendChildrenToParent(carouselWrapper, [firstItem, secondItem, thirdItem]);
  var wheelHandler = (e) =>
    handleMouseWheelDirection(
      detectMouseWheelDirection(e),
      () => {
        i = (i + 1) % carouselData.length;
        handleIndexChange(i);
        onChange(i);
      },
      () => {
        i = (carouselData.length + i - 1) % carouselData.length;
        handleIndexChange(i);
        onChange(i);
      }
    );

  carouselWrapper.addEventListener("wheel", wheelHandler);
  return carouselWrapper;
}
// Timer
function timer() {
  var timerWrapper = document.getElementById("timer-wrapper");
  var content = document.getElementById("content");
  var minutesWrapper = document.createElement("div");
  var secondsWrapper = document.createElement("div");
  var dots = document.createElement("div");

  minutesWrapper.className = "time";
  secondsWrapper.className = "time";
  dots.className = "dots";
  dots.innerHTML = ":";

  var minutesCarouselValue = 0;
  var secondsCarouselValue = 0;
  var seconds;
  var interval;

  var minutesCarousel = carousel(
    [...Array(60).keys()].map((x) => x.pad()),
    (i) => (minutesCarouselValue = i)
  );
  var secondsCarousel = carousel(
    [...Array(60).keys()].map((x) => x.pad()),
    (i) => (secondsCarouselValue = i)
  );

  timerWrapper.appendChild(minutesWrapper);
  timerWrapper.appendChild(dots);
  timerWrapper.appendChild(secondsWrapper);

  minutesWrapper.appendChild(minutesCarousel);
  secondsWrapper.appendChild(secondsCarousel);

  var buttonsWrapper = document.createElement("div");
  buttonsWrapper.id = "buttons-wrapper";
  var tickingFunction = () => {
    seconds--;
    minutesWrapper.innerHTML = Math.floor(seconds / 60).pad();
    secondsWrapper.innerHTML = (seconds % 60).pad();
    if (!seconds) {
      clearInterval(interval);
      buttonsWrapper.removeChild(pauseAndCancelButtonsWrapper);
      buttonsWrapper.appendChild(resetButton);
      if (window.Notification && Notification.permission === "granted") {
        var text = "Time's up";
        var notification = new Notification("Time's up", {
          body: text,
        });
      }
    }
  };
  var pauseAndCancelButtonsWrapper = document.createElement("div");
  pauseAndCancelButtonsWrapper.id = "pause-and-cancel-buttons-wrapper";
  content.appendChild(buttonsWrapper);
  var pauseResumeButton = button(
    "Pause",
    () => {
      if (interval) {
        clearInterval(interval);
        interval = undefined;
        pauseResumeButton.textContent = "Resume";
        pauseResumeButton.style.background = "#5a0699";
      } else {
        interval = setInterval(tickingFunction, 1000);
        pauseResumeButton.textContent = "Pause";
        pauseResumeButton.style.background = "red";
      }
    },
    undefined,
    undefined,
    "pause-resume-button"
  );
  var resetButton = button(
    "Reset",
    () => {
      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }
      buttonsWrapper.removeChild(resetButton);

      minutesWrapper.innerHTML = "";
      secondsWrapper.innerHTML = "";
      minutesWrapper.appendChild(minutesCarousel);
      secondsWrapper.appendChild(secondsCarousel);
      buttonsWrapper.appendChild(startButton);
    },
    undefined,
    undefined,
    "cancel-reset-button"
  );
  var cancelButton = button(
    "Cancel",
    () => {
      if (interval) {
        clearInterval(interval);
        interval = undefined;
      }
      buttonsWrapper.removeChild(pauseAndCancelButtonsWrapper);

      minutesWrapper.innerHTML = "";
      secondsWrapper.innerHTML = "";
      minutesWrapper.appendChild(minutesCarousel);
      secondsWrapper.appendChild(secondsCarousel);
      buttonsWrapper.appendChild(startButton);
    },
    undefined,
    undefined,
    "cancel-reset-button"
  );
  var startButton = button("Start", () => {
    seconds = minutesCarouselValue * 60 + secondsCarouselValue;
    if (seconds) {
      minutesWrapper.removeChild(minutesCarousel);
      secondsWrapper.removeChild(secondsCarousel);
      buttonsWrapper.removeChild(startButton);
      appendChildrenToParent(pauseAndCancelButtonsWrapper, [
        pauseResumeButton,
        cancelButton,
      ]);
      buttonsWrapper.appendChild(pauseAndCancelButtonsWrapper);
      minutesWrapper.innerHTML = minutesCarouselValue.pad();
      secondsWrapper.innerHTML = secondsCarouselValue.pad();
      interval = setInterval(tickingFunction, 1000);
    }
  });

  buttonsWrapper.appendChild(startButton);
}
Number.prototype.pad = function (size) {
  var s = String(this);
  while (s.length < (size || 2)) {
    s = "0" + s;
  }
  return s;
};

// notification

function askNotificationPermission() {
  // function to actually ask the permissions
  function handlePermission(permission) {
    // Whatever the user answers, we make sure Chrome stores the information
    if (!("permission" in Notification)) {
      Notification.permission = permission;
    }
  }
  function checkNotificationPromise() {
    try {
      Notification.requestPermission().then();
    } catch (e) {
      return false;
    }

    return true;
  }
  // Let's check if the browser supports notifications
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications.");
  } else {
    if (window.Notification && Notification.permission !== "granted") {
      if (checkNotificationPromise()) {
        Notification.requestPermission().then((permission) => {
          handlePermission(permission);
        });
      } else {
        Notification.requestPermission(function (permission) {
          handlePermission(permission);
        });
      }
    }
  }
}
window.onload = function () {
  askNotificationPermission();
  timer();
};

function detectMouseWheelDirection(e) {
  if (!e) {
    // if the event is not provided, we get it from the window object
    e = window.event;
  }

  return e.deltaY > 0 ? "up" : "down";
}
function handleMouseWheelDirection(direction, downCallback, upCallback) {
  if (direction == "down") {
    downCallback();
  } else {
    upCallback();
  }
}
