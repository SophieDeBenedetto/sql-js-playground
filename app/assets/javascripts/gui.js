$( document ).ready(function() {
    


var execBtn = document.getElementById("execute");
var outputElm = document.getElementById('output');
var errorElm = document.getElementById('error');
var commandsElm = document.getElementById('commands');
var dbFileElm = document.getElementById('dbfile');
var savedbElm = document.getElementById('savedb');

// Start the worker in which sql.js will run
// var worker = new Worker("../js/worker.sql.js");
// worker.onerror = error;

// // Open a database
// worker.postMessage({action:'open'});

// Connect to the HTML element we 'print' to
function print(text) {
    outputElm.innerHTML = text.replace(/\n/g, '<br>');
}
function error(e) {
  console.log(e);
  errorElm.style.height = '2em';
  errorElm.textContent = e.message;
}

function noerror() {
    errorElm.style.height = '0';
}

// Run a command in the database
function execute(commands) {
  window.db = new SQL.Database();
  db.run(commands);
  var query = commands.split(/(?=SELECT)/)[1]
  var results = db.exec(query);
  for (var i=0; i<results.length; i++) {
    $("#output").html(" ");
    outputElm.appendChild(tableCreate(results[i].columns, results[i].values));
  }
}

// Create an HTML table
var tableCreate = function () {
  function valconcat(vals, tagName) {
    if (vals.length === 0) return '';
    var open = '<'+tagName+'>', close='</'+tagName+'>';
    return open + vals.join(close + open) + close;
  }
  return function (columns, values){
    var tbl  = document.createElement('table');
    var html = '<thead>' + valconcat(columns, 'th') + '</thead>';
    var rows = values.map(function(v){ return valconcat(v, 'td'); });
    html += '<tbody>' + valconcat(rows, 'tr') + '</tbody>';
    tbl.innerHTML = html;
    return tbl;
  }
}();

// Execute the commands when the button is clicked
function execEditorContents () {
  noerror()
  if (window.db) {
    var results = db.exec(editor.getValue() + ';')
    for (var i=0; i<results.length; i++) {
      $("#output").html(" ");
      outputElm.appendChild(tableCreate(results[i].columns, results[i].values));
    };
  } else {
    execute (editor.getValue() + ';');
  };
}
execBtn.addEventListener("click", execEditorContents, true);


// Add syntax highlihjting to the textarea
var editor = CodeMirror.fromTextArea(commandsElm, {
    mode: 'text/x-mysql',
    viewportMargin: Infinity,
    indentWithTabs: true,
    smartIndent: true,
    lineNumbers: true,
    matchBrackets : true,
    autofocus: true,
    extraKeys: {
      "Ctrl-Enter": execEditorContents,
      "Ctrl-S": savedb,
    }
});

// Load a db from a file
dbFileElm.onchange = function() {
  var f = dbFileElm.files[0];
  var r = new FileReader();

  editor.setValue("");
  r.onload = function() {
        var Uints = new Uint8Array(r.result);
        window.db = new SQL.Database(Uints);
    }
  r.readAsArrayBuffer(f);
  
};

// Save the db to a file
// function savedb () {
//   debugger;
//   worker.onmessage = function(event) {
//     toc("Exporting the database");
//     var arraybuff = event.data.buffer;
//     var blob = new Blob([arraybuff]);
//     var url = window.URL.createObjectURL(blob);
//     window.location = url;
//   };
//   tic();
//   worker.postMessage({action:'export'});
// }
// savedbElm.addEventListener("click", savedb, true);
});
