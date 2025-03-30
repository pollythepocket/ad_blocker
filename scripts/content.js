const allElements = document.querySelectorAll('*');

const adElements = [...allElements].filter(el => 
    el.tagName.toLowerCase().includes("ad") ||  
    el.className.includes("ad") ||               
    el.id.includes("ad")                         
);

console.log(adElements);
