const fixturesAPI =
"https://opensheet.elk.sh/1Qa6-iiWnyRZwhYdJOkTrdiFUs64ovheRdrmQ4umkMEI/FixturesAPI";

const pointsAPI =
"https://opensheet.elk.sh/1Qa6-iiWnyRZwhYdJOkTrdiFUs64ovheRdrmQ4umkMEI/PointsAPI";

const updateAPI =
"https://script.google.com/macros/s/AKfycbzX5TqmtrBG6yu0N15v_cb6Qv5tWcaAijgg1MIG2Kxzg4RhjmPKe08jZja7NiSAmnxj/exec";


// ---------- decimal → cricket overs ----------
function displayOvers(value){

if(!value) return "";

let overs = Math.floor(value);

let balls =
Math.round((value - overs) * 6);

return overs + "." + balls;

}


// ---------- cricket → decimal ----------
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


// ---------- LOAD FIXTURES ----------
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
value="${displayOvers(m["Overs A"]) || ""}">

</div>

<div class="team">

<b>${m["Team B"]}</b><br>

Runs
<input id="rb${i}" value="${m["Runs B"]||""}">

Overs
<input id="ob${i}"
value="${displayOvers(m["Overs B"]) || ""}">

</div>

<button onclick="updateMatch(${i})">
Update Match
</button>

</div>

`;

});

});

}


// ---------- UPDATE MATCH ----------
function updateMatch(i){

let row = 11+i;

let runA=document.getElementById("ra"+i).value;
let runB=document.getElementById("rb"+i).value;

let overA =
convertOvers(document.getElementById("oa"+i).value);

let overB =
convertOvers(document.getElementById("ob"+i).value);


// update sheet
fetch(updateAPI,{
method:"POST",
body:JSON.stringify({cell:"L"+row,value:runA})
});

fetch(updateAPI,{
method:"POST",
body:JSON.stringify({cell:"O"+row,value:runB})
});

fetch(updateAPI,{
method:"POST",
body:JSON.stringify({cell:"M"+row,value:overA})
});

fetch(updateAPI,{
method:"POST",
body:JSON.stringify({cell:"P"+row,value:overB})
});

alert("Updated ✅");


// ✅ wait 1 second then refresh
setTimeout(()=>{

loadTable();
loadMatches();

},1000);

}


// ---------- LOAD POINTS ----------
function loadTable(){

fetch(pointsAPI)
.then(r=>r.json())
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

});

}


// ---------- INITIAL LOAD ----------
loadMatches();
loadTable();


// background refresh
setInterval(loadTable,3000);