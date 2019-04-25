var ctx = canvas.getContext('2d');
var running = false;
var mouseOldPos;
var mousePos;
var existedElements;
var elementsLoadedEvent = new Event('loaded'); // event when ajax returns data


// drawing existed elements. 
function drawExisted(data) {
  var elements = JSON.parse(data);
  for (item of elements.values()) {
    ctx.beginPath();
    ctx.moveTo(item.fields.x0, item.fields.y0);
    ctx.lineTo(item.fields.x1, item.fields.y1);
    ctx.stroke();
  }
}

// get existing elements from DB
function getExisted() {
  var data = {};
  var plan_id = document.getElementById('canvas_form').name;
  data.plan = plan_id;
  var url = '/catalog/get_elements/';
  $.ajax({
    url: url,
    type: 'GET',
    data: data,
    cache: true,
    success: function (data) {
      existedElements = data;
      console.log("OK Getting stored elements");
      //raise event when the reqiest recieved and we can draw existed elements
      document.dispatchEvent(elementsLoadedEvent);
    },
    error: function () {
      console.log("Getting stored elements error");
    }
  });

}

// getting existing elements when just open scheme
$(document).ready(function () {
  getExisted();
});

// draw existed elements when GET request returned saved elements
document.addEventListener('loaded', function (e) {
  drawExisted(existedElements);
}, false);


var elementLine = {
  draw: function () {
    ctx.beginPath();
    ctx.moveTo(mouseOldPos.x, mouseOldPos.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.stroke();
  }
};

function clear() {
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

canvas.addEventListener('mousemove', function (e) {
  ctx.lineWidth = 10.0;
  ctx.lineCap = 'square';
  if (running) {
    clear();
    mousePos = getMousePos(canvas, e);
    drawExisted(existedElements);
    elementLine.draw();
  }
});

canvas.addEventListener('click', function (e) {
  if (!running) {
    mouseOldPos = getMousePos(canvas, e);
    running = true;
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
        console.log("POST OK");
      },
      error: function () {
        console.log("POST error");
      }
    });
    getExisted();
    drawExisted(existedElements);
  }
});

function getMousePos(canvas, e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - Math.round(rect.left),
    y: e.clientY - Math.round(rect.top)
  };
}

