let sidebar = document.querySelector(".sidebar");
let closeBtn = document.querySelector("#btn");
let infoBtn = document.querySelector("#info");
let active_tab = document.querySelector(".home-section");
let dashboard = document.querySelector(".li_dashboard");
let teams = document.querySelector(".li_teams");
let polls = document.querySelector(".li_polls");

closeBtn.addEventListener("click", ()=>{
  sidebar.classList.toggle("open");
  menuBtnChange();
});

infoBtn.addEventListener("click", ()=>{
    if(!sidebar.classList.contains("open")){
    sidebar.classList.toggle("open");
    menuBtnChange();
    }
});

function menuBtnChange() {
 if(sidebar.classList.contains("open")){
   closeBtn.classList.replace("bx-menu", "bx-menu-alt-right");
 }else {
   closeBtn.classList.replace("bx-menu-alt-right","bx-menu");
 }
}

if(active_tab.classList.contains("dashboard")) dashboard.classList.add("active_tab");
if(active_tab.classList.contains("teams")) teams.classList.add("active_tab");
if(active_tab.classList.contains("polls")) polls.classList.add("active_tab");

