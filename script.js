// Firebase FTMS - Complete Functions
// Uses Firebase Compat SDK loaded via CDN in HTML

// Toggle functions for login/signup form
let currentForm = 'login';

function toggleForm(formType) {
  currentForm = formType;
  
  // Toggle buttons
  document.getElementById('login-toggle').classList.toggle('active', formType === 'login');
  document.getElementById('signup-toggle').classList.toggle('active', formType === 'signup');
  
  // Toggle title
  document.getElementById('form-title').innerHTML = formType === 'login' 
    ? '<i class="fas fa-sign-in-alt"></i> Login'
    : '<i class="fas fa-user-plus"></i> Sign Up';
  
  // Toggle signup section
  document.getElementById('signup-section').style.display = formType === 'signup' ? 'block' : 'none';
  
  // Toggle button
  const submitBtn = document.getElementById('submit-btn');
  submitBtn.innerHTML = formType === 'login' 
    ? '<i class="fas fa-sign-in-alt"></i> Login'
    : '<i class="fas fa-user-plus"></i> Sign Up';
  
  // Clear fields if switching to login
  if (formType === 'login') {
    document.getElementById('name').value = '';
    document.getElementById('phone').value = '';
  }
}

function submitForm() {
  if (currentForm === 'login') {
    login();
  } else {
    signup();
  }
}

