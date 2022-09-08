$(function () {
  $(".header").load("header.html");
  $(".main").load("main.html");
  $(".footer").load("footer.html");
});

function clickNavHome() {
  $(".main").load("home.html");
}

function clickNavViewListDepartments() {
  $(".main").load("viewListDepartments.html");
  buildTable();
}
// ============Khởi tạo Department====================
var departments = []; // tạo list phòng ban

function getListDepartments() {
  // call API from server
  $.get("http://localhost:8080/api/v1/departments", function(data, status){
    
    // reset list departments
    departments = [];

    // error
    if (status == "error") {
      // TODO
      alert("Error when loading data.");
      return;
    }
    
    // success
    departments = data;
    fillDepartmentToTable();
  });
}

function fillDepartmentToTable() {
  departments.forEach(function(element) {
    $('tbody').append(
      '<tr>' +
        '<td>' + element.name + '</td>' +
        '<td>' + element.author.fullName + '</td>' +
        '<td>' + element.createdDate + '</td>' +
        '<td>' +
          '<a class="edit" title="Edit" data-toggle="tooltip" onclick="openModalUpdate('+ element.id +')"><i class="material-icons">&#xE254;</i></a>' +
          '<a class="delete" title="Delete" data-toggle="tooltip" onclick="openConfirmDelete('+ element.id +')"><i class="material-icons">&#xE872;</i></a>' +
        '</td>' +
      '</tr>')
  });
}

function buildTable() {
  // cho bảng trống đi để thêm lại toàn bộ khi cập nhật (làm tạm)
  $('tbody').empty();
  getListDepartments();
}

// ==============Modal Add===============
function openModalAdd() {
  showModal(); // open modal trước rồi mới reset form
  resetFormAdd();
}

// reset form thành các trường rỗng mỗi khi load lại
function resetFormAdd() {
  document.getElementById("titleModal").innerHTML = "Add Department";
  document.getElementById("id").value = "";
  document.getElementById("name").value = "";
  document.getElementById("authorLabel").style.display = "none";
  document.getElementById("author").style.display = "none";
  document.getElementById("createdDateLabel").style.display = "none";
  document.getElementById("createdDate").style.display = "none";
}


function showModal() {
  $('#myModal').modal('show');
}

function hideModal() {
  $('#myModal').modal('hide');
}

//=============Save has 2 case==============
function save() {
    var id = document.getElementById("id").value;
    if (id == null || id == "") {
      addDepartment();
    } else {
      updateDepartment();
    }
}

// cho save case add
function addDepartment() { // post = create, add
  // get data
  var name = document.getElementById("name").value;

  // TODO validate
  // if validate fail -> return
  
  // if validate success -> tiếp code sau
  // post những value đã điền từ modal lên data server
  var department = {
      name: name,
      authorId: 3
    }
  // post data user đã nhập theo dạng json
  $.ajax({
    url: 'http://localhost:8080/api/v1/departments',
    type: 'POST',
    data: JSON.stringify(department), // convert value js sang string json
    contentType: "application/json", // type of body (json, xml, text)
    // dataType: 'json', // datatype return in method post in controller (ở đây đang trả về String nên cmt lại)
    success: function(data, textStatus, xhr) {
      // if (success)
      hideModal();
      showAlertSuccess();
      buildTable();
      console.log(data); // hiện ra Created successfully! của mình
      console.log(textStatus); // success
      console.log(xhr); // ?
      },
      // if (error)
      error(jqXHR, textStatus, errorThrown){
        alert("Error when deleting data");
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
    }
  })
  $.post("http://localhost:8080/api/v1/departments",
    department,
    function(data, status){
      // error
      if(status == "error"){
        alert("error when adding new Department");
        return;
      }
      // success
      hideModal();
      showAlertSuccess();
      buildTable();
    });
}

// ============Modal Update============
function resetFormUpdate() {
  document.getElementById("titleModal").innerHTML = "Update Department";
  document.getElementById("authorLabel").style.display = "block";
  document.getElementById("author").style.display = "block";
  document.getElementById("createdDateLabel").style.display = "block";
  document.getElementById("createdDate").style.display = "block";
}

function openModalUpdate(id) {
  // phải gọi api get data lên đã để user ko thấy form trống khi chưa load data xong
  $.get("http://localhost:8080/api/v1/departments/" + id, function(data, status){
    
    // if error
    if (status == "error") {
      // TODO
      alert("Error when loading data.");
      return;
    }
    
    // if success
    showModal();
    resetFormUpdate();
    
    // sau đó fill data vào
    document.getElementById("id").value = data.id; // field này ẩn
    document.getElementById("name").value = data.name;
    document.getElementById("author").value = data.author.fullName;
    document.getElementById("createdDate").value = data.createdDate;
  });
}

// cho save case update
function updateDepartment() {
  var id = document.getElementById("id").value; // tìm bằng id ẩn
  var name = document.getElementById("name").value; // user nhập info update rồi gán vào var
  
  // TODO validate
  // if validate fail -> return
  
  // if validate success -> tiếp
  var department = {
    name: name
  }
  $.ajax({
    url: 'http://localhost:8080/api/v1/departments/' + id,
    type: 'PUT',
    data: JSON.stringify(department), // convert value js sang string json
    contentType: "application/json", // type of body (json, xml, text)
    // dataType: 'json', // datatype return in method put in controller (ở đây đang trả về String nên cmt lại)
    success: function(data, textStatus, xhr) {
      // if (success)
      hideModal();
      showAlertSuccess();
      buildTable();
      console.log(data); // hiện ra Created successfully! của mình
      console.log(textStatus); // success
      console.log(xhr); // ?
      },
      // if (error)
      error(jqXHR, textStatus, errorThrown){
        alert("Error when deleting data");
        console.log(jqXHR);
        console.log(textStatus);
        console.log(errorThrown);
    }
  })
}

function showAlertSuccess() {
  $("#success-alert").fadeTo(2000,500).slideUp(500,function() {
    $("#success-alert").slideUp(500);
  });
}

// ============Alert delete============
function openConfirmDelete(id) {
  // có thể dùng api get by id ở trên để gọi obj cần delete nhưng ở đây lấy sẵn id lúc get all luôn
  var i = departments.findIndex(e => e.id == id);
  var name = departments[i].name;
  
  var result = confirm("Do you want to delete " + name + "?");
  if (result) { // nếu đúng, result là type boolean
    deleteDepartment(id);
  }
}

function deleteDepartment(id) {
  // TODO validate

  $.ajax({
    url: 'http://localhost:8080/api/v1/departments/' + id,
    type: 'DELETE',
    success: function(result) {
      // error
      if(result == undefined || result == null) {
        alert("Error when deleting data");
        return;
      }
      // success
      showAlertSuccess();
      buildTable();
    }
  })
}

