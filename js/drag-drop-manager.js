export class DragDropManager {
    constructor(badgeWrapper) {
        this.badgeWrapper = badgeWrapper;
        this.setupInteractJS();
    }

    setupInteractJS() {
        interact('.editable')
            .draggable({ 
                listeners: { move: (event) => this.dragMoveListener(event) }
            })
            .resizable({ 
                edges: { right: true, bottom: true }, 
                listeners: { move: (event) => this.resizeListener(event) }
            });
    }

    dragMoveListener(event) {
        const target = event.target;
        const x = (parseFloat(target.style.left) || 0) + (event.dx / this.badgeWrapper.clientWidth * 100);
        const y = (parseFloat(target.style.top) || 0) + (event.dy / this.badgeWrapper.clientHeight * 100);
        target.style.left = `${x}%`;
        target.style.top = `${y}%`;
    }

    resizeListener(event) {
        const target = event.target;
        const badgeRect = this.badgeWrapper.getBoundingClientRect();

        // Set width and height in percentage
        target.style.width = `${event.rect.width / badgeRect.width * 100}%`;
        target.style.height = `${event.rect.height / badgeRect.height * 100}%`;

        // Update position based on delta (also in percentage)
        const x = (parseFloat(target.style.left) || 0) + (event.deltaRect.left / badgeRect.width * 100);
        const y = (parseFloat(target.style.top) || 0) + (event.deltaRect.top / badgeRect.height * 100);
        target.style.left = `${x}%`;
        target.style.top = `${y}%`;
    }
} 