function setRole(role) {
  document.getElementById('role').value = role;
  document.querySelectorAll('.role-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById('role-'+role).classList.add('active');
}

// Firebase Auth
async function signup(){
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;
  const phone = document.getElementById("phone").value;
  
  if (!name || !email || !password || !role) {
    alert("Please fill all required fields");
    return;
  }

  try {
    const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
    await window.db.collection('users').doc(userCredential.user.uid).set({
      name,
      email,
      role,
      phone,
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
    });
    
    localStorage.setItem("uid", userCredential.user.uid);
    localStorage.setItem("user", JSON.stringify({id: userCredential.user.uid, role, name, email}));
    alert("Registration successful!");
    location.href = role + ".html";
  } catch (error) {
    alert("Signup failed: " + error.message);
  }
}

async function login(){
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  
  if (!email || !password) {
    alert("Please enter email and password");
    return;
  }

  try {
    const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
    const userDoc = await window.db.collection('users').doc(userCredential.user.uid).get();
    const userData = userDoc.data();
    
    localStorage.setItem("uid", userCredential.user.uid);
    localStorage.setItem("user", JSON.stringify(userData));
    const role = userData.role || 'farmer';
    location.href = role + ".html";
  } catch (error) {
    alert("Login failed: " + error.message);
  }
}

function logout(){
  window.auth.signOut().then(() => {
    localStorage.removeItem("uid");
    localStorage.removeItem("user");
    location.href = "index.html";
  });
}

function show(id){
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

async function createTransport(){
  const uid = localStorage.getItem("uid");
  if (!uid) {
    alert("Please login first");
    location.href = "login.html";
    return;
  }

  let fname = document.getElementById("fname").value;
  let phone = document.getElementById("phone").value;
  let from = document.getElementById("from").value;
  let to = document.getElementById("to").value;
  let crop = document.getElementById("crop").value.toLowerCase();
  let load = document.getElementById("load").value;
  let distance = document.getElementById("distance").value;

  if(!fname || !phone || !from || !to || !crop || !load || !distance){
    alert("Fill all fields");
    return;
  }

  let rate = 0;
  if(crop.includes("wheat") || crop.includes("rice")){
    rate = 20;
  } else if(crop.includes("fruit") || crop.includes("vegetable") || crop.includes("vegetables")){
    rate = 30;
  } else {
    rate = 25;
  }

  let price = parseInt(distance) * rate;

  try {
    await window.db.collection('trips').add({
      userId: uid,
      fname,
      phone,
      from,
      to,
      crop,
      load,
      distance,
      price,
      status: "Pending",
      createdAt: window.firebase.firestore.FieldValue.serverTimestamp()
    });

    // Clear form
    document.querySelectorAll('#create input').forEach(input => input.value = '');

    alert("Request created successfully!");
    show('list');
    loadFarmerRequests();
  } catch (error) {
    alert("Error: " + error.message);
  }
}

async function loadFarmerRequests(){
  const uid = localStorage.getItem("uid");
  if (!uid) return;

  try {
    const snapshot = await window.db.collection('trips').where('userId', '==', uid).get();
    
    let div = document.getElementById("requests");
    if(div){
      div.innerHTML = "";
      if(snapshot.empty){
        div.innerHTML = '<p class="card" style="text-align:center;color:#666;">No requests yet. Create one!</p>';
        return;
      }
      snapshot.forEach(doc => {
        const d = doc.data();
        div.innerHTML += `
          <div class="card">
            <h4>${d.from} → ${d.to}</h4>
            <p><i class="fas fa-crop"></i> Crop: ${d.crop} | Load: ${d.load}kg | Distance: ${d.distance || 0}km</p>
            <p class="price">₹${d.price} <span class="status ${d.status}">${d.status}</span></p>
          </div>
        `;
      });
    }
  } catch (error) {
    console.error('Error loading requests:', error);
    document.getElementById("requests").innerHTML = '<p class="card" style="color:red;">Error loading requests. Please refresh.</p>';
  }
}

async function loadDriverRequests(){
  try {
    const pendingSnapshot = await window.db.collection('trips').where('status', '==', 'Pending').get();
    
    let allDiv = document.getElementById("allRequests");
    if(allDiv){
      allDiv.innerHTML = "";
      if(pendingSnapshot.empty){
        allDiv.innerHTML = '<p class="card" style="text-align:center;color:#666;">No pending requests</p>';
      } else {
        pendingSnapshot.forEach(doc => {
          const d = doc.data();
          allDiv.innerHTML += `
            <div class="card">
              <h4>${d.from} → ${d.to}</h4>
              <p>Crop: ${d.crop} | ${d.load}kg | ${d.distance ? d.distance + 'km' : ''}</p>
              <p class="price">₹${d.price}</p>
              <button class="accept-btn" onclick="acceptRequest('${doc.id}')">Accept</button>
            </div>
          `;
        });
      }
    }

    const acceptedSnapshot = await window.db.collection('trips').where('status', '==', 'Accepted').get();
    
    let acceptedDiv = document.getElementById("acceptedRequests");
    if(acceptedDiv){
      acceptedDiv.innerHTML = "";
      if(acceptedSnapshot.empty){
        acceptedDiv.innerHTML = '<p class="card" style="text-align:center;color:#666;">No accepted requests</p>';
      } else {
        acceptedSnapshot.forEach(doc => {
          const d = doc.data();
          const farmerDoc = window.db.collection('users').doc(d.userId).get().then(fDoc => {
            const farmer = fDoc.exists ? fDoc.data().name : 'Unknown';
            return farmer;
          });
          acceptedDiv.innerHTML += `
            <div class="card">
              <h4>${d.from} → ${d.to}</h4>
              <p>Farmer: Unknown | Crop: ${d.crop} | ${d.load}kg</p>
              <p class="price">₹${d.price}</p>
              <span class="status Accepted">Accepted</span>
            </div>
          `;
        });
      }
    }
  } catch (error) {
    console.error('Error loading driver requests:', error);
  }
}

async function acceptRequest(docId){
  const uid = localStorage.getItem("uid");
  if (!uid) {
    alert("Please login first");
    return;
  }

  try {
    await window.db.collection('trips').doc(docId).update({
      status: 'Accepted',
      driverId: uid,
      updatedAt: window.firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Request accepted!");
    loadDriverRequests();
  } catch (error) {
    alert("Error: " + error.message);
  }
}

