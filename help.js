const crypto = require('crypto-js');
// Login and Registration
function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const passwordHash = crypto.SHA256(password).toString();
  fetch("https://kriptografi-server.vercel.app/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, passwordHash }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        localStorage.setItem("token", data.token);
        document.getElementById("loginSection").classList.add("hidden");
        document.getElementById("mainApp").classList.remove("hidden");
        document.getElementById("defaultOpen").click();
      } else {
        alert(data.message);
      }
    })
    .catch((error) => console.error("Error:", error));
}

function register() {
  const username = document.getElementById("registerUsername").value;
  const password = document.getElementById("registerPassword").value;
  const passwordHash = crypto.SHA256(password).toString();
  fetch("https://kriptografi-server.vercel.app/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, passwordHash }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        localStorage.setItem("token", data.token);
        document.getElementById("registerSection").classList.add("hidden");
        document.getElementById("mainApp").classList.remove("hidden");
        document.getElementById("defaultOpen").click();
      } else {
        alert(data.message);
      }
    })
    .catch((error) => console.error("Error:", error));
}

function showRegisterForm() {
  document.getElementById("loginSection").classList.add("hidden");
  document.getElementById("registerSection").classList.remove("hidden");
}

function showLoginForm() {
  document.getElementById("registerSection").classList.add("hidden");
  document.getElementById("loginSection").classList.remove("hidden");
}

