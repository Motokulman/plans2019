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
var canvasDiv = document.getElementById("canvas_form");
var editDiv = document.getElementById("edit-field");
// var topEditField = document.getElementById("top-edit-field");
var leftEditField = document.getElementById("left-edit-field");
// var rightEditField = document.getElementById("right-edit-field");
var bottomEditField = document.getElementById("bottom-edit-field");
var canvasPaddingTop = canvasDiv.getBoundingClientRect().top - editDiv.getBoundingClientRect().top;
var canvasPaddingLeft = canvasDiv.getBoundingClientRect().left - editDiv.getBoundingClientRect().left;
var yShift = canvas.height + 20 - canvasPaddingTop; // canvas.height + bootstrap paddings - canvas.style.top
var data = {};
var dataPlan = {};
var url;
// settings for size inputs
var sizeInputWidth = 60;
var sizeInputHeight = 20;
var sizeOld; // for detecting if the size in input field was really changed instead blind sending to server


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
      //raise event when the reqiest recieved and we can draw existed elements
      document.dispatchEvent(getElementsEvent);
      // add an input fields
      $(".SizeInput").remove();
      //var i = 0;
      let xAxisesSet = new Set(); // use Set for storing unique sizes only
      let yAxisesSet = new Set();  
      for (item of existedElements.values()) {
        xAxisesSet.add(item.fields.x0);
        xAxisesSet.add(item.fields.x1);
        yAxisesSet.add(item.fields.y0);
        yAxisesSet.add(item.fields.y1);
      }
      //transform sets to arrays for sorting
      var xAxisesArray = Array.from(xAxisesSet);
      var yAxisesArray = Array.from(yAxisesSet);
      //sorting arrays
      //first, function for comparing
      function compareNumeric(a, b) {
        if (a > b) return 1;
        if (a < b) return -1;
      }
      // now sort
      yAxisesArray.sort(compareNumeric);
      xAxisesArray.sort(compareNumeric);

      addInputFieldsBetweenAxisesY(yAxisesArray);
      addInputFieldsBetweenAxisesX(xAxisesArray);
    },
    error: function () {
      console.log("Getting stored elements error");
    }
  });
}



function addSizeInput(top, left, inputField, id, size) {
  var elem = document.createElement("input");
  var topStr = String(top) + "px";
  var leftStr = String(left) + "px";
  elem.id = id;
  elem.className = "SizeInput";
  elem.type = "number";
  elem.min = 0;
  elem.max = 90000;
  elem.pattern = "[0-9]{0,5}";
  elem.inputmode = "numeric";
  elem.maxLength = 5;
  elem.value = size;
  //console.log("id = ", id);
  elem.style.top = topStr;
  elem.style.left = leftStr;
  elem.style.position = "relative";
  elem.style.width = String(sizeInputWidth) + "px";
  elem.style.height = String(sizeInputHeight) + "px";
  elem.style.webkitAppearance = none;
  inputField.appendChild(elem);
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
      dataPlan = {};
      dataPlan.plan = plan_id;
      dataPlan["csrfmiddlewaretoken"] = csrf_token;
      if (paddingX == null) { // if after first attempt to change paddingX/Y it still null
        url = '/catalog/set_plan_paddingX/';
        dataPlan.paddingX = paddingX;
        ajaxPostPlan(dataPlan, url, "repeat first paddingX");
      }
      if (paddingY == null) {
        url = '/catalog/set_plan_paddingY/';
        dataPlan.paddingY = paddingY;
        ajaxPostPlan(dataPlan, url, "repeat first paddingY");
      }
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
  if ((plan[0].fields.paddingX != null) && (plan[0].fields.paddingY != null)) {
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
      data = {};
      dataPlan = {};
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
        ajaxPostPlan(dataPlan, url, "first paddingX");

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
        data.x2 = Math.abs(Math.round((data.x1 - data.x0) / 2)) + Math.min(data.x1, data.x0);
        data.y2 = Math.abs(Math.round((data.y1 - data.y0) / 2)) + Math.min(data.y1, data.y0);
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
    cache: false,
    async: false,
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
    cache: false,
    async: false,
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
//  console.log("canvasDiv = ", canvasDiv.getBoundingClientRect().top);//getBoundingClientRect()
  //console.log(canvasPaddingLeft);
  //addSizeInput(-500, 10);
});


