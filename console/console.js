console.old = console.log;
console.log = (...args) => {
    console.old(...args);
    return args;
}


const run_code = (code) => {
    try {return new Function("return "+ code)();}
    catch (e) { return e; }
}

// Words that may start a valid expression without naming a global.
const EXPRESSION_KEYWORDS = new Set([
    "new", "typeof", "void", "delete", "await", "function", "class",
    "this", "true", "false", "null", "undefined", "NaN", "Infinity",
]);
const BUILTIN_COMMANDS = new Set(["clear"]);

// Checks a command without running it: it must parse as an expression,
// and if it starts with a name, that name must exist on the page.
const is_valid_command = (code) => {
    let command = code.trim();
    if (command == "") return false;
    if (BUILTIN_COMMANDS.has(command)) return true;

    try { new Function("return " + command); }
    catch (e) { return false; }

    let head = command.match(/^[A-Za-z_$][\w$]*/);
    if (!head || EXPRESSION_KEYWORDS.has(head[0])) return true;
    return head[0] in globalThis;
}

const paint_input = (input) => {
    let text = input.innerText.trim();
    let valid = is_valid_command(text);
    input.classList.toggle("valid", text != "" && valid);
    input.classList.toggle("invalid", text != "" && !valid);
}

const log_result = (input, result, err=false) => {

    // set result
    let result_div = document.createElement("div");
    result_div.setAttribute("class", "console-result-div");
    result_div.innerHTML = `<span>${result}</br></br>`;

    // set input
    let input_div = document.createElement("div");
    input_div.setAttribute("class", "console-input-div");
    input_div.innerHTML = `
        <span class="term-arrow" readonly="true">➜</span> <span class="term-tilde">~</span> 
        <div style="color:${(err ? "#ff625e" : "#05ba25")};font-weight:bold;">${input}</br></div>
    `

    let log = document.createElement("div");
    log.setAttribute("class", "console-log");
    log.appendChild(input_div);
    log.appendChild(result_div);

    let shell = document.getElementsByClassName("console-res")[0];
    shell.appendChild(log)
}

const clear_shell = () => {
    document.getElementsByClassName("console-res")[0].innerHTML = ""
}

let console_input_wrapper = document.getElementsByClassName("console")[0];
console_input_wrapper.addEventListener("click", () => {
    document.getElementById("console-input").focus();
})

let console_input = document.getElementById("console-input");
console_input.addEventListener("input", (e) => paint_input(e.target));
console_input.addEventListener("keypress", (e) => {
    if (e.key == "backspace") console.old("asdf");
    if (e.key != "Enter") return;

    e.preventDefault()

    let text = e.target.innerText;
    console.old(text)
    if (text == "") return;
    if (text == "clear") { clear_shell(); e.target.innerText = ""; paint_input(e.target); return; }
    let result = run_code(text);
    log_result(text, result, (result instanceof Error ? true : false));
    e.target.innerText = ""
    paint_input(e.target);

})
