var ctx = canvas.getContext('2d');
var running = false;
var mouseOldPos;
var mousePos;



var elementLine = {
  draw: function() {
    ctx.beginPath();
    ctx.moveTo(mouseOldPos.x, mouseOldPos.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.stroke();
  }
};

// var savedRender = {
//   draw: function() {

//     ctx.beginPath();
//     ctx.moveTo(mouseOldPos.x, mouseOldPos.y);
//     ctx.lineTo(mousePos.x, mousePos.y);
//     ctx.stroke();
//   }
// };

function clear() {
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillRect(0,0,canvas.width,canvas.height);
}

canvas.addEventListener('mousemove', function(e) {
  ctx.lineWidth = 10.0; 
  ctx.lineCap = 'square';
  if (running) {
    clear();
    mousePos = getMousePos(canvas, e);
    elementLine.draw();
  }
});

canvas.addEventListener('click', function(e) {
  if (!running) {
    mouseOldPos = getMousePos(canvas, e);
    running = true;
    // geting saved lines from server
    


  } else {
    running = false;

    var data = {};
    data.x0 = mouseOldPos.x;
    data.y0 = mouseOldPos.y;
    data.x1 = mousePos.x;
    data.y1 = mousePos.y;
    var csrf_token = $('#canvas_form [name="csrfmiddlewaretoken"]').val();  
    var plan_id = document.getElementById('canvas_form').name;
    data.plan = plan_id;
    data["csrfmiddlewaretoken"] = csrf_token;
    var url = '/catalog/add_element/';
    console.log('data = ', data);
    $.ajax({
      url: url,
      type: 'POST',
      data: data,
      cache: true,
      success: function (data) {
        console.log("OK");
        console.log(data.elements);
      },
      error: function(){
        console.log("error");
      }

    });

    
  }

});

function getMousePos(canvas, e) {
  var rect = canvas.getBoundingClientRect();
  return {
      x: e.clientX - Math.round(rect.left),
      y: e.clientY - Math.round(rect.top)
  };
}

