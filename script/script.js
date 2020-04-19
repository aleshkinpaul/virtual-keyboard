import { init } from "./functions.js";

if (localStorage.getItem("layoutLang") === null) localStorage.setItem("layoutLang", "ru");

init();