let currentStudent = JSON.parse(localStorage.getItem('campusStudent') || 'null');
let selectedType = 'all';
let selectedVehicle = null;

function esc(v){return String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));}
function money(v){return '₹' + Number(v).toFixed(0);}
function toast(msg, ok=true){const t=document.getElementById('toast');t.textContent=msg;t.className=ok?'show success':'show error';setTimeout(()=>t.className='',2600);}

function showPage(id){
 document.querySelectorAll('.page').forEach(p=>p.classList.remove('active-page'));
 document.getElementById(id).classList.add('active-page');
 if(id==='vehicles') loadVehicles();
 if(id==='active') loadActive();
 if(id==='history') loadHistory();
 window.scrollTo({top:0,behavior:'smooth'});
}

function updateNav(){
 const n=document.getElementById('navAuth');
 n.innerHTML=currentStudent
  ? `<span style="color:#aaa;font-size:12px;margin-right:10px">Hi, ${esc(currentStudent.name.split(' ')[0])}</span><button class="login-btn" onclick="logout()">Logout</button>`
  : `<button class="login-btn" onclick="openAuth('login')">Student Login</button>`;
}
updateNav();

function setFilter(btn){
 document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));
 btn.classList.add('active'); selectedType=btn.dataset.type; loadVehicles();
}

async function api(url, options={}){
 const res=await fetch(url,{headers:{'Content-Type':'application/json',...(options.headers||{})},...options});
 const data=await res.json().catch(()=>({message:'Server error'}));
 if(!res.ok) throw new Error(data.message || 'Something went wrong');
 return data;
}

async function loadVehicles(){
 const q=encodeURIComponent(document.getElementById('search')?.value || '');
 const grid=document.getElementById('vehicleGrid');
 if(!grid)return;
 grid.innerHTML='<div class="empty" style="grid-column:1/-1">Loading fleet...</div>';
 try{
  const list=await api(`/api/vehicles?type=${selectedType}&search=${q}`);
  if(!list.length){grid.innerHTML='<div class="empty" style="grid-column:1/-1"><strong>No vehicles found</strong>Try another search or category.</div>';return;}
  grid.innerHTML=list.map(v=>{
   const icon=v.type==='Bicycle'?'🚲':v.type==='Scooter'?'⚡':'🏍️';
   return `<article class="vehicle-card">
    <div class="vehicle-art">${icon}</div>
    <div class="vehicle-top"><span class="tag">${esc(v.type)}</span><span class="available">${v.available?'● AVAILABLE':'● RENTED'}</span></div>
    <h3>${esc(v.name)}</h3><div class="model">${esc(v.model)} · ID ${esc(v.id)}</div>
    <div class="vehicle-bottom"><div class="price"><strong>${money(v.pricePerHour)}</strong><span>/ hour</span></div>
    <button class="rent-btn" ${v.available?'':'disabled'} onclick="openRent('${v.id}')">${v.available?'Rent now':'Unavailable'}</button></div>
   </article>`;
  }).join('');
 }catch(e){grid.innerHTML=`<div class="empty" style="grid-column:1/-1"><strong>Could not load vehicles</strong>${esc(e.message)}</div>`;}
}

function openAuth(mode){
 const c=document.getElementById('authContent');
 c.innerHTML=mode==='login'?`
 <h2>Welcome back.</h2><p>Sign in to manage your campus rides.</p>
 <form class="form" onsubmit="login(event)">
 <label>COLLEGE EMAIL</label><input id="loginEmail" type="email" required placeholder="you@college.edu">
 <label>PASSWORD</label><input id="loginPassword" type="password" required placeholder="••••••••">
 <button class="btn primary full">Sign in →</button></form>
 <div class="switch">New to CampusRide? <button onclick="openAuth('register')">Create account</button></div>`
 :`
 <h2>Create your account.</h2><p>Join the campus mobility network in less than a minute.</p>
 <form class="form" onsubmit="register(event)">
 <label>FULL NAME</label><input id="regName" required placeholder="Your full name">
 <label>COLLEGE EMAIL</label><input id="regEmail" type="email" required placeholder="you@college.edu">
 <label>PASSWORD</label><input id="regPassword" type="password" minlength="4" required placeholder="Minimum 4 characters">
 <button class="btn primary full">Create account →</button></form>
 <div class="switch">Already registered? <button onclick="openAuth('login')">Sign in</button></div>`;
 document.getElementById('authModal').classList.remove('hidden');
}
function closeModal(id){document.getElementById(id).classList.add('hidden');}

