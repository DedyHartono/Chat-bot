document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chatBox");
  const textInput = document.getElementById("textInput");
  const sendBtn = document.getElementById("sendBtn");
  const voiceInputBtn = document.getElementById("voiceInputBtn");
  const recordList = document.getElementById("recordList");
  const toggleRecords = document.getElementById("toggleRecords");
  const loader = document.getElementById("loader");
  const newChatBtn = document.getElementById("newChatBtn");
  const loginBtn = document.getElementById("loginBtn");

  let chatSessions = JSON.parse(localStorage.getItem("chatSessions")) || [];
  let currentSession = [];
  let sessionId = chatSessions.length + 1;

  // Add listener for send button
  sendBtn.addEventListener("click", () => {
    const message = textInput.value.trim();
    if (message) {
      sendMessage(message);
      textInput.value = "";
    }
  });

  // Add listener for Enter key in text input
  textInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      sendBtn.click();
    }
  });

  // Add listener for voice input button
  voiceInputBtn.addEventListener("click", () => {
    startVoiceRecognition();
  });

  // Add listener for toggle records button
  toggleRecords.addEventListener("click", () => {
    if (recordList.style.display === "none") {
      displayRecords();
      recordList.style.display = "block";
      toggleRecords.textContent = "Hide Records";
    } else {
      recordList.style.display = "none";
      toggleRecords.textContent = "Show Records";
    }
  });

  // Add listener for new chat button
  newChatBtn.addEventListener("click", () => {
    if (currentSession.length > 0) {
      const initialMessage = currentSession[0]?.message || "No initial message";

      // Simpan sesi obrolan saat ini ke dalam chatSessions
      chatSessions.push({
        sessionId: sessionId++,
        initialMessage: initialMessage,
        timestamp: new Date().toLocaleString(),
        messages: [...currentSession]
      });

      // Simpan ke localStorage
      localStorage.setItem("chatSessions", JSON.stringify(chatSessions));

      // Reset sesi obrolan saat ini
      currentSession = [];
    }

    // Bersihkan chatBox untuk sesi baru
    chatBox.innerHTML = "";

    // Sembunyikan record list
    recordList.style.display = "none";

    // Fokus ke input teks
    textInput.focus();
  });

  // Function to fetch response from server
  async function fetchResponse(message) {
    try {
      const response = await fetch(`/response?message=${encodeURIComponent(message)}`);
      const text = await response.text();
      return text;
    } catch (error) {
      console.error("Error fetching response:", error);
      return "Maaf, terjadi kesalahan.";
    }
  }
  

  // Function to display messages in chat box and read out response
  async function sendMessage(message) {
    // Display user message
    const messageElement = document.createElement("p");
    messageElement.className="user-message";
    messageElement.textContent = "User: " + message;
    chatBox.appendChild(messageElement);

    // Tambahkan pesan pengguna ke sesi saat ini
    currentSession.push({ sender: "User", message });

    // Show loader
    loader.style.display = "block";

    // Fetch bot response
    const botResponse = await fetchResponse(message);

    setTimeout(() => {
      // Hide loader
      loader.style.display = "none";

      // Display bot response
      displayBotMessage(botResponse);

      // Tambahkan pesan bot ke sesi saat ini
      currentSession.push({ sender: " ", message: botResponse });
    }, 1000);
  }

  // Fungsi untuk menampilkan pesan dari user di sebelah kiri
// Fungsi untuk menampilkan pesan dari user di sebelah kanan
function displayUserMessage(userMessage) {
  const userMessageElement = document.createElement("div");
  userMessageElement.classList.add("message-container", "user-message");
  userMessageElement.innerHTML = `
    <div class="message user-message-content">
      <strong>User:</strong> ${userMessage.trim()}
    </div>`;
  chatBox.appendChild(userMessageElement);
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll ke pesan terbaru
}

