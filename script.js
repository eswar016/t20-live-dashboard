const fixturesAPI =
"https://opensheet.elk.sh/1Qa6-iiWnyRZwhYdJOkTrdiFUs64ovheRdrmQ4umkMEI/FixturesAPI";

const pointsAPI =
"https://opensheet.elk.sh/1Qa6-iiWnyRZwhYdJOkTrdiFUs64ovheRdrmQ4umkMEI/PointsAPI";

const updateAPI =
"https://script.google.com/macros/s/AKfycbzX5TqmtrBG6yu0N15v_cb6Qv5tWcaAijgg1MIG2Kxzg4RhjmPKe08jZja7NiSAmnxj/exec";

const POINTS_SYNC_DELAY_MS = 900;
const POINTS_SYNC_STATE_KEY = "t20_points_sync_state_v1";

let pointsLoaderVisible = false;
let lastPointsSignature = "";

function sleep(ms){
return new Promise(resolve=>setTimeout(resolve,ms));
}

function setPointsLoading(show){
const wrap = document.getElementById("pointsWrap");
if(!wrap) return;
pointsLoaderVisible = show;
if(show){
wrap.classList.add("loading");
} else {
wrap.classList.remove("loading");
}
}

function toPointsSignature(data){
return data.map(t=>[
t.Teams,
t.Matches,
t.Won,
t.Lost,
t.Points,
Number(t.NRR).toFixed(3)
].join("|")).join("||");
}

function sameNumber(a,b){
if(a === "" && b === "") return true;
const na = Number(a);
const nb = Number(b);
if(Number.isNaN(na) || Number.isNaN(nb)){
return String(a) === String(b);
}
return Math.abs(na - nb) < 1e-9;
}

function getSyncState(){
try{
const raw = localStorage.getItem(POINTS_SYNC_STATE_KEY);
return raw ? JSON.parse(raw) : null;
} catch(e){
return null;
}
}

function saveSyncState(state){
localStorage.setItem(POINTS_SYNC_STATE_KEY,JSON.stringify(state));
}

function clearSyncState(){
localStorage.removeItem(POINTS_SYNC_STATE_KEY);
}

function postCell(cell,value){
return fetch(updateAPI,{
method:"POST",
body:JSON.stringify({cell:cell,value:value})
}).then(r=>{
if(!r.ok) throw new Error("Update failed HTTP "+r.status);
return r.text();
});
}

// decimal -> cricket overs
function displayOvers(value){

if(!value) return "";

let overs = Math.floor(value);

let balls =
Math.round((value - overs) * 6);

return overs + "." + balls;

}

// -------- overs converter ----------
function convertOvers(value){

if(!value) return "";

let parts = value.split(".");

let overs = Number(parts[0]);
let balls = Number(parts[1] || 0);

if(balls >= 6){
overs += Math.floor(balls/6);
balls = balls % 6;
}

return overs + (balls/6);

}

// ---------- fixtures ----------
function loadMatches(){

fetch(fixturesAPI)
.then(r=>r.json())
.then(data=>{

const div=document.getElementById("matches");
div.innerHTML="";

data.forEach((m,i)=>{

div.innerHTML+=`

<div class="match">

<h3>${m.Match}</h3>

<div class="team">

<b>${m["Team A"]}</b><br>

Runs
<input id="ra${i}" value="${m["Runs A"]||""}">

Overs
<input id="oa${i}"
value="${displayOvers(m["Overs A"]) || ""}"
placeholder="">

</div>

<div class="team">

<b>${m["Team B"]}</b><br>

Runs
<input id="rb${i}" value="${m["Runs B"]||""}">

Overs
<input id="ob${i}"
value="${displayOvers(m["Overs B"]) || ""}"
placeholder="">

</div>

<button onclick="updateMatch(${i})">
Update Match
</button>

</div>

`;

});

});

}

async function waitForPointsUpdate(previousSignature){
while(true){
const state = getSyncState();
if(!state || !state.pending){
setPointsLoading(false);
return;
}

const currentSignature = await loadTable(true);

if(currentSignature && currentSignature !== previousSignature){
clearSyncState();
setPointsLoading(false);
return;
}
await sleep(POINTS_SYNC_DELAY_MS);
}
}

// ---------- update ----------
async function updateMatch(i){

let row = 11+i;

let runA=document.getElementById("ra"+i).value;
let runB=document.getElementById("rb"+i).value;

let overA=
convertOvers(
document.getElementById("oa"+i).value
);

let overB=
convertOvers(
document.getElementById("ob"+i).value
);

const previousSignature = lastPointsSignature || await loadTable(true);

try{
await Promise.all([
postCell("L"+row,runA),
postCell("O"+row,runB),
postCell("M"+row,overA),
postCell("P"+row,overB)
]);

alert("Updated");
saveSyncState({
pending:true,
baselineSignature:previousSignature,
matchIndex:i,
expectedRunA:runA,
expectedRunB:runB,
expectedOverA:overA,
expectedOverB:overB
});
setPointsLoading(true);
await waitForPointsUpdate(previousSignature);
} catch(e){
clearSyncState();
setPointsLoading(false);
alert("Update failed");
}

}

// ---------- points ----------
function loadTable(keepLoader){

return fetch(pointsAPI)
.then(r=>{
if(!r.ok) throw new Error("Points HTTP "+r.status);
return r.json();
})
.then(data=>{

const tbody=document.getElementById("pointsBody");

tbody.innerHTML="";

data.forEach(t=>{

tbody.innerHTML+=`
<tr class="${t.Teams}">
<td>${t.Teams}</td>
<td>${t.Matches}</td>
<td>${t.Won}</td>
<td>${t.Lost}</td>
<td>${t.Points}</td>
<td>${Number(t.NRR).toFixed(3)}</td>
</tr>
`;

});

lastPointsSignature = toPointsSignature(data);

if(!keepLoader){
setPointsLoading(false);
}

return lastPointsSignature;
})
.catch(()=>{
if(!keepLoader){
setPointsLoading(false);
}
return "";
});

}

loadMatches();

const savedSyncState = getSyncState();
if(savedSyncState && savedSyncState.pending){
setPointsLoading(true);
loadTable(true).then((currentSig)=>{
const baseline = savedSyncState.baselineSignature || currentSig;
if(!savedSyncState.baselineSignature){
saveSyncState({
...savedSyncState,
baselineSignature: baseline
});
}
waitForPointsUpdate(baseline);
});
} else {
loadTable(false);
}

setInterval(()=>{
if(!pointsLoaderVisible){
loadTable(false);
}
},4000);
