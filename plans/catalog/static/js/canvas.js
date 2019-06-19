var ctx = canvas.getContext('2d');
var running = false;
var roundedWallSetStage = 0;
var mouseOldPos0;
var mouseOldPos1;
var mousePos;
var existedElements;
var points;
var floors;
var plates;
var apertures;
var grillages;
var plateId;
var last_plate; // when draw new plate, first added new plate and then points of this plate. You need to know last added plate for adding points of this new plate
var plan;
var getElementsEvent = new Event('getElements'); // event when ajax returns data
var getFloorsEvent = new Event('getFloors');
var getPlatesEvent = new Event('getPlates');
var getPointsEvent = new Event('getPoints');
var getGrillagesEvent = new Event('getGrillages');
var getAperturesEvent = new Event('getApertures');
var elementLineWidth = 3;
var guideLineWidth = 1;
var selectedTool = "none";
var underMousePoint;
var selectedElement;
var plan_id = document.getElementById('canvas_form').name;
var csrf_token = $('#canvas_form [name="csrfmiddlewaretoken"]').val();
var paddingX;
var paddingY;
var canvasDiv = document.getElementById("canvas_form");
var editDiv = document.getElementById("edit-field");
// var topEditField = document.getElementById("top-edit-field");
var leftEditField = document.getElementById("left-edit-field");
var floorEditField = document.getElementById("floor_form");
var plateEditField = document.getElementById("plates_form");
// var rightEditField = document.getElementById("right-edit-field");
var bottomEditField = document.getElementById("bottom-edit-field");
var canvasPaddingTop = canvasDiv.getBoundingClientRect().top - editDiv.getBoundingClientRect().top;
var canvasPaddingLeft = canvasDiv.getBoundingClientRect().left - editDiv.getBoundingClientRect().left;
var yShift = canvas.height + 20 - canvasPaddingTop; // canvas.height + bootstrap paddings - canvas.style.top
var data = {};
var dataPlan = {};
var url;
var wallType = "a_type";
var floorId;
var mousePosArray = [];
var allPlatesPointsArray = [];

// settings for size inputs
var sizeInputWidth = 60;
var sizeInputHeight = 20;
var sizeOld; // for detecting if the size in input field was really changed instead blind sending to server
var typeOld;
var colorMap = new Map([["universal", "#90EE90"], ["by_soil", "#2F4F4F"], ["wood", "#BDB76B"], ["hanging_monolith", "#FF4500"], ["hollow_plates", "#FF00FF"]]);
var color;
var plateType;
var stickPixels = 3;


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
  // console.log("allPlatesDraw = ");
  allPlatesDraw();

}