async function register(e){
 e.preventDefault();
 try{
  currentStudent=await api('/api/register',{method:'POST',body:JSON.stringify({name:regName.value,email:regEmail.value,password:regPassword.value})});
  localStorage.setItem('campusStudent',JSON.stringify(currentStudent)); closeModal('authModal');updateNav();toast('Account created. Welcome to CampusRide.');showPage('vehicles');
 }catch(err){toast(err.message,false);}
}
async function login(e){
 e.preventDefault();
 try{
  currentStudent=await api('/api/login',{method:'POST',body:JSON.stringify({email:loginEmail.value,password:loginPassword.value})});
  localStorage.setItem('campusStudent',JSON.stringify(currentStudent));closeModal('authModal');updateNav();toast('Signed in successfully.');showPage('vehicles');
 }catch(err){toast(err.message,false);}
}
function logout(){currentStudent=null;localStorage.removeItem('campusStudent');updateNav();toast('You have been logged out.');showPage('home');}

async function openRent(id){
 if(!currentStudent){openAuth('login');return;}
 try{
  selectedVehicle=await api('/api/vehicles/'+id);
  const c=document.getElementById('rentContent');
  c.innerHTML=`
   <div class="eyebrow"><span></span> RESERVE VEHICLE</div>
   <h2 style="margin-top:12px">Ready for a ride?</h2>
   <div class="rent-preview"><div class="rent-icon">${selectedVehicle.type==='Bicycle'?'🚲':selectedVehicle.type==='Scooter'?'⚡':'🏍️'}</div><div><strong>${esc(selectedVehicle.name)}</strong><span>${esc(selectedVehicle.model)} · ${money(selectedVehicle.pricePerHour)}/hour</span></div></div>
   <label style="font-size:11px;color:#aaa">RENTAL DURATION</label>
   <select id="hours" class="duration" onchange="updateTotal()">
    ${Array.from({length:24},(_,i)=>`<option value="${i+1}">${i+1} hour${i?'s':''}</option>`).join('')}
   </select>
   <div class="calc"><div class="calc-row"><span>Rate</span><span>${money(selectedVehicle.pricePerHour)} / hour</span></div><div class="calc-row"><span>Duration</span><span id="durationText">1 hour</span></div><div class="calc-row total"><span>Total</span><strong id="totalPrice">${money(selectedVehicle.pricePerHour)}</strong></div></div>
   <button class="btn primary full" onclick="confirmRent()">Confirm rental →</button>`;
  document.getElementById('rentModal').classList.remove('hidden');
 }catch(e){toast(e.message,false);}
}
function updateTotal(){
 const h=Number(document.getElementById('hours').value);
 let total=selectedVehicle.pricePerHour*h;
 if(selectedVehicle.type==='Bike'&&h>=5)total*=.9;
 document.getElementById('durationText').textContent=h+' hour'+(h>1?'s':'');
 document.getElementById('totalPrice').textContent=money(total);
}
async function confirmRent(){
 try{
  const r=await api('/api/rent',{method:'POST',body:JSON.stringify({studentId:currentStudent.id,vehicleId:selectedVehicle.id,hours:Number(hours.value)})});
  closeModal('rentModal');toast('Ride confirmed. Your vehicle is reserved.');showPage('active');
 }catch(e){toast(e.message,false);}
}

