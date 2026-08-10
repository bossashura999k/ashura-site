const text = "Demo: intake → review → status update → persistence check";
const el = document.getElementById('typedLine');
let i = 0;
function type(){
if(i <= text.length){
    el.textContent = text.slice(0, i);
    i++;
    setTimeout(type, 28);
}
}
type();