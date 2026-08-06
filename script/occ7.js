const observer = new IntersectionObserver(entries=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.classList.add("show");

        }

    });

});

document.querySelectorAll(".occasion").forEach(el=>observer.observe(el));
const card=document.querySelector(".occasion");

card.addEventListener("mousemove",(e)=>{

    const rect=card.getBoundingClientRect();

    const x=e.clientX-rect.left;
    const y=e.clientY-rect.top;

    const rotateY=((x/rect.width)-0.5)*16;
    const rotateX=((y/rect.height)-0.5)*-16;

    card.style.transform=
        `perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)`;

});

card.addEventListener("mouseleave",()=>{

    card.style.transform=
    "perspective(1000px) rotateX(0) rotateY(0)";

});
const title="Communication & Emotional Intelligence";

const h=document.querySelector("h1");

let i=0;

function type(){

    if(i<title.length){

        h.textContent+=title[i++];

        setTimeout(type,40);

    }

}

h.textContent="";

type();
for(let i=0;i<25;i++){

    const p=document.createElement("span");

    p.className="particle";

    p.style.left=Math.random()*100+"vw";
    p.style.top=Math.random()*100+"vh";
    p.style.animationDuration=
        3+Math.random()*5+"s";

    document.body.appendChild(p);

}