async function loadActive(){
 const box=document.getElementById('activeBox');
 if(!currentStudent){box.innerHTML=`<div class="empty"><strong>Sign in to see your active ride</strong><button class="btn primary" onclick="openAuth('login')">Student Login</button></div>`;return;}
 try{
  const data=await api(`/api/rentals/${currentStudent.id}/active`);
  if(!data.active){box.innerHTML=`<div class="empty"><strong>No active rental</strong><p>Choose a vehicle and start your next campus trip.</p><button class="btn primary" onclick="showPage('vehicles')">Browse vehicles →</button></div>`;return;}
  const r=data.rental;
  box.innerHTML=`<div class="ride-box"><div class="ride-grid"><div class="ride-main"><span class="status">● ACTIVE NOW</span><h3>${esc(r.vehicleName)}</h3><p style="color:#888;font-size:12px">Rental ID · ${esc(r.id)}</p><div class="ride-details"><div class="detail"><small>Duration</small><span>${r.hours} hour${r.hours>1?'s':''}</span></div><div class="detail"><small>Total</small><span>${money(r.amount)}</span></div><div class="detail"><small>Started</small><span>${formatDate(r.startTime)}</span></div><div class="detail"><small>Vehicle</small><span>${esc(r.vehicleId)}</span></div></div><button class="return-btn" onclick="returnRide('${r.id}')">Return vehicle & get bill</button></div><div style="display:grid;place-items:center;background:radial-gradient(circle,#2a1743,#121017);border-radius:15px;font-size:110px">🏍️</div></div></div>`;
 }catch(e){box.innerHTML=`<div class="empty">${esc(e.message)}</div>`;}
}
async function returnRide(id){
 if(!confirm('Return this vehicle now?'))return;
 try{await api(`/api/return/${id}?studentId=${encodeURIComponent(currentStudent.id)}`,{method:'POST'});toast('Vehicle returned. Bill generated.');showBill(id);loadActive();}catch(e){toast(e.message,false);}
}
async function showBill(id){
 const history=await api(`/api/rentals/${currentStudent.id}`);
 const r=history.find(x=>x.id===id);
 if(!r)return;
 document.getElementById('rentContent').innerHTML=`<div class="eyebrow"><span></span> PAYMENT RECEIPT</div><h2 style="margin-top:12px">Ride complete.</h2><p>Your digital bill is ready.</p><div class="calc" style="margin-top:24px"><div class="calc-row"><span>Rental ID</span><span>${esc(r.id)}</span></div><div class="calc-row"><span>Vehicle</span><span>${esc(r.vehicleName)}</span></div><div class="calc-row"><span>Duration</span><span>${r.hours} hour(s)</span></div><div class="calc-row"><span>Payment status</span><span style="color:#43dca8">PAID</span></div><div class="calc-row total"><span>Total paid</span><strong>${money(r.amount)}</strong></div></div><button class="btn primary full" onclick="closeModal('rentModal');showPage('history')">View rental history</button>`;
 document.getElementById('rentModal').classList.remove('hidden');
}
async function loadHistory(){
 const box=document.getElementById('historyBox');
 if(!currentStudent){box.innerHTML=`<div class="empty"><strong>Sign in to see your history</strong><button class="btn primary" onclick="openAuth('login')">Student Login</button></div>`;return;}
 try{
  const rows=await api(`/api/rentals/${currentStudent.id}`);
  if(!rows.length){box.innerHTML='<div class="empty"><strong>No rides yet</strong><p>Your completed rentals will appear here.</p></div>';return;}
  box.innerHTML=`<div class="history-table"><div class="history-row header"><div>Vehicle</div><div>Rental ID</div><div>Date</div><div>Amount</div></div>${rows.map(r=>`<div class="history-row"><div><strong>${esc(r.vehicleName)}</strong><br><small style="color:#777">${esc(r.vehicleId)}</small></div><div>${esc(r.id)}</div><div>${formatDate(r.startTime)}</div><div><strong>${money(r.amount)}</strong><br><small class="${r.status==='COMPLETED'?'completed':''}">${esc(r.status)}</small></div></div>`).join('')}</div>`;
 }catch(e){box.innerHTML=`<div class="empty">${esc(e.message)}</div>`;}
}
function formatDate(s){return new Date(s).toLocaleString('en-IN',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'});}