function getPoints() {
  var data = {};
  data.plan = plan_id;
  var url = '/catalog/get_points/';
  $.ajax({
    url: url,
    type: 'GET',
    data: data,
    cache: true,
    async: false,
    success: function (data) {
      points = JSON.parse(data);
      underMousePoint = points[points.length - 1];
      // console.log("underMousePoint = points[points.length - 1]: ", underMousePoint);
      console.log("OK Getting stored points: ", points);
      //raise event when the reqiest recieved and we can draw existed elements
      document.dispatchEvent(getPointsEvent);
      // add an input fields
      $(".SizeInput").remove();
      let xAxisesSet = new Set(); // use Set for storing unique sizes only
      let yAxisesSet = new Set();
      for (item of points.values()) {
        xAxisesSet.add(item.fields.x);
        yAxisesSet.add(item.fields.y);
        //   console.log("item = ", item);
        //    console.log("twoPointsDist = ", twoPointsDist(item.fields.x0, item.fields.y0, item.fields.x1, item.fields.y1)); 
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
      console.log("Getting stored points error");
    }
  });
}

// get existing elements from DB
function getElements() {
  // var data = {};
  // data.plan = plan_id;
  // var url = '/catalog/get_elements/';
  // $.ajax({
  //   url: url,
  //   type: 'GET',
  //   data: data,
  //   cache: true,
  //   success: function (data) {
  //     existedElements = JSON.parse(data);
  //     console.log("OK Getting stored elements");

  //     //raise event when the reqiest recieved and we can draw existed elements
  //     document.dispatchEvent(getElementsEvent);
  //     // add an input fields
  //     $(".SizeInput").remove();
  //     //var i = 0;
  //     let xAxisesSet = new Set(); // use Set for storing unique sizes only
  //     let yAxisesSet = new Set();
  //     for (item of existedElements.values()) {
  //       xAxisesSet.add(item.fields.x0);
  //       xAxisesSet.add(item.fields.x1);
  //       yAxisesSet.add(item.fields.y0);
  //       yAxisesSet.add(item.fields.y1);
  //       //   console.log("item = ", item);
  //       //    console.log("twoPointsDist = ", twoPointsDist(item.fields.x0, item.fields.y0, item.fields.x1, item.fields.y1)); 
  //     }
  //     //transform sets to arrays for sorting
  //     var xAxisesArray = Array.from(xAxisesSet);
  //     var yAxisesArray = Array.from(yAxisesSet);
  //     //sorting arrays
  //     //first, function for comparing
  //     function compareNumeric(a, b) {
  //       if (a > b) return 1;
  //       if (a < b) return -1;
  //     }
  //     // now sort
  //     yAxisesArray.sort(compareNumeric);
  //     xAxisesArray.sort(compareNumeric);

  //     addInputFieldsBetweenAxisesY(yAxisesArray);
  //     addInputFieldsBetweenAxisesX(xAxisesArray);
  //   },
  //   error: function () {
  //     console.log("Getting stored elements error");
  //   }
  // });
}

// get existed grillages of this plan from DB
function getGrillages() {
  var data = {};
  data.plan = plan_id;
  var url = '/catalog/get_grillages/';
  $.ajax({
    url: url,
    type: 'GET',
    data: data,
    cache: true,
    async: false,
    success: function (data) {
      grillages = JSON.parse(data);
      console.log("OK Getting grillages");
      console.log("grillages = ", grillages);
      document.dispatchEvent(getGrillagesEvent);//raise event when the reqiest recieved and we can draw existed elements 
      drawGrillages();
    },
    error: function () {
      console.log("Getting grillages error");
    }
  });
}

// get existed floors of this plan from DB
function getApertures() {
  var data = {};
  data.plan = plan_id;
  var url = '/catalog/get_apertures/';
  $.ajax({
    url: url,
    type: 'GET',
    data: data,
    cache: true,
    success: function (data) {
      apertures = JSON.parse(data);
      console.log("OK Getting stored apertures");
      console.log("apertures = ", apertures);
      document.dispatchEvent(getAperturesEvent);//raise event when the reqiest recieved and we can draw existed elements 
    },
    error: function () {
      console.log("Getting stored apertures error");
    }
  });
}

// get existed floors of this plan from DB
function getFloors() {
  var data = {};
  data.plan = plan_id;
  var url = '/catalog/get_floors/';
  $.ajax({
    url: url,
    type: 'GET',
    data: data,
    cache: true,
    success: function (data) {
      floors = JSON.parse(data);
      // console.log("OK Getting stored floors");
      // console.log("floors = ", floors);
      document.dispatchEvent(getFloorsEvent);//raise event when the reqiest recieved and we can draw existed elements 
    },
    error: function () {
      console.log("Getting stored elements error");
    }
  });
}

// get existed plates from DB
function getPlates() {
  var data = {};
  data.plan = plan_id;
  var url = '/catalog/get_plates/';
  $.ajax({
    url: url,
    type: 'GET',
    data: data,
    cache: true,
    success: function (data) {
      plates = JSON.parse(data);
      console.log("OK Getting stored plates: ", plates);
      //raise event when the reqiest recieved and we can draw existed elements
      document.dispatchEvent(getPlatesEvent);
    },
    error: function () {
      console.log("Getting stored plates error");
    }
  });
}
// get existed plate's points from DB from just one plate
function getPlatePoints(plateId) {
  var data = {};
  data.plate = plateId;
  var url = '/catalog/get_plate_points/';
  console.log("plateId = ", plateId);
  $.ajax({
    url: url,
    type: 'GET',
    data: data,
    cache: true,
    success: function (data) {
      allPlatesPointsArray.push(JSON.parse(data));
      // console.log("allPlatesPointsArray[i] = ", allPlatesPointsArray.length);
      //polygon.draw(JSON.parse(data), color);
      console.log("OK Getting stored plate's points: ", JSON.parse(data));
      //  console.log("allPlatesPointsArray: ", allPlatesPointsArray);
      //raise event when the reqiest recieved and we can draw existed elements
      //document.dispatchEvent(getPlatePointsEvent);
      allPlatesDraw();
    },
    error: function () {
      console.log("Getting stored plate's points error");
    }
  });
}

function allPlatesDraw() {
  //console.log("allPlatesPointsArray[i] = ", allPlatesPointsArray.length);
  for (var i = 0; i < allPlatesPointsArray.length; i++) {

    //color = allPlatesPointsArray[i].type;
    console.log("color = ", allPlatesPointsArray);
    polygon.draw(allPlatesPointsArray[i], color);
  }
}

function aperturesDraw() {
  var x;
  var y;
  for (var i = 0; i < apertures.length; i++) {
    for (var j = 0; j < existedElements.length; j++) {

      if (apertures[i].fields.element == existedElements[j].pk) {
        // console.log("совпало = ", existedElements[j].pk);
        // console.log("existedElements[j].fields.x0 = ", existedElements[j].fields.x0);

        x = paddingX + Math.min(existedElements[j].fields.x0, existedElements[j].fields.x1) + Math.abs(existedElements[j].fields.x0 - existedElements[j].fields.x1) * apertures[i].fields.center;
        y = paddingY + Math.min(existedElements[j].fields.y0, existedElements[j].fields.y1) + Math.abs(existedElements[j].fields.y0 - existedElements[j].fields.y1) * apertures[i].fields.center;
        if (apertures[i].fields.filling == "empty") {
          aperture.draw_empty(x, y);
        } else if (apertures[i].fields.filling == "window") {
          aperture.draw_window(x, y);
        } else if (apertures[i].fields.filling == "door") {
          aperture.draw_door(x, y);
        } else if (apertures[i].fields.filling == "combined") {
          aperture.draw_combined(x, y);
        }
      }
    }
  }
};
//console.log("apertures[i].fields = ", apertures[i].fields);

// for (var i = 0; i < existedElements.length; i++) {
//   data.pk = existedElements[i].pk;
//   data.x0 = existedElements[i].fields.x0 + delta;
//   data.x1 = existedElements[i].fields.x1 + delta;



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
    async: false,
    success: function (data) {
      plan = JSON.parse(data);
      paddingX = plan[0].fields.paddingX;
      paddingY = plan[0].fields.paddingY;
      console.log("paddingX = ", paddingX);
      console.log("paddingY = ", paddingY);
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
  getPoints();
  getGrillages();
  // getElements();
  getFloors();
  getPlates();
  defineSelectedPlateType();
  getApertures();
});

