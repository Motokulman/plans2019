var ctx = canvas.getContext('2d');
var running = false;
var mouseOldPos;
var mousePos;
var existedElements;
var plan;
var getElementsEvent = new Event('getElements'); // event when ajax returns data
//var getPlanEvent = new Event('getPlan'); // event when ajax returns data
var elementLineWidth = 3;
var guideLineWidth = 1;
var selectedTool = "none";
var plan_id = document.getElementById('canvas_form').name;
var csrf_token = $('#canvas_form [name="csrfmiddlewaretoken"]').val();
var paddingX;
var paddingY;


ctx.lineCap = 'square';

// drawing existed elements. 
function drawExisted(data, paddingX, paddingY) {
  for (item of data.values()) {
    ctx.lineWidth = elementLineWidth;
    ctx.beginPath();
    ctx.moveTo(item.fields.x0 + paddingX, item.fields.y0 + paddingY);
    ctx.lineTo(item.fields.x1 + paddingX, item.fields.y1 + paddingY);
    ctx.stroke();
  }
}

// get existing elements from DB
function getElements() {
  var data = {};
  data.plan = plan_id;
  var url = '/catalog/get_elements/';
  $.ajax({
    url: url,
    type: 'GET',
    data: data,
    cache: true,
    success: function (data) {
      existedElements = JSON.parse(data);
      console.log("OK Getting stored elements");
      //console.log("data = ", data);
      //console.log("existedElements = ", existedElements);
      //raise event when the reqiest recieved and we can draw existed elements
      document.dispatchEvent(getElementsEvent);
    },
    error: function () {
      console.log("Getting stored elements error");
    }
  });
}

// get current plan info from DB - padding, scaling
function getPlan() {
  var data = {};
  var plan_id = document.getElementById('canvas_form').name;
  data.plan = plan_id;
  var url = '/catalog/get_plan/';
  $.ajax({
    url: url,
    type: 'GET',
    data: data,
    cache: true,
    success: function (data) {
      plan = JSON.parse(data);
      paddingX = plan[0].fields.paddingX;
      paddingY = plan[0].fields.paddingY;
      //   console.log("plan = ", plan);
      console.log("Getting plan Ok");
      //raise event when the reqiest recieved and we can draw existed elements
      //document.dispatchEvent(getPlanEvent);
    },
    error: function () {
      console.log("Getting plan error");
    }
  });
}

// getting existing elements when just open scheme
$(document).ready(function () {
  getPlan();
  getElements();
});

// draw existed elements when GET request returned saved elements
document.addEventListener('getElements', function (e) {
  if (plan[0].fields.paddingX != null) {
    drawExisted(existedElements, paddingX, paddingY);
  }
}, false);


// draw new line
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
    drawExisted(existedElements, paddingX, paddingY);
    elementLine.draw();
  } else if (selectedTool != "none") {
    clear();
    sticking(canvas, e, existedElements);
    drawExisted(existedElements, paddingX, paddingY);
  }
});

// clicking handler
canvas.addEventListener('click', function (e) {
  if (selectedTool == "wall") {
    if (!running) {
      mouseOldPos = mousePos;
      running = true;
    } else {
      var data = {};
      var dataPlan = {};
      var url;
      running = false;
      // if it's first line
      if (plan[0].fields.paddingX == null) {
        paddingX = Math.min(mousePos.x, mouseOldPos.x);
        paddingY = Math.min(mousePos.y, mouseOldPos.y);

        // post first coords
        if (mousePos.x > mouseOldPos.x) {
          data.x1 = mousePos.x - mouseOldPos.x;
          data.x0 = 0;
        } else {
          data.x0 = mouseOldPos.x - mousePos.x;
          data.x1 = 0;
        }
        if (mousePos.y > mouseOldPos.y) {
          data.y0 = 0;
          data.y1 = mousePos.y - mouseOldPos.y;
        } else {
          data.y1 = 0;
          data.y0 = mouseOldPos.y - mousePos.y;
        }

        data.x2 = Math.round(Math.abs(mousePos.x - mouseOldPos.x) / 2);
        data.y2 = Math.round(Math.abs(mousePos.y - mouseOldPos.y) / 2);
        data.plan = plan_id;
        data["csrfmiddlewaretoken"] = csrf_token;
        url = '/catalog/add_element/';
        ajaxPostElement(data, url, "first element");

        // post paddings into plan

        dataPlan.plan = plan_id;
        dataPlan["csrfmiddlewaretoken"] = csrf_token;
        url = '/catalog/set_plan_paddingY/';
        dataPlan.paddingY = paddingY;
        // console.log("dataPlan.paddingY = ", dataPlan.paddingY);
        ajaxPostPlan(dataPlan, url, "first paddingY");

        url = '/catalog/set_plan_paddingX/';
        dataPlan.paddingX = paddingX;
        // console.log("dataPlan.paddingX = ", dataPlan.paddingX);
        ajaxPostPlan(dataPlan, url, "first paddingX");

        // add input fields


      } else {
        // check if new line getting smaller paddings
        if (paddingX > Math.min(mousePos.x, mouseOldPos.x)) {
          // console.log("paddingX > Math.min(mousePos.x, mouseOldPos.x)");
          var delta = paddingX - Math.min(mousePos.x, mouseOldPos.x);
          paddingX = Math.min(mousePos.x, mouseOldPos.x);
          // var dataArray = {
          //   csrfmiddlewaretoken: csrf_token,
          //   fields: [
          //   ]

          // };
          data["csrfmiddlewaretoken"] = csrf_token;
          var url = '/catalog/set_element_x/';
          for (var i = 0; i < existedElements.length; i++) {
            data.pk = existedElements[i].pk;
            data.x0 = existedElements[i].fields.x0 + delta;
            data.x1 = existedElements[i].fields.x1 + delta;
            data.x2 = existedElements[i].fields.x2 + delta;
            // console.log("data = ", data);
            ajaxPostElement(data, url, "change x coords");
          }

          dataPlan.plan = plan_id;
          dataPlan["csrfmiddlewaretoken"] = csrf_token;
          var url = '/catalog/set_plan_paddingX/';
          dataPlan.paddingX = paddingX;
          ajaxPostPlan(dataPlan, url, "set new paddingX");
        }
        if (paddingY > Math.min(mousePos.y, mouseOldPos.y)) {
          var delta = paddingY - Math.min(mousePos.y, mouseOldPos.y);
          paddingY = Math.min(mousePos.y, mouseOldPos.y);

          data["csrfmiddlewaretoken"] = csrf_token;
          var url = '/catalog/set_element_y/';
          for (var i = 0; i < existedElements.length; i++) {
            data.pk = existedElements[i].pk;
            data.y0 = existedElements[i].fields.y0 + delta;
            data.y1 = existedElements[i].fields.y1 + delta;
            data.y2 = existedElements[i].fields.y2 + delta;
            // console.log("data = ", data);
            ajaxPostElement(data, url, "change y coords");
          }

          dataPlan.plan = plan_id;
          dataPlan["csrfmiddlewaretoken"] = csrf_token;
          var url = '/catalog/set_plan_paddingY/';
          dataPlan.paddingY = paddingY;
          ajaxPostPlan(dataPlan, url, "set new paddingY");
        }

        data.x0 = mouseOldPos.x - paddingX;
        data.y0 = mouseOldPos.y - paddingY;
        data.x1 = mousePos.x - paddingX;
        data.y1 = mousePos.y - paddingY;
        data.x2 = Math.abs(Math.round((data.x1 - data.x0) / 2));
        data.y2 = Math.abs(Math.round((data.y1 - data.y0) / 2));
        data.plan = plan_id;
        data["csrfmiddlewaretoken"] = csrf_token;
        var url = '/catalog/add_element/';
        ajaxPostElement(data, url, "add new element");

      }



    }
  }
});