// Fungsi untuk menampilkan pesan dari bot di sebelah kiri
function displayBotMessage(botResponse) {
  // Split response into parts based on semicolon for better readability
  const parts = botResponse.split(";");

  // Tambahkan spasi antara pesan user dan respons bot
  const spacerElement = document.createElement("div");
  spacerElement.style.marginTop = "20px";  // Atur ukuran spasi
  chatBox.appendChild(spacerElement);

  parts.forEach((part) => {
    const botMessageElement = document.createElement("div");
    botMessageElement.classList.add("message-container", "bot-message");

    // Tambahkan setiap bagian sebagai paragraf terpisah
    botMessageElement.innerHTML = `
      <div class="message bot-message-content">
        <strong> </strong> ${part.trim()}
      </div>`;
    
    chatBox.appendChild(botMessageElement);
  });
  
  chatBox.scrollTop = chatBox.scrollHeight; // Scroll ke pesan terbaru
}

  


  // Function to convert text to speech
  function speak(text) {
    const parts = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];
    parts.forEach((part, index) => {
      part = part.trim();
      if (part.length > 200) {
        const subParts = part.match(new RegExp('.{1,200}', 'g')) || [];
        subParts.forEach(subPart => {
          speakPart(subPart);
        });
      } else {
        speakPart(part);
      }
      if (index < parts.length - 1) {
        speakPart(" ");
      }
    });
  }

  function speakPart(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";
    window.speechSynthesis.speak(utterance);
  }

  // Function to start voice recognition
  function startVoiceRecognition() {
    try {
      const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
      recognition.lang = "id-ID";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        sendMessage(transcript);
      };

      recognition.start();
    } catch (error) {
      console.error("Speech recognition not supported:", error);
    }
  }

  // Function to display records
  function displayRecords() {
    const records = JSON.parse(localStorage.getItem("chatSessions")) || [];
    recordList.innerHTML = "";
    records.forEach((session, index) => {
      const listItem = document.createElement("li");
      listItem.style.display = "flex";
      listItem.style.alignItems = "center";
      listItem.style.justifyContent = "space-between"; // Menyebar item di sepanjang sumbu horizontal
      listItem.style.marginBottom = "10px"; // Optional: untuk jarak antar item

      // Create span for message text
      const messageSpan = document.createElement("span");
      // Potong teks initialMessage menjadi 15 karakter dan tambahkan elipsis jika diperlukan
      const initialMessage = session.initialMessage || `Sesi ${session.sessionId}`;
      const truncatedMessage = initialMessage.length > 15 ? initialMessage.substring(0, 15) + "..." : initialMessage;
      messageSpan.textContent = truncatedMessage;

      // Create delete button (trash icon)
      const deleteButton = document.createElement("button");
      deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>'; // Font Awesome trash icon
      deleteButton.classList.add("delete-button"); // Add class for styling
      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation(); // Prevent click event from firing for list item
        if (confirm("Are you sure you want to delete this session?")) {
          deleteSession(index);
        }
      });

      // Append message text and delete button to list item
      listItem.appendChild(messageSpan);
      listItem.appendChild(deleteButton);

      // Event listener untuk menampilkan pesan dari sesi yang dipilih
      listItem.addEventListener("click", () => {
        chatBox.innerHTML = ""; // Bersihkan chatBox
        session.messages.forEach((msg) => {
          const messageElement = document.createElement("p");
          messageElement.textContent = `${msg.sender}: ${msg.message}`;
          chatBox.appendChild(messageElement);
        });
      });

      recordList.appendChild(listItem);
    });
  }

  // Function to delete a session
  function deleteSession(sessionIndex) {
    chatSessions.splice(sessionIndex, 1); // Remove session from array
    localStorage.setItem("chatSessions", JSON.stringify(chatSessions)); // Update localStorage
    displayRecords(); // Refresh record list
  }

  // Add listener for login button
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "DASHBOARD.html";
    });
  }

  // Initial test to verify speech synthesis
  function testSpeech() {
    const testText = "Halo, Selamat Datang di Si Bantu.";
    speak(testText);
  }

  testSpeech();
});
