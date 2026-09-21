/**
 * gas-shim.js
 * -----------
 * Membuat "google.script.run.withSuccessHandler(cb).namaFungsi(arg)" tetap
 * berjalan seperti biasa, padahal di balik layar ini mengirim fetch() POST
 * ke Web App Apps Script Anda dan menerjemahkan hasilnya balik.
 *
 * PENTING: isi APPS_SCRIPT_URL di bawah dengan URL /exec deployment
 * Apps Script Anda (Deploy > Manage deployments > Web app URL).
 */
var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw5uepvfAv7J76sgrgOAB3oOFqCDAWXx2LTbCvQH-KJUal2EUCw6FNkplH0BBqscSKBcg/exec";

// Fungsi yang wajib menyertakan PIN admin (harus sama dengan daftar SENSITIVE di Code.gs)
var GAS_SENSITIVE_FUNCTIONS = [
  "updateSettings", "addStudent", "deleteStudent",
  "registerFace", "updateStudentContact", "setupSpreadsheet", "getStudentList"
];

function callAppsScript(fnName, args) {
  var pin = sessionStorage.getItem('adminPin') || '';
  var needsPin = GAS_SENSITIVE_FUNCTIONS.indexOf(fnName) !== -1;

  return fetch(APPS_SCRIPT_URL, {
    method: "POST",
    // text/plain menghindari CORS preflight (Apps Script tidak bisa menjawab OPTIONS)
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ fn: fnName, args: args || [], pin: needsPin ? pin : undefined })
  }).then(function (res) {
    if (!res.ok) throw new Error("HTTP " + res.status);
    return res.json();
  });
}

function makeRunner() {
  var successCb = function () {};
  var failureCb = function (err) { console.error("[gas-shim] Error:", err); };

  var runner = {
    withSuccessHandler: function (cb) { successCb = cb; return runner; },
    withFailureHandler: function (cb) { failureCb = cb; return runner; }
  };

  return new Proxy(runner, {
    get: function (target, prop) {
      if (prop in target) return target[prop];
      // Setiap properti lain dianggap nama fungsi Apps Script, mis. .getSettings(x)
      return function () {
        var args = Array.prototype.slice.call(arguments);
        callAppsScript(prop, args)
          .then(function (result) { successCb(result); })
          .catch(function (err) { failureCb(err); });
        return runner;
      };
    }
  });
}

window.google = window.google || {};
window.google.script = window.google.script || {};
Object.defineProperty(window.google.script, "run", {
  get: function () { return makeRunner(); },
  configurable: true
});