function fetchMessage() {
  response = " ";
  fetch("https://kriptografi-server.vercel.app/message", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const messagesList = document.getElementById("messagesList");

        // Create table if it doesn't exist
        let table = document.getElementById("messagesTable");
        if (!table) {
          table = document.createElement("table");
          table.id = "messagesTable";
          table.className = "message-table";
          messagesList.appendChild(table);
        }

        // Create table header
        table.innerHTML = `
            <thead>
              <tr>
                <th>No</th>
                <th>Pengirim</th>
                <th>Pesan Terenkripsi</th>
              </tr>
            </thead>
            <tbody></tbody>
          `;

        const tbody = table.querySelector("tbody");

        // Add messages to table
        data.messages.forEach((message, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${index + 1}</td>
              <td>${message.sender_username || "Unknown"}</td>
              <td class="encrypted-text">${message.text}</td>
            `;
          tbody.appendChild(row);
        });
      } else {
        alert("Failed to fetch messages: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while fetching messages");
    });
}

function fetchHistory() {
  response = " ";
  fetch("https://kriptografi-server.vercel.app/history", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        const historyList = document.getElementById("historyList");

        // Create table if it doesn't exist
        let table = document.getElementById("historyTable");
        if (!table) {
          table = document.createElement("table");
          table.id = "historyTable";
          table.className = "history-table";
          historyList.appendChild(table);
        }

        // Create table header
        table.innerHTML = `
            <thead>
              <tr>
                <th>No</th>
                <th>Penerima</th>
                <th>Pesan Terenkripsi</th>
              </tr>
            </thead>
            <tbody></tbody>
          `;

        const tbody = table.querySelector("tbody");

        // Add messages to table
        data.messages.forEach((message, index) => {
          const row = document.createElement("tr");
          row.innerHTML = `
              <td>${index + 1}</td>
              <td>${message.receive_username || "Unknown"}</td>
              <td class="encrypted-text">${message.text}</td>
            `;
          tbody.appendChild(row);
        });
      } else {
        alert("Failed to fetch messages: " + data.message);
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      alert("An error occurred while fetching messages");
    });
}

// Tab management
function openTab(evt, tabName) {
  let tabcontent = document.getElementsByClassName("tabcontent");
  for (let i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  let tablinks = document.getElementsByClassName("tablinks");
  for (let i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
  if (tabName === "ReceiveMessage") {
    fetchMessage();
  }
  if (tabName === "ReceiveHistory") {
    fetchHistory();
  }
}

// Fungsi untuk Enkripsi dan Pengiriman
function encryptText() {
  const text = document.getElementById("textInputEncrypt").value;
  const username_to = document.getElementById("usernameTo").value;
  const aesKey = document.getElementById("aesKeyInputEncrypt").value;
  let shiftCaesar = parseInt(
    document.getElementById("shiftCaesarInputEncrypt").value
  );

  // Cek apakah kunci AES dan shift Caesar sudah diisi
  if (!aesKey) {
    alert("Kunci AES tidak boleh kosong!");
    return;
  }
  if (!shiftCaesar && shiftCaesar !== 0) {
    // Pastikan shiftCaesar bukan undefined atau kosong
    alert("Shift Caesar tidak boleh kosong!");
    return;
  }

    if (shiftCaesar >= 26) {
      shiftCaesar = shiftCaesar % 26;
      document.getElementById('shiftCaesarInputEncrypt').value = shiftCaesar;
    }

  let textEncrypted = CryptoJS.AES.encrypt(text, aesKey).toString();
  textEncrypted = caesarCipher(textEncrypted, shiftCaesar);
  document.getElementById("encryptionResult").innerText = textEncrypted;
  // Kirim hasil enkripsi ke server jika terdapat username
  if (username_to) {
    sendMessage(textEncrypted, username_to);
  }
}

function sendMessage(textEncrypted, username_to) {
  fetch("https://kriptografi-server.vercel.app/message", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + localStorage.getItem("token"),
    },
    body: JSON.stringify({
      text: textEncrypted,
      username_to: username_to,
    }),
  })
    .then((response) => {
      // Periksa apakah respons berhasil (status 200-299)
      if (!response.ok) {
        return response.json().then((data) => {
          // Menangkap pesan kesalahan dari server
          throw new Error(
            data.message || "Terjadi kesalahan saat mengirim pesan."
          );
        });
      }
      return response.json();
    })
    .then((data) => {
      if (data.success) {
        alert("Pesan berhasil dikirim!");
      } else {
        alert(data.message || "Terjadi kesalahan saat mengirim pesan.");
      }
    })
    .catch((error) => {
      // Tampilkan pesan kesalahan dari server
      alert(error.message);
    });
}

// Fungsi untuk Dekripsi
function decryptText() {
  const superEncrypted = document.getElementById("textInputDecrypt").value;
  const aesKey = document.getElementById("aesKeyInputDecrypt").value;
  let shiftCaesar = parseInt(
    document.getElementById("shiftCaesarInputDecrypt").value
  );

  // Cek apakah kunci AES dan shift Caesar sudah diisi
  if (!aesKey) {
    alert("Kunci AES tidak boleh kosong!");
    return;
  }
  if (!shiftCaesar && shiftCaesar !== 0) {
    alert("Shift Caesar tidak boleh kosong!");
    return;
  }

  if (shiftCaesar >= 26) {
    shiftCaesar = shiftCaesar % 26;
    document.getElementById('shiftCaesarInputEncrypt').value = shiftCaesar;
  }

  // Step 1: Reverse Caesar cipher
  const aesEncrypted = caesarCipher(superEncrypted, -shiftCaesar);

  // Step 2: Reverse AES
  const decrypted = CryptoJS.AES.decrypt(aesEncrypted, aesKey).toString(
    CryptoJS.enc.Utf8
  );

  // Tampilkan hasil dekripsi
  document.getElementById("decryptionResult").innerText = decrypted;
}

function caesarCipher(text, shift) {
  return text
    .split("")
    .map((char) => {
      if (char.match(/[a-z]/i)) {
        const code = char.charCodeAt(0);
        const isUpperCase = code >= 65 && code <= 90;
        const base = isUpperCase ? 65 : 97;
        return String.fromCharCode(((code - base + shift + 26) % 26) + base);
      }
      return char;
    })
    .join("");
}

// Function to encode a message into an image
function encodeMessage() {
  const message = document.getElementById("hiddenMessage").value;
  const imageLoader = document.getElementById("imageLoader");
  const canvas = document.getElementById("imageCanvas");
  const ctx = canvas.getContext("2d");

  if (!message || !imageLoader.files[0]) {
    alert("Pesan atau gambar tidak valid!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      encodeTextIntoImage(ctx, message);
      showPreviewImage(canvas); // Show the preview of the encoded image
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(imageLoader.files[0]);
}

// Function to encode text into image pixels
function encodeTextIntoImage(ctx, message) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const messageBinary = stringToBinary(message);
  let msgIndex = 0;

  for (let i = 0; i < data.length && msgIndex < messageBinary.length; i += 4) {
    // Only modify the least significant bit (LSB) of the red channel (or any channel)
    if (msgIndex < messageBinary.length) {
      data[i] = (data[i] & 0xfe) | parseInt(messageBinary[msgIndex], 2);
      msgIndex++;
    }
  }

  // Put the modified data back into the image
  ctx.putImageData(imageData, 0, 0);
}

// Convert string to binary
function stringToBinary(str) {
  return str
    .split("")
    .map(function (char) {
      return ("00000000" + char.charCodeAt(0).toString(2)).slice(-8);
    })
    .join("");
}

// Function to show the preview of the encoded image
function showPreviewImage(canvas) {
  const previewContainer = document.getElementById("encodedImagePreview");
  const previewImg = document.createElement("img");
  previewImg.src = canvas.toDataURL();
  previewContainer.innerHTML = ""; // Clear previous preview
  previewContainer.appendChild(previewImg); // Append the new image preview
}

// Function to download the encoded image
function downloadEncodedImage() {
  const canvas = document.getElementById("imageCanvas");
  const link = document.createElement("a");
  link.download = "encoded_image.png";
  link.href = canvas.toDataURL();
  link.click();
}

// Function to decode the hidden message from an image
function decodeMessage() {
  const imageLoader = document.getElementById("imageLoaderDecode");
  const canvas = document.getElementById("imageCanvas");
  const ctx = canvas.getContext("2d");

  if (!imageLoader.files[0]) {
    alert("Gambar tidak valid!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (event) {
    const img = new Image();
    img.onload = function () {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const message = decodeTextFromImage(ctx);
      document.getElementById("decodedMessage").innerText =
        message || "Tidak ada pesan tersembunyi";
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(imageLoader.files[0]);
}

// Function to decode text from image pixels
function decodeTextFromImage(ctx) {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;
  let binaryMessage = "";

  for (let i = 0; i < data.length; i += 4) {
    // Extract the least significant bit (LSB) from the red channel (or any channel)
    binaryMessage += (data[i] & 1).toString();
  }

  // Convert binary to string
  return binaryToString(binaryMessage);
}

// Convert binary to string
function binaryToString(binary) {
  const bytes = binary.match(/.{8}/g) || [];
  return bytes
    .map(function (byte) {
      return String.fromCharCode(parseInt(byte, 2));
    })
    .join("");
}

const BASE62 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

function toBase62(buffer) {
  const BASE62 =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const bytes = new Uint8Array(buffer);
  let value = 0n;
  for (let i = 0; i < bytes.length; i++) {
    value = value * 256n + BigInt(bytes[i]);
  }

  let result = "";
  while (value > 0n) {
    result = BASE62[Number(value % 62n)] + result;
    value = value / 62n;
  }
  return result || "0";
}

function fromBase62(str) {
  const BASE62 =
    "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  let value = 0n;
  for (let i = 0; i < str.length; i++) {
    value = value * 62n + BigInt(BASE62.indexOf(str[i]));
  }

  const bytes = [];
  while (value > 0n) {
    bytes.unshift(Number(value % 256n));
    value = value / 256n;
  }
  return new Uint8Array(bytes);
}

// Update file encryption functions
function encryptFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) {
    alert("Masukkan file terlebih dahulu");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const buffer = e.target.result;
    const base62Encoded = toBase62(buffer);

    // Create download link
    const blob = new Blob([base62Encoded], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = file.name + ".encrypted";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    document.getElementById("fileResult").innerText =
      "File berhasil dienkrip!";
  };
  reader.readAsArrayBuffer(file);
}

function decryptFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) {
    alert("Pilih File yang telah dienkripsi");
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const base62Content = e.target.result;
    try {
      const decryptedBuffer = fromBase62(base62Content);

      // Create download link
      const blob = new Blob([decryptedBuffer]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.name.replace(".encrypted", "");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      document.getElementById("fileResult").innerText =
        "File berhasil dideskrip!";
    } catch (error) {
      document.getElementById("fileResult").innerText =
        "Berikan file yang telah dienkripsi.";
    }
  };
  reader.readAsText(file);
}

function downloadEncodedImage() {
  const canvas = document.getElementById("imageCanvas");
  downloadCanvas(canvas, "encoded-image.png");
}

function downloadDecodedImage() {
  const canvas = document.getElementById("imageCanvas2");
  downloadCanvas(canvas, "decoded-image.png");
}

function downloadCanvas(canvas, filename) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL();
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function logout() {
  // Hapus token dari localStorage
  localStorage.removeItem("token");

  // Menyembunyikan aplikasi utama dan menampilkan halaman login
  document.getElementById("mainApp").classList.add("hidden");
  document.getElementById("loginSection").classList.remove("hidden");

  // Mengosongkan semua input yang ada
  const inputFields = document.querySelectorAll(
    'input[type="text"], input[type="password"], textarea'
  );
  inputFields.forEach((input) => {
    input.value = ""; // Mengosongkan value input
  });

  // Menampilkan alert bahwa user berhasil logout
  alert("Anda berhasil logout!");
}
