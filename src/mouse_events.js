
export function addEventsToElement(ele){
    const rect = ele.getBoundingClientRect();
    let mouseInfo = {
        pos: [0,0],
        vel: [0,0],
		down: 0,
		scrolldelta: 0.0,
    };
    ele.addEventListener('mousedown', e => {
		mouseInfo.pos[0] = e.clientX - rect.left;
		mouseInfo.pos[1] = e.clientY - rect.top;
		mouseInfo.down++;
	});
	ele.addEventListener('mousemove', e => {
		let newX = e.clientX - rect.left;
        let newY = e.clientY - rect.top;
        mouseInfo.vel = [newX-mouseInfo.pos[0],newY-mouseInfo.pos[1]];
        mouseInfo.pos = [newX,newY];
	});
	  
	window.addEventListener('mouseup', e => {
		mouseInfo.pos[0] = e.clientX - rect.left;
		mouseInfo.pos[1] = e.clientY - rect.top;
		mouseInfo.down--;
    });

    ele.addEventListener('touchstart', evt => {
		mouseInfo.pos[0] = evt.changedTouches[0].clientX - rect.left;
		mouseInfo.pos[1] = evt.changedTouches[0].clientY - rect.top;
		mouseInfo.down++;
	});
	ele.addEventListener('touchmove', evt => {
		let newX = evt.changedTouches[0].clientX - rect.left;
        let newY = evt.changedTouches[0].clientY - rect.top;
        mouseInfo.vel = [newX-mouseInfo.pos[0],newY-mouseInfo.pos[1]];
        mouseInfo.pos = [newX,newY];
	});
	  
	window.addEventListener('touchend', evt => {
		mouseInfo.pos[0] = evt.changedTouches[0].clientX - rect.left;
		mouseInfo.pos[1] = evt.changedTouches[0].clientY - rect.top;
		mouseInfo.down--;
	});

	window.addEventListener('wheel', evt => {
		evt.preventDefault();
		mouseInfo.scrolldelta = evt.deltaY*0.01;
	});
    
    return mouseInfo;
}