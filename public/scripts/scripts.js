document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chatBox");
  const textInput = document.getElementById("textInput");
  const sendBtn = document.getElementById("sendBtn");
  const voiceInputBtn = document.getElementById("voiceInputBtn");
  const recordList = document.getElementById("recordList");
  const toggleRecords = document.getElementById("toggleRecords");
  const loader = document.getElementById("loader");
  const newChatBtn = document.getElementById("newChatBtn"); // Tambahkan ID untuk tombol New Chat
  const loginBtn = document.getElementById("loginBtn"); // Tambahkan ID untuk tombol Login

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
    // Clear the chat box
    chatBox.innerHTML = "";

    // Optionally clear the text input
    textInput.value = "";

    // Optionally hide the record list
    recordList.style.display = "none";

    // Optionally, you might want to focus on the text input
    textInput.focus();
  });

  // Function to fetch response from server
  async function fetchResponse(message) {
    try {
      const response = await fetch(
        `/response?message=${encodeURIComponent(message)}`
      );
      const text = await response.text();
      console.log("Fetched response:", text); // Debug line
      return text;
    } catch (error) {
      console.error("Error fetching response:", error);
      return "Maaf, terjadi kesalahan.";
    }
  }

  // Function to display messages in chat box and read out response
  async function sendMessage(message) {
    console.log("Sending message:", message); // Debug line

    // Display user message
    const messageElement = document.createElement("p");
    messageElement.textContent = "User: " + message;
    chatBox.appendChild(messageElement);

    // Show loader
    loader.style.display = "block";

    // Fetch bot response
    const botResponse = await fetchResponse(message);
    console.log("Bot response:", botResponse); // Debug line

    // Simulate delay for loading effect
    setTimeout(() => {
      // Hide loader
      loader.style.display = "none";

      // Display bot response with splitting logic for long texts
      displayBotMessage(botResponse);

      // Convert text response to speech
      if (botResponse.trim()) {
        speak(botResponse);
      } else {
        console.error("Bot response is empty");
      }

      // Save the interaction to records
      saveRecord(message, botResponse);
    }, 1000); // Adjust delay time as needed (e.g., 1000 ms = 1 second)
  }

  // Function to display bot response with splitting for long texts
  function displayBotMessage(botResponse) {
    // Gunakan regex untuk memisahkan setiap poin berdasarkan pola huruf + titik (a. b. c. dst.)
    const parts = botResponse.split(/(?=[a-f]\.\s)/); // Memisahkan berdasarkan a., b., c., dst.

    // Untuk setiap bagian hasil pemisahan, buat elemen <p> baru dan tambahkan ke chatBox
    parts.forEach((part) => {
      const botMessageElement = document.createElement("p");
      botMessageElement.textContent = " " + part.trim();
      chatBox.appendChild(botMessageElement);
    });
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
  }

  // Function to convert text to speech
  function speak(text) {
    console.log("Preparing to speak:", text); // Debug line

    // Pecah teks berdasarkan titik, koma, atau tanda tanya
    const parts = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [];

    parts.forEach((part, index) => {
      // Hilangkan spasi berlebihan sebelum memulai ucapan
      part = part.trim();

      // Cek jika bagian masih terlalu panjang, pecah lagi
      if (part.length > 200) {
        const subParts = part.match(new RegExp('.{1,200}', 'g')) || [];
        subParts.forEach(subPart => {
          speakPart(subPart);
        });
      } else {
        speakPart(part);
      }

      // Tambahkan jeda setelah setiap kalimat untuk rapi
      if (index < parts.length - 1) {
        speakPart(" "); // Menambahkan sedikit jeda
      }
    });
  }

  // Helper function to handle speaking each part
  function speakPart(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "id-ID";

    utterance.onerror = (event) => {
      console.error("SpeechSynthesisUtterance error:", event);
    };
    
    utterance.onstart = () => {
      console.log("Speech started");
    };
    
    utterance.onend = () => {
      console.log("Speech ended");
    };

    window.speechSynthesis.speak(utterance);
  }

  // Function to start voice recognition
  function startVoiceRecognition() {
    try {
      const recognition = new (window.SpeechRecognition ||
        window.webkitSpeechRecognition)();
      recognition.lang = "id-ID";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("Voice input:", transcript); // Debug line
        sendMessage(transcript);
      };

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
      };

      recognition.onend = () => {
        console.log("Speech recognition service has stopped.");
      };

      recognition.start();
    } catch (error) {
      console.error("Speech recognition not supported:", error);
    }
  }

  // Function to save chat records
  function saveRecord(userMessage, botResponse) {
    const timestamp = new Date().toLocaleString();
    const record = { timestamp, userMessage, botResponse };

    // Save record to localStorage
    const records = JSON.parse(localStorage.getItem("chatRecords")) || [];
    records.push(record);
    localStorage.setItem("chatRecords", JSON.stringify(records));
  }

  // Function to display records
  function displayRecords() {
    const records = JSON.parse(localStorage.getItem("chatRecords")) || [];
    console.log("Records to display:", records); // Debug line
    recordList.innerHTML = "";

    records.forEach((record) => {
      const listItem = document.createElement("li");
      listItem.textContent = `${record.timestamp} - User: ${record.userMessage} - Bot: ${record.botResponse}`;
      recordList.appendChild(listItem);
    });

    // Scroll ke bawah otomatis jika ada konten
    recordList.scrollTop = recordList.scrollHeight;
  }

  // Initial test to verify speech synthesis
  function testSpeech() {
    const testText = "Halo, Selamat Datang di Si Bantu.";
    speak(testText);
  }

  // Call the test function to see if it works
  testSpeech();

  // Add listener for login button
  if (loginBtn) {
    loginBtn.addEventListener("click", () => {
      window.location.href = "DASHBOARD.html";
    });
  }
});
