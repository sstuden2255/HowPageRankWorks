
//const colors = ["#990000", "#009900", "#000099"]
//const colors = ['red', 'orange', 'green', 'blue', 'violet']
const colors = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58']
var color_index = 0

const jump_chance = 0.15

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
    circle.setAttribute("fill", colors[color_index]);
    color_index = (color_index+1) % colors.length;
    
    circle.setAttribute("class", "node");
    circle.inlinks = []
    circle.outlinks = []
    circle.percentValue = 0.5;
    //updateNode(circle)

    onMouseDown = (event) => {
        dragged_node = circle;
        event.stopPropagation()
    }
    circle.addEventListener('mousedown', onMouseDown);
    
    onMouseUp = (event) => {
        if (dragged_node == circle) {
            removeNode(circle)
        } else {
            createLink(dragged_node, circle);
        }
        calcGraphValues()
        event.stopPropagation()
    }
    circle.addEventListener('mouseup', onMouseUp)
    
    text = createSVGElement('text')
    text.innerHTML = 'skdjfls'
    text.setAttribute("class", "node-label");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("text-anchor", "middle");

    text.addEventListener('mouseup', onMouseUp)
    text.addEventListener('mousedown', onMouseDown);
    
    circle.textElement = text

    main_svg.appendChild(circle)
    main_svg.appendChild(text)

    calcGraphValues()
}

function createLink(node1, node2) {
    for (let link of node1.outlinks) {
        if (link.destNode == node2) {
            return;
        }
    }
    
    let link = createSVGElement('line');
    link.setAttribute("stroke", "black");
    link.setAttribute("stroke-width", "4px");
    link.setAttribute("marker-end", "url(#arrow)");

    link.setAttribute("class", "node");
    link.sourceNode = node1
    link.destNode = node2

    node1.outlinks.push(link)
    node2.inlinks.push(link)

    link.addEventListener('mousedown', set_dragged);
    link.addEventListener('mouseup', (event) => {
        if (dragged_node == link) {
            removeLink(link)
            calcGraphValues()
        }
    });

    main_svg.insertBefore(link, main_svg.firstChild)
    calcGraphValues()
}

function updateNode(circle) {
    //const allNodes = Array.from(document.querySelectorAll('#interactive-vis svg circle'))
    //let max = Math.max(...(allNodes.map((node) => node.percentValue)))
    //console.log(max, allNodes, allNodes.map((node) => node.percentValue))
    circle.setAttribute("r", Math.max(10, circle.percentValue * 40 + 20));
    circle.textElement.innerHTML = Math.round(circle.percentValue * 100) + "%";
}

function updateLink(link) {
    let x1 = link.sourceNode.cx.baseVal.value
    let y1 = link.sourceNode.cy.baseVal.value
    let x2 = link.destNode.cx.baseVal.value
    let y2 = link.destNode.cy.baseVal.value
    let radius = link.destNode.r.baseVal.value
    let length = Math.pow((x1-x2) * (x1-x2) + (y1-y2) * (y1-y2), 0.5)
    x2 += (x1-x2) / length * radius
    y2 += (y1-y2) / length * radius

    link.setAttribute("x1", x1)
    link.setAttribute("y1", y1)
    link.setAttribute("x2", x2)
    link.setAttribute("y2", y2)
}

function removeNode(node) {
    for (let link of Array.from(node.outlinks)) {
        removeLink(link);
    }
    for (let link of Array.from(node.inlinks)) {
        removeLink(link);
    }
    node.inlinks = null
    node.outlinks = null
    node.textElement.remove()
    node.textElement = null;
    node.remove()
}

function removeLink(link) {
    link.sourceNode.outlinks.splice(link.sourceNode.outlinks.indexOf(link), 1);
    link.destNode.inlinks.splice(link.destNode.inlinks.indexOf(link), 1);
    link.sourceNode = null
    link.destNode = null
    link.remove()
}


const damping_factor = 0.85
function calcGraphValues() {
    nodes = document.querySelectorAll('#interactive-vis svg circle')

    for (let node of nodes) {
        node.percentValue = 1 / nodes.length;
        node.nextValue = 0;
    }
    
    for (let iters = 0; iters < 100; iters ++) {
        let redistribute = 0;
        for (let node of nodes) {
            //let value = 0
            //for (let link of node.inlinks) {
            //    value += link.sourceNode.percentValue / link.sourceNode.outlinks.length
            //}
            //node.nextValue = value * damping_factor + (1 - damping_factor) / nodes.length
            
            let value = node.percentValue
            for (let link of node.outlinks) {
                let givenValue = (node.percentValue * (1-jump_chance)) / node.outlinks.length
                link.destNode.nextValue += givenValue
                value -= givenValue
            }
            redistribute += value
        }
        
        for (let node of nodes) {
            node.percentValue = node.nextValue + redistribute / nodes.length
            node.nextValue = 0;
        }
    }

    tmp = []
    for (let node of nodes) {
        tmp.push(node.percentValue);
        updateNode(node);
        for (let link of node.outlinks) {
            updateLink(link);
        }
    }
    //console.log(tmp)
}

