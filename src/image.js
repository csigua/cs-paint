function setColor(r, g, b) { // allow me to set colors using RGB vals to 255 instead of 0-1
    gl.uniform4f(u_FragColor, r/255, g/255, b/255, 1.0);
}

class Drawing {
    constructor() {
        this.type = 'drawing';
        this.position = [0.0, 0.0, 0.0];
    }
}

function drawImage() {
    // draw background
    setColor(40, 0, 60);
    drawTriangle([1,-1 , 1,1, -1,1]);
    drawTriangle([1,-1 , -1,-1, -1,1]);

    // draw bottle
    // cork
    setColor(200, 0, 0);
    drawTriangle([-.6,.7,     -.6,.5,    -.4,.7]);
    drawTriangle([-.4,.5,     -.6,.5,    -.4,.7]);

    // glass of bottle
    setColor(20, 100, 10);
    drawTriangle([-.7,.2,     -.7,-.6,    -.3,.2]);
    drawTriangle([-.3,-.6,     -.7,-.6,    -.3,.2]);
    drawTriangle([-.4,.2,     -.6,.2,    -.4,.5]);
    drawTriangle([-.6,.5,     -.6,.2,    -.4,.5]);
    drawTriangle([-.6,.5,     -.6,.2,    -.7,.2]);
    drawTriangle([-.3,.2,     -.6,.2,    -.4,.5]);

    // bottle label
    setColor(250, 250, 150);
    drawTriangle([-.7,.1,     -.7,-.4,    -.3,.1]);
    drawTriangle([-.3,-.4,     -.7,-.4,    -.3,.1]);

    // label text
    setColor(10, 0, 100);
    drawTriangle([-.65,0,     -.35,0,     -.65,-.05]);
    drawTriangle([-.35,-.05,     -.35,0,     -.65,-.05]);

    // draw wine glass
    setColor(190, 255, 255);
    drawTriangle([.1,-.6,     .6,-.6,    .35,-.4]);
    drawTriangle([.35,-.6,     .4,.4,    .3,.4]);
    drawTriangle([.0,.4,     .7,.4,    .35,.0]);

    // draw wine inside glass
    setColor(150, 0, 0);
    drawTriangle([.05,.36,     .65,.36,    .35,.05]);

    // draw table
    setColor(150, 70, 0);
    drawTriangle([-1,-.6,     -1,-1,    1,-.6]);
    drawTriangle([1,-1,     -1,-1,    1,-.6]);
}