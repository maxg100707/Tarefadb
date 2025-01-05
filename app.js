// Importações do Firebase Modular
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAS13C4jdWB8dWc2iABjfOANqT_yu6qwyc",
  authDomain: "tarefa-55eba.firebaseapp.com",
  projectId: "tarefa-55eba",
  storageBucket: "tarefa-55eba.firebasestorage.app",
  messagingSenderId: "624404612435",
  appId: "1:624404612435:web:7cdafefa5ec0160ae5cda6",
};

// Inicialização do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const db = getFirestore();

// Elementos HTML
const loginGoogleButton = document.getElementById("login-google-button");
const loginEmailButton = document.getElementById("login-email-button");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const taskInput = document.getElementById("task-input");
const addTaskButton = document.getElementById("add-task-button");
const taskList = document.getElementById("task-list");
const authContainer = document.getElementById("auth-container");
const taskContainer = document.getElementById("task-container");
const logoutButton = document.getElementById("logout-button");

// Login com Google
loginGoogleButton.addEventListener("click", () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
    .then((result) => {
      console.log("Usuário logado com Google:", result.user);
      authContainer.style.display = "none";
      taskContainer.style.display = "block";
      loadTasks();
    })
    .catch((error) => {
      console.error("Erro ao fazer login com Google:", error);
    });
});

// Login com E-mail e Senha
loginEmailButton.addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("Usuário logado com e-mail:", userCredential.user);
      authContainer.style.display = "none";
      taskContainer.style.display = "block";
      loadTasks();
    })
    .catch((error) => {
      console.error("Erro ao fazer login com e-mail:", error);
    });
});

// Registrar novo usuário com E-mail e Senha
document.getElementById("register-link").addEventListener("click", () => {
  const email = emailInput.value;
  const password = passwordInput.value;
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log("Usuário registrado:", userCredential.user);
    })
    .catch((error) => {
      console.error("Erro ao registrar usuário:", error);
    });
});

// Logout
logoutButton.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      authContainer.style.display = "block";
      taskContainer.style.display = "none";
    })
    .catch((error) => {
      console.error("Erro ao sair:", error);
    });
});

// Adicionar tarefa
addTaskButton.addEventListener("click", () => {
  const task = taskInput.value;
  if (task && auth.currentUser) {
    // Verifica se há usuário logado
    addDoc(collection(db, "tasks"), {
      task: task,
      uid: auth.currentUser.uid,
      timestamp: new Date(),
    })
      .then(() => {
        taskInput.value = ""; // Limpa o campo de input
        loadTasks(); // Carrega novamente as tarefas
      })
      .catch((error) => {
        console.error("Erro ao adicionar tarefa:", error);
      });
  } else {
    console.log("Usuário não autenticado ou tarefa vazia");
  }
});

// Carregar tarefas
function loadTasks() {
  taskList.innerHTML = ""; // Limpa a lista de tarefas antes de carregá-la novamente
  if (auth.currentUser) {
    // Verifica se há usuário logado
    const q = query(
      collection(db, "tasks"),
      where("uid", "==", auth.currentUser.uid),
      orderBy("timestamp", "desc")
    );
    getDocs(q)
      .then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          const taskData = doc.data();
          const taskItem = document.createElement("li");

          // Criar o botão de excluir
          const deleteButton = document.createElement("button");
          deleteButton.textContent = "Excluir";

          // Adicionar evento de exclusão
          deleteButton.addEventListener("click", () => {
            deleteTask(doc.id);
          });

          // Adicionar tarefa e botão de excluir à lista
          taskItem.innerHTML = `<span>${taskData.task}</span>`;
          taskItem.appendChild(deleteButton);
          taskList.appendChild(taskItem);
        });
      })
      .catch((error) => {
        console.error("Erro ao carregar tarefas:", error);
      });
  }
}
// Excluir tarefa
function deleteTask(taskId) {
  const taskRef = doc(db, "tasks", taskId);
  deleteDoc(taskRef)
    .then(() => {
      loadTasks(); // Atualiza a lista de tarefas
    })
    .catch((error) => {
      console.error("Erro ao excluir tarefa:", error);
    });
}

// Monitorar estado de autenticação
onAuthStateChanged(auth, (user) => {
  if (user) {
    authContainer.style.display = "none";
    taskContainer.style.display = "block";
    loadTasks();
  } else {
    authContainer.style.display = "block";
    taskContainer.style.display = "none";
  }
});
