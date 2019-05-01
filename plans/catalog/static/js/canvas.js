var ctx = canvas.getContext('2d');
var running = false;
var mouseOldPos;
var mousePos;
var existedElements;
var elementsLoadedEvent = new Event('loaded'); // event when ajax returns data
var elementLineWidth = 3;
var guideLineWidth = 1;

ctx.lineCap = 'square';

// drawing existed elements. 
function drawExisted(data) {
  var elements = JSON.parse(data);
  for (item of elements.values()) {
    ctx.lineWidth = elementLineWidth;
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
  if (running) {
    clear();
    sticking(canvas, e, existedElements);
    drawExisted(existedElements);
    elementLine.draw();
  } else {
    clear();
    sticking(canvas, e, existedElements);
    drawExisted(existedElements);
  }
});

canvas.addEventListener('click', function (e) {
  if (!running) {
    mouseOldPos = mousePos;
    running = true;
  } else {
    running = false;
    var data = {};
    data.x0 = mouseOldPos.x;
    data.y0 = mouseOldPos.y;
    data.x1 = mousePos.x;
    data.y1 = mousePos.y;
    //data.x2 = Math.abs(Math.round(mousePos.x - mouseOldPos.x));
    //data.y2 = Math.abs(Math.round(mousePos.y - mouseOldPos.y));
    var csrf_token = $('#canvas_form [name="csrfmiddlewaretoken"]').val();
    var plan_id = document.getElementById('canvas_form').name;
    data.plan = plan_id;
    data["csrfmiddlewaretoken"] = csrf_token;
    var url = '/catalog/add_element/';
    $.ajax({
      url: url,
      type: 'POST',
      data: data,
      cache: true,
      success: function (data) {
        console.log("POST OK");
        getExisted();
        drawExisted(existedElements);
      },
      error: function () {
        console.log("POST error");
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

// Sticking
var stickPixels = 3;
function sticking(canvas, e, data) {
  mousePos = getMousePos(canvas, e);
  var flagX = false;
  var flagY = false;
  // Sticking to horizont and vertical
  if (Math.abs(mousePos.x - mouseOldPos.x) <= stickPixels) {
    mousePos.x = mouseOldPos.x;
    flagX = true;
  }
  if (Math.abs(mousePos.y - mouseOldPos.y) <= stickPixels) {
    mousePos.y = mouseOldPos.y;
    flagY = true;
  }
  // Sticking to other points
  var elements = JSON.parse(data);
  for (item of elements.values()) {
    if (Math.abs(mousePos.x - item.fields.x0) <= stickPixels) {
      mousePos.x = item.fields.x0;
      flagX = true;
    } else if (Math.abs(mousePos.x - item.fields.x1) <= stickPixels) {
      mousePos.x = item.fields.x1;
      flagX = true;
    }
    if (Math.abs(mousePos.y - item.fields.y0) <= stickPixels) {
      mousePos.y = item.fields.y0;
      flagY = true;
    } else if (Math.abs(mousePos.y - item.fields.y1) <= stickPixels) {
      mousePos.y = item.fields.y1;
      flagY = true;
    }
  }
  // draw guidelines
  if (flagX || flagY) {
    ctx.lineWidth = guideLineWidth;
    ctx.setLineDash([10, 5]);
    ctx.lineWidth = 1;
    if (flagX) {
      ctx.beginPath();
      ctx.moveTo(mousePos.x, 0);
      ctx.lineTo(mousePos.x, canvas.height);
      ctx.stroke();
    }
    if (flagY) {
      ctx.beginPath();
      ctx.moveTo(0, mousePos.y);
      ctx.lineTo(canvas.width, mousePos.y);
      ctx.stroke();
    }
    ctx.setLineDash([0, 0]);
  }
}

// Circling
function circling () {

}