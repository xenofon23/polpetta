(() => {
  "use strict";

  const card = document.querySelector("#invitationCard");
  const confirmationCard = document.querySelector("#confirmationCard");
  const actionZone = document.querySelector("#actionZone");
  const yesButton = document.querySelector("#yesButton");
  const noButton = document.querySelector("#noButton");
  const playfulMessage = document.querySelector("#playfulMessage");
  const crownButton = document.querySelector("#crownButton");
  const toast = document.querySelector("#royalToast");
  const noMessages = [
    "Nice try 😏",
    "Not so fast, Princess 👑",
    "The polpetta says no to NO 🍝",
    "Wrong button 😌",
    "Are you sure about that? 👀",
    "That was suspiciously close 😏",
    "Your YES button is looking pretty good right now 👀"
  ];
  let noAttempts = 0;
  let crownTaps = 0;
  let lastNoEscape = 0;
  let cursorX = 0;
  let cursorY = 0;
  let hasPointer = false;
  let cursorSpeed = 0;
  let lastPointerTime = 0;
  let noPosition = { x: 0, y: 0 };
  let noTarget = { x: 0, y: 0 };
  let messageTimer;
  let toastTimer;

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  function updateButtonScales() {
    const noScale = clamp(1 - noAttempts * 0.07, 0.65, 1);
    const yesScale = 1;
    noButton.style.setProperty("--no-scale", noScale.toFixed(3));
    yesButton.style.setProperty("--yes-scale", yesScale.toFixed(3));
    if (noAttempts >= 3) yesButton.querySelector("span").textContent = noAttempts >= 5 ? "Obviously YES" : "YES";
    if (noAttempts >= 3) yesButton.classList.add("yes-pulse");
  }

  function showMessage() {
    playfulMessage.textContent = noMessages[(noAttempts - 1) % noMessages.length];
    playfulMessage.classList.add("is-visible");
    clearTimeout(messageTimer);
    messageTimer = window.setTimeout(() => playfulMessage.classList.remove("is-visible"), 2100);
  }

  function moveNoButton(isEscape = false) {
    const zoneRect = actionZone.getBoundingClientRect();
    const buttonRect = noButton.getBoundingClientRect();
    const yesRect = yesButton.getBoundingClientRect();
    const currentScale = clamp(1 - noAttempts * 0.07, 0.65, 1);
    const buttonWidth = buttonRect.width / (noButton.offsetWidth ? buttonRect.width / noButton.offsetWidth : 1);
    const buttonHeight = buttonRect.height / (noButton.offsetHeight ? buttonRect.height / noButton.offsetHeight : 1);
    const baseLeft = noButton.offsetLeft;
    const baseTop = noButton.offsetTop;
    const minX = 6 - baseLeft;
    const maxX = Math.max(minX, zoneRect.width - buttonWidth - 6 - baseLeft);
    const minY = 6 - baseTop;
    const maxY = Math.max(minY, zoneRect.height - buttonHeight - 6 - baseTop);
    const yesCenterX = yesRect.left + yesRect.width / 2 - zoneRect.left;
    const yesCenterY = yesRect.top + yesRect.height / 2 - zoneRect.top;
    let x = 0;
    let y = 0;
    let safe = false;

    for (let attempt = 0; attempt < 30 && !safe; attempt += 1) {
      x = minX + Math.random() * (maxX - minX);
      y = minY + Math.random() * (maxY - minY);
      const noCenterX = baseLeft + buttonWidth / 2 + x;
      const noCenterY = baseTop + buttonHeight / 2 + y;
      const distance = Math.hypot(noCenterX - yesCenterX, noCenterY - yesCenterY);
      safe = distance > Math.max(95, (yesRect.width + buttonWidth) * .55);
    }

    noButton.style.setProperty("--no-x", `${clamp(x, minX, maxX)}px`);
    noButton.style.setProperty("--no-y", `${clamp(y, minY, maxY)}px`);
    noPosition = { x, y };
    noTarget = { x, y };
    if (isEscape) {
      noButton.classList.remove("escape");
      void noButton.offsetWidth;
      noButton.classList.add("escape");
    }
    noButton.setAttribute("aria-label", "No, maybe not. Try again if you can");
    noButton.style.setProperty("--no-scale", currentScale.toFixed(3));
  }

  function attemptNo(event) {
    event.preventDefault();
    const now = Date.now();
    if (now - lastNoEscape < 450) return;
    lastNoEscape = now;
    noAttempts += 1;
    updateButtonScales();
    showMessage();
  }

  function celebrate() {
    card.classList.add("is-hidden");
    confirmationCard.hidden = false;
    document.body.classList.add("is-celebrating");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }

  function getSafeBounds() {
    const zoneRect = actionZone.getBoundingClientRect();
    const buttonRect = noButton.getBoundingClientRect();
    const yesRect = yesButton.getBoundingClientRect();
    const buttonWidth = buttonRect.width / (noButton.offsetWidth ? buttonRect.width / noButton.offsetWidth : 1);
    const buttonHeight = buttonRect.height / (noButton.offsetHeight ? buttonRect.height / noButton.offsetHeight : 1);
    const baseLeft = noButton.offsetLeft;
    const baseTop = noButton.offsetTop;
    const yesCenterX = yesRect.left + yesRect.width / 2 - zoneRect.left;
    const yesCenterY = yesRect.top + yesRect.height / 2 - zoneRect.top;
    return {
      zoneRect,
      buttonWidth,
      buttonHeight,
      baseLeft,
      baseTop,
      minX: 6 - baseLeft,
      maxX: Math.max(6 - baseLeft, zoneRect.width - buttonWidth - 6 - baseLeft),
      minY: 6 - baseTop,
      maxY: Math.max(6 - baseTop, zoneRect.height - buttonHeight - 6 - baseTop),
      yesCenterX,
      yesCenterY,
      yesWidth: yesRect.width,
      yesHeight: yesRect.height
    };
  }

  function animateNo(timestamp) {
    if (!document.hidden && !card.classList.contains("is-hidden")) {
      const bounds = getSafeBounds();
      const pointerInside = hasPointer && cursorX >= 0 && cursorX <= bounds.zoneRect.width && cursorY >= 0 && cursorY <= bounds.zoneRect.height;
      if (pointerInside) {
        const noCenterX = bounds.baseLeft + bounds.buttonWidth / 2 + noPosition.x;
        const noCenterY = bounds.baseTop + bounds.buttonHeight / 2 + noPosition.y;
        const awayX = noCenterX - cursorX;
        const awayY = noCenterY - cursorY;
        const distance = Math.max(1, Math.hypot(awayX, awayY));
        const buttonLeft = bounds.baseLeft + noPosition.x;
        const buttonTop = bounds.baseTop + noPosition.y;
        const edgeDistance = Math.hypot(
          Math.max(buttonLeft - cursorX, 0, cursorX - (buttonLeft + bounds.buttonWidth)),
          Math.max(buttonTop - cursorY, 0, cursorY - (buttonTop + bounds.buttonHeight))
        );
        const urgency = clamp((180 - edgeDistance) / 180, 0, 1);
        const targetRadius = 145 + cursorSpeed * 0.05 + urgency * 35;
        const targetCenterX = bounds.zoneRect.width / 2 + (awayX / distance) * targetRadius;
        const targetCenterY = bounds.zoneRect.height / 2 + (awayY / distance) * targetRadius;
        const desiredX = targetCenterX - bounds.baseLeft - bounds.buttonWidth / 2;
        const desiredY = targetCenterY - bounds.baseTop - bounds.buttonHeight / 2;
        noTarget.x = clamp(desiredX, bounds.minX, bounds.maxX);
        noTarget.y = clamp(desiredY, bounds.minY, bounds.maxY);
        const candidateCenterX = bounds.baseLeft + bounds.buttonWidth / 2 + noTarget.x;
        const candidateCenterY = bounds.baseTop + bounds.buttonHeight / 2 + noTarget.y;
        const yesDistance = Math.hypot(candidateCenterX - bounds.yesCenterX, candidateCenterY - bounds.yesCenterY);
        const safeYesDistance = Math.max(bounds.yesWidth, bounds.yesHeight) / 2 + Math.max(bounds.buttonWidth, bounds.buttonHeight) / 2 + 18;
        if (yesDistance < safeYesDistance) {
          const pushX = candidateCenterX - bounds.yesCenterX;
          const pushY = candidateCenterY - bounds.yesCenterY;
          const pushDistance = Math.max(1, Math.hypot(pushX, pushY));
          noTarget.x = clamp(bounds.yesCenterX + (pushX / pushDistance) * safeYesDistance - bounds.baseLeft - bounds.buttonWidth / 2, bounds.minX, bounds.maxX);
          noTarget.y = clamp(bounds.yesCenterY + (pushY / pushDistance) * safeYesDistance - bounds.baseTop - bounds.buttonHeight / 2, bounds.minY, bounds.maxY);
        }
      }

      if (pointerInside) {
        const responsiveness = clamp(.085 + cursorSpeed / 3000, .085, .26);
        noPosition.x += (noTarget.x - noPosition.x) * responsiveness;
        noPosition.y += (noTarget.y - noPosition.y) * responsiveness;
        noPosition.x = clamp(noPosition.x, bounds.minX, bounds.maxX);
        noPosition.y = clamp(noPosition.y, bounds.minY, bounds.maxY);
        noButton.style.setProperty("--no-x", `${noPosition.x}px`);
        noButton.style.setProperty("--no-y", `${noPosition.y}px`);
      }
      cursorSpeed *= .91;
    }
    window.requestAnimationFrame(animateNo);
  }

  yesButton.addEventListener("click", celebrate);
  noButton.addEventListener("pointerdown", attemptNo);
  noButton.addEventListener("click", (event) => {
    if (event.detail === 0) {
      event.preventDefault();
    }
  });
  noButton.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") attemptNo(event);
  });
  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    const now = performance.now();
    const zoneRect = actionZone.getBoundingClientRect();
    const nextX = event.clientX - zoneRect.left;
    const nextY = event.clientY - zoneRect.top;
    if (lastPointerTime) {
      const elapsed = Math.max(8, now - lastPointerTime);
      cursorSpeed = Math.hypot(nextX - cursorX, nextY - cursorY) / elapsed * 1000;
    }
    cursorX = nextX;
    cursorY = nextY;
    hasPointer = true;
    lastPointerTime = now;
    const buttonRect = noButton.getBoundingClientRect();
    const distanceX = Math.max(buttonRect.left - event.clientX, 0, event.clientX - buttonRect.right);
    const distanceY = Math.max(buttonRect.top - event.clientY, 0, event.clientY - buttonRect.bottom);
    if (Math.hypot(distanceX, distanceY) < 52) attemptNo(event);
  });
  window.requestAnimationFrame(animateNo);
  crownButton.addEventListener("click", () => {
    crownTaps += 1;
    if (crownTaps === 5) {
      document.body.classList.add("is-royal");
      showToast("Royal Polpetta Mode 👑🍝");
      window.setTimeout(() => document.body.classList.remove("is-royal"), 4300);
      crownTaps = 0;
    }
  });
})();