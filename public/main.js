
const colors = ["#990000", "#009900", "#000099"]
var color_index = 0

var dragged_node = null;

function set_dragged(event) {
    dragged_node = event.target;
}

function createSVGElement(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
}

var main_svg = document.querySelector("#interactive-vis svg")

main_svg.addEventListener('mousedown', set_dragged);
main_svg.addEventListener('mouseup', (event) => {
    if (dragged_node == main_svg) {
        let bounding = main_svg.getBoundingClientRect()
        let x = event.clientX - bounding.left;
        let y = event.clientY - bounding.top;
        createNode(x,y)
    }
})

function createNode(x,y) {
    let circle = createSVGElement("circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 50);
    circle.setAttribute("fill", colors[color_index]);
    color_index = (color_index+1) % colors.length;
    
    circle.setAttribute("class", "node");
    circle.inlinks = []
    circle.outlinks = []

    circle.addEventListener('mousedown', (event) => {
        dragged_node = event.target;
        event.stopPropagation()
    });
    
    circle.addEventListener('mouseup', (event) => {
        if (dragged_node == event.target) {
            for (let link of event.target.inlinks) {
                link.remove()
            }
            for (let link of event.target.outlinks) {
                link.remove()
            }
            event.target.remove()
        } else {
            createLink(dragged_node, event.target);
        }
        event.stopPropagation()
    });

    console.log(circle);
    
    main_svg.appendChild(circle)
}

function createLink(node1, node2) {
    for (let link of node1.outlinks) {
        if (link.destNode == node2) {
            return;
        }
    }
    
    let link = createSVGElement('line');
    link.setAttribute("x1", node1.cx.baseVal.value);
    link.setAttribute("y1", node1.cy.baseVal.value);
    link.setAttribute("x2", node2.cx.baseVal.value);
    link.setAttribute("y2", node2.cy.baseVal.value);
    link.setAttribute("stroke", "black");
    link.setAttribute("stroke-width", "5px");
    link.setAttribute("marker-end", "url(#arrow)");

    link.setAttribute("class", "node");
    link.sourceNode = node1
    link.destNode = node2
    node1.outlinks.push(link)
    node2.inlinks.push(link)

    link.addEventListener('mousedown', set_dragged);
    link.addEventListener('mouseup', (event) => {
        if (dragged_node == link) {
            node1.outlinks.splice(node1.outlinks.indexOf(link), 1);
            node1.inlinks.splice(node1.inlinks.indexOf(link), 1);
            link.remove()
        }
    });

    console.log(link)
    
    main_svg.appendChild(link)
}


