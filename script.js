"use strict";

/* ---------- Endpoints ---------- */
const fixturesAPI = "https://opensheet.elk.sh/1Qa6-iiWnyRZwhYdJOkTrdiFUs64ovheRdrmQ4umkMEI/FixturesAPI";
const pointsAPI   = "https://opensheet.elk.sh/1Qa6-iiWnyRZwhYdJOkTrdiFUs64ovheRdrmQ4umkMEI/PointsAPI";
const updateAPI   = "https://script.google.com/macros/s/AKfycbzX5TqmtrBG6yu0N15v_cb6Qv5tWcaAijgg1MIG2Kxzg4RhjmPKe08jZja7NiSAmnxj/exec";

/* ---------- Helpers: overs conversion ---------- */
function displayOvers(value) {
	if (value === null || value === undefined || value === "") return "";
	const num = Number(value);
	if (isNaN(num)) return "";
	const overs = Math.floor(num);
	const balls = Math.round((num - overs) * 6);
	return overs + "." + balls;
}

function convertOvers(value) {
	if (value === null || value === undefined || value === "") return "";
	const parts = String(value).trim().split(".");
	const overs = Number(parts[0]) || 0;
	let balls = Number(parts[1] || 0) || 0;
	if (balls >= 6) {
		const extra = Math.floor(balls / 6);
		balls = balls % 6;
		return overs + extra + (balls / 6);
	}
	return overs + (balls / 6);
}

/* ---------- Load fixtures and render matches ---------- */
function loadMatches() {
	fetch(fixturesAPI)
		.then(r => r.json())
		.then(data => {
			const div = document.getElementById("matches");
			div.innerHTML = "";
			data.forEach((m, i) => {
				div.innerHTML += `
					<div class="match">
						<h3>${m.Match}</h3>
						<div class="team">
							<b>${m["Team A"]}</b><br>
							Runs
							<input id="ra${i}" value="${m["Runs A"] || ""}">
							Overs
							<input id="oa${i}" value="${displayOvers(m["Overs A"]) || ""}">
						</div>
						<div class="team">
							<b>${m["Team B"]}</b><br>
							Runs
							<input id="rb${i}" value="${m["Runs B"] || ""}">
							Overs
							<input id="ob${i}" value="${displayOvers(m["Overs B"]) || ""}">
						</div>
						<button onclick="updateMatch(${i})">Update Match</button>
					</div>
				`;
			});
		})
		.catch(() => {
			// keep UI silent on fetch errors (preserve original behavior)
		});
}

/* ---------- Update a match (push to sheet) ---------- */
function updateMatch(i) {
	const row = 11 + i;
	const runA = document.getElementById("ra" + i).value;
	const runB = document.getElementById("rb" + i).value;
	const overA = convertOvers(document.getElementById("oa" + i).value);
	const overB = convertOvers(document.getElementById("ob" + i).value);

	// send updates (preserve original parallel POSTs)
	fetch(updateAPI, { method: "POST", body: JSON.stringify({ cell: "L" + row, value: runA }) });
	fetch(updateAPI, { method: "POST", body: JSON.stringify({ cell: "O" + row, value: runB }) });
	fetch(updateAPI, { method: "POST", body: JSON.stringify({ cell: "M" + row, value: overA }) });
	fetch(updateAPI, { method: "POST", body: JSON.stringify({ cell: "P" + row, value: overB }) });

	alert("Updated ✅");

	setTimeout(() => {
		loadTable();
		loadMatches();
	}, 1000);
}

/* ---------- Load points table ---------- */
function loadTable() {
	fetch(pointsAPI)
		.then(r => r.json())
		.then(data => {
			const tbody = document.getElementById("pointsBody");
			tbody.innerHTML = "";
			data.forEach(t => {
				tbody.innerHTML += `
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
		})
		.catch(() => {
			// keep UI silent on fetch errors
		});
}

/* ---------- Init ---------- */
loadMatches();
loadTable();
setInterval(loadTable, 3000);