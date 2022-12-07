
const canvas = document.getElementById('c')
let ctx = canvas.getContext('2d')
let img  = document.getElementById('map')
let result  = document.getElementById('result')
window.addEventListener("DOMContentLoaded",() => {
    console.log("画像読み込み成功")
    animloop()   
})
const getMousePosition = (canvas,evt) => {
    let rect = canvas.getBoundingClientRect()
    return {
            x: evt.clientX - rect.left,
            y: evt.clientY - rect.top
        };
}
const copyPosition = (pos) => {
    return {
        x:pos.x,
        y:pos.y
    }
}
let move_flag = false
let mousePos = {x:0,y:0}
let prev_MousePos = copyPosition(mousePos) 
let d_cameraPos ={} = {x:0,y:0}
let cameraPos = copyPosition(d_cameraPos)
let click_cameraPos = copyPosition(cameraPos)
let prev_cameraPos = copyPosition(cameraPos)
let cameraPosMax
let eps = 0.0001
let imageScale = 0.3
let imageScaleMax=2.0
let imageScaleMin=0.3
const cameraPositionFix = () => {
    cameraPos.x = cameraPos.x > 0 ? cameraPos.x : 0
    cameraPos.x = cameraPosMax.x > cameraPos.x ? cameraPos.x : cameraPosMax.x
    cameraPos.y = cameraPos.y > 0 ? cameraPos.y : 0
    cameraPos.y = cameraPosMax.y > cameraPos.y ? cameraPos.y : cameraPosMax.y
}
document.getElementById("copy-button").addEventListener("click", function() {
    // textContentを取得する
    var textContent = result.textContent;
    // textContentをクリップボードにコピーする
    navigator.clipboard.writeText(textContent);
});
canvas.addEventListener('mousedown', evt => {
    move_flag=true;
    prev_MousePos = getMousePosition(canvas,evt)
    click_cameraPos = copyPosition(cameraPos)
    let convert_pos = convert_cv_pos(prev_MousePos)
    console.log(convert_pos)
    result.textContent="x:[" + convert_pos.x + "],y:[" + convert_pos.y + "]"
}, false);
canvas.addEventListener('mouseup', () => {
    move_flag=false;
}, false);
canvas.addEventListener('mouseleave', () => {
    move_flag=false;
}, false);
canvas.addEventListener('mousemove', evt => {
    mousePos = getMousePosition(canvas, evt);
}, false);
let SCALE_STEP = 0.025
canvas.addEventListener('mousewheel', evt => {
    let incdec = 1 - (evt.deltaY < 0) * 2
    imageScale += incdec * SCALE_STEP
    imageScale = imageScale > imageScaleMin ? imageScale : imageScaleMin
    imageScale = imageScaleMax > imageScale ? imageScale : imageScaleMax
    let mouse = getMousePosition(canvas,evt)
    cameraPos.x += mouse.x*SCALE_STEP / (imageScale * (imageScale - SCALE_STEP))*incdec
    cameraPos.y += mouse.y*SCALE_STEP / (imageScale * (imageScale - SCALE_STEP))*incdec
}, false);

const gridWidthMag = 1.0
const ini = () => {
    ctx.beginPath();
	ctx.globalAlpha = 1;
    ctx.fillStyle = '#fff';
	ctx.fillRect(0,0,canvas.width,canvas.height);
    cameraPosMax = {
        x:imageScale*3000-window.innerWidth*gridWidthMag,
        y:imageScale*3000-window.innerHeight
    }
}
const mouse_drag = () => {
    cameraPos.x = prev_MousePos.x+click_cameraPos.x-mousePos.x
    cameraPos.y = prev_MousePos.y+click_cameraPos.y-mousePos.y
    d_cameraPos.x = cameraPos.x-prev_cameraPos.x
    d_cameraPos.y = cameraPos.y-prev_cameraPos.y
    prev_cameraPos = copyPosition(cameraPos)
}
const mouse_drag_after = () => {
    d_cameraPos.x = Math.abs(d_cameraPos.x)>eps ? d_cameraPos.x*0.9 : 0
    d_cameraPos.y = Math.abs(d_cameraPos.y)>eps ? d_cameraPos.y*0.9 : 0
    cameraPos.x+= d_cameraPos.x
    cameraPos.y+= d_cameraPos.y
}

const base = {
    // x:-119,
    // y:-21,
    x:-114,
    y:-16,
    scale:5.9
    /* 根拠なし　適当に調整したらこうなった */
}
const convert_cv_pos = pos => {
    return {
        x: (pos.x+cameraPos.x)/imageScale/base.scale-base.x,
        y: (pos.y+cameraPos.y)/imageScale/base.scale-base.y
    }
}

const all = () => {
    ini()
    if(move_flag) {
        mouse_drag()
    } else {
        mouse_drag_after()
    }
    cameraPositionFix()
    ctx.drawImage(img, cameraPos.x*-1, cameraPos.y*-1, imageScale*3000, imageScale*3000);
}
const animloop = () =>{
	all();
	window.requestAnimationFrame(animloop);
}