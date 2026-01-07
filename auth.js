// ======= UTILISATEURS (LOGIN / REGISTER) =======
let users = [];
let currentUser = null;

// ====== ETUDIANTS EN ATTENTE (VALIDATION ADMIN) ======
function addPendingStudent(username, level, classroom){
  try{
    const raw = localStorage.getItem("pendingStudents");
    let pending = raw ? JSON.parse(raw) : [];
    pending.push({
      name: username,
      level: level,
      classroom: classroom || "" // maintenant rempli dès l'inscription
    });
    localStorage.setItem("pendingStudents", JSON.stringify(pending));
  }catch(e){
    console.error("Erreur addPendingStudent", e);
  }
}

function saveUsers(){
  try{
    localStorage.setItem("schoolUsers", JSON.stringify(users));
  }catch(e){
    console.error("Erreur saveUsers", e);
  }
}

function loadUsers(){
  const raw = localStorage.getItem("schoolUsers");
  if(raw){
    try{
      users = JSON.parse(raw) || [];
    }catch(e){
      users = [];
    }
  }else{
    users = [];
  }

  // Admin par défaut
  if(!users.some(function(u){ return u.role === "admin"; })){
    users.push({
      username:"admin",
      email:"admin@admin.com",
      password:"admin",
      role:"admin",
      level:"",
      classroom:""
    });
    saveUsers();
  }
}

function handleRegister(){
  const usernameInput   = document.getElementById("registerUsername");
  const emailInput      = document.getElementById("registerEmail");
  const passInput       = document.getElementById("registerPassword");
  const roleSelect      = document.getElementById("registerRole");
  const levelSelect     = document.getElementById("registerLevel");
  const classroomInput  = document.getElementById("registerClassroom");

  if(!usernameInput || !emailInput || !passInput){
    alert("Le formulaire d'inscription est mal configuré.");
    return;
  }

  const username  = usernameInput.value.trim();
  const email     = emailInput.value.trim();
  const password  = passInput.value;
  const role      = roleSelect ? roleSelect.value : "student";
  const level     = levelSelect ? levelSelect.value : "";
  const classroom = classroomInput ? classroomInput.value.trim() : "";

  if(!username || !email || !password){
    alert("Remplis tous les champs !");
    return;
  }

  if(users.some(function(u){ return u.username === username; })){
    alert("Nom d'utilisateur déjà utilisé.");
    return;
  }
  if(users.some(function(u){ return u.email === email; })){
    alert("Email déjà utilisé.");
    return;
  }

  // pour un étudiant, le niveau et la classe sont obligatoires
  if(role === "student"){
    if(!level){
      alert("Veuillez sélectionner le niveau de l'étudiant.");
      return;
    }
    if(!classroom){
      alert("Veuillez saisir la classe / le groupe de l'étudiant.");
      return;
    }
  }

  // ➕ On enregistre le compte utilisateur
  users.push({
    username:  username,
    email:     email,
    password:  password,
    role:      role,
    level:     (role === "student") ? level : "",
    classroom: (role === "student") ? classroom : ""
  });
  saveUsers();

  // ➕ Si c'est un étudiant, on l'ajoute dans la liste d'attente
  if(role === "student"){
    addPendingStudent(username, level, classroom);
  }

  alert("Compte créé ! En attente de validation par l'administrateur.");
  usernameInput.value  = "";
  emailInput.value     = "";
  passInput.value      = "";
  if(roleSelect)      roleSelect.value      = "student";
  if(levelSelect)     levelSelect.value     = "";
  if(classroomInput)  classroomInput.value  = "";

  window.location.href = "index.html";
}

function handleLogin(){
  const loginInput = document.getElementById("loginUsername");
  const passInput  = document.getElementById("loginPassword");

  if(!loginInput || !passInput){
    alert("Formulaire de connexion mal configuré (ID manquants).");
    console.error("loginUsername / loginPassword introuvables");
    return;
  }

  const loginId  = loginInput.value.trim();
  const password = passInput.value;

  if(!loginId || !password){
    alert("Saisis ton identifiant et ton mot de passe.");
    return;
  }

  const user = users.find(function(u){
    return (u.username === loginId || u.email === loginId) && u.password === password;
  });

  if(!user){
    alert("Identifiants incorrects.");
    return;
  }

  // On garde toutes les infos (role + niveau + classe éventuelle)
  currentUser = {
    username:  user.username,
    email:     user.email,
    password:  user.password,
    role:      user.role,
    level:     user.level || "",
    classroom: user.classroom || ""
  };

  try{
    localStorage.setItem("currentUser", JSON.stringify(currentUser));
  }catch(e){
    console.error("Erreur stockage currentUser", e);
  }

  // Redirection vers l'application
  window.location.href = "app.html";
}

window.onload = function(){
  loadUsers();

  const savedUser = localStorage.getItem("currentUser");
  if(savedUser){
    // déjà connecté -> on va directement sur l'application
    window.location.href = "app.html";
  }
};