// adding input fields between Y axises
function addInputFieldsBetweenAxisesY(yAxisesArray) {
  for (var i = 1; i < yAxisesArray.length; i++) {
    var size = yAxisesArray[i] - yAxisesArray[i - 1];
    addSizeInput(paddingY + yAxisesArray[i - 1] + size / 2 - sizeInputHeight / 2 - (i - 1) * (sizeInputHeight + 4), 10, leftEditField, "left" + String(i - 1), size);  // Y between
    //set the event listener for changing size
    var currentInput = document.getElementById("left" + String(i - 1));
    currentInput.addEventListener("focus", function (e) {
      sizeOld = this.value;
    });
    currentInput.addEventListener("blur", function (e) {
      if ((this.value <= 0) || (this.value > 99999)) { // введено не число
        this.focus(); //Введено неправильное значение ... и вернуть фокус обратно 
      } else if (sizeOld != this.value) { // if size was really changed
        var delta = this.value - sizeOld;
        // find current field's id
        if (this.id.includes("left")) { // if this left inputs with y sizes between axises
          var fieldPos = this.id.substr(4); // cut the "left" word and get position of this field
          var startValue = yAxisesArray[++fieldPos];
          var data = {};

          for (var i = 0; i < existedElements.length; i++) {
            data.pk = existedElements[i].pk;
            data["csrfmiddlewaretoken"] = csrf_token;
            data.y0 = existedElements[i].fields.y0;
            data.y1 = existedElements[i].fields.y1;
            data.y2 = existedElements[i].fields.y2;
            var flag = false;
            if (existedElements[i].fields.y0 >= startValue) {
              data.y0 = existedElements[i].fields.y0 + delta;
              flag = true;
            }
            if (existedElements[i].fields.y1 >= startValue) {
              data.y1 = existedElements[i].fields.y1 + delta;
              flag = true;
            }
            if (flag) {
              var url = '/catalog/set_element_y/';
              ajaxPostElement(data, url, "change y coords aftes size changing");

            }
          }
        }
      }
    });
  }
}

// adding input fields between X axises
function addInputFieldsBetweenAxisesX(xAxisesArray) {
  for (var i = 1; i < xAxisesArray.length; i++) {
    var size = xAxisesArray[i] - xAxisesArray[i - 1];
    addSizeInput(10, paddingX + xAxisesArray[i - 1] + size / 2 - sizeInputWidth / 2 - (i - 1) * (sizeInputWidth + 4), bottomEditField, "bottom" + String(i - 1), size);  // X between
    //set the event listener for changing size
    var currentInput = document.getElementById("bottom" + String(i - 1));
    currentInput.addEventListener("focus", function (e) {
      sizeOld = this.value;
    });
    currentInput.addEventListener("blur", function (e) {
      if ((this.value <= 0) || (this.value > 99999)) { // введено не число
        this.focus(); //Введено неправильное значение ... и вернуть фокус обратно 
      } else if (sizeOld != this.value) { // if size was really changed
        var delta = this.value - sizeOld;
        // find current field's id
        if (this.id.includes("bottom")) { // if this bottom inputs with y sizes between axises
          var fieldPos = this.id.substr(6); // cut the "bottom" word and get position of this field
          var startValue = xAxisesArray[++fieldPos];
          var data = {};

          for (var i = 0; i < existedElements.length; i++) {
            data.pk = existedElements[i].pk;
            data["csrfmiddlewaretoken"] = csrf_token;
            data.x0 = existedElements[i].fields.x0;
            data.x1 = existedElements[i].fields.x1;
            data.x2 = existedElements[i].fields.x2;
            var flag = false;
            if (existedElements[i].fields.x0 >= startValue) {
              data.x0 = existedElements[i].fields.x0 + delta;
              flag = true;
            }
            if (existedElements[i].fields.x1 >= startValue) {
              data.x1 = existedElements[i].fields.x1 + delta;
              flag = true;
            }
            if (flag) {
              var url = '/catalog/set_element_x/';
              ajaxPostElement(data, url, "change x coords aftes size changing");

            }
          }
        }
      }
    });
  }
}