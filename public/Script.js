// public/Script.js
document.addEventListener("DOMContentLoaded", () => {
  // Floating hearts (same as before)
  function createFloatingHearts() {
    const container = document.getElementById("floatingHearts");
    if (!container) return;
    const heartCount = 20;
    for (let i = 0; i < heartCount; i++) {
      const heart = document.createElement("div");
      heart.classList.add("heart");
      heart.innerHTML = "❤️";
      heart.style.left = `${Math.random() * 100}%`;
      heart.style.animationDelay = `${Math.random() * 15}s`;
      heart.style.fontSize = `${10 + Math.random() * 20}px`;
      heart.style.opacity = `${0.2 + Math.random() * 0.3}`;
      container.appendChild(heart);
    }
  }
  createFloatingHearts();

  // Elements (select by ID so we never pick the wrong form)
  const chatForm = document.getElementById("chatForm");
  const input = document.getElementById("userInput");
  const chatMessages = document.getElementById("chatMessages");
  const clearBtn = document.getElementById("clearChatsBtn");
  const menuBtn = document.getElementById("optionsMenuBtn");
  const dropdown = document.getElementById("optionsDropdown");

  if (!chatForm || !input || !chatMessages) {
    console.error("Chat form or required elements missing.");
    return;
  }

  function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function getCurrentTime() {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  }

  function addMessage(text, sender) {
    const msg = document.createElement("div");
    msg.classList.add("message", sender);

    if (sender === "bot") {
      msg.innerHTML = `
        <span class="bot-message-decoration left">❣️</span>
        <span class="message-text">${text}</span>
        <span class="bot-message-decoration right">💖</span>
        <span class="message-time">${getCurrentTime()}</span>`;
    } else {
      msg.innerHTML = `
        <span class="message-text">${text}</span>
        <span class="message-time">${getCurrentTime()}</span>`;
    }

    chatMessages.appendChild(msg);
    scrollToBottom();
  }

  // Submit handler (AJAX)
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const message = input.value.trim();
    if (!message) return;

    // show user message instantly
    addMessage(message, "user");
    input.value = "";
    input.focus();

    // show typing indicator
    const typingDiv = document.createElement("div");
    typingDiv.classList.add("message", "bot", "typing");
    typingDiv.innerHTML = `
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>`;
    chatMessages.appendChild(typingDiv);
    scrollToBottom();

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!res.ok) throw new Error("Network response not ok");
      const data = await res.json();

      typingDiv.remove();
      addMessage(data.reply, "bot");
    } catch (err) {
      typingDiv.remove();
      console.error("Chat send error:", err);
      addMessage("⚠️ Error sending message", "bot");
    }
  });

  // Clear chats button (AJAX)
  // if (clearBtn) {
  //   clearBtn.addEventListener("click", async (e) => {
  //     // e.preventDefault();
  //     try {
  //       const res = await fetch("/clear", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //       });

  //       if (!res.ok) throw new Error("Network error while clearing chat");

  //       const data = await res.json();

  //       if (data.success) {
  //         // Reset UI with default bot greeting
  //         chatMessages.innerHTML = `
  //         <div class="message bot">
  //           <span class="message-text">Hey Babu! 😊 Kaise ho?</span>
  //         </div>
  //       `;
  //         scrollToBottom();
  //         dropdown.style.display = "none"; // close menu
  //       } else {
  //         console.warn("⚠️ Server responded but clear failed:", data);
  //       }
  //     } catch (err) {
  //       console.error("❌ Clear error:", err);
  //       addMessage("⚠️ Failed to clear chat", "bot");
  //     }
  //   });
  // }

  // Menu toggle
  if (menuBtn && dropdown) {
    menuBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    });
    document.addEventListener("click", (e) => {
      if (!menuBtn.contains(e.target) && !dropdown.contains(e.target))
        dropdown.style.display = "none";
    });
  }
});