// draw existed elements when GET request returned saved elements
document.addEventListener('getElements', function (e) {
  console.log("floors.length = ");
  if ((plan[0].fields.paddingX != null) && (plan[0].fields.paddingY != null)) {
    drawExisted(existedElements, paddingX, paddingY);
  }
}, false);

document.addEventListener('getFloors', function (e) {
  if (floors.length == 0) {
    //console.log("floors.length 1= ");
    // if it new empty plan, create level's presets
    addFloor("Первый этаж", 3000, 0, 0, 0);
    addFloor("Второй этаж", 3000, 0, 1, 0);
    addFloor("Третий этаж", 3000, 0, 2, 0);
    addFloor("Цоколь", 2000, 0, -1, 0);
    addFloor("Гараж", 2500, 1, 0, -900);

  }
}, false);


document.addEventListener('getPlates', function (e) {
  if (plates.length != 0) {
    last_plate = plates[plates.length - 1];
    for (var i = 0; i < mousePosArray.length; i++) { // if the new plate was added and we have an array of plate's points, let's add it
      data = {};
      data.plate = last_plate.pk;
      data.x = mousePosArray[i].x;
      data.y = mousePosArray[i].y;
      data["csrfmiddlewaretoken"] = csrf_token;
      var url = '/catalog/add_plate_point/';
      ajaxPostPlatePoint(data, url, "add new plate point");
    }
    mousePosArray = [];

    for (var i = 0; i < plates.length; i++) {
      //  console.log("plates[i].id= ", plates[i].pk);
      getPlatePoints(plates[i].pk);
    }

  }

}, false);

function addFloor(title, height, batch, order, levelFromGroundFloor) {
  //console.log("floors.length = ", floors.length);
  var data = {};
  data.plan = plan_id;
  data.title = title;
  data.height = height;
  data.batch = batch;
  data.order = order;
  data.levelFromGroundFloor = levelFromGroundFloor;
  data["csrfmiddlewaretoken"] = csrf_token;
  var url = '/catalog/add_floor/';
  //console.log("data = ", data);
  ajaxPostFloor(data, url, title + " floor preset");
}

// draw new line
var elementLine = {
  draw: function () {
    ctx.beginPath();
    ctx.moveTo(mouseOldPos0.x, mouseOldPos0.y);
    ctx.lineTo(mousePos.x, mousePos.y);
    ctx.stroke();
  }
};

// draw point
var point = {
  draw: function (x, y, r, c) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, 2 * Math.PI);
    ctx.fillStyle = c;// "#333333";
    ctx.fill();
    ctx.closePath();
  }
};

// draw apertures

var aperture = {
  draw_empty: function (x, y) {
    var h = 10;
    ctx.strokeRect(x - h / 2, y - h / 2, h, h);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x - h / 2, y - h / 2, h, h);
  },

  draw_window: function (x, y) {
    var h = 10;
    ctx.strokeRect(x - h / 2, y - h / 2, h, h);
    ctx.fillStyle = "#0000ff";
    ctx.fillRect(x - h / 2, y - h / 2, h, h);
  },

  draw_door: function (x, y) {
    var h = 10;
    ctx.strokeRect(x - h / 2, y - h / 2, h, h);
    ctx.fillStyle = "#333333";
    ctx.fillRect(x - h / 2, y - h / 2, h, h);
  },

  draw_combined: function (x, y) {
    var h = 10;
    ctx.strokeRect(x - h / 2, y - h / 2, h, h);
    ctx.fillStyle = "#ffff00";
    ctx.fillRect(x - h / 2, y - h / 2, h, h);
  }
};