function ajaxPostPlan(data, url, message) {
  $.ajax({
    url: url,
    type: 'POST',
    data: data,
    cache: true,
    success: function (data) {
      console.log("POST OK: ", message);
      getPlan();
    },
    error: function () {
      console.log("POST error: ", message);
    }
  });
}

function ajaxPostElement(data, url, message) {
  $.ajax({
    url: url,
    type: 'POST',
    data: data,
    cache: true,
    success: function (data) {
      console.log("POST OK: ", message);
      getElements();
    },
    error: function () {
      console.log("POST error: ", message);
    }
  });
}


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
  // var flagCX = false;
  // var flagCY = false;
  // Sticking to horizont and vertical
  if (running) {
    if (Math.abs(mousePos.x - mouseOldPos.x) <= stickPixels) {
      mousePos.x = mouseOldPos.x;
      flagX = true;
    }
    if (Math.abs(mousePos.y - mouseOldPos.y) <= stickPixels) {
      mousePos.y = mouseOldPos.y;
      flagY = true;
    }
  }
  // Sticking to other points
  for (item of existedElements.values()) {
    if (Math.abs(mousePos.x - item.fields.x0 - paddingX) <= stickPixels) {
      mousePos.x = item.fields.x0 + paddingX;
      flagX = true;
    } else if (Math.abs(mousePos.x - item.fields.x1 - paddingX) <= stickPixels) {
      mousePos.x = item.fields.x1 + paddingX;
      flagX = true;
    }
    if (Math.abs(mousePos.y - item.fields.y0 - paddingY) <= stickPixels) {
      mousePos.y = item.fields.y0 + paddingY;
      flagY = true;
    } else if (Math.abs(mousePos.y - item.fields.y1 - paddingY) <= stickPixels) {
      mousePos.y = item.fields.y1 + paddingY;
      flagY = true;
    }
    //is it center
    // if ((Math.abs(mousePos.x - item.fields.x2) <= stickPixels) && (item.fields.x2 != item.fields.x0)) {
    //   mousePos.x = item.fields.x2;
    //   flagCX = true;
    // }
    // if ((Math.abs(mousePos.y - item.fields.y2) <= stickPixels) && (item.fields.y2 != item.fields.y0)) {
    //   mousePos.y = item.fields.y2;
    //   flagCY = true;
    // }
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


// Handling selected tool
$('#selector button').click(function () {
  $(this).addClass('active').siblings().removeClass('active');
  selectedTool = this.id;
  // if (this.id == "wall") {
  //   selectedTool = "wall";
  // } else if (this.id == "none") {
  //   selectedTool = "none";
  // }
});

$('#add').click(function () {
  addSizeInput (-500, 10);
}); 

function addSizeInput (t, l) {
  var articleDiv = document.getElementsByClassName("edit-field");
  var elem = document.createElement("input");
  var a = String(t) + "px";
  var b = String(l) + "px";
  elem.id = "0";
  elem.type  = "number";
  elem.min  = 0;
  elem.max  = 90000;
  elem.pattern  = "[0-9]{0,5}";
  elem.inputmode  = "numeric";
  elem.maxLength = 5;
  elem.value = 0;
  elem.style.top = a;
  elem.style.left = b;
  elem.style.position = "relative";
  elem.style.width = "60px";
  elem.style.height = "20px";
  articleDiv[0].appendChild(elem);
}