// draw polygon
var polygon = {
  draw: function (arr) {
    var c;
    for (var i = 0; i < plates.length; i++) {
      if (arr[0].fields.plate == plates[i].pk) {
        c = colorMap.get(plates[i].fields.plateType);
      }
    }
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(arr[0].fields.x, arr[0].fields.y);

    for (var i = 1; i < arr.length; i++) {
      ctx.lineTo(arr[i].fields.x, arr[i].fields.y);
      console.log("arr[i].fields.x = ", arr[i].fields.x);
      ctx.stroke();
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

  }
};


// draw new circle
var circleLine = {
  draw: function () {
    var xc = (Math.max(mouseOldPos1.x, mouseOldPos0.x) - Math.min(mouseOldPos1.x, mouseOldPos0.x)) / 2 + Math.min(mouseOldPos1.x, mouseOldPos0.x);
    var yc = (Math.max(mouseOldPos1.y, mouseOldPos0.y) - Math.min(mouseOldPos1.y, mouseOldPos0.y)) / 2 + Math.min(mouseOldPos1.y, mouseOldPos0.y);
    var a = mouseOldPos1.x - mouseOldPos0.x;
    var z = mouseOldPos1.y - mouseOldPos0.y;
    var k = - a / z;
    var b = yc - k * xc;
    var yh = k * mousePos.x + b;
    ctx.beginPath();
    ctx.moveTo(xc, yc);
    ctx.lineTo(mousePos.x, yh);
    ctx.stroke();
  }
};

function clear() {
  ctx.fillStyle = 'rgba(255, 255, 255, 1)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

//////////////////////////////////////////////////////////////  MOUSE MOVE //////////////////////
canvas.addEventListener('mousemove', function (e) {
  mousePos = getMousePos(canvas, e);
  if (selectedTool == "foundation") {
    clear();
    drawGrillages();
    //sticking(canvas, e, existedElements);
    underMousePoint = defUnderMousePoint();
    // if (underMousePoint) {
    //   console.log("underMousePoint = ", underMousePoint);
    //   point.draw(underMousePoint.fields.x + paddingX, underMousePoint.fields.y + paddingY, 5, "234223");
    // }
    //console.log("mousePos.x =", mousePos.x);

    // if (running) {
    //   clear();
    //   sticking(canvas, e, existedElements);
    //   drawExisted(existedElements, paddingX, paddingY);
    //   elementLine.draw();
    // } else {
    //   clear();
    //   sticking(canvas, e, existedElements);
    //   drawExisted(existedElements, paddingX, paddingY);
    // }
  }


  if (selectedTool == "wall") {
    if (running) {
      clear();
      sticking(canvas, e, existedElements);
      drawExisted(existedElements, paddingX, paddingY);
      elementLine.draw();
    } else {
      clear();
      sticking(canvas, e, existedElements);
      drawExisted(existedElements, paddingX, paddingY);
    }
  }
  if (selectedTool == "rounded_wall") {
    if (roundedWallSetStage == 1) {
      clear();
      sticking(canvas, e, existedElements);
      drawExisted(existedElements, paddingX, paddingY);
      elementLine.draw();
    } else if (roundedWallSetStage == 2) {
      clear();
      sticking(canvas, e, existedElements);
      drawExisted(existedElements, paddingX, paddingY);
      circleLine.draw();
    } else {
      clear();
      sticking(canvas, e, existedElements);
      drawExisted(existedElements, paddingX, paddingY);
    }
  }
  if (selectedTool == "plate") {
    clear();
    sticking(canvas, e, existedElements);
    drawExisted(existedElements, paddingX, paddingY);
    for (var i = 0; i < mousePosArray.length; i++) {
      point.draw(mousePosArray[i].x, mousePosArray[i].y, 5, color);
    }
  }
  if (selectedTool == "aperture") {
    clear();
    sticking(canvas, e, existedElements);
    drawExisted(existedElements, paddingX, paddingY);
    aperturesDraw();
    //console.log("aperture");
    var a = defUnderMouseElement();
    if (a) {
      //console.log("a = ", a);
      point.draw(mousePos.x, mousePos.y, 5, "#2F4F4F");
    }
  }


});

//////////////////////////////////////////////////////////////  MOUSE CLICK //////////////////////
// clicking handler
canvas.addEventListener('click', function (e) {
  // if it first point
  if (points.length == 0) {
    // post paddings into plan
    paddingX = mousePos.x;
    paddingY = mousePos.y;
    dataPlan = {};
    dataPlan.plan = plan_id;
    dataPlan["csrfmiddlewaretoken"] = csrf_token;
    url = '/catalog/set_plan_paddingY/';
    dataPlan.paddingY = paddingY;
    ajaxPostPlan(dataPlan, url, "first paddingY");
    url = '/catalog/set_plan_paddingX/';
    dataPlan.paddingX = paddingX;
    ajaxPostPlan(dataPlan, url, "first paddingX");
  }

  if (!underMousePoint) {
    var dataNewPoint = {};
    dataNewPoint.plan = plan_id;
    dataNewPoint.x = mousePos.x - paddingX;
    dataNewPoint.y = mousePos.y - paddingY;
    dataNewPoint["csrfmiddlewaretoken"] = csrf_token;
    url = '/catalog/add_point/';
    ajaxPostPoint(dataNewPoint, url, "add point");
    defUnderMousePoint();
  }

  if (selectedTool == "foundation") {
    //   console.log("selectedTool == foundation ");
    if (grillageType == "pillar") {

      data = {};
      data.plan = plan_id;
      data.width = grillageWidth;
      data["csrfmiddlewaretoken"] = csrf_token;
      url = '/catalog/add_grillage/';

      if (underMousePoint) {
        data.point1 = underMousePoint.pk;
        data.point2 = underMousePoint.pk;
        console.log("data grillage = ", data);
        ajaxPostGrillage(data, url, "add grillage");
      } else {
        alert("Не записалась точка!");
      }

    }

  }


  if (selectedTool == "wall") {
    if (!running) {
      mouseOldPos0 = mousePos;
      running = true;
    } else {
      data = {};
      dataPlan = {};
      running = false;
      // if it's first line
      if (plan[0].fields.paddingX == null) {
        paddingX = Math.min(mousePos.x, mouseOldPos0.x);
        paddingY = Math.min(mousePos.y, mouseOldPos0.y);

        // post first coords
        if (mousePos.x > mouseOldPos0.x) {
          data.x1 = mousePos.x - mouseOldPos0.x;
          data.x0 = 0;
        } else {
          data.x0 = mouseOldPos0.x - mousePos.x;
          data.x1 = 0;
        }
        if (mousePos.y > mouseOldPos0.y) {
          data.y0 = 0;
          data.y1 = mousePos.y - mouseOldPos0.y;
        } else {
          data.y1 = 0;
          data.y0 = mouseOldPos0.y - mousePos.y;
        }

        data.plan = plan_id;
        data["csrfmiddlewaretoken"] = csrf_token;
        url = '/catalog/add_element/';
        data.wallType = wallType;
        ajaxPostElement(data, url, "first element");

        // post paddings into plan
        dataPlan.plan = plan_id;
        dataPlan["csrfmiddlewaretoken"] = csrf_token;
        url = '/catalog/set_plan_paddingY/';
        dataPlan.paddingY = paddingY;
        ajaxPostPlan(dataPlan, url, "first paddingY");
        url = '/catalog/set_plan_paddingX/';
        dataPlan.paddingX = paddingX;
        ajaxPostPlan(dataPlan, url, "first paddingX");
      } else {
        // check if new line getting smaller paddings
        if (paddingX > Math.min(mousePos.x, mouseOldPos0.x)) {
          var delta = paddingX - Math.min(mousePos.x, mouseOldPos0.x);
          paddingX = Math.min(mousePos.x, mouseOldPos0.x);
          data["csrfmiddlewaretoken"] = csrf_token;
          var url = '/catalog/set_element_x/';
          for (var i = 0; i < existedElements.length; i++) {
            data.pk = existedElements[i].pk;
            data.x0 = existedElements[i].fields.x0 + delta;
            data.x1 = existedElements[i].fields.x1 + delta;
            ajaxPostElement(data, url, "change x coords");
          }
          dataPlan.plan = plan_id;
          dataPlan["csrfmiddlewaretoken"] = csrf_token;
          var url = '/catalog/set_plan_paddingX/';
          dataPlan.paddingX = paddingX;
          ajaxPostPlan(dataPlan, url, "set new paddingX");
        }
        if (paddingY > Math.min(mousePos.y, mouseOldPos0.y)) {
          var delta = paddingY - Math.min(mousePos.y, mouseOldPos0.y);
          paddingY = Math.min(mousePos.y, mouseOldPos0.y);
          data["csrfmiddlewaretoken"] = csrf_token;
          var url = '/catalog/set_element_y/';
          for (var i = 0; i < existedElements.length; i++) {
            data.pk = existedElements[i].pk;
            data.y0 = existedElements[i].fields.y0 + delta;
            data.y1 = existedElements[i].fields.y1 + delta;
            ajaxPostElement(data, url, "change y coords");
          }
          dataPlan.plan = plan_id;
          dataPlan["csrfmiddlewaretoken"] = csrf_token;
          var url = '/catalog/set_plan_paddingY/';
          dataPlan.paddingY = paddingY;
          ajaxPostPlan(dataPlan, url, "set new paddingY");
        }
        data.x0 = mouseOldPos0.x - paddingX;
        data.y0 = mouseOldPos0.y - paddingY;
        data.x1 = mousePos.x - paddingX;
        data.y1 = mousePos.y - paddingY;
        data.wallType = wallType;
        data.plan = plan_id;
        data["csrfmiddlewaretoken"] = csrf_token;
        var url = '/catalog/add_element/';
        ajaxPostElement(data, url, "add new element");
      }



    }
  }

  if (selectedTool == "rounded_wall") {
    if (roundedWallSetStage == 0) {
      console.log("rounded_wall roundedWallSetStage == 0");
      mouseOldPos0 = mousePos;
      roundedWallSetStage = 1;
    } else if (roundedWallSetStage == 1) {
      console.log("rounded_wall roundedWallSetStage == 1");
      mouseOldPos1 = mousePos;
      console.log("mouseOldPos1 = ", mouseOldPos1);
      roundedWallSetStage = 2;
    } else {
      roundedWallSetStage = 0;
    }
  }

  if (selectedTool == "plate") {
    if ((mousePosArray.length != 0) && (mousePosArray[0].x == mousePos.x) && (mousePosArray[0].y == mousePos.y)) {
      {
        defineSelectedPlateType();
        data = {};
        data.plan = plan_id;
        data.title = "test plate title";
        data.floor = floorId;
        data.plateType = plateType;
        data["csrfmiddlewaretoken"] = csrf_token;
        var url = '/catalog/add_plate/';
        ajaxPostPlate(data, url, "add new plate");
      }
    } else if (mousePosArray.length == 0) {
      console.log("mousePosArray.length == ", mousePosArray.length);
      mousePosArray.push(mousePos);
      console.log("mousePosArray.length.push == ", mousePosArray.length);
    } else if ((mousePosArray[0].x != mousePos.x) || (mousePosArray[0].y != mousePos.y)) {
      console.log("(mousePosArray[0].x != mousePos.x) || (mousePosArray[0].y != mousePos.y) ");
      mousePosArray.push(mousePos);
    }
    color = colorMap.get(plateType);
    point.draw(mousePos.x, mousePos.y, 5, color);
  }

  if (selectedTool == "aperture") {

    selectedElement = defUnderMouseElement();
    // var elementData = {};


    if (selectedElement) {
      // console.log("selectedElement = ", selectedElement);
      point.draw(mousePos.x, mousePos.y, 5, "#2F4F4F");
      var modal = document.querySelector("#apertureModal");
      //console.log("modal = ", modal);
      $("#apertureModal").modal();
      var label_element = document.querySelector("#selected_element_id");
      label_element.setAttribute("value", selectedElement);
      //console.log("label_element = ", label_element);

    }
  }


  // for (item of existedElements.values()) {

  //   if (twoPointsDist(mousePos.x, mousePos.y, item.fields.x0, item.fields.y0, item.fields.x1, item.fields.y1)) {
  //     //  console.log("item = ", item);
  //     //    console.log("twoPointsDist = ", twoPointsDist(item.fields.x0, item.fields.y0, item.fields.x1, item.fields.y1)); 
  //     return item.pk;
  //   }
  // }



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

function ajaxPostFloor(data, url, message) {
  $.ajax({
    url: url,
    type: 'POST',
    data: data,
    cache: false,
    async: false,
    success: function (data) {
      getFloors();
      console.log("POST OK: ", message);

    },
    error: function () {
      console.log("POST error: ", message);
    }
  });
}


function ajaxPostPlate(data, url, message) {
  $.ajax({
    url: url,
    type: 'POST',
    data: data,
    cache: false,
    async: false,
    success: function (data) {
      getPlates();
      console.log("POST OK: ", message);

    },
    error: function () {
      console.log("POST error: ", message);
    }
  });
}

function ajaxPostPlatePoint(data, url, message) {
  $.ajax({
    url: url,
    type: 'POST',
    data: data,
    cache: false,
    async: false,
    success: function (data) {
      getPoints();
      console.log("POST OK: ", message);

    },
    error: function () {
      console.log("POST error: ", message);
    }
  });
}

function ajaxPostPoint(data, url, message) {
  $.ajax({
    url: url,
    type: 'POST',
    data: data,
    cache: false,
    async: false,
    success: function (data) {
      getPoints();
      console.log("POST OK: ", message);
    },
    error: function () {
      console.log("POST error: ", message);
    }
  });
}

function ajaxPostGrillage(data, url, message) {
  $.ajax({
    url: url,
    type: 'POST',
    data: data,
    cache: false,
    async: false,
    success: function (data) {
      console.log("POST OK: ", message);
    },
    error: function () {
      console.log("POST error: ", message);
    }
  });
}

function ajaxPostAperture(data, url, message) {
  $.ajax({
    url: url,
    type: 'POST',
    data: data,
    cache: false,
    async: false,
    success: function (data) {
      console.log("POST OK: ", message);
      getApertures();
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

function sticking(canvas, e, data) {
  mousePos = getMousePos(canvas, e);
  var flagX = false;
  var flagY = false;
  // Sticking to horizont and vertical
  if (running) {
    if (Math.abs(mousePos.x - mouseOldPos0.x) <= stickPixels) {
      mousePos.x = mouseOldPos0.x;
      flagX = true;
    }
    if (Math.abs(mousePos.y - mouseOldPos0.y) <= stickPixels) {
      mousePos.y = mouseOldPos0.y;
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
  if (selectedTool == "foundation") {
    defineSelectedGrillageType();
  }
});

wall_type_form.addEventListener('change', function (evt) {
  wallType = event.target.value;
})

plate_type_form.addEventListener('change', function (evt) {
  plateType = event.target.value;
})


grillage_width.addEventListener('change', function (evt) {
  grillageWidth = event.target.value;
  //  console.log("grillageWidth = ", grillageWidth)
})

grillage_form.addEventListener('change', function (evt) {
  grillageType = event.target.value;
  if (grillageType == "line") {
    grillageWidth = $("[name='grillage_width']")[0].value;
  }
  // console.log("grillageType = ", grillageType)
})

// floor_form.addEventListener('change', function (evt) {
//   console.log("event.target.value = ", event.target.value);
// })

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
    addSizeInput(10, paddingX + xAxisesArray[i - 1] + size / 2 - sizeInputWidth / 2 - (i - 1) * (sizeInputWidth + 4) + document.getElementById("left-edit-field").offsetWidth + 30, bottomEditField, "bottom" + String(i - 1), size);  // X between
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


function addFloorInput(inputField, item, id) {
  var selectFloorField = document.createElement("input");
  selectFloorField.id = "selectFloorField" + id;
  selectFloorField.name = "floor_type"
  selectFloorField.type = "radio";
  selectFloorField.className = "selectFloorField";
  if (id == 0) {
    selectFloorField.checked = true;
    floorId = 0;
    console.log("floorId =  ", floorId);
  }
  inputField.appendChild(selectFloorField);

  var titleFloorField = document.createElement("input");
  titleFloorField.id = "titleFloorField" + id;
  titleFloorField.className = "FloorTitleInput";
  titleFloorField.type = "text";
  titleFloorField.value = item.fields.title;
  inputField.appendChild(titleFloorField);

  var sizeFloorField = document.createElement("input");
  sizeFloorField.id = "sizeFloorField" + id;
  sizeFloorField.className = "FloorSizeInput";
  sizeFloorField.type = "number";
  sizeFloorField.min = 0;
  sizeFloorField.max = 10000;
  sizeFloorField.pattern = "[0-9]{0,5}";
  sizeFloorField.inputmode = "numeric";
  sizeFloorField.maxLength = 5;
  sizeFloorField.value = item.fields.height;
  inputField.appendChild(sizeFloorField);
}



// adding input fields for floors
function addFloorInputTable() {
  for (var i = 0; i < floors.length; i++) {
    addFloorInput(floorEditField, floors[i], i);
    //set the event listener for changing size
    var currentInput = document.getElementById("sizeFloorField" + String(i));
    currentInput.addEventListener("focus", function (e) {
      sizeOld = this.value;
    });
    currentInput.addEventListener("blur", function (e) {
      if ((this.value <= 0) || (this.value > 99999)) { // введено не число
        this.focus(); //Введено неправильное значение ... и вернуть фокус обратно 
      } else if (sizeOld != this.value) { // if size was really changed
        // find current field's id
        var data = {};
        var i = this.id.substr(14);
        console.log("floors[i].pk = ", floors[i]);
        data.pk = floors[i].pk;
        data["csrfmiddlewaretoken"] = csrf_token;
        data.title = floors[i].fields.title;
        data.height = this.value;
        var url = '/catalog/set_floor/';
        console.log("data height =  ", data);
        ajaxPostFloor(data, url, "change height of the floor " + floors[i].fields.title + " from " + floors[i].fields.height + " to " + this.value);
      }
    });
    //set the event listener for changing title
    currentInput = document.getElementById("titleFloorField" + String(i));
    currentInput.addEventListener("focus", function (e) {
      sizeOld = this.value;
    });
    currentInput.addEventListener("blur", function (e) {
      if (sizeOld != this.value) { // if size was really changed
        // find current field's id
        var data = {};
        var i = this.id.substr(15);

        data.pk = floors[i].pk;
        data["csrfmiddlewaretoken"] = csrf_token;
        data.height = floors[i].fields.height;
        data.title = this.value;
        var url = '/catalog/set_floor/';
        ajaxPostFloor(data, url, "change title of the floor from " + floors[i].fields.title + " to " + this.value);
      }
    });

    //set the event listener for radio choice
    currentInput = document.getElementById("selectFloorField" + String(i));
    currentInput.addEventListener("change", function (e) {
      floorId = this.id.substr(16);
    });
  }
}



document.addEventListener('getFloors', function (e) {
  floorInputFieldUpdate();
}, false);


document.addEventListener('getApertures', function (e) {
  console.log("getApertures event")
  aperturesDraw();
}, false);


$('#add').click(function () {

});

// submit aperture form
$('#aperture_form_submit').click(function () {
  var center;
  for (item of existedElements.values()) {
    if (item.pk == selectedElement) {
      center = (mousePos.x - Math.min(item.fields.x0, item.fields.x1) - paddingX) / Math.abs(item.fields.x0 - item.fields.x1);
      if (!center) {
        center = (mousePos.y - Math.min(item.fields.y0, item.fields.y1) - paddingY) / Math.abs(item.fields.y0 - item.fields.y1);
      }

      console.log("center = ", center);
    }
  }
  console.log("$('#selected_element_id').value = ", $('#selected_element_id').val());
  console.log("$('#aperture_fill').value = ", $('#aperture_fill').val());
  //$('#selected_element_id').value;

  var data = {};
  data["csrfmiddlewaretoken"] = csrf_token;
  data.plan = plan_id;
  data.element = selectedElement;
  data.filling = $('#aperture_fill').val();
  data.center = center;
  data.r = $('#aperture_radius').val();
  data.maxL = $('#aperture_maxL').val();
  data.maxH = $('#aperture_maxH').val();
  data.h = $('#aperture_h').val();
  data.l1 = $('#aperture_l1').val();
  data.l2 = $('#aperture_l2').val();
  data.ld = $('#aperture_ld').val();

  var url = '/catalog/add_aperture/';
  ajaxPostAperture(data, url, "add aperture")
  document.getElementById('aperture_form').reset();

});



function floorInputFieldUpdate() {
  $(".selectFloorField").remove();
  $(".FloorTitleInput").remove();
  $(".FloorSizeInput").remove();
  addFloorInputTable();
}

function defineSelectedPlateType() {
  for (var i = 0; i < $("[name='plate_type']").length; i++) {
    if ($("[name='plate_type']")[i].checked) {
      plateType = $("[name='plate_type']")[i].value;
    }
  }
}

// function defineSelectedGrillageType() {
//   for (var i = 0; i < $("[name='grillage_type']").length; i++) {
//     if ($("[name='grillage_type']")[i].checked) {
//       grillageType = $("[name='grillage_type']")[i].value;
//     }
//   }
// }

function defineSelectedGrillageType() {
  for (var i = 0; i < $("[name='grillage_type']").length; i++) {
    if ($("[name='grillage_type']")[i].checked) {
      grillageType = $("[name='grillage_type']")[i].value;
    }
  }
  if (grillageType == "line") {
    grillageWidth = $("[name='grillage_width']")[0].value;
  }
}

// define distance between two points
// function twoPointsDist(x0, y0, x1, y1) {
//   var dist = Math.sqrt(Math.pow((x0 - x1), 2) + Math.pow((y0 - y1), 2));
//   return dist;
// }

// define is the point on the line
function twoPointsDist(x, y, x0, y0, x1, y1) {
  x = x - paddingX;
  y = y - paddingY;
  //console.log("x = ", x);
  var dist = Math.sqrt(Math.pow((x0 - x1), 2) + Math.pow((y0 - y1), 2));
  var dist1 = Math.sqrt(Math.pow((x - x0), 2) + Math.pow((y - y0), 2));
  var dist2 = Math.sqrt(Math.pow((x - x1), 2) + Math.pow((y - y1), 2));
  // console.log("dist = ", dist);
  // console.log("dist1 = ", dist1);
  // console.log("dist2 = ", dist2);
  if ((dist1 + dist2) - dist < 0.05) {
    return true;
  }

}

function defUnderMouseElement() {
  for (item of existedElements.values()) {

    if (twoPointsDist(mousePos.x, mousePos.y, item.fields.x0, item.fields.y0, item.fields.x1, item.fields.y1)) {
      //  console.log("item = ", item);
      //    console.log("twoPointsDist = ", twoPointsDist(item.fields.x0, item.fields.y0, item.fields.x1, item.fields.y1)); 
      return item.pk;
    }
  }
}


function defUnderMousePoint() {
  // console.log("defUnderMousePoint: ", points);
  for (item of points.values()) {
    if ((mousePos.x - item.fields.x - paddingX < stickPixels) && (mousePos.y - item.fields.y - paddingY < stickPixels)) {
      point.draw(item.fields.x + paddingX, item.fields.y + paddingY, 5, "423423");
      // console.log("UnderMousePointt: ", item);
      return item;
    }
  }
}

function drawGrillages() {
  for (item of grillages.values()) {
    if (item.fields.point1 == item.fields.point2) {
      for (pitem of points.values()) {
        if (pitem.pk == item.fields.point1) {
          var h = 5;
          ctx.strokeRect(pitem.fields.x + paddingX - h / 2, pitem.fields.y + paddingY - h / 2, h, h);
          ctx.fillStyle = "#234355";
          ctx.fillRect(pitem.fields.x + paddingX - h / 2, pitem.fields.y + paddingY - h / 2, h, h);
        }
      }
    }
  }
}

// function drawUnderMousePoint() {

// }


// // draw new line
// var elementLine = {
//   draw: function () {
//     ctx.beginPath();
//     ctx.moveTo(mouseOldPos0.x, mouseOldPos0.y);
//     ctx.lineTo(mousePos.x, mousePos.y);
//     ctx.stroke();
//   }
// };

// // draw point
// var point = {
//   draw: function (x, y, r, c) {
//     ctx.beginPath();
//     ctx.arc(x, y, r, 0, 2 * Math.PI);
//     ctx.fillStyle = c;// "#333333";
//     ctx.fill();
//     ctx.closePath();
//   }
// };